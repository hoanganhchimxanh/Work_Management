const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

/**
 * GET /notification
 * Lấy danh sách thông báo của user (phân trang)
 */
router.get(
  "/",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT", "EMPLOYEE"]),
  notificationController.getMyNotifications
);

/**
 * GET /notification/unread-count
 * Lấy số lượng thông báo chưa đọc (badge)
 */
router.get(
  "/unread-count",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT", "EMPLOYEE"]),
  notificationController.getUnreadCount
);

/**
 * PATCH /notification/:id/read
 * Đánh dấu 1 thông báo đã đọc
 */
router.patch(
  "/:id/read",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT", "EMPLOYEE"]),
  notificationController.markAsRead
);

/**
 * PATCH /notification/read-all
 * Đánh dấu tất cả thông báo đã đọc
 */
router.patch(
  "/read-all",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT", "EMPLOYEE"]),
  notificationController.markAllAsRead
);

/**
 * DELETE /notification/:id
 * Xóa 1 thông báo
 */
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT", "EMPLOYEE"]),
  notificationController.deleteNotification
);

module.exports = router;
