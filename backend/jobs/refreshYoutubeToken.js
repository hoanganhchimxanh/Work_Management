const cron = require("node-cron");
const db = require("../models");
const YoutubeAuth = db.YoutubeAuth;
const User = db.User;
const { refreshAccessToken } = require("../controllers/youtubeAuth.controller");
const { sendNotification } = require("../services/notification.service");

// Chạy mỗi 6 tiếng để check và refresh token sắp hết hạn
const refreshYoutubeToken = () => {
  cron.schedule("0 */6 * * *", async () => {
    console.log("🔄 [JOB] Running YouTube token refresh scheduler...");

    try {
      // Tìm các token ACTIVE hoặc EXPIRED sẽ hết hạn/đã hết hạn
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

      const expiringSoonTokens = await YoutubeAuth.find({
        status: { $in: ["ACTIVE", "EXPIRED"] },
        expiresAt: { $lte: oneHourFromNow },
      })
        .populate("channel", "name")
        .populate("user", "_id fullName");

      if (expiringSoonTokens.length === 0) {
        return;
      }

      console.log(`[JOB] Found ${expiringSoonTokens.length} tokens to refresh`);

      for (const auth of expiringSoonTokens) {
        try {
          // Thử refresh token
          await refreshAccessToken(auth._id);
          console.log(`✅ [JOB] Refreshed token for channel: ${auth.channel?.name || auth.youtubeChannelId}`);

          // 🔔 Gửi thông báo refresh thành công cho User sở hữu
          if (auth.user?._id) {
            await sendNotification({
              userId: auth.user._id,
              title: "Token YouTube đã được làm mới",
              message: `Token xác thực cho kênh "${auth.channel?.name || "của bạn"}" đã được tự động làm mới thành công.`,
              type: "YOUTUBE_AUTH",
              metadata: { channelId: auth.channel?._id, action: "TOKEN_REFRESHED" },
            });
          }
        } catch (err) {
          console.error(`❌ [JOB] Failed to refresh token (${auth.channel?.name}):`, err.message);

          // invalid_grant = token chết hẳn (user hủy quyền hoặc pass đổi) → cần re-auth
          if (err.message?.includes("invalid_grant")) {
            auth.status = "RE_AUTH_REQUIRED";
            
            if (auth.user?._id) {
              await sendNotification({
                userId: auth.user._id,
                title: "⚠️ Cần xác thực lại YouTube",
                message: `Quyền truy cập kênh "${auth.channel?.name || "của bạn"}" đã bị hủy. Vui lòng xác thực lại.`,
                type: "YOUTUBE_AUTH",
                metadata: { channelId: auth.channel?._id, action: "RE_AUTH_REQUIRED", severity: "high" },
              });
            }
          } else {
            auth.status = "EXPIRED";
          }

          await auth.save();
        }
      }
    } catch (err) {
      console.error("❌ [JOB] Critical error in refreshYoutubeToken job:", err);
      await notifyAdmins(
        "🚨 Lỗi Job Refresh YouTube Token",
        `Hệ thống gặp lỗi nghiêm trọng khi tự động làm mới token: ${err.message}`
      );
    }
  });

  console.log("✅ YouTube token refresh scheduler initialized (runs every 6 hours)");
};

/**
 * Helper: Gửi thông báo cho tất cả Admin
 */
async function notifyAdmins(title, message) {
  try {
    const admins = await User.find({ role: "ADMIN" }).select("_id").lean();
    for (const admin of admins) {
      await sendNotification({
        userId: admin._id,
        title,
        message,
        type: "SYSTEM",
        metadata: { job: "refreshYoutubeToken" }
      });
    }
  } catch (err) {
    console.error("Error notifying admins:", err);
  }
}

module.exports = refreshYoutubeToken;

