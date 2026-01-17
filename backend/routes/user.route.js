const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
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

// ========== BASIC ROUTES ==========
router.post(
  "/create-by-admin",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  userController.createByAdmin,
);
router.get(
  "/get-all",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  userController.getAll,
);
router.get(
  "/get-one/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "EMPLOYEE", "ACCOUNTANT"]),
  userController.getPersonal,
);
router.put(
  "/update/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "EMPLOYEE", "ACCOUNTANT"]),
  userController.updateUser,
);
router.delete(
  "/delete/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  userController.deleteUser,
);
router.delete(
  "/delete-self-account",
  authenticateJWT,
  authorizeRoles(["EMPLOYEE", "ACCOUNTANT"]),
  userController.deleteSelfAccount,
);

module.exports = router;
