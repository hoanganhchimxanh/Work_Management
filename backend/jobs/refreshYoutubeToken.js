const cron = require("node-cron");
const db = require("../models");
const YoutubeAuth = db.YoutubeAuth;
const { refreshAccessToken } = require("../controllers/youtubeAuth.controller");

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
      });

      console.log(`Found ${expiringSoonTokens.length} tokens expiring soon`);

      for (const auth of expiringSoonTokens) {
        try {
          await refreshAccessToken(auth._id);
          console.log(`✅ Refreshed token for channel ${auth.channel}`);
        } catch (err) {
          console.error(
            `❌ Failed to refresh token for channel ${auth.channel}:`,
            err.message
          );

          // Đánh dấu là EXPIRED nếu refresh thất bại
          auth.status = "EXPIRED";
          await auth.save();
        }
      }
    } catch (err) {
      console.error("Error in token refresh scheduler:", err);
    }
  });
};

module.exports = refreshYoutubeToken;
