const cron = require("node-cron");
const {
  syncAllChannels,
} = require("../controllers/youtubeAnalytics.controller");

// Sync mỗi ngày lúc 6:00 AM
const syncYoutubeAnalytics = () => {
  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("🔄 Starting daily YouTube analytics sync...");

      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startDate = yesterday.toISOString().split("T")[0];
        const endDate = startDate;

        // Tạo mock req, res, next objects
        const mockReq = {
          query: {
            startDate,
            endDate,
          },
          user: {
            role: "ADMIN", // Scheduler chạy với quyền admin
          },
        };

        const mockRes = {
          json: (data) => {
            if (data.success) {
              console.log("✅ Sync completed successfully!");
              console.log(
                `   - Successful: ${data.data.successful.length} channels`
              );
              console.log(`   - Failed: ${data.data.failed.length} channels`);
            }
          },
          status: (code) => ({
            json: (data) => {
              console.error(
                `❌ Sync failed with status ${code}:`,
                data.message
              );
            },
          }),
        };

        const mockNext = (error) => {
          console.error("❌ Sync error:", error);
        };

        // Gọi trực tiếp controller function
        await syncAllChannels(mockReq, mockRes, mockNext);
      } catch (err) {
        console.error("❌ Sync failed:", err);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  console.log("Analytics sync scheduler started (runs daily at 6:00 AM)");
};

module.exports = syncYoutubeAnalytics;
