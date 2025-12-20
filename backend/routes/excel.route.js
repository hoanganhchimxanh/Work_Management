const express = require("express");
const multer = require("multer");
const {
  importUserExcel,
  exportUserExcel,
  exportUserTemplate,
  importTeamExcel,
  exportTeamExcel,
  exportTeamTemplate,
  importResourceExcel,
  exportResourceExcel,
  exportResourceTemplate,
  importNetworkExcel,
  exportNetworkExcel,
  exportNetworkTemplate,
} = require("../controllers/excel.controller");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Cấu hình multer để xử lý file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép file Excel
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file Excel (.xlsx, .xls)"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
});

const logRequestTime = (req, res, next) => {
  console.log("Time: ", Date.now());
  next();
};

router.use(logRequestTime);
router.use(express.json());

// ========== USER EXCEL ROUTES ==========

// Download template Excel để import
router.get(
  "/download-user-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportUserTemplate
);

// Import users từ Excel
router.post(
  "/import-user-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  importUserExcel
);

// Export users ra Excel
router.get(
  "/export-user-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportUserExcel
);

// ========== TEAM EXCEL ROUTES ==========

router.get(
  "/download-team-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportTeamTemplate
);

router.post(
  "/import-team-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  importTeamExcel
);

router.get(
  "/export-team-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportTeamExcel
);

// ========== NETWORK EXCEL ROUTES ==========

// Download template Excel
router.get(
  "/download-network-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportNetworkTemplate
);

// Import networks từ Excel
router.post(
  "/import-network-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  importNetworkExcel
);

// Export networks ra Excel
router.get(
  "/export-network-excel",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  exportNetworkExcel
);

// ========== RESOURCE EXCEL ROUTES ==========

// Download template Excel để import resources
router.get(
  "/download-resource-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportResourceTemplate
);

// Import resources từ Excel
router.post(
  "/import-resource-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  importResourceExcel
);

// Export resources ra Excel
router.get(
  "/export-resource-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportResourceExcel
);

module.exports = router;
