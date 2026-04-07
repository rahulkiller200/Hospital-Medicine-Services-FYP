const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createOrUpdatePatientHistory, getPatientHistory, getPatientProfile, updatePatientProfile } = require("../controllers/PatientController");

const { uploadProfile } = require("../middleware/uploadMiddleware");

// Get patient profile
router.get("/profile", authMiddleware, getPatientProfile);

// Update basic profile information
router.post("/update", authMiddleware, uploadProfile.single("profilePicture"), updatePatientProfile);

// Get patient history
router.get("/history", authMiddleware, getPatientHistory);

// Create or update patient history
router.post("/", authMiddleware, createOrUpdatePatientHistory);

module.exports = router; 