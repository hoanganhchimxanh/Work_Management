const cron = require("node-cron");
const db = require("../models");
const YoutubeAuth = db.YoutubeAuth;
const { refreshAccessToken } = require("../controllers/youtubeAuth.controller");
const { sendNotification } = require("../services/notification.service");

// Chạy mỗi 6 tiếng để check và refresh token sắp hết hạn
const refreshYoutubeToken = () => {
  cron.schedule("0 */6 * * *", async () => {
    console.log("🔄 Running token refresh scheduler...");

    try {
      // Tìm các token sẽ hết hạn trong 1 giờ tới
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

      const expiringSoonTokens = await YoutubeAuth.find({
        status: "ACTIVE",
        expiresAt: { $lte: oneHourFromNow },
      })
        .populate("channel", "name")
        .populate("user", "_id fullName");

      console.log(`Found ${expiringSoonTokens.length} tokens expiring soon`);

      for (const auth of expiringSoonTokens) {
        try {
          // Thử refresh token
          await refreshAccessToken(auth._id);
          console.log(
            `✅ Refreshed token for channel ${
              auth.channel?.name || auth.channel
            }`
          );

          // 🔔 Gửi thông báo refresh thành công
          if (auth.user?._id) {
            await sendNotification({
              userId: auth.user._id,
              title: "Token YouTube đã được làm mới",
              message: `Token xác thực cho kênh "${
                auth.channel?.name || "không rõ tên"
              }" đã được tự động làm mới thành công.`,
              type: "YOUTUBE_AUTH",
              metadata: {
                channelId: auth.channel?._id,
                channelName: auth.channel?.name,
                action: "TOKEN_REFRESHED",
              },
            });
          }
        } catch (err) {
          console.error(
            `❌ Failed to refresh token for channel ${
              auth.channel?.name || auth.channel
            }:`,
            err.message
          );

          // invalid_grant = token chết hẳn → cần re-auth
          if (err.message?.includes("invalid_grant")) {
            auth.status = "RE_AUTH_REQUIRED";

            // 🔔 Gửi thông báo cần xác thực lại
            if (auth.user?._id) {
              await sendNotification({
                userId: auth.user._id,
                title: "⚠️ Cần xác thực lại YouTube",
                message: `Token xác thực cho kênh "${
                  auth.channel?.name || "không rõ tên"
                }" đã hết hạn. Vui lòng xác thực lại để tiếp tục đồng bộ dữ liệu.`,
                type: "YOUTUBE_AUTH",
                metadata: {
                  channelId: auth.channel?._id,
                  channelName: auth.channel?.name,
                  action: "RE_AUTH_REQUIRED",
                  severity: "high",
                },
              });
            }
          } else {
            auth.status = "EXPIRED";

            // 🔔 Gửi thông báo token hết hạn
            if (auth.user?._id) {
              await sendNotification({
                userId: auth.user._id,
                title: "Token YouTube đã hết hạn",
                message: `Token xác thực cho kênh "${
                  auth.channel?.name || "không rõ tên"
                }" đã hết hạn. Hệ thống sẽ tự động thử làm mới trong lần kiểm tra tiếp theo.`,
                type: "YOUTUBE_AUTH",
                metadata: {
                  channelId: auth.channel?._id,
                  channelName: auth.channel?.name,
                  action: "TOKEN_EXPIRED",
                  severity: "medium",
                },
              });
            }
          }

          await auth.save();
        }
      }

      // Tổng kết
      if (expiringSoonTokens.length > 0) {
        console.log(
          `✅ Token refresh scheduler completed: processed ${expiringSoonTokens.length} tokens`
        );
      }
    } catch (err) {
      console.error("Error in token refresh scheduler:", err);
    }
  });

  console.log(
    "✅ YouTube token refresh scheduler initialized (runs every 6 hours)"
  );
};

module.exports = refreshYoutubeToken;
