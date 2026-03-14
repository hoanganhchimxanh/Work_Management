const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resource.controller");
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

// ========== ADMIN ROUTES ==========

// Tạo resource mới
router.post(
  "/create-new",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceController.createNew
);

// Lấy tất cả resources
router.get(
  "/get-all",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceController.getAll
);

// Lấy resource theo ID
router.get(
  "/get-by-id/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceController.getById
);

// Cập nhật resource
router.put(
  "/update/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceController.updateResource
);

// Xóa resource
router.delete(
  "/delete/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceController.deleteResource
);

// Gán resource cho user
router.post(
  "/assign-to-user/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceController.assignToUser
);

// Gán resource cho channel
router.post(
  "/assign-to-channel/:id",
  authenticateJWT,
  resourceController.assignToChannel
);

// Gỡ channel khỏi resource
router.post(
  "/unassign-from-channel/:id",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN"]),
  resourceController.unassignFromChannel
);

// Gán nhiều resources cho user
router.post(
  "/bulk-assign-to-user",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceController.bulkAssignToUser
);

// Gỡ gán resource
router.post(
  "/unassign/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceController.unassign
);

// Vô hiệu hóa resource
router.patch(
  "/disable/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceController.disableResource
);

// Kích hoạt lại resource
router.patch(
  "/enable/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceController.enableResource
);

// Thống kê resources
router.get(
  "/stats",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN"]),
  resourceController.getResourceStats
);

// ========== EMPLOYEE ROUTES ==========

// Lấy resources của user hiện tại
router.get(
  "/my-resources",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ADMIN"]),
  resourceController.getMyResources
);

module.exports = router;
