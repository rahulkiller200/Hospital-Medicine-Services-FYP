const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [50, "First name cannot exceed 50 characters"]
    },
    profilePicture: {
      type: String,
      default: ""
    },
    lastName: {
      type: String,
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name cannot exceed 50 characters"]
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
    },
    email: {
      type: String,
      unique: true,
      required: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (v) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]).{8,}$/.test(v);
        },
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      },
    },
    role: {
      type: String,
      enum: ["patient", "ambulance", "hospital", "admin", "bloodbank", "pharmacy"],
      required: true,
      default: "patient",
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    medicalProfile: {
      bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"], default: "Unknown" },
      allergies: { type: [String], default: [] },
      currentMedications: { type: [String], default: [] },
      emergencyContactName: { type: String, default: "" },
      emergencyContactPhone: { type: String, default: "" },
      medicalConditions: { type: [String], default: [] },
      vitalsHistory: [{
        date: { type: Date, default: Date.now },
        systolic: { type: Number },
        diastolic: { type: Number },
        glucose: { type: Number },
        weight: { type: Number },
        height: { type: Number }
      }]
    }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.statics.validateLoginCredentials = function(credentials) {
  const { username, password } = credentials;
  const errors = {};

  if (!username) {
    errors.username = "Username is required";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const Users = mongoose.model("Users", UserSchema);

module.exports = { Users };