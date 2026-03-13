const cron = require("node-cron");
const db = require("../models");
const User = db.User;
const {
  syncAllChannels,
} = require("../controllers/youtubeAnalytics.controller");
const { sendNotification } = require("../services/notification.service");

// Sync mỗi ngày lúc 9:00 AM (giờ Việt Nam)
const syncYoutubeAnalytics = () => {
  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("📅 [JOB] Starting daily YouTube analytics sync...");

      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startDate = yesterday.toISOString().split("T")[0];
        const endDate = startDate;

        // Mock objects để gọi controller
        const mockReq = {
          query: { startDate, endDate },
          user: { role: "ADMIN" },
        };

        let syncResults = null;
        const mockRes = {
          json: (data) => {
            syncResults = data;
          },
          status: (code) => ({
            json: (data) => {
              console.error(`❌ [JOB] Sync failed (Status ${code}):`, data.message);
              throw new Error(data.message || "Unknown controller error");
            },
          }),
        };

        const mockNext = (err) => {
          throw err;
        };

        // Thực thi sync
        await syncAllChannels(mockReq, mockRes, mockNext);

        if (syncResults && syncResults.success) {
          const { successful, failed } = syncResults.data;
          console.log(`✅ [JOB] Sync completed: ${successful.length} OK, ${failed.length} Failed`);

          // Nếu có channel fail, thông báo cho Admin
          if (failed.length > 0) {
            await notifyAdmins(
              "⚠️ Một số kênh sync YouTube thất bại",
              `Kết quả sync ngày ${startDate}: ${successful.length} thành công, ${failed.length} thất bại. Vui lòng kiểm tra Logs hệ thống.`
            );
          }
        }
      } catch (err) {
        console.error("❌ [JOB] Critical error in syncYoutubeAnalytics:", err);
        await notifyAdmins(
          "🚨 Lỗi đồng bộ YouTube Analytics",
          `Hệ thống gặp lỗi nghiêm trọng khi tự động đồng bộ dữ liệu: ${err.message}`
        );
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  console.log("✅ YouTube analytics sync scheduler initialized (runs daily at 9:00 AM)");
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
        metadata: { job: "syncYoutubeAnalytics" }
      });
    }
  } catch (err) {
    console.error("Error notifying admins:", err);
  }
}

module.exports = syncYoutubeAnalytics;
