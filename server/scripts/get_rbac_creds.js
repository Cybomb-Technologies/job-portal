const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const getCreds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job-portal');
        
        const admin = await User.findOne({ role: 'Employer', companyRole: 'Admin' });
        const recruiter = await User.findOne({ role: 'Employer', companyRole: 'Recruiter' });

        if (admin) console.log(`ADMIN_EMAIL=${admin.email}`);
        if (recruiter) console.log(`RECRUITER_EMAIL=${recruiter.email}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

getCreds();
