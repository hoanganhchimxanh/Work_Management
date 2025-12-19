const express = require("express");
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
  sendResources,
} = require("../controllers/user.controller");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const multer = require("multer");

const router = express.Router();

const resourceUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
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

router.post(
  "/send-resources/:userId",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  resourceUpload.single("file"), // Chấp nhận 1 file với field name là "file"
  sendResources
);

module.exports = router;
