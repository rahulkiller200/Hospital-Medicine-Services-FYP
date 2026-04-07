const mongoose = require('mongoose');
const { Users } = require('./models/UserModel');
const { Hospital, BedTypes, Specializations } = require('./models/HospitalModel');

const MONGO_URI = 'mongodb://127.0.0.1:27017/HospitalServices';

const hospitalFacilities = [
    {
        username: "kanti_admin",
        email: "info@kantichildrenhospital.gov.np",
        name: "Kanti Children's Hospital",
        street: "Maharajgunj",
        city: "Kathmandu",
        lat: 27.7315,
        lng: 85.3340,
        type: "Pediatric Government Hospital",
        beds: [
            { type: BedTypes.PEDIATRIC, total: 350, available: 60 },
            { type: BedTypes.EMERGENCY, total: 40, available: 12 },
            { type: BedTypes.ICU, total: 15, available: 1 }
        ],
        doctors: [
            { name: "Dr. Ajit Rayamajhi", specialization: Specializations.PEDIATRICS, available: true }
        ]
    },
    {
        username: "nmc_admin",
        email: "info@nmcth.edu",
        name: "Nepal Medical College (NMC)",
        street: "Attarkhel, Jorpati",
        city: "Kathmandu",
        lat: 27.7170,
        lng: 85.3850,
        type: "Medical College & Hospital",
        beds: [
            { type: BedTypes.GENERAL, total: 600, available: 85 }
        ],
        doctors: [
            { name: "Dr. Sunil Sharma", specialization: Specializations.GENERAL, available: true }
        ]
    },
    {
        username: "civil_admin",
        email: "admin@civilhospital.gov.np",
        name: "Civil Service Hospital",
        street: "Minbhawan",
        city: "Kathmandu",
        lat: 27.6885,
        lng: 85.3365,
        type: "Government Hospital",
        beds: [
            { type: BedTypes.GENERAL, total: 200, available: 22 },
            { type: BedTypes.ICU, total: 10, available: 3 }
        ],
        doctors: [
            { name: "Dr. Bimal Pandey", specialization: Specializations.NEUROLOGY, available: true }
        ]
    },
    {
        username: "om_admin",
        email: "info@omhospitalnepal.com",
        name: "Om Hospital & Research Center",
        street: "Chabahil",
        city: "Kathmandu",
        lat: 27.7180,
        lng: 85.3485,
        type: "Private Research Hospital",
        beds: [
            { type: BedTypes.GENERAL, total: 150, available: 34 },
            { type: BedTypes.MATERNITY, total: 30, available: 10 }
        ],
        doctors: [
            { name: "Dr. Bhola Rijal", specialization: Specializations.GYNECOLOGY, available: true }
        ]
    },
    {
        username: "kmc_admin",
        email: "info@kmcs.edu.np",
        name: "Kathmandu Medical College (KMC)",
        street: "Sinamangal",
        city: "Kathmandu",
        lat: 27.6975,
        lng: 85.3525,
        type: "Medical College Hospital",
        beds: [
            { type: BedTypes.GENERAL, total: 450, available: 50 },
            { type: BedTypes.EMERGENCY, total: 50, available: 15 }
        ],
        doctors: [
            { name: "Dr. Prajwal Man Shrestha", specialization: Specializations.CARDIOLOGY, available: true }
        ]
    },
    {
        username: "gangalal_admin",
        email: "admin@sgnhc.org.np",
        name: "Shahid Gangalal National Heart Center",
        street: "Bansbari",
        city: "Kathmandu",
        lat: 27.7390,
        lng: 85.3395,
        type: "Specialized Heart Center",
        beds: [
            { type: BedTypes.ICU, total: 50, available: 4 },
            { type: BedTypes.GENERAL, total: 150, available: 18 }
        ],
        doctors: [
            { name: "Dr. Chandramani Adhikari", specialization: Specializations.CARDIOLOGY, available: true }
        ]
    },
    {
        username: "alka_admin",
        email: "info@alkahospital.com",
        name: "Alka Hospital",
        street: "Jawalakhel",
        city: "Lalitpur",
        lat: 27.6695,
        lng: 85.3125,
        type: "Private General Hospital",
        beds: [
            { type: BedTypes.GENERAL, total: 100, available: 15 },
            { type: BedTypes.ICU, total: 8, available: 2 }
        ],
        doctors: [
            { name: "Dr. Shishir Lakhey", specialization: Specializations.ORTHOPEDICS, available: true }
        ]
    },
    {
        username: "mediciti_admin",
        email: "client@nepalmediciti.com",
        name: "Nepal Mediciti Hospital",
        street: "Bhaisepati, Nakkhu",
        city: "Lalitpur",
        lat: 27.6580,
        lng: 85.3050,
        type: "Luxury Multispecialty Hospital",
        beds: [
            { type: BedTypes.GENERAL, total: 700, available: 250 },
            { type: BedTypes.ICU, total: 60, available: 15 }
        ],
        doctors: [
            { name: "Dr. Upendra Devkota", specialization: Specializations.NEUROLOGY, available: true }
        ]
    },
    {
        username: "bb_admin",
        email: "bb@hospital.com",
        name: "B&B Hospital",
        street: "Gwarko",
        city: "Lalitpur",
        lat: 27.6655,
        lng: 85.3325,
        type: "Orthopedic Specialized",
        beds: [
            { type: BedTypes.GENERAL, total: 150, available: 40 },
            { type: BedTypes.ORTHOPEDICS_BED, total: 50, available: 10 } // Specialization specific
        ],
        doctors: [
            { name: "Dr. Jagdish Lal Baidya", specialization: Specializations.ORTHOPEDICS, available: true }
        ]
    },
    {
        username: "vayodha_admin",
        email: "info@vayodha.com",
        name: "Vayodha City Hospital",
        street: "Balkhu",
        city: "Kathmandu",
        lat: 27.6840,
        lng: 85.2950,
        type: "Private Life Care Hospital",
        beds: [
            { type: BedTypes.GENERAL, total: 100, available: 30 },
            { type: BedTypes.EMERGENCY, total: 15, available: 5 }
        ],
        doctors: [
            { name: "Dr. Sanjay Kumar", specialization: Specializations.CARDIOLOGY, available: true }
        ]
    }
];

const seedHospitals = async () => {
    try {
        console.log("Connecting to Database Cluster...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected!");

        const password = "Password123!";

        for (const f of hospitalFacilities) {
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
                phone: "0144556677", // Generic phone for seeds
                hotline: "0144556677",
                email: f.email,
                address: { street: f.street, city: f.city, state: "Bagmati" },
                position: { lat: f.lat, lng: f.lng },
                beds: f.beds.filter(b => Object.values(BedTypes).includes(b.type)), // Ensure bed types match enums
                doctors: f.doctors,
                available: true,
                emergencyServices: true
            };
            
            await Hospital.findOneAndUpdate({ name: f.name }, hospitalData, { upsert: true });
            console.log(`[SEED] ${f.name} updated/created.`);
        }

        const totalCount = await Hospital.countDocuments();
        console.log(`\n==============================================`);
        console.log(`HOSPITAL DATABASE EXPANDED.`);
        console.log(`TOTAL HOSPITALS IN SYSTEM: ${totalCount}`);
        console.log(`==============================================`);

        process.exit(0);
    } catch (err) {
        console.error("Critical Seeding Error:", err);
        process.exit(1);
    }
};

seedHospitals();
