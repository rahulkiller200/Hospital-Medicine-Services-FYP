const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/hospital_management');

const Hospital = mongoose.model('Hospital', new mongoose.Schema({ name: String, available: Boolean, position: Object, phone: String, address: Object, type: String }), 'hospitals');
const Pharmacy = mongoose.model('Pharmacy', new mongoose.Schema({ name: String, available: Boolean, position: Object, phone: String, address: Object }), 'pharmacies');
const BloodBank = mongoose.model('BloodBank', new mongoose.Schema({ name: String, available: Boolean, position: Object, phone: String, address: Object, bloodTypes: Array }), 'bloodbanks');

async function seed() {
  await Hospital.deleteMany({});
  await Pharmacy.deleteMany({});
  await BloodBank.deleteMany({});

  await Hospital.insertMany([{ name: 'Bir Hospital', available: true, phone: '01-4221988', address: {street: 'Kanti Path', city: 'Kathmandu'}, position: {lat: 27.7058, lng: 85.3146}, type: 'Government' }, { name: 'Teaching Hospital (TUTH)', available: true, phone: '01-4412303', address: {street: 'Maharajgunj', city: 'Kathmandu'}, position: {lat: 27.7361, lng: 85.3316}, type: 'Teaching' }]);
  await Pharmacy.insertMany([{ name: 'Sajha Bipani (Pharmacy)', available: true, phone: '01-424036', address: {street: 'Teku', city: 'Kathmandu'}, position: {lat: 27.6975, lng: 85.3055} }, { name: 'Apollo Pharmacy', available: true, phone: '9841234567', address: {street: 'Baneshwor', city: 'Kathmandu'}, position: {lat: 27.6915, lng: 85.3420} }]);
  await BloodBank.insertMany([{ name: 'Nepal Red Cross Society', available: true, phone: '01-4225067', address: {street: 'Balkhu', city: 'Kathmandu'}, position: {lat: 27.6841, lng: 85.2979}, bloodTypes: [{group: 'A+', available: 45}, {group: 'O+', available: 120}] }, { name: 'Teaching Hospital Blood Bank', available: true, phone: '01-4412303', address: {street: 'Maharajgunj', city: 'Kathmandu'}, position: {lat: 27.7360, lng: 85.3310}, bloodTypes: [{group: 'B+', available: 32}] }]);
  
  console.log('Seeded Hospitals, Pharmacies, and Blood Banks!');
  mongoose.disconnect();
}
seed();
