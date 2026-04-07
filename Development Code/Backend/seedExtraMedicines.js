const mongoose = require('mongoose');
const Medicine = require('./models/MedicineModel');

const MONGO_URI = 'mongodb://127.0.0.1:27017/HospitalServices';

const extraMedicines = [
    // Pain Relief
    { name: "Diclofenac 50mg", category: "Pain Relief", price: 35, manufacturer: "Deurali Janta", description: "Nonsteroidal anti-inflammatory drug (NSAID).", prescriptionRequired: true },
    { name: "Naproxen 250mg", category: "Pain Relief", price: 45, manufacturer: "Quest", description: "Long-acting pain relief for joint and muscle pain.", prescriptionRequired: true },
    { name: "Tramadol 50mg", category: "Pain Relief", price: 150, manufacturer: "Cipla", description: "Opioid pain medication for moderate to severe pain.", prescriptionRequired: true },
    { name: "Mefenamic Acid 500mg", category: "Pain Relief", price: 50, manufacturer: "Lomus", description: "Used for menstrual and general muscle pain.", prescriptionRequired: false },

    // Antibiotics
    { name: "Ciprofloxacin 500mg", category: "Antibiotics", price: 95, manufacturer: "NPL", description: "Broad-spectrum fluoroquinolone antibiotic.", prescriptionRequired: true },
    { name: "Clarithromycin 500mg", category: "Antibiotics", price: 210, manufacturer: "Deurali Janta", description: "Effective for respiratory tract infections.", prescriptionRequired: true },
    { name: "Doxycycline 100mg", category: "Antibiotics", price: 70, manufacturer: "Asian Pharma", description: "Tetracycline antibiotic used for various infections.", prescriptionRequired: true },
    { name: "Cephalexin 500mg", category: "Antibiotics", price: 110, manufacturer: "Quest", description: "Cephalosporin antibiotic.", prescriptionRequired: true },

    // Fever
    { name: "Nimesulide 100mg", category: "Fever", price: 30, manufacturer: "Lomus", description: "Antipyretic and analgesic properties.", prescriptionRequired: true },
    { name: "Aspirin 300mg", category: "Fever", price: 25, manufacturer: "Bayer", description: "Standard fever and pain relief medication.", prescriptionRequired: false },

    // Cough & Cold
    { name: "Levocetirizine 5mg", category: "Cough & Cold", price: 25, manufacturer: "NPL", description: "Next-gen antihistamine for allergies.", prescriptionRequired: false },
    { name: "Guaifenesin Syrup 100ml", category: "Cough & Cold", price: 120, manufacturer: "Dabur", description: "Expectorant for chest congestion.", prescriptionRequired: false },
    { name: "Montelukast 10mg", category: "Cough & Cold", price: 80, manufacturer: "Quest", description: "Prevents asthma and allergy symptoms.", prescriptionRequired: true },
    { name: "Chlorpheniramine 4mg", category: "Cough & Cold", price: 15, manufacturer: "Lomus", description: "Relief for common cold symptoms.", prescriptionRequired: false },

    // First Aid
    { name: "Povidone-Iodine Ointment", category: "First Aid", price: 90, manufacturer: "Cipla", description: "Topical antiseptic for minor cuts.", prescriptionRequired: false },
    { name: "Elastic Bandage (6 inch)", category: "First Aid", price: 250, manufacturer: "Generic", description: "For sprains and muscle support.", prescriptionRequired: false },
    { name: "Sterile Gauze Pads (X5)", category: "First Aid", price: 60, manufacturer: "Generic", description: "Wound dressing material.", prescriptionRequired: false },
    { name: "Adhesive Bandages (X10)", category: "First Aid", price: 40, manufacturer: "Johnson & Johnson", description: "Standard adhesive strips for minor cuts.", prescriptionRequired: false },

    // Chronic Diseases
    { name: "Amlodipine 5mg", category: "Chronic Diseases", price: 75, manufacturer: "NPL", description: "Calcium channel blocker for hypertension.", prescriptionRequired: true },
    { name: "Lisinopril 10mg", category: "Chronic Diseases", price: 85, manufacturer: "Deurali Janta", description: "ACE inhibitor for blood pressure control.", prescriptionRequired: true },
    { name: "Atorvastatin 20mg", category: "Chronic Diseases", price: 130, manufacturer: "Quest", description: "Lipid-lowering medication (statin).", prescriptionRequired: true },
    { name: "Losartan 50mg", category: "Chronic Diseases", price: 95, manufacturer: "Lomus", description: "Angiotensin II receptor antagonist.", prescriptionRequired: true },
    { name: "Levothyroxine 50mcg", category: "Chronic Diseases", price: 60, manufacturer: "NPL", description: "Thyroid hormone replacement.", prescriptionRequired: true },
    { name: "Gliclazide 80mg", category: "Chronic Diseases", price: 110, manufacturer: "Deurali Janta", description: "Sulfonylurea for type 2 diabetes.", prescriptionRequired: true },
    { name: "Warfarin 5mg", category: "Chronic Diseases", price: 140, manufacturer: "Quest", description: "Anticoagulant (blood thinner).", prescriptionRequired: true },
    { name: "Furosemide 40mg", category: "Chronic Diseases", price: 40, manufacturer: "NPL", description: "Diuretic for fluid retention (edema).", prescriptionRequired: true },

    // Others
    { name: "Multivitamin Tabs (X30)", category: "Others", price: 450, manufacturer: "HealthKart", description: "General health supplement.", prescriptionRequired: false },
    { name: "Vitamin C Chewable (X20)", category: "Others", price: 150, manufacturer: "Lomus", description: "Immunity support supplement.", prescriptionRequired: false },
    { name: "Calcium + Vitamin D3", category: "Others", price: 280, manufacturer: "Quest", description: "Bone health support.", prescriptionRequired: false },
    { name: "Iron Supplement Drops", category: "Others", price: 190, manufacturer: "NPL", description: "For pediatric iron deficiency.", prescriptionRequired: false },
    { name: "Magnesium Hydroxide Syrup", category: "Others", price: 110, manufacturer: "Lomus", description: "Antacid and laxative.", prescriptionRequired: false },
    { name: "Eye Drops (Lubricating)", category: "Others", price: 230, manufacturer: "Entod", description: "Relief for dry or tired eyes.", prescriptionRequired: false },
    { name: "Hydrocortisone Cream", category: "Others", price: 85, manufacturer: "Quest", description: "Topical steroid for skin irritation.", prescriptionRequired: true },
    { name: "Metronidazole 400mg", category: "Others", price: 65, manufacturer: "NPL", description: "For certain bacterial and parasitic infections.", prescriptionRequired: true },
    { name: "Fluconazole 150mg", category: "Others", price: 120, manufacturer: "Deurali Janta", description: "Antifungal medication.", prescriptionRequired: true },
    { name: "Albendazole 400mg", category: "Others", price: 50, manufacturer: "Lomus", description: "For deworming.", prescriptionRequired: false },
    { name: "Ranitidine 150mg", category: "Others", price: 45, manufacturer: "Quest", description: "Reduces stomach acid.", prescriptionRequired: true },
    { name: "Pantoprazole 40mg", category: "Others", price: 90, manufacturer: "NPL", description: "Proton pump inhibitor for GERD.", prescriptionRequired: true },
    { name: "Simvastatin 10mg", category: "Others", price: 115, manufacturer: "Deurali Janta", description: "Cholesterol control medication.", prescriptionRequired: true },
    { name: "Spironolactone 25mg", category: "Others", price: 140, manufacturer: "Quest", description: "Potassium-sparing diuretic.", prescriptionRequired: true }
];

const seedExtra = async () => {
    try {
        console.log("Connecting to Database Cluster...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected!");

        console.log(`Injecting ${extraMedicines.length} additional medicine records...`);
        
        for (const med of extraMedicines) {
            await Medicine.findOneAndUpdate({ name: med.name }, med, { upsert: true });
        }

        const totalCount = await Medicine.countDocuments();
        console.log(`\n==============================================`);
        console.log(`SUCCESS! EXTRA MEDICINES INJECTED.`);
        console.log(`TOTAL MEDICINES IN DATABASE: ${totalCount}`);
        console.log(`==============================================`);

        process.exit(0);
    } catch (err) {
        console.error("Infection Error:", err);
        process.exit(1);
    }
};

seedExtra();
