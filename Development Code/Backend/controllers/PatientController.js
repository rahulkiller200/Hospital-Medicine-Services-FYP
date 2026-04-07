const PatientHistory = require("../models/PatientHistoryModel");
const { Users } = require("../models/UserModel");

// Create or update patient history
exports.createOrUpdatePatientHistory = async (req, res) => {
  try {
    const userId = req.body.userId || req.user._id;
    const {
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      height,
      weight,
      address,
      phoneNumber,
      emergencyContact,
      allergies,
      currentMedications,
      pastSurgeries,
      chronicConditions,
      familyHistory,
      lifestyle,
      username,
    } = req.body;

    // Validate required fields
    if (!fullName || !dateOfBirth || !gender || !bloodGroup || !height || !weight || !address || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate emergency contact
    if (!emergencyContact?.name || !emergencyContact?.relationship || !emergencyContact?.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide all emergency contact details",
      });
    }

    // Check if user exists
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find existing patient history or create new one
    let patientHistory = await PatientHistory.findOne({ user: userId });

    if (patientHistory) {
      // Update existing history
      patientHistory = await PatientHistory.findByIdAndUpdate(
        patientHistory._id,
        {
          fullName,
          dateOfBirth,
          gender,
          bloodGroup,
          height,
          weight,
          address,
          phoneNumber,
          emergencyContact,
          allergies,
          currentMedications,
          pastSurgeries,
          chronicConditions,
          familyHistory,
          lifestyle,
          username,
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new history
      patientHistory = await PatientHistory.create({
        user: userId,
        fullName,
        dateOfBirth,
        gender,
        bloodGroup,
        height,
        weight,
        address,
        phoneNumber,
        emergencyContact,
        allergies,
        currentMedications,
        pastSurgeries,
        chronicConditions,
        familyHistory,
        lifestyle,
        username,
      });
    }

    res.status(200).json({
      success: true,
      data: patientHistory,
    });
  } catch (error) {
    console.error("Error in createOrUpdatePatientHistory:", error);
    res.status(500).json({
      success: false,
      message: "Error creating/updating patient history",
      error: error.message,
    });
  }
};

// Get patient history
exports.getPatientHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const patientHistory = await PatientHistory.findOne({ user: userId });

    if (!patientHistory) {
      return res.status(404).json({
        success: false,
        message: "Patient history not found",
      });
    }

    res.status(200).json({
      success: true,
      data: patientHistory,
    });
  } catch (error) {
    console.error("Error in getPatientHistory:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching patient history",
      error: error.message,
    });
  }
};

// Get patient profile
exports.getPatientProfile = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update basic profile information
exports.updatePatientProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user information
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    // Update profile picture if uploaded
    if (req.file) {
      user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    // Update password if provided
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        });
      }
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};