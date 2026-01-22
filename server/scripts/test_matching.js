const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { findMatchesForUser } = require('../services/recommendationService');
const User = require('../models/User');
const Job = require('../models/Job');

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
    console.log('--- Testing Job Matching Logic ---');

    // 1. Get a few job seekers
    const users = await User.find({ role: 'Job Seeker' }).limit(3); 
    
    if (users.length === 0) {
        console.log('No job seekers found to test.');
        process.exit();
    }

    for (const user of users) {
        console.log(`\nUser: ${user.name}`);
        console.log(`Skills: ${user.skills}`);
        console.log(`Experience: ${user.totalExperience || 'N/A'}`);
        console.log(`Location: ${user.currentLocation || 'N/A'}`);

        const matches = await findMatchesForUser(user, 5);
        
        console.log(`Found ${matches.length} matches:`);
        matches.forEach(job => {
            console.log(`- [${job.score}pts] ${job.title} @ ${job.company} (${job.matchReasons.join(', ')})`);
        });
    }

    console.log('\nDone.');
    process.exit();
};

runTest();
