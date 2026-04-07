const Medicine = require("../models/MedicineModel");
const MedicineOrder = require("../models/MedicineOrderModel");
const { validationResult } = require("express-validator");
const { sendOrderPlacedEmail } = require("../utils/mailer");

// Get all medicines (Catalog)
exports.getMedicines = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (category && category !== "All") {
      query.category = category;
    }

    const medicines = await Medicine.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching medicines", error: error.message });
  }
};

// Add medicine to catalog (Admin only)
exports.addMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: "Error adding medicine", error: error.message });
  }
};

// Create Medicine Order (with optional prescription)
exports.createOrder = async (req, res) => {
  try {
    const { medicineId, providerId, providerType, quantity, notes } = req.body;
    
    // Check if medicine requires prescription
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });

    if (medicine.prescriptionRequired && !req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "This medicine requires a prescription upload. Please provide a clear photo of your prescription." 
      });
    }

    const orderData = {
      patientId: req.user.id,
      medicineId,
      providerId,
      providerType,
      quantity,
      notes,
      prescriptionImageUrl: req.file ? `/uploads/prescriptions/${req.file.filename}` : undefined,
      status: "Pending"
    };

    const order = await MedicineOrder.create(orderData);

    // Emit socket event for the provider
    if (req.io) {
      req.io.emit('new_order', { 
        message: `New medicine request received for ${medicine.name}!`,
        orderId: order._id 
      });
    }

    // Send order confirmation email to the patient
    if (req.user && req.user.email) {
       sendOrderPlacedEmail(req.user.email, req.user.username || 'Patient', medicine.name, quantity);
    }

    res.status(201).json({ success: true, message: "Order placed successfully", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating order", error: error.message });
  }
};

// Fetch user orders history
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await MedicineOrder.find({ patientId: req.user.id })
      .populate("medicineId")
      .populate("providerId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching order history", error: error.message });
  }
};

// Fetch cheaper generic alternatives
exports.getAlternatives = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine || !medicine.genericSalt) {
      return res.status(404).json({ success: false, message: "Medicine or generic salt information not found" });
    }

    // Find medicines with the same generic salt but a lower price
    const alternatives = await Medicine.find({
      genericSalt: medicine.genericSalt,
      _id: { $ne: medicine._id },
      price: { $lt: medicine.price }
    })
    .sort({ price: 1 })
    .limit(3);

    res.status(200).json({
      success: true,
      count: alternatives.length,
      data: alternatives
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching alternatives", error: error.message });
  }
};
