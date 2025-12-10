const express = require("express");
const router = express.Router();
const kpiController = require("../controllers/kpi.controller");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

// Public routes (hoặc thêm authMiddleware nếu cần)
router.post(
  "/create-new",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  kpiController.createNew
);
router.get(
  "/get-all",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  kpiController.getAll
);
router.get(
  "/get-by-id/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  kpiController.getById
);
router.put(
  "/update/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  kpiController.updateKPI
);
router.delete(
  "/delete/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  kpiController.deleteKPI
);

router.get(
  "/my-kpis",
  authenticateJWT,
  authorizeRoles("EMPLOYEE"),
  kpiController.getMyKPIs
);

router.get(
  "/team/:teamId",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  kpiController.getTeamKPIs
);

module.exports = router;
