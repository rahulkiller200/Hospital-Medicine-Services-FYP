const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const setup = async () => {
    try {
        console.log("Connecting to Atlas...");
        await mongoose.connect(process.env.MONGO_URI);

        const UserSchema = new mongoose.Schema({ username: String }, { strict: false, collection: 'users' });
        const PharmacySchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, name: String, inventory: Array }, { strict: false, collection: 'pharmacies' });
        const MedicineSchema = new mongoose.Schema({ name: String }, { strict: false, collection: 'medicines' });
        const OrderSchema = new mongoose.Schema({ providerId: mongoose.Schema.Types.ObjectId, status: String }, { strict: false, collection: 'medicineorders' });

        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        const Pharmacy = mongoose.models.Pharmacy || mongoose.model('Pharmacy', PharmacySchema);
        const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);
        const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

        const user = await User.findOne({ username: 'test2' });
        if (!user) {
            console.log("❌ User 'test2' not found");
            return;
        }

        let pharmacy = await Pharmacy.findOne({ userId: user._id });
        if (!pharmacy) {
            console.log("Creating Pharmacy Profile...");
            pharmacy = await Pharmacy.create({
                userId: user._id,
                name: 'Test2 Pharmacy & Wellness',
                licenseNumber: 'PH-TEST-2024',
                phone: '9800000000',
                email: 'test2@pharmacy.com',
                position: { lat: 27.7172, lng: 85.3240 },
                available: true,
                inventory: []
            });
        }

        const meds = await Medicine.find().limit(8);
        console.log(`Found ${meds.length} medicines in global catalog.`);
        
        pharmacy.inventory = meds.map(m => ({
            medicineId: m._id,
            stock: Math.floor(Math.random() * 60) + 2
        }));

        await Pharmacy.updateOne({ _id: pharmacy._id }, { $set: { inventory: pharmacy.inventory } });
        console.log("✅ Linked medicines to your inventory.");

        const existingOrder = await Order.findOne({ providerId: pharmacy._id });
        if (!existingOrder && meds.length > 0) {
            await Order.create({
                patientId: user._id,
                providerId: pharmacy._id,
                medicineId: meds[0]._id,
                quantity: 3,
                status: 'Pending',
                orderDate: new Date()
            });
            console.log("✅ Created a test pending order for you.");
        }

        console.log("\n--- SETUP COMPLETE ---");
        console.log(`Pharmacy: ${pharmacy.name}`);
        console.log(`Items in Stock: ${pharmacy.inventory.length}`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

setup();
