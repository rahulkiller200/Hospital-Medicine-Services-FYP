const { Users } = require('../models/UserModel');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const users = await Users.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Check authentication status
exports.checkAuth = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'User is authenticated',
      user: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication check' });
  }
};

// Get single user
exports.getUserById = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const user = await Users.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const user = await Users.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Handle password update
    if (req.body.newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    // Update profile picture if uploaded
    if (req.file) {
      user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    // Update other fields if provided
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.username) user.username = req.body.username.toLowerCase();
    if (req.body.name) {
       // Support for legacy 'name' field if frontend uses it
       const parts = req.body.name.split(' ');
       user.firstName = parts[0];
       user.lastName = parts.slice(1).join(' ');
    }
    if (req.body.email) {
      // Check if email is already in use by another user
      const emailExists = await Users.findOne({ 
        email: req.body.email,
        _id: { $ne: req.user.id }
      });
      
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email is already in use'
        });
      }
      user.email = req.body.email;
    }

    // Update medical profile if provided
    if (req.body.medicalProfile) {
      if (!user.medicalProfile) {
        user.medicalProfile = {};
      }
      // Merge new fields into the existing medical profile
      Object.assign(user.medicalProfile, req.body.medicalProfile);
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await Users.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating profile'
    });
  }
};

// Add health vitals record
exports.addVitals = async (req, res) => {
  try {
    const { systolic, diastolic, glucose, weight, height } = req.body;
    
    // Basic validation
    if (!systolic || !diastolic || !glucose || !weight || !height) {
      return res.status(400).json({
        success: false,
        message: "All vitals (BP, Glucose, Weight, Height) are required."
      });
    }

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Initialize medicalProfile if it doesn't exist
    if (!user.medicalProfile) {
      user.medicalProfile = { vitalsHistory: [] };
    }

    // Add to history
    user.medicalProfile.vitalsHistory.push({
      systolic,
      diastolic,
      glucose,
      weight,
      height,
      date: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Vitals logged successfully!",
      data: user.medicalProfile.vitalsHistory
    });
  } catch (error) {
    console.error("Error adding vitals:", error);
    res.status(500).json({ success: false, message: "Server error logging vitals" });
  }
}; 