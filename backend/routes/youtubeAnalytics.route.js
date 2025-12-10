const express = require("express");
const router = express.Router();
const youtubeAnalyticsController = require("../controllers/youtubeAnalytics.controller");
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

// ============== USER ROUTES ==============

// Sync analytics data cho một kênh
router.post(
  "/sync/:channelId",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN"]),
  youtubeAnalyticsController.syncChannelAnalytics
);

// Lấy analytics data từ database
router.get(
  "/get-analytics/:channelId",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN", "ACCOUNTANT"]),
  youtubeAnalyticsController.getChannelAnalytics
);

// ============== ADMIN ROUTES ==============

// [ADMIN] Lấy analytics của tất cả channels
router.get(
  "/get-all-analytics",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  youtubeAnalyticsController.getAllChannelsAnalytics
);

// [ADMIN] Sync tất cả channels đã authorize
router.post(
  "/sync-all",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  youtubeAnalyticsController.syncAllChannels
);

module.exports = router;
