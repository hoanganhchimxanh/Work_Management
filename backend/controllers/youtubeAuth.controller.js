const { google } = require("googleapis");
const db = require("../models");
const YoutubeAuth = db.YoutubeAuth;
const Channel = db.Channel;
const User = db.User;
const CryptoJS = require("crypto-js");

// Cấu hình OAuth2 client
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Tạo URL để user authorize
const getAuthUrl = async (req, res, next) => {
  try {
    const { channelId } = req.query;
    const userId = req.user.userId; // Từ JWT middleware

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu channelId!",
      });
    }

    // Kiểm tra channel có tồn tại và thuộc về user không
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    if (channel.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền kết nối kênh này!",
      });
    }

    const oauth2Client = getOAuth2Client();

    // Scopes cần thiết cho YouTube Data API và YouTube Analytics API
    const scopes = [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
      "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
    ];

    // State để lưu thông tin channel và user
    const state = Buffer.from(JSON.stringify({ channelId, userId })).toString(
      "base64"
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state: state,
      prompt: "consent", // Bắt buộc lấy refresh token
    });

    res.json({
      success: true,
      authUrl,
    });
  } catch (err) {
    next(err);
  }
};

// Xử lý callback từ Google OAuth
const handleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: "Thiếu authorization code hoặc state!",
      });
    }

    // Decode state để lấy channelId và userId
    const { channelId, userId } = JSON.parse(
      Buffer.from(state, "base64").toString()
    );

    const oauth2Client = getOAuth2Client();

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Lấy thông tin YouTube channel của user
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelsResponse = await youtube.channels.list({
      part: "snippet,contentDetails,statistics",
      mine: true,
    });

    if (
      !channelsResponse.data.items ||
      channelsResponse.data.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy kênh YouTube nào!",
      });
    }

    const youtubeChannel = channelsResponse.data.items[0];

    // Lưu hoặc cập nhật auth tokens
    const expiresAt = new Date(Date.now() + tokens.expiry_date);

    const existingAuth = await YoutubeAuth.findOne({
      user: userId,
      channel: channelId,
    });

    if (existingAuth) {
      existingAuth.accessToken = tokens.access_token;
      existingAuth.refreshToken =
        tokens.refresh_token || existingAuth.refreshToken;
      existingAuth.expiresAt = expiresAt;
      existingAuth.youtubeChannelId = youtubeChannel.id;
      existingAuth.scopes = tokens.scope.split(" ");
      existingAuth.status = "ACTIVE";
      await existingAuth.save();
    } else {
      await YoutubeAuth.create({
        user: userId,
        channel: channelId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        youtubeChannelId: youtubeChannel.id,
        scopes: tokens.scope.split(" "),
        status: "ACTIVE",
      });
    }

    // Redirect về frontend với success message
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/channels?auth=success`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/channels?auth=error`);
  }
};

// Kiểm tra trạng thái authorization của channel
const checkAuthStatus = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.userId;

    const auth = await YoutubeAuth.findOne({
      user: userId,
      channel: channelId,
    }).lean();

    if (!auth) {
      return res.json({
        success: true,
        data: {
          isAuthorized: false,
        },
      });
    }

    // Kiểm tra token có hết hạn không
    const isExpired = new Date() >= new Date(auth.expiresAt);

    res.json({
      success: true,
      data: {
        isAuthorized: auth.status === "ACTIVE" && !isExpired,
        status: auth.status,
        expiresAt: auth.expiresAt,
        lastSyncedAt: auth.lastSyncedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Thu hồi quyền truy cập
const revokeAuth = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.userId;

    const auth = await YoutubeAuth.findOne({
      user: userId,
      channel: channelId,
    });

    if (!auth) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy authorization!",
      });
    }

    // Revoke token trên Google
    try {
      const oauth2Client = getOAuth2Client();
      await oauth2Client.revokeToken(auth.accessToken);
    } catch (err) {
      console.error("Error revoking token:", err);
    }

    // Cập nhật status
    auth.status = "REVOKED";
    await auth.save();

    res.json({
      success: true,
      message: "Thu hồi quyền truy cập thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Refresh access token
const refreshAccessToken = async (youtubeAuthId) => {
  const auth = await YoutubeAuth.findById(youtubeAuthId);
  if (!auth || !auth.refreshToken) {
    throw new Error("Không tìm thấy refresh token!");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: auth.refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  auth.accessToken = credentials.access_token;
  auth.expiresAt = new Date(credentials.expiry_date);
  await auth.save();

  return credentials.access_token;
};

// Lấy danh sách channels đã authorize
const getAuthorizedChannels = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const authorizedChannels = await YoutubeAuth.find({
      user: userId,
      status: "ACTIVE",
    })
      .populate("channel", "name link subscriber status")
      .lean();

    res.json({
      success: true,
      data: authorizedChannels.map((auth) => ({
        channelId: auth.channel._id,
        channelName: auth.channel.name,
        channelLink: auth.channel.link,
        subscriber: auth.channel.subscriber,
        status: auth.channel.status,
        youtubeChannelId: auth.youtubeChannelId,
        isAuthorized: true,
        expiresAt: auth.expiresAt,
        lastSyncedAt: auth.lastSyncedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// [ADMIN] Lấy tất cả channels đã authorize
const getAllAuthorizedChannels = async (req, res, next) => {
  try {
    const authorizedChannels = await YoutubeAuth.find({
      status: "ACTIVE",
    })
      .populate("user", "fullName personalEmail")
      .populate("channel", "name link subscriber status")
      .lean();

    res.json({
      success: true,
      data: authorizedChannels.map((auth) => ({
        userId: auth.user._id,
        userName: auth.user.fullName,
        userEmail: auth.user.personalEmail,
        channelId: auth.channel._id,
        channelName: auth.channel.name,
        channelLink: auth.channel.link,
        subscriber: auth.channel.subscriber,
        status: auth.channel.status,
        youtubeChannelId: auth.youtubeChannelId,
        expiresAt: auth.expiresAt,
        lastSyncedAt: auth.lastSyncedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  checkAuthStatus,
  revokeAuth,
  refreshAccessToken,
  getAuthorizedChannels,
  getAllAuthorizedChannels,
};

// youtubeAuthSchema.pre("save", function (next) {
//   if (this.isModified("accessToken")) {
//     this.accessToken = CryptoJS.AES.encrypt(
//       this.accessToken,
//       process.env.ENCRYPTION_KEY
//     ).toString();
//   }
//   if (this.isModified("refreshToken")) {
//     this.refreshToken = CryptoJS.AES.encrypt(
//       this.refreshToken,
//       process.env.ENCRYPTION_KEY
//     ).toString();
//   }
//   next();
// });

// youtubeAuthSchema.methods.getDecryptedAccessToken = function () {
//   const bytes = CryptoJS.AES.decrypt(
//     this.accessToken,
//     process.env.ENCRYPTION_KEY
//   );
//   return bytes.toString(CryptoJS.enc.Utf8);
// };

// youtubeAuthSchema.methods.getDecryptedRefreshToken = function () {
//   const bytes = CryptoJS.AES.decrypt(
//     this.refreshToken,
//     process.env.ENCRYPTION_KEY
//   );
//   return bytes.toString(CryptoJS.enc.Utf8);
// };
