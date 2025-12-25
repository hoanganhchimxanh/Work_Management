const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

// Public routes (hoặc thêm authMiddleware nếu cần)
router.post(
  "/create-new",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  taskController.createNew
);
router.get(
  "/get-all",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  taskController.getAll
);
router.get(
  "/get-by-id/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  taskController.getById
);
router.put(
  "/update/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  taskController.updateTask
);
router.patch(
  "/update-status/:id",
  authenticateJWT,
  authorizeRoles(["ADMIN", "EMPLOYEE"]),
  taskController.updateStatus
);
router.delete(
  "/delete/:id",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  taskController.deleteTask
);

router.get(
  "/my-tasks",
  authenticateJWT,
  authorizeRoles("EMPLOYEE"),
  taskController.getMyTasks
);

router.get(
  "/team/:teamId",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  taskController.getTeamTasks
);

// Stats
router.get(
  "/stats",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  taskController.getTaskStats
);

module.exports = router;
