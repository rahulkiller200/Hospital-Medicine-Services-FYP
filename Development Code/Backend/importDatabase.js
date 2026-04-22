const mongoose = require('mongoose');
const fs = require('fs');

const URI = 'mongodb://127.0.0.1:27017/HospitalServices';
const backupFile = 'hospital_master_backup.json';

async function importDatabase() {
    console.log("==============================================");
    console.log("🚀 HMS DATABASE RESTORE TOOL");
    console.log("==============================================");

    if (!fs.existsSync(backupFile)) {
        console.error(`❌ Error: Backup file '${backupFile}' not found!`);
        console.log("Please run 'node exportDatabase.js' on your old machine first.");
        process.exit(1);
    }

    try {
        console.log("Connecting to the Local Database...");
        await mongoose.connect(URI);
        const db = mongoose.connection.db;
        console.log("Connected successfully!\n");

        console.log("Reading Master Backup File...");
        const rawData = fs.readFileSync(backupFile);
        const masterDump = JSON.parse(rawData);
        const collections = Object.keys(masterDump);

        for (let name of collections) {
            const data = masterDump[name];
            if (data.length === 0) {
                console.log(`[SKIPPING] '${name}' is empty.`);
                continue;
            }

            console.log(`[RESTORING] Processing ${data.length} records for collection: ${name}...`);
            
            // 1. Clear existing data in the target collection
            try {
                await db.collection(name).drop();
                console.log(`   - Cleared existing '${name}' collection.`);
            } catch (e) {
                // Ignore if collection doesn't exist yet
            }

            // 2. Insert master data
            // We use insertMany for high-speed restoration
            await db.collection(name).insertMany(data);
            console.log(`   - ✅ Successfully restored ${data.length} documents to '${name}'.`);
        }

        console.log(`\n==============================================`);
        console.log(`🎉 FULL DATABASE RESTORE COMPLETED!`);
        console.log(`All Users, Patients, and Services are synced.`);
        console.log(`==============================================`);

    } catch (err) {
        console.error("❌ Restore Failed:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

importDatabase();
