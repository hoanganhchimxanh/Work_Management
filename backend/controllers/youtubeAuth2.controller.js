const { google } = require("googleapis");
const db = require("../models");
const YoutubeAuth = db.YoutubeAuth;
const Channel = db.Channel;
const User = db.User;

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
    const userId = req.user.userId;

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

    if (channel.assignedUser.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền kết nối kênh này!",
      });
    }

    const oauth2Client = getOAuth2Client();

    // Scopes cần thiết
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

// ✅ MỚI: Lấy danh sách tất cả channels của user (bao gồm Brand Accounts)
const getAvailableChannels = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: "Thiếu authorization code hoặc state!",
      });
    }

    // Decode state
    const { channelId, userId } = JSON.parse(
      Buffer.from(state, "base64").toString()
    );

    const oauth2Client = getOAuth2Client();

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // ✅ Lấy TẤT CẢ channels (bao gồm Brand Accounts)
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelsResponse = await youtube.channels.list({
      part: "snippet,contentDetails,statistics",
      mine: true, // Lấy tất cả channels mà user có quyền truy cập
      maxResults: 50,
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

    // Format danh sách channels
    const availableChannels = channelsResponse.data.items.map((ch) => ({
      youtubeChannelId: ch.id,
      title: ch.snippet.title,
      thumbnail: ch.snippet.thumbnails?.default?.url,
      subscriberCount: ch.statistics?.subscriberCount || "0",
      videoCount: ch.statistics?.videoCount || "0",
    }));

    // ✅ Lưu tạm tokens và state vào session hoặc cache
    // (Hoặc bạn có thể trả về cho frontend kèm encrypted tokens)

    res.json({
      success: true,
      message: "Vui lòng chọn kênh bạn muốn kết nối",
      data: {
        channels: availableChannels,
        // Gửi kèm state để frontend gửi lại khi chọn channel
        authState: state,
        tempTokens: Buffer.from(JSON.stringify(tokens)).toString("base64"), // ⚠️ Nên encrypt tokens
      },
    });
  } catch (err) {
    next(err);
  }
};

// ✅ MỚI: Xác nhận channel được chọn và lưu vào database
const confirmChannelSelection = async (req, res, next) => {
  try {
    const { authState, tempTokens, selectedYoutubeChannelId } = req.body;

    if (!authState || !tempTokens || !selectedYoutubeChannelId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc!",
      });
    }

    // Decode state và tokens
    const { channelId, userId } = JSON.parse(
      Buffer.from(authState, "base64").toString()
    );
    const tokens = JSON.parse(Buffer.from(tempTokens, "base64").toString());

    // Kiểm tra user có quyền không
    const channel = await Channel.findById(channelId);
    if (!channel || channel.assignedUser.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền kết nối kênh này!",
      });
    }

    // ✅ Cập nhật youtubeChannelId vào Channel model
    channel.youtubeChannelId = selectedYoutubeChannelId;
    await channel.save();

    // Lưu hoặc cập nhật auth tokens
    const expiresAt = new Date(tokens.expiry_date);

    const existingAuth = await YoutubeAuth.findOne({
      user: userId,
      channel: channelId,
    });

    if (existingAuth) {
      existingAuth.accessToken = tokens.access_token;
      existingAuth.refreshToken =
        tokens.refresh_token || existingAuth.refreshToken;
      existingAuth.expiresAt = expiresAt;
      existingAuth.youtubeChannelId = selectedYoutubeChannelId;
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
        youtubeChannelId: selectedYoutubeChannelId,
        scopes: tokens.scope.split(" "),
        status: "ACTIVE",
      });
    }

    res.json({
      success: true,
      message: "Kết nối kênh YouTube thành công!",
      data: {
        channelId,
        youtubeChannelId: selectedYoutubeChannelId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ❌ XÓA hoặc SỬA LẠI handleCallback (không dùng nữa)
// Hoặc giữ lại cho trường hợp redirect từ Google
const handleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/channels?auth=error&reason=missing_params`
      );
    }

    // Decode state
    const { channelId, userId } = JSON.parse(
      Buffer.from(state, "base64").toString()
    );

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Lấy tất cả channels
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelsResponse = await youtube.channels.list({
      part: "snippet,contentDetails,statistics",
      mine: true,
      maxResults: 50,
    });

    if (
      !channelsResponse.data.items ||
      channelsResponse.data.items.length === 0
    ) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/channels?auth=error&reason=no_channels`
      );
    }

    // ✅ Redirect về frontend với danh sách channels
    const channels = channelsResponse.data.items.map((ch) => ({
      id: ch.id,
      title: ch.snippet.title,
      thumbnail: ch.snippet.thumbnails?.default?.url,
    }));

    // Encode data để gửi qua URL
    const encodedData = Buffer.from(
      JSON.stringify({
        channels,
        state,
        tokens: Buffer.from(JSON.stringify(tokens)).toString("base64"),
      })
    ).toString("base64");

    res.redirect(
      `${process.env.FRONTEND_URL}/channels/select?data=${encodedData}`
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/channels?auth=error`);
  }
};

// Các functions khác giữ nguyên...
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
          reason: "NOT_FOUND",
          message: "Không tìm thấy thông tin Authorization cho kênh này.",
        },
      });
    }

    if (auth.status !== "ACTIVE") {
      return res.json({
        success: true,
        data: {
          isAuthorized: false,
          reason: "INACTIVE_STATUS",
          status: auth.status,
          message: `Trạng thái Authorization hiện tại là: ${auth.status}.`,
        },
      });
    }

    const now = new Date();
    const expiresAt = new Date(auth.expiresAt);
    const isExpired = now >= expiresAt;

    if (isExpired) {
      try {
        await refreshAccessToken(auth._id);
        const refreshedAuth = await YoutubeAuth.findById(auth._id).lean();

        return res.json({
          success: true,
          data: {
            isAuthorized: true,
            status: refreshedAuth.status,
            message: "Access Token đã được refresh tự động.",
            expiresAt: refreshedAuth.expiresAt,
            lastSyncedAt: refreshedAuth.lastSyncedAt,
          },
        });
      } catch (refreshError) {
        return res.json({
          success: true,
          data: {
            isAuthorized: false,
            reason: "TOKEN_EXPIRED",
            status: auth.status,
            message: `Không thể refresh token: ${refreshError.message}`,
            expiresAt: auth.expiresAt,
          },
        });
      }
    }

    return res.json({
      success: true,
      data: {
        isAuthorized: true,
        status: auth.status,
        message: "Authorization thành công và Access Token còn hiệu lực.",
        expiresAt: auth.expiresAt,
        lastSyncedAt: auth.lastSyncedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

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

    try {
      const oauth2Client = getOAuth2Client();
      await oauth2Client.revokeToken(auth.accessToken);
    } catch (err) {
      console.error("Error revoking token:", err);
    }

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

const getAuthorizedChannels = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const authorizedChannels = await YoutubeAuth.find({
      user: userId,
      status: "ACTIVE",
    })
      .populate("channel", "name link status youtubeChannelId")
      .lean();

    res.json({
      success: true,
      data: authorizedChannels.map((auth) => ({
        channelId: auth.channel._id,
        channelName: auth.channel.name,
        channelLink: auth.channel.link,
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

const getAllAuthorizedChannels = async (req, res, next) => {
  try {
    const authorizedChannels = await YoutubeAuth.find({
      status: "ACTIVE",
    })
      .populate("user", "fullName personalEmail")
      .populate("channel", "name link status youtubeChannelId")
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
  getAvailableChannels, // ✅ MỚI
  confirmChannelSelection, // ✅ MỚI
  handleCallback,
  checkAuthStatus,
  revokeAuth,
  refreshAccessToken,
  getAuthorizedChannels,
  getAllAuthorizedChannels,
};
