const mongoose = require('mongoose');
const { Users } = require('./models/UserModel.js');

mongoose.connect('mongodb://127.0.0.1:27017/HospitalServices')
  .then(async () => {
    const res = await Users.updateMany({}, { isVerified: true });
    console.log("Automatically approved all users:", res);
    process.exit(0);
  });
