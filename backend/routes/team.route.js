const express = require("express");
const {
  createNew,
  editInfo,
  deleteTeam,
} = require("../controllers/team.controller");

const router = express.Router();
const logRequestTime = (req, res, next) => {
  console.log("Time: ", Date.now());
  next();
};

router.use(logRequestTime);
router.use(express.json());

router.post("/create-new", createNew);
router.put("/edit-team-info/:id", editInfo);
router.delete("/delete-team/:id", deleteTeam);

module.exports = router;
