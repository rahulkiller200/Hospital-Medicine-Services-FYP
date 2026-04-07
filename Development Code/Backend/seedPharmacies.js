const mongoose = require('mongoose');
const { Users } = require('./models/UserModel');
const Pharmacy = require('./models/PharmacyModel');

const MONGO_URI = 'mongodb://127.0.0.1:27017/HospitalServices';

const pharmacies = [
    { name: "Sajha Swasthya Sewa", licenseNumber: "L-1001", street: "New Road", city: "Kathmandu", lat: 27.7032, lng: 85.3114, phone: "01-4221122" },
    { name: "Nepal Pharmacy", licenseNumber: "L-1002", street: "Putalisadak", city: "Kathmandu", lat: 27.7058, lng: 85.3214, phone: "01-4433556" },
    { name: "Health-Care Pharmacy", licenseNumber: "L-1003", street: "Pulchowk", city: "Lalitpur", lat: 27.6766, lng: 85.3150, phone: "01-5544332" },
    { name: "Shuva Pharmacy", licenseNumber: "L-1004", street: "Lagankhel", city: "Lalitpur", lat: 27.6690, lng: 85.3225, phone: "01-5522110" },
    { name: "Koteshwor Polyclinic & Pharmacy", licenseNumber: "L-1005", street: "Koteshwor", city: "Kathmandu", lat: 27.6755, lng: 85.3475, phone: "01-4488776" },
    { name: "Chabahil Pharmacy", licenseNumber: "L-1006", street: "Chabahil", city: "Kathmandu", lat: 27.7170, lng: 85.3485, phone: "01-4477665" },
    { name: "Balaju Pharmacy", licenseNumber: "L-1007", street: "Balaju", city: "Kathmandu", lat: 27.7315, lng: 85.3025, phone: "01-4455443" },
    { name: "Satdobato Pharmacy", licenseNumber: "L-1008", street: "Satdobato", city: "Lalitpur", lat: 27.6585, lng: 85.3245, phone: "01-5588776" },
    { name: "Baneshwor Pharmacy", licenseNumber: "L-1009", street: "Baneshwor", city: "Kathmandu", lat: 27.6915, lng: 85.3415, phone: "01-4499887" },
    { name: "Kalimati Pharmacy", licenseNumber: "L-1010", street: "Kalimati", city: "Kathmandu", lat: 27.7001, lng: 85.2954, phone: "01-4270650" },
    { name: "Teaching Hospital Pharmacy", licenseNumber: "L-1011", street: "Maharajgunj", city: "Kathmandu", lat: 27.7303, lng: 85.3340, phone: "01-4412345" }
];

const seedPharmacies = async () => {
    try {
        console.log("Connecting to Database Cluster...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected!");

        const password = "Password123!";

        for (const p of pharmacies) {
            const username = p.name.toLowerCase().replace(/ /g, "_").replace(/&/g, "and").replace(/-/g, "_").slice(0, 30);
            const email = `${username}@pharmacy.com`;

            let user = await Users.findOne({ username });
            if (!user) {
                user = await Users.create({
                    username,
                    email,
                    password,
                    role: "pharmacy",
                    firstName: "Pharmacy",
                    lastName: "Manager"
                });
            }

            const pharmacyData = {
                userId: user._id,
                name: p.name,
                licenseNumber: p.licenseNumber,
                address: { street: p.street, city: p.city, state: "Bagmati" },
                phone: p.phone,
                position: { lat: p.lat, lng: p.lng },
                available: true
            };

            await Pharmacy.findOneAndUpdate({ licenseNumber: p.licenseNumber }, pharmacyData, { upsert: true });
            console.log(`[SEED] ${p.name} updated/created.`);
        }

        const totalCount = await Pharmacy.countDocuments();
        console.log(`\n==============================================`);
        console.log(`PHARMACY DATABASE EXPANDED.`);
        console.log(`TOTAL PHARMACIES IN SYSTEM: ${totalCount}`);
        console.log(`==============================================`);

        process.exit(0);
    } catch (err) {
        console.error("Critical Seeding Error:", err);
        process.exit(1);
    }
};

seedPharmacies();
