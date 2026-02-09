
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
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

const runReproMismatch = async () => {
    await connectDB();

    const domain = 'mismatch-cybomb.com'; 

    try {
        // 1. Create Company A (Verified)
        const companyA = await Company.create({
            name: 'Cybomb Orig',
            companyEmail: `admin@${domain}`,
            status: 'Approved'
        });
        const userA = await User.create({
            name: 'User A',
            email: `admin@${domain}`,
            password: 'pw',
            role: 'Employer',
            companyId: companyA._id,
            companyRole: 'Admin',
            employerVerification: { emailVerified: true, domainVerified: true }
        });

        // 2. Create Company B (Unverified) - Same Domain
        const companyB = await Company.create({
            name: 'Cybomb Duplicate',
            companyEmail: `other@${domain}`, // Same domain
            status: 'Pending'
        });
        const userB = await User.create({
            name: 'User B',
            email: `recruit@${domain}`,
            password: 'pw',
            role: 'Employer',
            companyId: companyB._id, // DIFFERENT COMPANY
            companyRole: 'Admin',
            employerVerification: { emailVerified: false }
        });

        console.log(`User A (Unified): ${userA._id} (Co: ${companyA._id})`);
        console.log(`User B (Pending): ${userB._id} (Co: ${companyB._id})`);

        // 3. Simulate Check
         const emailDomain = domain;
         const query = {
            _id: { $ne: userB._id },
            role: 'Employer',
            'employerVerification.emailVerified': true,
            email: { $regex: new RegExp(`@${emailDomain}$`, 'i') }
        };

        // My previous fix added this:
        if (userB.companyId) {
            query.companyId = { $ne: userB.companyId };
        }
        // Result: 
        // query.companyId = { $ne: companyB._id }
        // User A has companyId = companyA._id.
        // companyA != companyB.
        // So User A MATCHES the query!
        // Conflict FOUND.

        const conflict = await User.findOne(query);

        if (conflict) {
            console.log("FAIL: Conflict found. User B cannot verify because User A exists in a different company.");
        } else {
            console.log("PASS: No conflict.");
        }

        // Cleanup
        await User.deleteMany({ email: { $regex: domain } });
        await Company.deleteMany({ name: { $regex: 'Cybomb' } });

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

runReproMismatch();
