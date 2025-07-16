const express = require("express");
const router = express.Router();
const {
  createAlert,
  getAllAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  toggleAlertStatus,
} = require("../controllers/alertsController");

router.post("/", createAlert);
router.get("/", getAllAlerts);
router.get("/:id", getAlertById);
router.put("/:id", updateAlert);
router.delete("/:id", deleteAlert);
router.patch("/:id/toggle-status", toggleAlertStatus);

module.exports = router;

