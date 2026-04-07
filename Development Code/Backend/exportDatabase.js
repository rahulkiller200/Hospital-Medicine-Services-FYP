const mongoose = require('mongoose');
const fs = require('fs');

const URI = 'mongodb://127.0.0.1:27017/HospitalServices';

// Target all standard collections visible in the screenshot
const collectionsToExport = [
    'bloodbanks', 
    'hospitals', 
    'medicineorders', 
    'medicines', 
    'patienthistories', 
    'pharmacies', 
    'systemconfigs', 
    'users'
];

async function exportDatabase() {
    console.log("Connecting to the Master Database Cluster...");
    try {
        await mongoose.connect(URI);
        const db = mongoose.connection.db;
        
        let masterDump = {};
        
        console.log("Database connected successfully! Scanning target collections...\n");

        for (let name of collectionsToExport) {
            console.log(`[DUMPING] Extracting documents from: ${name}...`);
            const data = await db.collection(name).find({}).toArray();
            masterDump[name] = data;
            console.log(`[SUCCESS] Captured ${data.length} records from ${name}.`);
        }

        // Save the massive object to a single file
        const backupFile = 'hospital_master_backup.json';
        fs.writeFileSync(backupFile, JSON.stringify(masterDump, null, 2));
        
        console.log(`\n==============================================`);
        console.log(`DATABASE EXPORTED SUCCESSFULLY!`);
        console.log(`Saved to: ${backupFile}`);
        console.log(`==============================================`);
        
    } catch (err) {
        console.error("Export Failed:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

exportDatabase();
