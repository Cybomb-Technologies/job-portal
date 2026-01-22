const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { sendDailyEmails } = require('../services/recommendationService');

// Load env
dotenv.config();

// Connect DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const runTest = async () => {
    await connectDB();
    console.log('Triggering Daily Email Process...');
    await sendDailyEmails();
    console.log('Done.');
    process.exit();
};

runTest();
