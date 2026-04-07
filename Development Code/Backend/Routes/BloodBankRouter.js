const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { verifyBloodBank, validateBloodBankData } = require('../middleware/bloodBankAuth');
const {
  getAllBloodBanks,
  getBloodBankById,
  createBloodBank,
  updateBloodBank,
  deleteBloodBank,
  updateBloodInventory
} = require('../controllers/bloodBankController');

// Public routes
router.get('/', getAllBloodBanks);
router.get('/:userId', getBloodBankById);

// Protected routes (require authentication)
router.post('/', authMiddleware, verifyBloodBank, validateBloodBankData, createBloodBank);
router.put('/:id', authMiddleware, verifyBloodBank, validateBloodBankData, updateBloodBank);
router.delete('/:id', authMiddleware, verifyBloodBank, deleteBloodBank);
router.put('/:id/inventory', authMiddleware, verifyBloodBank, updateBloodInventory);

module.exports = router; 