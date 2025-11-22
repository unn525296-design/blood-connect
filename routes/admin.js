const express = require("express");
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getActivityLogs,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:userId/status", toggleUserStatus);
router.delete("/users/:userId", deleteUser);
router.get("/activity-logs", getActivityLogs);

module.exports = router;
