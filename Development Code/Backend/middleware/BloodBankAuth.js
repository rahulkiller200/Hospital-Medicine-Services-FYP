const { Users } = require('../models/UserModel');

const verifyBloodBank = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await Users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== 'bloodbank') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only blood bank users can perform this action."
      });
    }

    next();
  } catch (error) {
    console.error("Blood bank auth error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying blood bank user"
    });
  }
};

const validateBloodBankData = (req, res, next) => {
  const { name, address, phone, hotline, bloodTypes, position } = req.body;

  // Check required fields
  if (!name || !address || !phone || !hotline || !position) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  // Validate address
  if (!address.street || !address.city || !address.state) {
    return res.status(400).json({
      success: false,
      message: "Invalid address format"
    });
  }

  // Validate position
  if (typeof position.lat !== 'number' || typeof position.lng !== 'number') {
    return res.status(400).json({
      success: false,
      message: "Invalid position format"
    });
  }

  // Validate phone numbers
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(phone) || !phoneRegex.test(hotline)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number format"
    });
  }

  // Validate blood types if provided
  if (bloodTypes && Array.isArray(bloodTypes)) {
    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const type of bloodTypes) {
      if (!validGroups.includes(type.group) || typeof type.available !== 'number' || type.available < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid blood type data"
        });
      }
    }
  }

  next();
};

module.exports = { verifyBloodBank, validateBloodBankData };
