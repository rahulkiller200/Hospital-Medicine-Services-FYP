const express = require('express');
const { Login, Signup, Logout, GetPendingVerifications, VerifyUser, VerifyRecovery, ResetPassword } = require('../controllers/Controllers');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Auth routes
router.post('/login', Login);
router.post('/signup', Signup);
router.post('/logout', Logout);
router.post('/verify-recovery', VerifyRecovery);
router.post('/reset-password', ResetPassword);

// Admin workflow
const isAdmin = require('../middleware/isAdmin');
router.get('/admin/pending', authMiddleware, isAdmin, GetPendingVerifications);
router.put('/admin/verify/:id', authMiddleware, isAdmin, VerifyUser);

router.get('/users/check-auth', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      message: "User is authenticated",
      user: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication check"
    });
  }
});

router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    const user = await updateUser(req, res);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    const user = await deleteUser(req, res);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 