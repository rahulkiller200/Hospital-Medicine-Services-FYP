const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Requester name is required"],
    trim: true
  },
  bloodType: {
    type: String,
    required: [true, "Blood type is required"],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  contact: {
    type: String,
    required: [true, "Contact information is required"],
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  urgency: {
    type: String,
    enum: ['High', 'Normal', 'Low'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['Pending', 'Fulfilled', 'Canceled'],
    default: 'Pending'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }
}, { timestamps: true });

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
