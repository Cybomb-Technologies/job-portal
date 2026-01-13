const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

dotenv.config({ path: '../.env' });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job-portal');
        console.log('MongoDB Connected for migration...');

        const employers = await User.find({ role: 'Employer' });
        console.log(`Found ${employers.length} employers to migrate.`);

        for (const employer of employers) {
            // Check if employer already has a companyId linked
            if (employer.companyId) {
                console.log(`Employer ${employer.name} already linked to company ${employer.companyId}. Skipping.`);
                continue;
            }

            // Create new Company record
            const companyData = {
                name: employer.companyName || `${employer.name}'s Company`,
                website: employer.website,
                companyEmail: employer.companyEmail,
                companyLocation: employer.companyLocation,
                companyCategory: employer.companyCategory,
                companyType: employer.companyType,
                foundedYear: employer.foundedYear,
                employeeCount: employer.employeeCount,
                profilePicture: employer.profilePicture,
                bannerPicture: employer.bannerPicture,
                about: employer.about,
                employerVerification: employer.employerVerification,
                whyJoinUs: employer.whyJoinUs,
                members: [{
                    user: employer._id,
                    role: 'Admin'
                }]
            };

            const company = await Company.create(companyData);
            console.log(`Created company ${company.name} for employer ${employer.name}.`);

            // Update Employer User
            employer.companyId = company._id;
            employer.companyRole = 'Admin';
            await employer.save();

            // Update Jobs posted by this employer
            const jobsUpdate = await Job.updateMany(
                { postedBy: employer._id },
                { $set: { companyId: company._id } }
            );
            console.log(`Updated ${jobsUpdate.modifiedCount} jobs for company ${company.name}.`);

            // Update Applications for this employer's jobs
            const appsUpdate = await Application.updateMany(
                { employer: employer._id },
                { $set: { companyId: company._id } }
            );
            console.log(`Updated ${appsUpdate.modifiedCount} applications for company ${company.name}.`);
        }

        console.log('Migration completed successfully.');
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
