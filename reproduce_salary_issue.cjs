require('dotenv').config();
const mongoose = require('mongoose');
const Job = require('./server/models/Job');
const User = require('./server/models/User');
const Company = require('./server/models/Company');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find an employer
        const employer = await User.findOne({ role: 'Employer', companyId: { $ne: null } });
        if (!employer) {
            console.log('No employer found to test with.');
            process.exit(0);
        }
        console.log('Found employer:', employer.email);

        const company = await Company.findById(employer.companyId);
        if(!company) {
             console.log('Company not found');
             process.exit(0);
        }

        // Mock Job Data
        const jobData = {
            title: 'Test Salary Job',
            company: company.name,
            location: 'Test City',
            type: 'Full-time',
            salaryMin: 200000,
            salaryMax: 500000, // The value in question
            salaryType: 'Range',
            salaryFrequency: 'Year',
            experienceMin: 1,
            experienceMax: 3,
            description: '<p>Test description</p>',
            skills: ['Test'],
            postedBy: employer._id,
            companyId: employer.companyId,
            status: 'Active',
            jobRole: 'Tester',
            functionalArea: 'Testing',
            recruitmentDuration: 'Immediate'
        };

        console.log('Creating job with salaryMax:', jobData.salaryMax);

        const job = await Job.create(jobData);
        console.log('Job created. ID:', job._id);
        console.log('Stored salaryMax:', job.salaryMax);

        if (job.salaryMax === 499997) {
            console.log('Reproduced! Backend changed 500000 to 499997');
        } else if (job.salaryMax === 500000) {
            console.log('Backend stored 500000 correctly. Issue must be in Frontend.');
        } else {
            console.log('Stored value is:', job.salaryMax);
        }

        // Cleanup
        await Job.findByIdAndDelete(job._id);
        console.log('Test job deleted');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
