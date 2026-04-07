const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  genericSalt: { type: String, trim: true },
  description: { type: String }
});

const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);

const seedGenerics = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Add a Branded Expensive Medicine
        await Medicine.findOneAndUpdate(
            { name: "Panadol Extra (Branded)" },
            { 
                name: "Panadol Extra (Branded)", 
                category: "Pain Relief", 
                price: 150, 
                genericSalt: "Paracetamol 500mg",
                description: "Premium branded pain relief with caffeine booster."
            },
            { upsert: true, new: true }
        );

        // Add a Cheaper Generic Alternative
        await Medicine.findOneAndUpdate(
            { name: "G-Cetamol (Generic)" },
            { 
                name: "G-Cetamol (Generic)", 
                category: "Pain Relief", 
                price: 45, 
                genericSalt: "Paracetamol 500mg",
                description: "Government approved generic paracetamol equivalent."
            },
            { upsert: true, new: true }
        );

        console.log("Seeding complete: Panadol (150) vs G-Cetamol (45)");
        process.exit();
    } catch (err) {
        console.error("Seeding failed", err);
        process.exit(1);
    }
};

seedGenerics();
