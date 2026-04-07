const { Hospital } = require("../models/HospitalModel");
const Pharmacy = require("../models/PharmacyModel");

exports.getProviders = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ available: true }).select('name position phone type');
    const pharmacies = await Pharmacy.find({ available: true }).select('name position phone');

    const providers = [
      ...hospitals.map(h => ({ ...h._doc, providerType: 'Hospital' })),
      ...pharmacies.map(p => ({ ...p._doc, providerType: 'Pharmacy' }))
    ];

    res.status(200).json({ success: true, count: providers.length, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching providers", error: error.message });
  }
};
