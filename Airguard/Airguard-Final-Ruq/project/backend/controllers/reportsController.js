const PollutionReport = require("../models/ReportModel");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createPollutionReport = async (req, res) => {
  try {
    const { description, location, pollutionType, user, date, lat, lon } = req.body;
    const images = [];

    // FIX: Use req.files as an array (multer.array)
    if (req.files && req.files.length > 0) {
      const files = req.files;
  for (const file of files) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "pollution_reports" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
          uploadStream.end(file.buffer);
    });
    images.push(result.secure_url);
  }
}

    const newReport = new PollutionReport({
      description,
      location,
      pollutionType,
      user,
      date,
      images,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      verificationStatus: "pending",
      resolved: false,
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPollutionReports = async (req, res) => {
  try {
    const reports = await PollutionReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePollutionReport = async (req, res) => {
  try {
    console.log("Update request body:", req.body);
    console.log("Update request files:", req.files);
    console.log("Update request params:", req.params);
    console.log("Content-Type:", req.headers['content-type']);
    
    // For debugging, log each field individually
    console.log("Description from body:", req.body.description);
    console.log("Location from body:", req.body.location);
    console.log("PollutionType from body:", req.body.pollutionType);
    console.log("Lat from body:", req.body.lat);
    console.log("Lon from body:", req.body.lon);
    console.log("LocationName from body:", req.body.locationName);
    
    const { 
      verificationStatus, 
      resolved, 
      rejectionComment,
      description,
      location,
      pollutionType,
      lat,
      lon,
      locationName,
      clearImages
    } = req.body;

    const validStatuses = ["pending", "verified", "rejected"];
    if (verificationStatus && !validStatuses.includes(verificationStatus)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    const updateData = {};
    
    // Admin-specific fields
    if (verificationStatus) updateData.verificationStatus = verificationStatus;
    if (resolved !== undefined) {
      updateData.resolved = resolved;
      updateData.resolvedAt = resolved ? new Date() : null;
    }
    if (rejectionComment !== undefined) updateData.rejectionComment = rejectionComment;
    
    // User-editable fields
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (pollutionType !== undefined) updateData.pollutionType = pollutionType;
    if (lat !== undefined) updateData.lat = parseFloat(lat);
    if (lon !== undefined) updateData.lon = parseFloat(lon);
    if (locationName !== undefined) updateData.locationName = locationName;

    // Handle images
    if (req.files && req.files.length > 0) {
      // New images uploaded
      const newImages = [];
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "pollution_reports" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });
        newImages.push(result.secure_url);
      }
      updateData.images = newImages;
      console.log("New images uploaded:", newImages);
    } else if (clearImages === true || clearImages === 'true') {
      // User wants to clear all images
      updateData.images = [];
      console.log("Clearing all images");
    } else {
      console.log("No new images uploaded, preserving existing images");
    }
    // If no new images are uploaded and clearImages is not set, don't update the images field (preserve existing images)

    console.log("Final update data:", updateData);

    const updatedReport = await PollutionReport.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean(); // Add .lean() to get plain JavaScript object

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(updatedReport);
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: error.message });
  }
};
exports.deletePollutionReport = async (req, res) => {
  try {
    const report = await PollutionReport.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    if (report.images && report.images.length > 0) {
      for (const imageUrl of report.images) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`pollution_reports/${publicId}`);
      }
    }
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};