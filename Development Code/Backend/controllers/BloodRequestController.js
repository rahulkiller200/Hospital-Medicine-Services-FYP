const BloodRequest = require("../models/BloodRequestModel");

exports.createRequest = async (req, res) => {
  try {
    const { name, bloodType, contact, message, urgency, userId } = req.body;

    // Basic validation
    if (!name || !bloodType || !contact) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, blood type, and contact info"
      });
    }

    const newRequest = await BloodRequest.create({
      name,
      bloodType,
      contact,
      message,
      urgency: urgency || "Normal",
      userId: userId || null
    });

    res.status(201).json({
      success: true,
      message: "Blood request submitted successfully",
      data: newRequest
    });
  } catch (error) {
    console.error("Error creating blood request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error("Error getting blood requests:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error("Error updating blood request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
