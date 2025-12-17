// backend/routes/dashboard.route.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
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

// Get dashboard statistics (total revenue, employees, channels, networks)
router.get(
  "/stats",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  dashboardController.getDashboardStats
);

// Get revenue by month for a specific year
router.get(
  "/revenue-by-month",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  dashboardController.getRevenueByMonth
);

// Get top employees by revenue
router.get(
  "/top-employees",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  dashboardController.getTopEmployees
);

// Get top teams by revenue
router.get(
  "/top-teams",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  dashboardController.getTopTeams
);

// Get top channels by revenue
router.get(
  "/top-channels",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  dashboardController.getTopChannels
);

// Get revenue comparison (current month vs previous month)
router.get(
  "/revenue-comparison",
  authenticateJWT,
  authorizeRoles(["ADMIN", "ACCOUNTANT"]),
  dashboardController.getRevenueComparison
);

module.exports = router;
