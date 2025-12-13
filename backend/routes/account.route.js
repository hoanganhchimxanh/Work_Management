const express = require("express");
const {
  createNewAccount,
  login,
  changePassword,
  register,
  autoResetPassword,
  updateStatus,
} = require("../controllers/account.controller");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

const router = express.Router();
const logRequestTime = (req, res, next) => {
  console.log("Time: ", Date.now());
  next();
};

router.use(logRequestTime);
router.use(express.json());

router.post("/create-new-account", createNewAccount);
router.post("/register", register);
router.post("/login", login);
router.post("/auto-reset-password", autoResetPassword);
router.patch(
  "/change-password/:id",
  authenticateJWT,
  authorizeRoles(["ACCOUNTANT", "EMPLOYEE"]),
  changePassword
);

router.put(
  "/update-status",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  updateStatus
);

module.exports = router;
