const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const SystemConfig = require('../models/SystemConfigModel');

// Ensure config exists
async function ensureConfig() {
  let config = await SystemConfig.findOne({ configId: "master_config" });
  if (!config) {
    config = await SystemConfig.create({});
  }
  return config;
}

// Get Settings
router.get('/settings', authMiddleware, isAdmin, async (req, res) => {
  try {
    const config = await ensureConfig();
    res.json({ success: true, settings: config });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching settings" });
  }
});

// Update Settings
router.put('/settings', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { maintenanceMode, hospital2FAEnabled } = req.body;
    let config = await ensureConfig();
    
    config.maintenanceMode = maintenanceMode !== undefined ? maintenanceMode : config.maintenanceMode;
    config.hospital2FAEnabled = hospital2FAEnabled !== undefined ? hospital2FAEnabled : config.hospital2FAEnabled;
    
    await config.save();
    res.json({ success: true, message: "Settings Updated Successfully", settings: config });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating settings" });
  }
});

module.exports = router;
