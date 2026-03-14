const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channel.controller");
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

// Thêm kênh mới
router.post(
  "/add-new",
  authenticateJWT,
  authorizeRoles("EMPLOYEE"),
  channelController.addNew,
);

// Lấy kênh của user hiện tại
router.get(
  "/my-channels",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN", "ACCOUNTANT"]),
  channelController.getMyChannels,
);

// Lấy tất cả kênh
router.get(
  "/get-all",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  channelController.getAll,
);

// Lấy kênh theo ID
router.get(
  "/get-by-id/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT", "EMPLOYEE"]),
  channelController.getById,
);

// Chỉnh sửa thông tin kênh
router.put(
  "/edit/:id",
  authenticateJWT,
  authorizeRoles("EMPLOYEE"),
  channelController.editChannelInfo,
);

// Xóa kênh
router.delete(
  "/delete/:id",
  authenticateJWT,
  authorizeRoles("EMPLOYEE"),
  channelController.deleteChannel,
);

// Gán owner cho kênh
router.put(
  "/assign-owner/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  channelController.assignOwner,
);

// Lấy kênh theo owner
router.get(
  "/by-owner/:userId",
  authenticateJWT,
  authorizeRoles(["ADMIN", "EMPLOYEE", "ACCOUNTANT"]),
  channelController.getByOwner,
);

// Lấy kênh theo network
router.get(
  "/by-network/:networkId",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  channelController.getByNetwork,
);

module.exports = router;
