require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const users = await User.find({}).limit(1);
    if (users.length > 0) {
      console.log('User Data:', JSON.stringify(users[0], null, 2));
    } else {
      console.log('No users found');
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkUser();
