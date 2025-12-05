const express = require("express");
const {
  createNew,
  getAll,
  getById,
  editInfo,
  deleteTeam,
} = require("../controllers/team.controller");
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

router.post("/create-new", authenticateJWT, authorizeRoles("ADMIN"), createNew);
router.get("/get-all-team", authenticateJWT, authorizeRoles("ADMIN"), getAll);
router.get("/get-team/:id", authenticateJWT, authorizeRoles("ADMIN"), getById);

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

module.exports = router;
