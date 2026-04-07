const SystemConfig = require('../models/SystemConfigModel');
const jwt = require('jsonwebtoken');

const maintenanceMiddleware = async (req, res, next) => {
  try {
    const config = await SystemConfig.findOne({ configId: "master_config" });
    if (config && config.maintenanceMode) {
      
      // Allow auth routes to process so Admin can log in
      if (req.path.startsWith('/api/v1/auth/login')) {
        return next();
      }

      // Check if user is an admin
      let role = null;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          role = decoded.role;
        } catch(e) {}
      }
      
      if (role === 'admin') {
        return next();
      }

      return res.status(503).json({
        success: false,
        message: "503 SERVICE UNAVAILABLE: Global Maintenance Mode is strictly active. Non-Admin requests blocked."
      });
    }
    
    // Normal operation
    next();
  } catch (err) {
    next();
  }
};

module.exports = maintenanceMiddleware;
