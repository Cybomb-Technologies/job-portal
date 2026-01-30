
const mongoose = require('mongoose');
const User = require('../models/User');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const debugCybomb = async () => {
    await connectDB();

    try {
        const users = await User.find({ email: { $regex: 'cybomb.com', $options: 'i' } });
        
        const simplifiedUsers = users.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            companyId: u.companyId,
            companyRole: u.companyRole, // EXPLICITLY INCLUDE THIS
            verification: u.employerVerification
        }));

        fs.writeFileSync('cybomb_users_roles.json', JSON.stringify(simplifiedUsers, null, 2));
        console.log("Written to cybomb_users_roles.json");

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

debugCybomb();
