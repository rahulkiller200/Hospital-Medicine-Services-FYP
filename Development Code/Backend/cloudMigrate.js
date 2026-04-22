const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const CLOUD_URI = process.env.MONGO_URI;
const backupFile = 'hospital_master_backup.json';

async function cloudMigrate() {
    console.log("==============================================");
    console.log("☁️ HMS CLOUD MIGRATION TOOL (Atlas)");
    console.log("==============================================");

    if (!CLOUD_URI || CLOUD_URI.includes('localhost')) {
        console.error("❌ Error: MONGO_URI in .env is not a cloud address.");
        console.log("Please update your .env with the mongodb+srv:// connection string first.");
        process.exit(1);
    }

    if (!fs.existsSync(backupFile)) {
        console.error(`❌ Error: Backup file '${backupFile}' not found!`);
        console.log("Please run 'node exportDatabase.js' on your old machine first.");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(CLOUD_URI);
        const db = mongoose.connection.db;
        console.log(`Connected to Cloud Cluster: ${mongoose.connection.name}\n`);

        console.log("Reading Master Backup File...");
        const rawData = fs.readFileSync(backupFile);
        const masterDump = JSON.parse(rawData);
        const collections = Object.keys(masterDump);

        console.log("Starting Migration Push...");

        // Helper to convert 24-char hex strings back to ObjectIds
        const { ObjectId } = require('mongodb');
        function restoreObjectIds(obj) {
            if (obj === null || obj === undefined) return obj;
            if (typeof obj === 'string' && /^[0-9a-fA-F]{24}$/.test(obj)) {
                return new ObjectId(obj);
            }
            if (Array.isArray(obj)) {
                return obj.map(item => restoreObjectIds(item));
            }
            if (typeof obj === 'object') {
                const newObj = {};
                for (let key in obj) {
                    newObj[key] = restoreObjectIds(obj[key]);
                }
                return newObj;
            }
            return obj;
        }

        for (let name of collections) {
            let data = masterDump[name];
            if (data.length === 0) {
                console.log(`[SKIPPING] '${name}' is empty.`);
                continue;
            }
            
            // Restore IDs
            data = restoreObjectIds(data);

            console.log(`[PUSHING] Moving ${data.length} records to collection: ${name}...`);
            
            // Clear cloud collection before push to avoid duplicates
            try {
                await db.collection(name).drop();
            } catch (e) {
                // Collection might not exist yet
            }

            // Push data
            await db.collection(name).insertMany(data);
            console.log(`   - ✅ Successfully migrated ${data.length} documents to '${name}'.`);
        }

        console.log(`\n==============================================`);
        console.log(`🎉 CLOUD MIGRATION COMPLETED SUCCESSFULLY!`);
        console.log(`Your platform is now globally synchronized.`);
        console.log(`==============================================`);

    } catch (err) {
        console.error("❌ Migration Failed:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

cloudMigrate();
