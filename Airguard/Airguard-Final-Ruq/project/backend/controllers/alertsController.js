const Alert = require('../models/AlertModel')

// Create a new alert
const createAlert = async (req, res) => {
  try {
    const alertData = req.body;
    const alert = new Alert(alertData);
    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({ error: "Failed to create alert" });
  }
};

// Retrieve all alerts
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};

// Retrieve a single alert by ID
const getAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }
    res.json(alert);
  } catch (error) {
    console.error("Error fetching alert by ID:", error);
    res.status(500).json({ error: "Failed to fetch alert" });
  }
};

// Update an alert by ID
const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedAlert = await Alert.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedAlert) {
      return res.status(404).json({ error: "Alert not found" });
    }
    res.json(updatedAlert);
    console.log("Updating Alert:", id, updateData);

  } catch (error) {
    console.error("Error updating alert:", error);
    res.status(500).json({ error: "Failed to update alert" });
  }
};

// Delete an alert by ID
const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAlert = await Alert.findByIdAndDelete(id);
    if (!deletedAlert) {
      return res.status(404).json({ error: "Alert not found" });
    }
    res.json({ id, message: "Alert deleted successfully" });
} catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({ error: "Failed to delete alert" });
  }
};

// Toggle the status of an alert (active/inactive)
const toggleAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }
    alert.status = !alert.status;
    await alert.save();
    res.json(alert);
  } catch (error) {
    console.error("Error toggling alert status:", error);
    res.status(500).json({ error: "Failed to toggle alert status" });
  }
};
module.exports = {createAlert,getAllAlerts,deleteAlert, updateAlert,  getAlertById  ,toggleAlertStatus  }






