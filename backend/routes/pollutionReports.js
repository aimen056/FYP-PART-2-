const express = require("express");
const router = express.Router();
const {
  createPollutionReport,
  getAllPollutionReports,
  updatePollutionReport,
  deletePollutionReport,
} = require("../controllers/reportsController");
const multer = require("multer");
const path = require("path");

// Configure Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Images only (jpeg, jpg, png)!"));
    }
  },
});

// Create a new pollution report with image uploads
router.post("/", upload.array("images", 5), createPollutionReport);

// Get all pollution reports
router.get("/", getAllPollutionReports);

// Update a pollution report (verification/resolution)
router.put("/:id", upload.array("images", 5), updatePollutionReport);

// Delete a pollution report
router.delete("/:id", deletePollutionReport);

module.exports = router;