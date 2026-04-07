const mongoose = require('mongoose');

const bloodTypeSchema = new mongoose.Schema({
  group: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  available: {
    type: Number,
    required: true,
    min: 0
  }
});

const bloodBankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    }
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  hotline: {
    type: String,
    required: true,
    trim: true
  },
  bloodTypes: [bloodTypeSchema],
  available: {
    type: Boolean,
    default: true
  },
  position: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  }
}, {
  timestamps: true
});

const BloodBank = mongoose.model('BloodBank', bloodBankSchema);

module.exports = BloodBank;