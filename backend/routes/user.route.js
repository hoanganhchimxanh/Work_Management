const express = require("express");
const {
  getAll,
  getPersonal,
  createNew,
} = require("../controllers/user.controller");
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

router.get("/get-all", authenticateJWT, authorizeRoles("ADMIN"), getAll);
router.get(
  "/get-one/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  getPersonal
);
router.post("/create-new", authenticateJWT, authorizeRoles("ADMIN"), createNew);

module.exports = router;
