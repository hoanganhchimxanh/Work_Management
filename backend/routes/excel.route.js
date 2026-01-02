const express = require("express");
const multer = require("multer");
const router = express.Router();
const excelController = require("../controllers/excel.controller");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

// Cấu hình multer để xử lý file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file Excel (.xlsx, .xls, .csv)"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const logRequestTime = (req, res, next) => {
  console.log("Time: ", Date.now());
  next();
};

router.use(logRequestTime);
router.use(express.json());

// ========== USER EXCEL ROUTES ==========
router.get(
  "/download-user-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  excelController.exportUserTemplate
);

router.post(
  "/import-user-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  excelController.importUserExcel
);

router.get(
  "/export-user-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  excelController.exportUserExcel
);

// ========== TEAM EXCEL ROUTES ==========
router.get(
  "/download-team-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  excelController.exportTeamTemplate
);

router.post(
  "/import-team-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  excelController.importTeamExcel
);

router.get(
  "/export-team-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  excelController.exportTeamExcel
);

// ========== NETWORK EXCEL ROUTES ==========
router.get(
  "/download-network-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  excelController.exportNetworkTemplate
);

router.post(
  "/import-network-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  excelController.importNetworkExcel
);

router.get(
  "/export-network-excel",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  excelController.exportNetworkExcel
);

// ========== RESOURCE EXCEL ROUTES ==========
router.get(
  "/download-resource-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  excelController.exportResourceTemplate
);

router.post(
  "/import-resource-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  excelController.importResourceExcel
);

router.get(
  "/export-resource-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  excelController.exportResourceExcel
);

module.exports = router;
