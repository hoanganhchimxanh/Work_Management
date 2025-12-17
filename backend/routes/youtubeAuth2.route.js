const express = require("express");
const router = express.Router();
const youtubeAuthController = require("../controllers/youtubeAuth2.controller");
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

// Lấy OAuth URL để authorize
router.get(
  "/get-auth-url",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN"]),
  youtubeAuthController.getAuthUrl
);

// Callback từ Google OAuth (không cần auth vì đây là redirect từ Google)
router.get("/callback", youtubeAuthController.handleCallback);

// ✅ MỚI: Lấy danh sách channels có sẵn sau khi authorize
router.get(
  "/get-available-channels",
  youtubeAuthController.getAvailableChannels
);

// ✅ MỚI: Xác nhận channel được chọn
router.post(
  "/confirm-channel",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN"]),
  youtubeAuthController.confirmChannelSelection
);

// Kiểm tra trạng thái authorization
router.get(
  "/check-status/:channelId",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN"]),
  youtubeAuthController.checkAuthStatus
);

// Thu hồi quyền truy cập
router.delete(
  "/revoke/:channelId",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN"]),
  youtubeAuthController.revokeAuth
);

// Lấy danh sách channels đã authorize của user hiện tại
router.get(
  "/my-channels",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN"]),
  youtubeAuthController.getAuthorizedChannels
);

// ============== ADMIN ROUTES ==============

// [ADMIN] Lấy tất cả channels đã authorize
router.get(
  "/all-channels",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  youtubeAuthController.getAllAuthorizedChannels
);

module.exports = router;
