const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
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

// ========== EMPLOYEE ROUTES ==========

// Tạo nhân viên mới
router.post(
  "/create-new",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  employeeController.createNew
);

// Lấy toàn bộ danh sách nhân viên
router.get(
  "/get-all",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  employeeController.getAll
);

// Xem thông tin của 1 cá nhân
router.get(
  "/get-by-id/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT", "EMPLOYEE"]),
  employeeController.getById
);

// Chỉnh sửa thông tin nhân viên
router.put(
  "/update/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "EMPLOYEE"]),
  employeeController.updateEmployee
);

// Xóa nhân viên
router.delete(
  "/delete/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  employeeController.deleteEmployee
);

module.exports = router;
