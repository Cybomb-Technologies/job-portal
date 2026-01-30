
const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const debugCybomb = async () => {
    await connectDB();

    try {
        console.log('--- Finding users with gmail.com (just to test) or cybomb.com ---');
        // Searching for cybomb.com users
        const users = await User.find({ email: { $regex: 'cybomb.com', $options: 'i' } });

        console.log(`Found ${users.length} users.`);

        users.forEach(user => {
            console.log('--------------------------------------------------');
            console.log(`ID: ${user._id}`);
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`CompanyId: ${user.companyId}`); // This is what we need to compare
            console.log(`Verification:`, JSON.stringify(user.employerVerification, null, 2));
        });

        console.log('--------------------------------------------------');

        // Check if my logic holds
        if (users.length >= 2) {
             const user1 = users[0];
             const user2 = users[1];
             if (user1.companyId && user2.companyId) {
                 console.log(`Comparing Company IDs: ${user1.companyId} === ${user2.companyId} ?`);
                 console.log(`Result: ${user1.companyId.toString() === user2.companyId.toString()}`);
                 
                 // Simulate Query
                 const query = {
                    _id: { $ne: user2._id },
                    role: 'Employer',
                    'employerVerification.emailVerified': true,
                    email: { $regex: new RegExp(`@${user2.email.split('@')[1]}$`, 'i') },
                    // My fix logic:
                    companyId: { $ne: user2.companyId }
                 };
                 console.log('Test Query for User 2 against User 1 details:', query);
             }
        }


    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

debugCybomb();
