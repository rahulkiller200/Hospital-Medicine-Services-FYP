const mongoose = require('mongoose');
const { Users } = require('./models/UserModel');
const BloodBank = require('./models/BloodBankModel');

const MONGO_URI = 'mongodb://127.0.0.1:27017/HospitalServices';

const bloodBankFacilities = [
    {
        username: "redcross_bhaktapur",
        email: "bhaktapur@nrcsblood.org.np",
        name: "Nepal Red Cross Society - Bhaktapur Center",
        street: "Dudhpati",
        city: "Bhaktapur",
        state: "Bagmati",
        phone: "016612266",
        hotline: "016612266",
        lat: 27.6715,
        lng: 85.4295,
        bloodTypes: [
            { group: 'A+', available: 30 },
            { group: 'B+', available: 45 },
            { group: 'O+', available: 60 },
            { group: 'AB+', available: 10 }
        ]
    },
    {
        username: "redcross_lalitpur",
        email: "lalitpur@nrcsblood.org.np",
        name: "Nepal Red Cross Society - Lalitpur Center",
        street: "Patan-DH",
        city: "Lalitpur",
        state: "Bagmati",
        phone: "015522742",
        hotline: "015522742",
        lat: 27.6750,
        lng: 85.3220,
        bloodTypes: [
            { group: 'A+', available: 25 },
            { group: 'B+', available: 32 },
            { group: 'O+', available: 40 },
            { group: 'O-', available: 2 }
        ]
    },
    {
        username: "mediciti_blood",
        email: "blood@mediciti.com.np",
        name: "Nepal Mediciti Blood Bank",
        street: "Bhaisepati",
        city: "Lalitpur",
        state: "Bagmati",
        phone: "014217766",
        hotline: "014217766",
        lat: 27.6580,
        lng: 85.3050,
        bloodTypes: [
            { group: 'A+', available: 50 },
            { group: 'B+', available: 50 },
            { group: 'O+', available: 100 },
            { group: 'AB+', available: 15 },
            { group: 'O-', available: 10 }
        ]
    },
    {
        username: "civil_blood",
        email: "bloodbank@civilhospital.gov.np",
        name: "Civil Service Hospital Blood Center",
        street: "Minbhawan",
        city: "Kathmandu",
        state: "Bagmati",
        phone: "014489977",
        hotline: "014489977",
        lat: 27.6885,
        lng: 85.3365,
        bloodTypes: [
            { group: 'A+', available: 12 },
            { group: 'B+', available: 18 },
            { group: 'O+', available: 22 }
        ]
    },
    {
        username: "norvic_blood",
        email: "blood@norvichospital.com",
        name: "Norvic Hospital Blood Bank",
        street: "Thapathali",
        city: "Kathmandu",
        state: "Bagmati",
        phone: "014258554",
        hotline: "014258554",
        lat: 27.6923,
        lng: 85.3195,
        bloodTypes: [
            { group: 'AB-', available: 5 },
            { group: 'O+', available: 45 }
        ]
    }
];

const seedBloodBanks = async () => {
    try {
        console.log("Connecting to Database Cluster...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected!");

        const password = "Password123!";

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
            console.log(`[SEED] ${b.name} updated/created.`);
        }

        const totalCount = await BloodBank.countDocuments();
        console.log(`\n==============================================`);
        console.log(`BLOOD BANK DATABASE EXPANDED.`);
        console.log(`TOTAL BLOOD BANKS IN SYSTEM: ${totalCount}`);
        console.log(`==============================================`);

        process.exit(0);
    } catch (err) {
        console.error("Critical Seeding Error:", err);
        process.exit(1);
    }
};

seedBloodBanks();
