const cron = require("node-cron");
const axios = require("axios");

// Sync mỗi ngày lúc 6:00 AM
cron.schedule("0 6 * * *", async () => {
  console.log("Starting daily YouTube analytics sync...");

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startDate = yesterday.toISOString().split("T")[0];
    const endDate = startDate;

    // Call sync endpoint với admin token
    await axios.post(
      `http://localhost:9999/youtube/analytics/sync-all?startDate=${startDate}&endDate=${endDate}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
        },
      }
    );

    console.log("Sync completed!");
  } catch (err) {
    console.error("Sync failed:", err);
  }
});

module.exports = cron;
