
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

const runRepro = async () => {
    await connectDB();

    try {
        const domain = 'update-test.com';

        // 1. Create Company
        const company = await Company.create({
            name: 'Update Test Co',
            companyEmail: `info@${domain}`,
            website: 'www.original.com',
            status: 'Approved'
        });

        // 2. Create Admin User
        const adminUser = await User.create({
            name: 'Admin Updater',
            email: `admin@${domain}`,
            password: 'pw',
            role: 'Employer',
            companyId: company._id,
            companyRole: 'Admin', // Permission Check PASS
        });

        // 3. Create Recruiter User
        const recruiterUser = await User.create({
            name: 'Recruiter Updater',
            email: `recruiter@${domain}`,
            password: 'pw',
            role: 'Employer',
            companyId: company._id,
            companyRole: 'Recruiter', // Permission Check FAIL
        });

        // 4. Simulate Update Logic (Copied from authController.js)
        const simulateUpdate = async (user, updates) => {
            console.log(`\n--- Simulating Update for ${user.name} (${user.companyRole}) ---`);
            
            // Logic from authController.js
            let company = null;
            if (user.role === 'Employer' && user.companyId) {
                company = await Company.findById(user.companyId);
                if (company) {
                    if (user.companyRole === 'Admin') {
                        console.log("Permission Granted: Updating fields...");
                        company.name = updates.companyName || company.name;
                        company.website = updates.website || company.website;
                        await company.save();
                        console.log("Saved.");
                    } else {
                        console.log("Permission Denied: User is not Admin.");
                    }
                }
            }
            return await Company.findById(user.companyId);
        };

        // Test 1: Admin updates
        const updatedCo1 = await simulateUpdate(adminUser, { website: 'www.updated-by-admin.com' });
        console.log(`Result Website: ${updatedCo1.website}`);

        // Test 2: Recruiter updates
        const updatedCo2 = await simulateUpdate(recruiterUser, { website: 'www.hack-attempt.com' });
        console.log(`Result Website: ${updatedCo2.website}`);

        // Cleanup
        await User.deleteMany({ email: { $regex: domain } });
        await Company.findByIdAndDelete(company._id);

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

runRepro();
