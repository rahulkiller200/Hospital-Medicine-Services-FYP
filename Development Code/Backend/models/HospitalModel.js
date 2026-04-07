const mongoose = require('mongoose');

// Enum for bed types
const BedTypes = {
  ICU: 'ICU',
  GENERAL: 'General',
  EMERGENCY: 'Emergency',
  PEDIATRIC: 'Pediatric',
  MATERNITY: 'Maternity'
};

// Enum for specializations
const Specializations = {
  GENERAL: 'General',
  CARDIOLOGY: 'Cardiology',
  NEUROLOGY: 'Neurology',
  ORTHOPEDICS: 'Orthopedics',
  PEDIATRICS: 'Pediatrics',
  GYNECOLOGY: 'Gynecology',
  EMERGENCY: 'Emergency'
};

const hospitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    default: 'hospital'
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid Nepali phone number (10 digits)']
  },
  hotline: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid Nepali hotline number (10 digits)']
  },
  email: {
    type: String,
    required: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
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
  position: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  available: {
    type: Boolean,
    required: true,
    default: true
  },
  emergencyServices: {
    type: Boolean,
    default: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  beds: [{
    type: {
      type: String,
      required: true,
      enum: Object.values(BedTypes)
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    available: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(val) {
          return val <= this.total;
        },
        message: 'Available beds cannot exceed total beds'
      }
    }
  }],
  doctors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
      type: String,
      required: true,
      enum: Object.values(Specializations)
    },
    available: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Add index for faster queries
hospitalSchema.index({ userId: 1 });
hospitalSchema.index({ name: 1 });

// Create the model
const Hospital = mongoose.model('Hospital', hospitalSchema);

// Export everything
module.exports = {
  Hospital,
  BedTypes,
  Specializations
}; 