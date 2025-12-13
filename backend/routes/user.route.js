const express = require("express");
const multer = require("multer");
const {
  createNewUser,
  registerByUser,
  createByAdmin,
  approveUser,
  rejectUser,
  getAll,
  getPersonal,
  updateUser,
  deleteUser,
  importUserExcel,
  exportUserExcel,
  exportUserTemplate,
} = require("../controllers/user.controller");
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

// ========== BASIC ROUTES ==========
router.post("/create-new-user", createNewUser);
router.post("/register", registerByUser);
router.post(
  "/create-by-admin",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  createByAdmin
);
router.post(
  "/approve/:userId",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  approveUser
);
router.delete(
  "/reject/:userId",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  rejectUser
);
router.get("/get-all", authenticateJWT, authorizeRoles("ADMIN"), getAll);
router.get(
  "/get-one/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "EMPLOYEE", "ACCOUNTANT"]),
  getPersonal
);
router.put(
  "/update/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "EMPLOYEE", "ACCOUNTANT"]),
  updateUser
);
router.delete(
  "/delete/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  deleteUser
);

// ========== EXCEL ROUTES ==========

// Download template Excel để import
router.get(
  "/download-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportUserTemplate
);

// Import users từ Excel
router.post(
  "/import-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"), // field name là "file"
  importUserExcel
);

// Export users ra Excel
router.get(
  "/export-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportUserExcel
);

module.exports = router;
