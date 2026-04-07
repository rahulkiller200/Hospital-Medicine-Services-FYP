const express = require('express');
const router = express.Router();

const authRouter = require('./authRouter');
const hospitalRouter = require('./HospitalRoutes');
const patientHistoryRouter = require('./patientHistoryRoutes');
const userRouter = require('./userRoutes');
const bloodBankRouter = require('./BloodBankRouter');
const medicineRouter = require('./MedicineRoutes');
const pharmacyRouter = require('./PharmacyRoutes');
const mapRouter = require('./mapRouter');
const chatbotRouter = require('./ChatbotRoutes');
const systemRoutes = require('./systemRoutes');
const bloodRequestRouter = require('./BloodRequestRouter');

router.use('/auth', authRouter);
router.use('/system', systemRoutes);
router.use('/hospitals', hospitalRouter);
router.use('/patients', patientHistoryRouter);
router.use('/users', userRouter);
router.use('/bloodbank', bloodBankRouter);
router.use('/medicines', medicineRouter);
router.use('/pharmacies', pharmacyRouter);
router.use('/map', mapRouter);
router.use('/chatbot', chatbotRouter);
router.use('/blood-request', bloodRequestRouter);

module.exports = router;
