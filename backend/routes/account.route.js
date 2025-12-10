const express = require("express");
const {
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

router.post("/register", register);
router.post("/login", login);
router.put(
  "/change-password/:id",
  authenticateJWT,
  authorizeRoles("EMPLOYEE"),
  changePassword
);

router.put(
  "/auto-reset-password",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  autoResetPassword
);

router.put(
  "/update-status",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  updateStatus
);

module.exports = router;
