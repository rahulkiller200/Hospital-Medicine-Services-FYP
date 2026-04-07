const express = require("express");
const router = express.Router();
const pharmacyController = require("../controllers/PharmacyController");
const authMiddleware = require("../middleware/authMiddleware");

// Private Dashboard Logic (Pharmacy Only)
router.get("/profile", authMiddleware, pharmacyController.getPharmacyProfile);
router.post("/inventory", authMiddleware, pharmacyController.updateInventory);
router.get("/orders", authMiddleware, pharmacyController.getOrders);
router.put("/order/:orderId", authMiddleware, pharmacyController.updateOrderStatus);

module.exports = router;
