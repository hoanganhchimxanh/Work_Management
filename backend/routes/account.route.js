const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");
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

// ========== ACCOUNT ROUTES ==========
router.post("/login", accountController.login);
router.post("/auto-reset-password", accountController.autoResetPassword);

router.patch(
  "/change-password/:id",
  authenticateJWT,
  authorizeRoles(["ACCOUNTANT", "EMPLOYEE"]),
  accountController.changePassword,
);

router.put(
  "/update-status",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  accountController.updateStatus,
);

module.exports = router;
