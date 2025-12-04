const express = require("express");
const {
  login,
  changePassword,
  createNew,
  applyAccountForUser,
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

router.post("/login", login);
router.put(
  "/change-password/:id",
  authenticateJWT,
  authorizeRoles("EMPLOYEE"),
  changePassword
);
router.post("/create-new", authenticateJWT, authorizeRoles("ADMIN"), createNew);
router.post(
  "/apply",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  applyAccountForUser
);

module.exports = router;
