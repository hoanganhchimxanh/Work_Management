const express = require("express");
const {
  createNew,
  applyAccountForUser,
} = require("../controllers/account.controller");

const router = express.Router();
const logRequestTime = (req, res, next) => {
  console.log("Time: ", Date.now());
  next();
};

router.use(logRequestTime);
router.use(express.json());

router.post("/create-new", createNew);
router.post("/apply", applyAccountForUser);

module.exports = router;
