const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

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

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@jobportal.com';
        const adminPassword = 'adminpassword123';

        console.log(`Checking for existing admin with email: ${adminEmail}...`);

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists.');
            process.exit();
        }

        console.log('Creating admin user...');
        const admin = await User.create({
            name: 'Overall Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'Admin',
            isActive: true
        });

        console.log('Admin User Created Successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);

        process.exit();

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

seedAdmin();
