const BloodBank = require('../models/BloodBankModel');

// Helper function for error responses
const sendErrorResponse = (res, status, message, error = null) => {
  console.error(message, error ? error : '');
  return res.status(status).json({
    success: false,
    message,
    error: error ? error.message : undefined
  });
};

// Get all blood banks with search and filter
const getAllBloodBanks = async (req, res) => {
  try {
    const { 
      search, 
      city, 
      state, 
      bloodType,
      minAvailable,
      available
    } = req.query;

    // Build query
    const query = {};

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by location
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    if (state) {
      query['address.state'] = { $regex: state, $options: 'i' };
    }

    // Filter by availability
    if (available !== undefined) {
      query.available = available === 'true';
    }

    // Filter by blood type and minimum available
    if (bloodType || minAvailable) {
      query.bloodTypes = {
        $elemMatch: {
          ...(bloodType && { group: bloodType }),
          ...(minAvailable && { available: { $gte: parseInt(minAvailable) } })
        }
      };
    }

    const bloodBanks = await BloodBank.find(query);
    res.status(200).json({
      success: true,
      data: bloodBanks
    });
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching blood banks", error);
  }
};

// Get blood bank by ID
const getBloodBankById = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne({ userId: req.params.userId });
    if (!bloodBank) {
      return sendErrorResponse(res, 404, "Blood bank not found");
    }
    res.status(200).json({
      success: true,
      data: bloodBank
    });
  } catch (error) {
    sendErrorResponse(res, 500, "Error fetching blood bank", error);
  }
};

// Create new blood bank
const createBloodBank = async (req, res) => {
  try {
    const bloodBankData = {
      ...req.body,
      userId: req.user.id // From auth middleware
    };
    const bloodBank = new BloodBank(bloodBankData);
    await bloodBank.save();
    res.status(201).json({
      success: true,
      message: "Blood bank created successfully",
      data: bloodBank
    });
  } catch (error) {
    sendErrorResponse(res, 500, "Error creating blood bank", error);
  }
};

// Update blood bank
const updateBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    if (!bloodBank) {
      return sendErrorResponse(res, 404, "Blood bank not found");
    }

    // Check if user owns this blood bank
    if (bloodBank.userId.toString() !== req.user.id) {
      return sendErrorResponse(res, 403, "Not authorized to update this blood bank");
    }

    const updatedBloodBank = await BloodBank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Blood bank updated successfully",
      data: updatedBloodBank
    });
  } catch (error) {
    sendErrorResponse(res, 500, "Error updating blood bank", error);
  }
};

// Delete blood bank
const deleteBloodBank = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.params.id);
    if (!bloodBank) {
      return sendErrorResponse(res, 404, "Blood bank not found");
    }

    // Check if user owns this blood bank
    if (bloodBank.userId.toString() !== req.user.id) {
      return sendErrorResponse(res, 403, "Not authorized to delete this blood bank");
    }

    await bloodBank.deleteOne();
    res.json({
      success: true,
      message: "Blood bank deleted successfully"
    });
  } catch (error) {
    sendErrorResponse(res, 500, "Error deleting blood bank", error);
  }
};

// Update blood inventory
const updateBloodInventory = async (req, res) => {
  try {
    const { bloodTypes } = req.body;
    const bloodBank = await BloodBank.findById(req.params.id);
    
    if (!bloodBank) {
      return sendErrorResponse(res, 404, "Blood bank not found");
    }

    // Check if user owns this blood bank
    if (bloodBank.userId.toString() !== req.user.id) {
      return sendErrorResponse(res, 403, "Not authorized to update this blood bank");
    }

    bloodBank.bloodTypes = bloodTypes;
    await bloodBank.save();

    res.json({
      success: true,
      message: "Blood inventory updated successfully",
      data: bloodBank
    });
  } catch (error) {
    sendErrorResponse(res, 500, "Error updating blood inventory", error);
  }
};

module.exports = {
  getAllBloodBanks,
  getBloodBankById,
  createBloodBank,
  updateBloodBank,
  deleteBloodBank,
  updateBloodInventory
};