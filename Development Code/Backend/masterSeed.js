const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Users } = require('./models/UserModel');
const { Hospital, BedTypes, Specializations } = require('./models/HospitalModel');
const BloodBank = require('./models/BloodBankModel');
const Medicine = require('./models/MedicineModel');

const MONGO_URI = 'mongodb://127.0.0.1:27017/HospitalServices';

const seedData = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully!");

        const password = "Password123!";
        
        // --- 1. SEED MEDICINES ---
        console.log("Seeding Medicines...");
        const medicines = [
            { name: "Paracetamol 500mg", category: "Fever", price: 15, manufacturer: "NPL", description: "Effective for fever and mild pain relief.", prescriptionRequired: false },
            { name: "Azithromycin 500mg", category: "Antibiotics", price: 120, manufacturer: "Deurali Janta", description: "Broad-spectrum antibiotic for bacterial infections.", prescriptionRequired: true },
            { name: "Ibuprofen 400mg", category: "Pain Relief", price: 40, manufacturer: "Asian Pharma", description: "Effective for inflammatory pain.", prescriptionRequired: false },
            { name: "Cetirizine 10mg", category: "Cough & Cold", price: 20, manufacturer: "Lomus", description: "Antihistamine for allergy relief.", prescriptionRequired: false },
            { name: "Metformin 500mg", category: "Chronic Diseases", price: 60, manufacturer: "Quest", description: "First-line medication for type 2 diabetes.", prescriptionRequired: true },
            { name: "Amoxicillin 500mg", category: "Antibiotics", price: 85, manufacturer: "NPL", description: "Penicillin-type antibiotic.", prescriptionRequired: true },
            { name: "ORS (Sachet)", category: "First Aid", price: 10, manufacturer: "Lomus", description: "Oral Rehydration Salts for dehydration.", prescriptionRequired: false },
            { name: "Omeprazole 20mg", category: "Chronic Diseases", price: 55, manufacturer: "Deurali Janta", description: "Reduces stomach acid production.", prescriptionRequired: true },
            { name: "Salbutamol Inhaler", category: "Others", price: 350, manufacturer: "Cipla", description: "Quick relief for asthma symptoms.", prescriptionRequired: true },
            { name: "Betadine 100ml", category: "First Aid", price: 180, manufacturer: "Win-Medicare", description: "Antiseptic solution for wound cleaning.", prescriptionRequired: false }
        ];

        // Append to avoid breaking existing data as per user request
        for (const med of medicines) {
            await Medicine.findOneAndUpdate({ name: med.name }, med, { upsert: true });
        }
        console.log("Medicines seeded!");

        // --- 2. SEED HOSPITALS ---
        console.log("Seeding Hospitals...");
        const hospitalFacilities = [
            {
                username: "tuth_admin",
                email: "admin@tuth.edu.np",
                name: "Tribhuvan University Teaching Hospital (TUTH)",
                street: "Maharajgunj Road",
                city: "Kathmandu",
                state: "Bagmati",
                phone: "0144123456",
                hotline: "0144123456",
                lat: 27.7303,
                lng: 85.3340,
                type: "Teaching Hospital",
                beds: [
                    { type: BedTypes.GENERAL, total: 400, available: 45 },
                    { type: BedTypes.ICU, total: 24, available: 2 },
                    { type: BedTypes.EMERGENCY, total: 60, available: 8 }
                ],
                doctors: [
                    { name: "Dr. Ram Sharma", specialization: Specializations.CARDIOLOGY, available: true },
                    { name: "Dr. Sita Poudel", specialization: Specializations.NEUROLOGY, available: true },
                    { name: "Dr. Hari Thapa", specialization: Specializations.GENERAL, available: false }
                ]
            },
            {
                username: "bir_admin",
                email: "admin@birhospital.gov.np",
                name: "Bir Hospital",
                street: "Kantipath",
                city: "Kathmandu",
                state: "Bagmati",
                phone: "0142212345",
                hotline: "0142212345",
                lat: 27.7052,
                lng: 85.3134,
                type: "Government Hospital",
                beds: [
                    { type: BedTypes.GENERAL, total: 500, available: 12 },
                    { type: BedTypes.EMERGENCY, total: 100, available: 5 }
                ],
                doctors: [
                    { name: "Dr. Gopal Rai", specialization: Specializations.ORTHOPEDICS, available: true }
                ]
            },
            {
                username: "norvic_admin",
                email: "info@norvichospital.com",
                name: "Norvic International Hospital",
                street: "Thapathali",
                city: "Kathmandu",
                state: "Bagmati",
                phone: "0142585550",
                hotline: "0142585550",
                lat: 27.6923,
                lng: 85.3195,
                type: "Private International Hospital",
                beds: [
                    { type: BedTypes.ICU, total: 30, available: 12 },
                    { type: BedTypes.GENERAL, total: 150, available: 22 }
                ],
                doctors: [
                    { name: "Dr. Bharat Rawat", specialization: Specializations.CARDIOLOGY, available: true }
                ]
            }
        ];

        for (const f of hospitalFacilities) {
            // Create user first
            let user = await Users.findOne({ username: f.username });
            if (!user) {
                user = await Users.create({
                    username: f.username,
                    email: f.email,
                    password: password,
                    role: 'hospital',
                    firstName: "Hospital",
                    lastName: "Admin"
                });
            }

            const hospitalData = {
                userId: user._id,
                name: f.name,
                type: f.type,
                phone: f.phone,
                hotline: f.hotline,
                email: f.email,
                address: { street: f.street, city: f.city, state: f.state },
                position: { lat: f.lat, lng: f.lng },
                beds: f.beds,
                doctors: f.doctors,
                available: true,
                emergencyServices: true
            };
            
            await Hospital.findOneAndUpdate({ name: f.name }, hospitalData, { upsert: true });
        }
        console.log("Hospitals seeded!");

        // --- 3. SEED BLOOD BANKS ---
        console.log("Seeding Blood Banks...");
        const bloodBankFacilities = [
            {
                username: "nrcs_blood",
                email: "admin@nrcsblood.org.np",
                name: "Nepal Red Cross Society Blood Center",
                street: "Kalimati",
                city: "Kathmandu",
                state: "Bagmati",
                phone: "0142706500",
                hotline: "0142706500",
                lat: 27.7001,
                lng: 85.2954,
                bloodTypes: [
                    { group: 'A+', available: 45 },
                    { group: 'A-', available: 12 },
                    { group: 'B+', available: 56 },
                    { group: 'O+', available: 89 },
                    { group: 'O-', available: 5 }
                ]
            },
            {
                username: "hams_blood",
                email: "bloodbank@hams.com.np",
                name: "HAMS Hospital Blood Bank",
                street: "Dhumbarahi",
                city: "Kathmandu",
                state: "Bagmati",
                phone: "0143712345",
                hotline: "0143712345",
                lat: 27.7330,
                lng: 85.3520,
                bloodTypes: [
                    { group: 'AB+', available: 22 },
                    { group: 'O+', available: 34 }
                ]
            }
        ];

        for (const b of bloodBankFacilities) {
            let user = await Users.findOne({ username: b.username });
            if (!user) {
                user = await Users.create({
                    username: b.username,
                    email: b.email,
                    password: password,
                    role: 'bloodbank',
                    firstName: "BloodBank",
                    lastName: "Admin"
                });
            }

            const bbData = {
                userId: user._id,
                name: b.name,
                address: { street: b.street, city: b.city, state: b.state },
                phone: b.phone,
                hotline: b.hotline,
                bloodTypes: b.bloodTypes,
                position: { lat: b.lat, lng: b.lng },
                available: true
            };

            await BloodBank.findOneAndUpdate({ name: b.name }, bbData, { upsert: true });
        }
        console.log("Blood Banks seeded!");

        console.log("\nDATABASE POPULATION COMPLETED SUCCESSFULLY!");
        process.exit(0);
    } catch (err) {
        console.error("Critical Seeding Error:", err);
        process.exit(1);
    }
};

seedData();
