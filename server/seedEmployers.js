const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/job_portal');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedEmployers = async () => {
    try {
        await connectDB();

        console.log('🌱 Starting Employer Seeding Process...\n');

        // ==================== CREATE COMPANIES FIRST ====================

        console.log('🏢 Creating Company Records...\n');

        // Company 1 - Unverified
        let company1 = await Company.findOne({ name: 'Tech Innovations Pvt Ltd - Test' });
        if (!company1) {
            company1 = await Company.create({
                name: 'Tech Innovations Pvt Ltd - Test',
                website: 'https://techinnovations.com',
                companyEmail: 'contact@techinnovations.com',
                companyLocation: 'Bangalore, Karnataka',
                companyCategory: 'IT Services',
                companyType: 'Private',
                foundedYear: '2018',
                employeeCount: '50-100',
                employerVerification: {
                    level: 0,
                    status: 'Unverified',
                    domainVerified: false
                },
                members: []
            });
            console.log('✅ Created Company: Tech Innovations Pvt Ltd - Test');
        } else {
            console.log('⚠️  Tech Innovations company already exists');
        }

        // Company 2 - Level 1 (Email & Documents)
        let company2 = await Company.findOne({ name: 'Digital Solutions India - Test' });
        if (!company2) {
            company2 = await Company.create({
                name: 'Digital Solutions India - Test',
                website: 'https://digitalsolutions.com',
                companyEmail: 'info@digitalsolutions.com',
                companyLocation: 'Mumbai, Maharashtra',
                companyCategory: 'Software Development',
                companyType: 'Private',
                foundedYear: '2015',
                employeeCount: '100-200',
                employerVerification: {
                    level: 1,
                    status: 'Verified',
                    domainVerified: true,
                    documents: [
                        {
                            type: 'GST',
                            fileUrl: 'uploads/documents/digital-solutions-gst.pdf',
                            status: 'Approved',
                            uploadedAt: new Date()
                        }
                    ]
                },
                members: []
            });
            console.log('✅ Created Company: Digital Solutions India - Test');
        } else {
            console.log('⚠️  Digital Solutions company already exists');
        }

        // Company 3 - Level 1 (Domain only)
        let company3 = await Company.findOne({ name: 'Cloud Services Corp - Test' });
        if (!company3) {
            company3 = await Company.create({
                name: 'Cloud Services Corp - Test',
                website: 'https://cloudservices.com',
                companyEmail: 'hello@cloudservices.com',
                companyLocation: 'Hyderabad, Telangana',
                companyCategory: 'Cloud Computing',
                companyType: 'Startup',
                foundedYear: '2020',
                employeeCount: '10-50',
                employerVerification: {
                    level: 1,
                    status: 'Verified',
                    domainVerified: true
                },
                members: []
            });
            console.log('✅ Created Company: Cloud Services Corp - Test');
        } else {
            console.log('⚠️  Cloud Services company already exists');
        }

        // Company 4 - Level 2 (Fully Verified)
        let company4 = await Company.findOne({ name: 'Software Systems Ltd - Test' });
        if (!company4) {
            company4 = await Company.create({
                name: 'Software Systems Ltd - Test',
                website: 'https://softwaresystems.com',
                companyEmail: 'contact@softwaresystems.com',
                companyLocation: 'Pune, Maharashtra',
                companyCategory: 'Enterprise Software',
                companyType: 'Public',
                foundedYear: '2010',
                employeeCount: '500+',
                employerVerification: {
                    level: 2,
                    status: 'Verified',
                    domainVerified: true,
                    documents: [
                        {
                            type: 'GST',
                            fileUrl: 'uploads/documents/software-systems-gst.pdf',
                            status: 'Approved',
                            uploadedAt: new Date()
                        },
                        {
                            type: 'CIN',
                            fileUrl: 'uploads/documents/software-systems-cin.pdf',
                            status: 'Approved',
                            uploadedAt: new Date()
                        }
                    ]
                },
                members: []
            });
            console.log('✅ Created Company: Software Systems Ltd - Test');
        } else {
            console.log('⚠️  Software Systems company already exists');
        }

        console.log('\n📋 Creating Employer Admin Accounts...\n');

        // ==================== EMPLOYER ADMIN ACCOUNTS ====================

        // 1. Basic Employer - Unverified
        let employer1 = await User.findOne({ email: 'hr@techinnovations.com' });
        if (!employer1) {
            employer1 = await User.create({
                name: 'Tech Innovations HR',
                email: 'hr@techinnovations.com',
                password: 'password123',
                role: 'Employer',
                companyName: company1.name,
                companyRole: 'Admin',
                companyId: company1._id,
                isActive: true,
                employerVerification: {
                    level: 0,
                    status: 'Unverified',
                    emailVerified: false,
                    domainVerified: false,
                    idCard: { status: 'Not Uploaded' },
                    verificationScore: 0
                }
            });
            console.log('✅ Created: Tech Innovations HR (Unverified)');
            console.log(`   Email: hr@techinnovations.com | Password: password123`);
            console.log(`   Level: 0 | Status: Unverified\n`);

            await Company.findByIdAndUpdate(company1._id, {
                $push: { members: { user: employer1._id, role: 'Admin' } }
            });
        } else {
            console.log('⚠️  Tech Innovations HR account already exists\n');
        }

        // 2. Level 1 - Email & ID Verified
        let employer2 = await User.findOne({ email: 'admin@digitalsolutions.com' });
        if (!employer2) {
            employer2 = await User.create({
                name: 'Digital Solutions Admin',
                email: 'admin@digitalsolutions.com',
                password: 'password123',
                role: 'Employer',
                companyName: company2.name,
                companyRole: 'Admin',
                companyId: company2._id,
                isActive: true,
                employerVerification: {
                    level: 1,
                    status: 'Verified',
                    emailVerified: true,
                    domainVerified: true,
                    idCard: {
                        fileUrl: 'uploads/id-cards/digital-solutions-id.jpg',
                        uploadedAt: new Date(),
                        status: 'Approved'
                    },
                    verificationScore: 50
                }
            });
            console.log('✅ Created: Digital Solutions Admin (Level 1 - Email & ID Verified)');
            console.log(`   Email: admin@digitalsolutions.com | Password: password123`);
            console.log(`   Level: 1 | Email: ✓ | ID Card: ✓\n`);

            await Company.findByIdAndUpdate(company2._id, {
                $push: { members: { user: employer2._id, role: 'Admin' } }
            });
        } else {
            console.log('⚠️  Digital Solutions Admin account already exists\n');
        }

        // 3. Level 1 - Email Only
        let employer3 = await User.findOne({ email: 'manager@cloudservices.com' });
        if (!employer3) {
            employer3 = await User.create({
                name: 'Cloud Services Manager',
                email: 'manager@cloudservices.com',
                password: 'password123',
                role: 'Employer',
                companyName: company3.name,
                companyRole: 'Admin',
                companyId: company3._id,
                isActive: true,
                employerVerification: {
                    level: 1,
                    status: 'Verified',
                    emailVerified: true,
                    domainVerified: true,
                    idCard: { status: 'Not Uploaded' },
                    verificationScore: 30
                }
            });
            console.log('✅ Created: Cloud Services Manager (Level 1 - Email Only)');
            console.log(`   Email: manager@cloudservices.com | Password: password123`);
            console.log(`   Level: 1 | Email: ✓ | ID Card: ✗\n`);

            await Company.findByIdAndUpdate(company3._id, {
                $push: { members: { user: employer3._id, role: 'Admin' } }
            });
        } else {
            console.log('⚠️  Cloud Services Manager account already exists\n');
        }

        // 4. Level 2 - Fully Verified
        let employer4 = await User.findOne({ email: 'director@softwaresystems.com' });
        if (!employer4) {
            employer4 = await User.create({
                name: 'Software Systems Director',
                email: 'director@softwaresystems.com',
                password: 'password123',
                role: 'Employer',
                companyName: company4.name,
                companyRole: 'Admin',
                companyId: company4._id,
                isActive: true,
                employerVerification: {
                    level: 2,
                    status: 'Verified',
                    emailVerified: true,
                    domainVerified: true,
                    idCard: {
                        fileUrl: 'uploads/id-cards/software-systems-id.jpg',
                        uploadedAt: new Date(),
                        status: 'Approved'
                    },
                    documents: [
                        {
                            type: 'GST',
                            fileUrl: 'uploads/documents/software-systems-gst.pdf',
                            status: 'Approved',
                            uploadedAt: new Date()
                        },
                        {
                            type: 'CIN',
                            fileUrl: 'uploads/documents/software-systems-cin.pdf',
                            status: 'Approved',
                            uploadedAt: new Date()
                        }
                    ],
                    verificationScore: 100
                }
            });
            console.log('✅ Created: Software Systems Director (Level 2 - Fully Verified)');
            console.log(`   Email: director@softwaresystems.com | Password: password123`);
            console.log(`   Level: 2 | Email: ✓ | ID Card: ✓ | Documents: ✓\n`);

            await Company.findByIdAndUpdate(company4._id, {
                $push: { members: { user: employer4._id, role: 'Admin' } }
            });
        } else {
            console.log('⚠️  Software Systems Director account already exists\n');
        }

        // ==================== RECRUITER ACCOUNTS ====================

        console.log('\n📋 Creating Recruiter Accounts...\n');

        // 5. Recruiter - Not Verified
        let recruiter1 = await User.findOne({ email: 'sarah.recruiter@softwaresystems.com' });
        if (!recruiter1) {
            recruiter1 = await User.create({
                name: 'Sarah Recruiter',
                email: 'sarah.recruiter@softwaresystems.com',
                password: 'password123',
                role: 'Employer',
                companyName: company4.name,
                companyRole: 'Recruiter',
                companyId: company4._id,
                isActive: true,
                employerVerification: {
                    level: 0,
                    status: 'Unverified',
                    emailVerified: false,
                    domainVerified: false,
                    idCard: { status: 'Not Uploaded' },
                    verificationScore: 0
                }
            });
            console.log('✅ Created: Sarah Recruiter (Not Verified)');
            console.log(`   Email: sarah.recruiter@softwaresystems.com | Password: password123`);
            console.log(`   Company: ${company4.name}`);
            console.log(`   Status: Not Verified\n`);

            await Company.findByIdAndUpdate(company4._id, {
                $push: { members: { user: recruiter1._id, role: 'Recruiter' } }
            });
        } else {
            console.log('⚠️  Sarah Recruiter account already exists\n');
        }

        // 6. Recruiter - Email Verified
        let recruiter2 = await User.findOne({ email: 'john.recruiter@softwaresystems.com' });
        if (!recruiter2) {
            recruiter2 = await User.create({
                name: 'John Recruiter',
                email: 'john.recruiter@softwaresystems.com',
                password: 'password123',
                role: 'Employer',
                companyName: company4.name,
                companyRole: 'Recruiter',
                companyId: company4._id,
                isActive: true,
                employerVerification: {
                    level: 0,
                    status: 'Pending',
                    emailVerified: true,
                    domainVerified: true,
                    idCard: { status: 'Not Uploaded' },
                    verificationScore: 20
                }
            });
            console.log('✅ Created: John Recruiter (Email Verified)');
            console.log(`   Email: john.recruiter@softwaresystems.com | Password: password123`);
            console.log(`   Company: ${company4.name}`);
            console.log(`   Status: Email Verified ✓\n`);

            await Company.findByIdAndUpdate(company4._id, {
                $push: { members: { user: recruiter2._id, role: 'Recruiter' } }
            });
        } else {
            console.log('⚠️  John Recruiter account already exists\n');
        }

        // 7. Recruiter - ID Card Verified
        let recruiter3 = await User.findOne({ email: 'emily.recruiter@softwaresystems.com' });
        if (!recruiter3) {
            recruiter3 = await User.create({
                name: 'Emily Recruiter',
                email: 'emily.recruiter@softwaresystems.com',
                password: 'password123',
                role: 'Employer',
                companyName: company4.name,
                companyRole: 'Recruiter',
                companyId: company4._id,
                isActive: true,
                employerVerification: {
                    level: 0,
                    status: 'Pending',
                    emailVerified: false,
                    domainVerified: false,
                    idCard: {
                        fileUrl: 'uploads/id-cards/emily-recruiter-id.jpg',
                        uploadedAt: new Date(),
                        status: 'Approved'
                    },
                    verificationScore: 20
                }
            });
            console.log('✅ Created: Emily Recruiter (ID Card Verified)');
            console.log(`   Email: emily.recruiter@softwaresystems.com | Password: password123`);
            console.log(`   Company: ${company4.name}`);
            console.log(`   Status: ID Card Verified ✓\n`);

            await Company.findByIdAndUpdate(company4._id, {
                $push: { members: { user: recruiter3._id, role: 'Recruiter' } }
            });
        } else {
            console.log('⚠️  Emily Recruiter account already exists\n');
        }

        // 8. Recruiter - Fully Verified (Email + ID Card)
        let recruiter4 = await User.findOne({ email: 'michael.recruiter@softwaresystems.com' });
        if (!recruiter4) {
            recruiter4 = await User.create({
                name: 'Michael Recruiter',
                email: 'michael.recruiter@softwaresystems.com',
                password: 'password123',
                role: 'Employer',
                companyName: company4.name,
                companyRole: 'Recruiter',
                companyId: company4._id,
                isActive: true,
                employerVerification: {
                    level: 1,
                    status: 'Verified',
                    emailVerified: true,
                    domainVerified: true,
                    idCard: {
                        fileUrl: 'uploads/id-cards/michael-recruiter-id.jpg',
                        uploadedAt: new Date(),
                        status: 'Approved'
                    },
                    verificationScore: 50
                }
            });
            console.log('✅ Created: Michael Recruiter (Fully Verified)');
            console.log(`   Email: michael.recruiter@softwaresystems.com | Password: password123`);
            console.log(`   Company: ${company4.name}`);
            console.log(`   Status: Email ✓ | ID Card ✓ (Fully Verified)\n`);

            await Company.findByIdAndUpdate(company4._id, {
                $push: { members: { user: recruiter4._id, role: 'Recruiter' } }
            });
        } else {
            console.log('⚠️  Michael Recruiter account already exists\n');
        }

        // ==================== SUMMARY ====================

        console.log('\n' + '='.repeat(70));
        console.log('🎉 EMPLOYER SEEDING COMPLETED!');
        console.log('='.repeat(70));
        console.log('\n📊 SUMMARY OF TEST ACCOUNTS:\n');

        console.log('🏢 EMPLOYER ADMIN ACCOUNTS:');
        console.log('─'.repeat(70));
        console.log('1️⃣  Unverified Employer');
        console.log(`    Email: hr@techinnovations.com`);
        console.log(`    Password: password123`);
        console.log(`    Company: ${company1.name}`);
        console.log(`    Status: ❌ Not verified\n`);

        console.log('2️⃣  Level 1 - Email & ID Verified');
        console.log(`    Email: admin@digitalsolutions.com`);
        console.log(`    Password: password123`);
        console.log(`    Company: ${company2.name}`);
        console.log(`    Status: ✅ Email ✅ ID Card\n`);

        console.log('3️⃣  Level 1 - Email Only');
        console.log(`    Email: manager@cloudservices.com`);
        console.log(`    Password: password123`);
        console.log(`    Company: ${company3.name}`);
        console.log(`    Status: ✅ Email ❌ ID Card\n`);

        console.log('4️⃣  Level 2 - Fully Verified');
        console.log(`    Email: director@softwaresystems.com`);
        console.log(`    Password: password123`);
        console.log(`    Company: ${company4.name}`);
        console.log(`    Status: ✅ Email ✅ ID Card ✅ Documents\n`);

        console.log('\n👥 RECRUITER ACCOUNTS:');
        console.log('─'.repeat(70));
        console.log('5️⃣  Recruiter - Not Verified');
        console.log(`    Email: sarah.recruiter@softwaresystems.com`);
        console.log(`    Password: password123`);
        console.log(`    Company: ${company4.name}`);
        console.log(`    Status: ❌ Not verified\n`);

        console.log('6️⃣  Recruiter - Email Verified');
        console.log(`    Email: john.recruiter@softwaresystems.com`);
        console.log(`    Password: password123`);
        console.log(`    Company: ${company4.name}`);
        console.log(`    Status: ✅ Email verified\n`);

        console.log('7️⃣  Recruiter - ID Card Verified');
        console.log(`    Email: emily.recruiter@softwaresystems.com`);
        console.log(`    Password: password123`);
        console.log(`    Company: ${company4.name}`);
        console.log(`    Status: ✅ ID Card verified\n`);

        console.log('8️⃣  Recruiter - Fully Verified');
        console.log(`    Email: michael.recruiter@softwaresystems.com`);
        console.log(`    Password: password123`);
        console.log(`    Company: ${company4.name}`);
        console.log(`    Status: ✅ Email ✓ | ID Card ✓ (Fully Verified)\n`);

        console.log('='.repeat(70));
        console.log('💡 All passwords are: password123');
        console.log('💡 All company names end with "- Test" for easy identification');
        console.log('='.repeat(70) + '\n');

        process.exit();

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
};

seedEmployers();
