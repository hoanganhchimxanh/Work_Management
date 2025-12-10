const express = require("express");
const router = express.Router();
const channelManagerController = require("../controllers/channelManager.controller");
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

// Thêm tài khoản quản lý cho kênh
router.post(
  "/add-manager/:channelId",
  authenticateJWT,
  authorizeRoles("EMPLOYEE"),
  channelManagerController.addManager
);

// Lấy danh sách tài khoản quản lý của một kênh
router.get(
  "/get-managers/:channelId",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  channelManagerController.getChannelManagers
);

// Lấy thông tin một tài khoản quản lý
router.get(
  "/get-by-id/:managerId",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  channelManagerController.getManagerById
);

// Cập nhật thông tin tài khoản quản lý
router.put(
  "/update/:managerId",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  channelManagerController.updateManager
);

// Xóa tài khoản quản lý
router.delete(
  "/delete/:managerId",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  channelManagerController.deleteManager
);

// Thu hồi quyền (soft delete)
router.patch(
  "/revoke/:managerId",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  channelManagerController.revokeManager
);

// Thống kê tài khoản quản lý theo role
router.get(
  "/stats/:channelId",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  channelManagerController.getManagerStats
);

module.exports = router;
