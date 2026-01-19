const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const findUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job-portal');
        console.log('MongoDB Connected to job-portal');

        const allEmployers = await User.find({ role: 'Employer' }).limit(10);
        console.log(`Found ${allEmployers.length} total employers.`);
        
        allEmployers.forEach(u => {
            console.log(`- Name: ${u.name}, Email: ${u.email}, CompanyID: ${u.companyId}, CompanyRole: ${u.companyRole}`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

findUsers();
