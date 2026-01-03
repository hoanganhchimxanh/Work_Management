const express = require("express");
const router = express.Router();
const resourceBatchController = require("../controllers/resourceBatch.controller");
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

// ============== RESOURCE BATCH ROUTES ==============

// ✅ Lấy batches của user hiện tại (EMPLOYEE có thể xem)
router.get(
  "/my-batches",
  authenticateJWT,
  authorizeRoles(["ADMIN", "EMPLOYEE"]),
  resourceBatchController.getMyBatches
);

// ✅ Lấy thống kê batches (ADMIN only)
router.get(
  "/stats",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceBatchController.getBatchStats
);

// Lấy tất cả các batch (ADMIN only)
router.get(
  "/get-all",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceBatchController.getAllBatches
);

// Lấy một batch theo ID (ADMIN only)
router.get(
  "/get-by-id/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceBatchController.getBatchById
);

// Tạo mới một batch (thường dùng khi import Excel - ADMIN only)
router.post(
  "/create",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceBatchController.createBatch
);

// Cập nhật batch (thay đổi tên file, assignedUser, resources, status...)
router.put(
  "/update/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceBatchController.updateBatch
);

// Xóa batch (chỉ xóa metadata batch, không xóa resource)
router.delete(
  "/delete/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceBatchController.deleteBatch
);

// Lấy danh sách resources thuộc một batch (có populate chi tiết)
router.get(
  "/:id/resources",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceBatchController.getBatchResources
);

// Assign user cho batch và đồng bộ resources (ADMIN only)
router.post(
  "/assign/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceBatchController.assignUserToBatch
);

module.exports = router;
