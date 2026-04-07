const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  configId: { type: String, default: "master_config", unique: true },
  maintenanceMode: { type: Boolean, default: false },
  hospital2FAEnabled: { type: Boolean, default: false }
});

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

module.exports = SystemConfig;
