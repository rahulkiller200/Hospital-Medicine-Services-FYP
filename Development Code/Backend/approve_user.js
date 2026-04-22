const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

async function approve() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb+srv://rahulkiller200:rahulkiller200@cluster0.p0qny.mongodb.net/Hospital-Medicine-Services?retryWrites=true&w=majority';
        console.log("Connecting to Atlas...");
        await mongoose.connect(uri);
        
        // Define a generic schema to avoid model compilation errors
        const UserSchema = new mongoose.Schema({ 
            username: String, 
            isVerified: Boolean,
            status: String 
        }, { strict: false, collection: 'users' });
        
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const result = await User.findOneAndUpdate(
            { username: 'test2' },
            { $set: { isVerified: true, status: 'Approved' } },
            { new: true }
        );

        if (result) {
            console.log("✅ Success! Account 'test2' is now APPROVED.");
        } else {
            console.log("❌ Error: User 'test2' not found.");
        }
    } catch (err) {
        console.error("Database Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

approve();
