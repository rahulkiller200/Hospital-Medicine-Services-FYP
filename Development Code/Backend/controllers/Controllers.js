const { Users } = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SystemConfig = require('../models/SystemConfigModel');

// error responses
const sendErrorResponse = (res, status, message, error = null) => {
    console.error(`[ERROR] ${message}:`, error ? error.message : "No additional error info");
    return res.status(status).json({
        success: false,
        message,
        error: error ? error.message : undefined
    });
};

// Signup
const Signup = async (req, res) => {
    console.log("[SIGNUP] Incoming request for:", req.body.username);
    try {
        const { name, email, username, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !username || !password || !role) {
            return sendErrorResponse(res, 400, "All fields are required");
        }

        // Split name into firstName and lastName
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        // Validate role
        const validRoles = ['patient', 'ambulance', 'hospital', 'bloodbank', 'pharmacy', 'admin'];
        if (!validRoles.includes(role.toLowerCase())) {
            return sendErrorResponse(res, 400, "Invalid role selected");
        }

        // Check for duplicate email
        const existingEmail = await Users.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return sendErrorResponse(res, 400, "Email already exists");
        }

        // Check for duplicate username
        const existingUsername = await Users.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return sendErrorResponse(res, 400, "Username already exists");
        }

        // Prevent multiple admins
        if (role.toLowerCase() === 'admin') {
            const adminExists = await Users.findOne({ role: 'admin' });
            if (adminExists) {
                return sendErrorResponse(res, 403, "An Administrator account already exists. Maximum 1 admin allowed.");
            }
        }

        const userData = {
            firstName,
            lastName,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: password,
            role: role.toLowerCase(),
            isVerified: ['patient', 'admin'].includes(role.toLowerCase()) // Pharmacies require approval like Hospitals
        };

        // Create user
        const user = new Users(userData);
        console.log("[SIGNUP] Saving user to DB:", user.username);
        await user.save();
        console.log("[SIGNUP] User saved successfully!");

        // Generate token
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role,
                username: user.username
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            token: token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        sendErrorResponse(res, 500, "Error during signup", error);
    }
};

// Login
const Login = async (req, res) => {
    console.log("[LOGIN] Attempt for username:", req.body.username);
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return sendErrorResponse(res, 400, "Username and password are required");
        }
    
        // Find user
        const user = await Users.findOne({ username: username.toLowerCase() });
    
        if (!user) {
            return sendErrorResponse(res, 401, "Invalid credentials");
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("[LOGIN] Password match result:", isMatch);
        if (!isMatch) {
            return sendErrorResponse(res, 401, "Invalid credentials");
        }
        
        // Prevent strictly-regulated roles from logging in without Admin clearance
        if (['hospital', 'bloodbank', 'ambulance', 'pharmacy'].includes(user.role) && !user.isVerified) {
            return sendErrorResponse(res, 403, "Your administrative account is pending verification. Please wait until approved.");
        }
        
        // 2FA Injection for Hospitals
        if (user.role === 'hospital') {
            const config = await SystemConfig.findOne({ configId: "master_config" });
            if (config && config.hospital2FAEnabled) {
                // Return early without JWT to trigger the frontend 2FA prompt
                return res.json({
                    success: true,
                    requires2FA: true,
                    user: { id: user._id, username: user.username, role: user.role, email: user.email }
                });
            }
        }
        
        // Generate token
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role,
                username: user.username
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                email: user.email
            }
        });
    } catch (error) {
        sendErrorResponse(res, 500, "Error during login", error);
    }
};

// Logout
const Logout = (req, res) => {
    try {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        sendErrorResponse(res, 500, 'Error during logout', error);
    }
};

// Get pending verifications (Admin only)
const GetPendingVerifications = async (req, res) => {
    try {
        const pendingUsers = await Users.find({ isVerified: false }).select('-password');
        res.status(200).json({ success: true, count: pendingUsers.length, data: pendingUsers });
    } catch (error) {
        sendErrorResponse(res, 500, "Error fetching pending verifications", error);
    }
};

// Verify User (Admin only)
const VerifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Users.findByIdAndUpdate(id, { isVerified: true }, { new: true }).select('-password');
        if (!user) {
            return sendErrorResponse(res, 404, "User not found");
        }
        res.status(200).json({ success: true, message: `${user.role} verified successfully!`, data: user });
    } catch (error) {
        sendErrorResponse(res, 500, "Error verifying user", error);
    }
};

// Verify Recovery (Forgot Password Step 1)
const VerifyRecovery = async (req, res) => {
    try {
        const { email, lastName } = req.body;
        if (!email || !lastName) {
            return sendErrorResponse(res, 400, "Email and Last Name are required for recovery");
        }

        const user = await Users.findOne({ 
            email: email.toLowerCase(), 
            lastName: { $regex: new RegExp("^" + lastName.trim() + "$", "i") } 
        });

        if (!user) {
            return sendErrorResponse(res, 404, "Invalid recovery details. User not found.");
        }

        res.status(200).json({ 
            success: true, 
            message: "Identity verified. You may now reset your password.",
            userId: user._id 
        });
    } catch (error) {
        sendErrorResponse(res, 500, "Error during recovery verification", error);
    }
};

// Reset Password (Forgot Password Step 2)
const ResetPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
            return sendErrorResponse(res, 400, "User ID and New Password are required");
        }

        const user = await Users.findById(userId);
        if (!user) {
            return sendErrorResponse(res, 404, "User not found");
        }

        user.password = newPassword; // Pre-save hook will hash this
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "Password reset successful! You can now log in with your new password." 
        });
    } catch (error) {
        sendErrorResponse(res, 500, "Error resetting password", error);
    }
};

module.exports = {
    Login,
    Signup,
    Logout,
    GetPendingVerifications,
    VerifyUser,
    VerifyRecovery,
    ResetPassword
};
