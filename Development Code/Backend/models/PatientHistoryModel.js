const mongoose = require('mongoose');

const PatientHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
    min: [0, 'Height must be a positive number'],
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight must be a positive number'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required'],
      trim: true,
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Emergency contact phone number is required'],
      trim: true,
    },
  },
  allergies: {
    type: [String],
    default: [],
  },
  currentMedications: {
    type: [String],
    default: [],
  },
  pastSurgeries: {
    type: [String],
    default: [],
  },
  chronicConditions: {
    type: [String],
    default: [],
  },
  familyHistory: {
    type: [String],
    default: [],
  },
  lifestyle: {
    smoking: {
      type: String,
      enum: ['never', 'former', 'current'],
      default: 'never',
    },
    alcohol: {
      type: String,
      enum: ['never', 'occasional', 'regular'],
      default: 'never',
    },
    exercise: {
      type: String,
      enum: ['never', 'rarely', 'weekly', 'daily'],
      default: 'never',
    },
    diet: {
      type: String,
      default: '',
    },
    username: {
      type: String,
    },
  },
}, {
  timestamps: true
});

// Add indexes for better query performance
PatientHistorySchema.index({ user: 1 });

const PatientHistory = mongoose.model('PatientHistory', PatientHistorySchema);

module.exports = PatientHistory; 