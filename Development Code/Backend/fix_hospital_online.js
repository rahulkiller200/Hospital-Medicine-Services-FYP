const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const fix = async () => {
    try {
        console.log("Connecting to Atlas...");
        await mongoose.connect(process.env.MONGO_URI);
        
        const HospitalSchema = new mongoose.Schema({ name: String, available: Boolean }, { strict: false, collection: 'hospitals' });
        const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', HospitalSchema);

        const result = await Hospital.findOneAndUpdate(
            { name: 'Bir Hospital' }, 
            { $set: { available: true } },
            { new: true }
        );

        if (result) {
            console.log("✅ Bir Hospital is now ONLINE");
        } else {
            console.log("❌ Could not find Bir Hospital");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fix();
