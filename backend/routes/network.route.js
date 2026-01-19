const express = require("express");
const router = express.Router();
const networkController = require("../controllers/network.controller");
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

// ========== BASIC ROUTES ==========
// Tạo network mới
router.post(
  "/create-new",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.createNew,
);

// Lấy tất cả networks
router.get(
  "/get-all",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  networkController.getAll,
);

// Lấy network theo ID
router.get(
  "/get-by-id/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  networkController.getById,
);

// Cập nhật network
router.put(
  "/update/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.updateNetwork,
);

// Xóa network
router.delete(
  "/delete/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.deleteNetwork,
);

// Gán kênh vào network
router.post(
  "/assign-channel/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.assignChannel,
);

// Gỡ kênh khỏi network
router.post(
  "/remove-channel/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.removeChannel,
);

// Thống kê network
router.get(
  "/stats/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  networkController.getNetworkStats,
);

// ========== ADSENSE LOCATION ROUTES ==========
// Lấy danh sách địa chỉ duy nhất
router.get(
  "/locations/unique",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  networkController.getUniqueLocations,
);

// Lấy tất cả network theo địa chỉ
router.get(
  "/locations/:location",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  networkController.getNetworksByLocation,
);

// Cập nhật địa chỉ hàng loạt
router.put(
  "/locations/bulk-update",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.bulkUpdateLocation,
);

// Xóa địa chỉ khỏi tất cả network
router.delete(
  "/locations/remove",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.removeLocationFromNetworks,
);

module.exports = router;
