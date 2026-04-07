const express = require("express");
const router = express.Router();
const mapController = require("../controllers/MapController");

router.get("/providers", mapController.getProviders);

module.exports = router;
