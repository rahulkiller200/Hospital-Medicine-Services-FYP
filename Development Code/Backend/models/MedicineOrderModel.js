const mongoose = require("mongoose");

const medicineOrderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'providerType'
  },
  providerType: {
    type: String,
    required: true,
    enum: ['Hospital', 'Pharmacy']
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Packing', 'Out for Delivery', 'Delivered', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  prescriptionImageUrl: {
    type: String,
    required: function() {
      // This logic will be checked in the controller before saving
      return false; 
    }
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("MedicineOrder", medicineOrderSchema);
