const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAllUsers, getUserById, updateUser, deleteUser, checkAuth, updateProfile, getUserProfile, addVitals } = require('../controllers/UserController');
const { validateUserUpdate } = require('../middleware/hospitalAuth');
const { uploadProfile } = require('../middleware/uploadMiddleware');

// Get all users (admin only)
router.get('/', authMiddleware, getAllUsers);

// Check authentication status
router.get('/check-auth', authMiddleware, checkAuth);

// Get single user
router.get('/:id', authMiddleware, getUserById);

// Update user
router.put('/:id', authMiddleware, updateUser);

// Delete user
router.delete('/:id', authMiddleware, deleteUser);

// update user profile
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, uploadProfile.single('profilePicture'), validateUserUpdate, updateProfile);

// Add health vitals
router.post('/vitals', authMiddleware, addVitals);

module.exports = router; 