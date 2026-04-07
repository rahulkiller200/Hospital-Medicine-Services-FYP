const express = require('express');
const router = express.Router();
const { addHospital, getHospitals, updateHospital, deleteHospital, getHospitalByUser, getHospitalProfile, updateHospitalProfile } = require('../controllers/hospitalController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateHospital } = require('../middleware/hospitalAuth');


router.get('/', getHospitals);


router.get('/profile', authMiddleware, getHospitalProfile);
router.put('/profile', authMiddleware, updateHospitalProfile); 


router.post('/', authMiddleware, validateHospital, addHospital);
router.put('/:id', authMiddleware, validateHospital, updateHospital);
router.delete('/:id', authMiddleware, deleteHospital);
router.get('/me', authMiddleware, getHospitalByUser);

module.exports = router; 