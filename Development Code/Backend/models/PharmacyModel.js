const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  name: {
    type: String,
    required: [true, "Pharmacy name is required"],
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, "License number is required"],
    unique: true
  },
  address: {
    street: String,
    city: String,
    state: String
  },
  phone: {
    type: String,
    required: true
  },
  email: String,
  website: String,
  position: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  available: {
    type: Boolean,
    default: true
  },
  inventory: [{
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
    stock: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Pharmacy", pharmacySchema);
