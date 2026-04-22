const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Medicine name is required"],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: ["Pain Relief", "Antibiotics", "Fever", "Cough & Cold", "First Aid", "Chronic Diseases", "Others"],
    default: "Others"
  },
  genericSalt: {
    type: String,
    trim: true,
    default: "N/A"
  },
  manufacturer: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Medicine", medicineSchema);
