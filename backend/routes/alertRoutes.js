const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  createAlert,
  getAllAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  toggleAlertStatus,
} = require("../controllers/alertsController");

router.post("/", authMiddleware, createAlert);
router.get("/", authMiddleware, getAllAlerts);
router.get("/:id", authMiddleware, getAlertById);
router.put("/:id", authMiddleware, updateAlert);
router.delete("/:id", authMiddleware, deleteAlert);
router.patch("/:id/toggle-status", authMiddleware, toggleAlertStatus);

module.exports = router;
