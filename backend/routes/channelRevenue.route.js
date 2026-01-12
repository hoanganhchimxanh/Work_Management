const express = require("express");
const router = express.Router();
const channelRevenueController = require("../controllers/channelRevenue.controller");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

const logRequestTime = (req, res, next) => {
  console.log("Time: ", Date.now());
  next();
};

router.use(logRequestTime);
router.use(express.json());

// ============== CHANNEL REVENUE ROUTES ==============

// Lấy doanh thu theo tháng của một kênh
router.get(
  "/:channelId/monthly",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT", "EMPLOYEE"]),
  channelRevenueController.getChannelMonthlyRevenue
);

// Tạo hoặc cập nhật doanh thu tháng
router.post(
  "/:channelId/monthly",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  channelRevenueController.createOrUpdateRevenue
);

// Đồng bộ doanh thu từ YouTube Analytics
router.post(
  "/:channelId/sync-analytics",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  channelRevenueController.syncRevenueFromAnalytics
);

// Khóa/mở khóa tháng
router.patch(
  "/:channelId/monthly/:month/toggle-lock",
  authenticateJWT,
  authorizeRoles(["ADMIN"]),
  channelRevenueController.toggleLock
);

// Xóa dữ liệu doanh thu tháng
router.delete(
  "/:channelId/monthly/:month",
  authenticateJWT,
  authorizeRoles(["ADMIN"]),
  channelRevenueController.deleteRevenue
);

// [ADMIN] Lấy tổng quan doanh thu của tất cả kênh
router.get(
  "/summary",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  channelRevenueController.getAllChannelsRevenueSummary
);

module.exports = router;
