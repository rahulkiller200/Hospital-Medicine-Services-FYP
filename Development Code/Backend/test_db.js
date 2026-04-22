const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import Models
const { Hospital } = require('./Models/hospitalModel');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://rahuljaiswal473631_db_user:rahul_12345@cluster0.mnxuiys.mongodb.net/HospitalServices";

const approveUser = async (username) => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://rahulkiller200:rahulkiller200@cluster0.pvi89.mongodb.net/Hospital-Medicine-Services?retryWrites=true&w=majority");
        console.log("Connected to Database for Approval...");

        // We update the User model to ensure isVerified is true
        // Assuming the model name is 'User' and field is 'isVerified' or 'verified'
        const User = mongoose.model('User', new mongoose.Schema({ username: String, isVerified: Boolean }, { strict: false }));
        
        const result = await User.findOneAndUpdate(
            { username: username },
            { $set: { isVerified: true, status: 'Approved' } },
            { new: true }
        );

        if (result) {
            console.log(`✅ Success! Account '${username}' has been approved.`);
            console.log("You can now log in to the Hospital Panel.");
        } else {
            console.log(`❌ User '${username}' not found in the database.`);
        }
    } catch (err) {
        console.error("Error during approval:", err);
    } finally {
        await mongoose.disconnect();
    }
};

// Uncomment the line below and run: node test_db.js
// approveUser('krishal');

const seedHospitalData = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected Successfully.');

        // Find the first hospital or the one you are currently logged into
        const hospital = await Hospital.findOne();

        if (!hospital) {
            console.log('No hospital found in database. Please register an account first.');
            process.exit(1);
        }

        console.log(`Populating data for: ${hospital.name}`);

        // Professional Bed Allocation
        hospital.beds = [
            { type: 'ICU', total: 15, available: 4 },
            { type: 'Emergency', total: 20, available: 12 },
            { type: 'Maternity', total: 30, available: 18 },
            { type: 'General', total: 50, available: 22 },
            { type: 'Pediatric', total: 25, available: 10 }
        ];

        // Professional Doctor Registry
        hospital.doctors = [
            { name: 'Dr. Sameer Pathak', specialization: 'Cardiology', available: true },
            { name: 'Dr. Anjali Sharma', specialization: 'Pediatrics', available: true },
            { name: 'Dr. Ramesh Koirala', specialization: 'Emergency', available: false },
            { name: 'Dr. Sunita Gupta', specialization: 'Neurology', available: true }
        ];

        // Ensure status is online
        hospital.hotline = "9841234567";
        hospital.phone = "9841234567";
        hospital.website = "https://hms-medical-center.org";

        await hospital.save();

        console.log('-------------------------------------------');
        console.log('✅ DATABASE POPULATED SUCCESSFULLY!');
        console.log(`- 5 Wards Seeded (${hospital.beds.length} Total)`);
        console.log(`- 4 Doctors Registered`);
        console.log('-------------------------------------------');
        console.log('Refresh your dashboard to see the live updates.');

        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedHospitalData();
