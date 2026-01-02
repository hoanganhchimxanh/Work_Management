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

// ============== RESOURCE BATCH ROUTES (ADMIN ONLY) ==============

// Lấy tất cả các batch
router.get(
  "/get-all",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceBatchController.getAllBatches
);

// Lấy một batch theo ID
router.get(
  "/get-by-id/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceBatchController.getBatchById
);

// Tạo mới một batch (thường dùng khi import Excel)
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

module.exports = router;
