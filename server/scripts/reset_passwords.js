const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const resetPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job-portal');
        
        const emails = ['santhosh@cybomb.com', 'vignesh@cybomb.com'];
        
        for (const email of emails) {
            const user = await User.findOne({ email });
            if (user) {
                user.password = '123456';
                await user.save();
                console.log(`Reset password for ${email}`);
            } else {
                console.log(`User not found: ${email}`);
            }
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPasswords();
