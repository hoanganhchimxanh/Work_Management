const express = require("express");
const {
  createNew,
  getAll,
  getById,
  editInfo,
  deleteTeam,
  importTeamExcel,
  exportTeamExcel,
  exportTeamTemplate,
} = require("../controllers/team.controller");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const multer = require("multer");

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

const router = express.Router();
const logRequestTime = (req, res, next) => {
  console.log("Time: ", Date.now());
  next();
};

router.use(logRequestTime);
router.use(express.json());

router.post("/create-new", authenticateJWT, authorizeRoles("ADMIN"), createNew);
router.get("/get-all-team", authenticateJWT, authorizeRoles("ADMIN"), getAll);
router.get(
  "/get-team/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "EMPLOYEE"]),
  getById
);

router.put(
  "/edit-team-info/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  editInfo
);
router.delete(
  "/delete-team/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  deleteTeam
);

// Excel routes
router.get(
  "/download-template",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportTeamTemplate
);

router.post(
  "/import-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  upload.single("file"),
  importTeamExcel
);

router.get(
  "/export-excel",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  exportTeamExcel
);

module.exports = router;
