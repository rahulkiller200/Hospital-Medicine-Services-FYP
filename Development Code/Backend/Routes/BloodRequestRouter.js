const express = require('express');
const router = express.Router();
const bloodRequestController = require('../controllers/BloodRequestController');

// All blood request routes
router.post('/create', bloodRequestController.createRequest);
router.get('/all', bloodRequestController.getAllRequests);
router.patch('/:id/status', bloodRequestController.updateRequestStatus);

module.exports = router;
