const Pharmacy = require("../models/PharmacyModel");
const MedicineOrder = require("../models/MedicineOrderModel");
const { Users } = require("../models/UserModel");

// Get Pharmacy profile for logged-in pharmacy
exports.getPharmacyProfile = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id }).populate("inventory.medicineId");
    if (!pharmacy) return res.status(404).json({ success: false, message: "Pharmacy profile not found" });
    res.status(200).json({ success: true, data: pharmacy });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching profile", error: error.message });
  }
};

// Update Pharmacy Inventory
exports.updateInventory = async (req, res) => {
  try {
    const { medicineId, stock, medicineData } = req.body;
    let finalMedicineId = medicineId;

    // Support creating new medicine on the fly
    if (!medicineId && medicineData) {
      const Medicine = require("../models/MedicineModel");
      let existingMed = await Medicine.findOne({ name: { $regex: new RegExp("^" + medicineData.name + "$", "i") } });
      if (!existingMed) {
        existingMed = await Medicine.create(medicineData);
      }
      finalMedicineId = existingMed._id;
    }

    let pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) return res.status(404).json({ success: false, message: "Pharmacy not found" });

    const itemIndex = pharmacy.inventory.findIndex(item => item.medicineId.toString() === finalMedicineId.toString());

    if (itemIndex > -1) {
      pharmacy.inventory[itemIndex].stock = stock;
    } else {
      pharmacy.inventory.push({ medicineId: finalMedicineId, stock });
    }

    await pharmacy.save();
    const updatedPharmacy = await Pharmacy.findById(pharmacy._id).populate("inventory.medicineId");
    res.status(200).json({ success: true, message: "Inventory updated successfully", data: updatedPharmacy });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating inventory", error: error.message });
  }
};

// Get Pending Orders for Pharmacy
exports.getOrders = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) return res.status(404).json({ success: false, message: "Pharmacy not found" });

    const orders = await MedicineOrder.find({ providerId: pharmacy._id })
      .populate("patientId", "firstName lastName email")
      .populate("medicineId", "name price category");

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
  }
};

// Approve/Reject Order
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await MedicineOrder.findById(orderId).populate("patientId").populate("medicineId");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status;
    await order.save();

    // Trigger Email Notification (Nodemailer)
    if (status === "Approved") {
      // Mocking email trigger for now - will be implemented in Nodemailer phase
      console.log(`EMail sent to ${order.patientId.email}: Your order for ${order.medicineId.name} has been approved!`);
    }

    res.status(200).json({ success: true, message: `Order ${status} successfully`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};
