const mongoose = require("mongoose");
const Medicine = require("./models/MedicineModel");
require("dotenv").config();

const medicines = [
  {
    name: "Paracetamol",
    category: "Pain Relief",
    manufacturer: "NPL",
    description: "Used to treat fever and mild to moderate pain.",
    price: 5,
    prescriptionRequired: false
  },
  {
    name: "Amoxicillin",
    category: "Antibiotics",
    manufacturer: "Deurali Janta",
    description: "Antibiotic used to treat bacterial infections.",
    price: 15,
    prescriptionRequired: true
  },
  {
    name: "Ibuprofen",
    category: "Pain Relief",
    manufacturer: "Quest Pharmaceuticals",
    description: "Nonsteroidal anti-inflammatory drug (NSAID) used for pain and fever.",
    price: 8,
    prescriptionRequired: false
  },
  {
    name: "Cetirizine",
    category: "Others",
    manufacturer: "NPL",
    description: "Antihistamine used to treat allergy symptoms.",
    price: 10,
    prescriptionRequired: false
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    await Medicine.deleteMany({});
    console.log("Cleared existing medicines.");
    
    await Medicine.insertMany(medicines);
    console.log("Successfully seeded medicines!");
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
