const express = require("express");
const router = express.Router();

const userRouter = require("./user.route");
const accountRouter = require("./account.route");
const teamRouter = require("./team.route");
const kpiRouter = require("./kpi.route");
const taskRouter = require("./task.route");
const channelRouter = require("./channel.route");
const networkRouter = require("./network.route");
const youtubeAuthRouter = require("./youtubeAuth.route");
const youtubeAnalyticsRouter = require("./youtubeAnalytics.route");
const dashboardRouter = require("./dashboard.route");
const excelRouter = require("./excel.route");
const notificationRouter = require("./notification.route");
const resourceRouter = require("./resource.route");
const bugReportRouter = require("./bugReport.route");
const channelRevenueRouter = require("./channelRevenue.route");
const resourceBatchRouter = require("./resourceBatch.route");

// ============== MOUNT ROUTES ==============
router.use("/user", userRouter);
router.use("/account", accountRouter);
router.use("/team", teamRouter);
router.use("/kpi", kpiRouter);
router.use("/task", taskRouter);
router.use("/channel", channelRouter);
router.use("/network", networkRouter);
router.use("/youtube-auth", youtubeAuthRouter);
router.use("/youtube-analytics", youtubeAnalyticsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/excel", excelRouter);
router.use("/notification", notificationRouter);
router.use("/resource", resourceRouter);
router.use("/bug-report", bugReportRouter);
router.use("/channel-revenue", channelRevenueRouter);
router.use("/resource-batch", resourceBatchRouter);

// Route gốc (tùy chọn - để kiểm tra)
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the API routes index",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
