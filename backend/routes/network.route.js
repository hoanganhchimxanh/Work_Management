const express = require("express");
const multer = require("multer");
const router = express.Router();
const networkController = require("../controllers/network.controller");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

// Cấu hình multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file Excel (.xlsx, .xls)"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

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
  networkController.createNew
);

// Lấy tất cả networks
router.get(
  "/get-all",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  networkController.getAll
);

// Lấy network theo ID
router.get(
  "/get-by-id/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  networkController.getById
);

// Cập nhật network
router.put(
  "/update/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.updateNetwork
);

// Xóa network
router.delete(
  "/delete/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.deleteNetwork
);

// Gán kênh vào network
router.post(
  "/assign-channel/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.assignChannel
);

// Gỡ kênh khỏi network
router.post(
  "/remove-channel/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.removeChannel
);

// Thống kê network
router.get(
  "/stats/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  networkController.getNetworkStats
);

// ========== EXCEL ROUTES ==========
// Download template Excel
router.get(
  "/download-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  networkController.exportNetworkTemplate
);

// Import networks từ Excel
router.post(
  "/import-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  networkController.importNetworkExcel
);

// Export networks ra Excel
router.get(
  "/export-excel",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  networkController.exportNetworkExcel
);

module.exports = router;
