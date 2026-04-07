const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/MedicineController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadPrescription } = require("../middleware/uploadMiddleware");

// Public Search
router.get("/all", medicineController.getMedicines);
router.get("/alternatives/:id", medicineController.getAlternatives);

// Private Ordering
router.post("/order", authMiddleware, uploadPrescription.single("prescription"), medicineController.createOrder);
router.get("/orders", authMiddleware, medicineController.getUserOrders);

// Admin: Add medicine catalog
router.post("/add", authMiddleware, medicineController.addMedicine);

module.exports = router;
