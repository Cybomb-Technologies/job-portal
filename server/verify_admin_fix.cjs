require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Company = require('./models/Company');

const verifyFix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    console.log('--- Verifying getCompanies ---');
    const companies = await Company.find({}).sort({ createdAt: -1 }).limit(3);
    const formattedCompanies = companies.map(comp => ({
        ...comp.toObject(),
        companyName: comp.name
    }));
    console.log(`Found ${companies.length} companies from Company model.`);
    if (formattedCompanies.length > 0) {
        console.log('Sample Company:', JSON.stringify(formattedCompanies[0], null, 2));
    }

    console.log('\n--- Verifying getEmployers ---');
    const employers = await User.find({ role: 'Employer' })
        .select('-password')
        .populate('companyId', 'name companyEmail companyLocation')
        .limit(3);
    
    const formattedEmployers = employers.map(emp => {
        const empObj = emp.toObject();
        if (empObj.companyId && typeof empObj.companyId === 'object') {
             if (!empObj.companyName) empObj.companyName = empObj.companyId.name;
             if (!empObj.companyEmail) empObj.companyEmail = empObj.companyId.companyEmail;
             if (!empObj.companyLocation) empObj.companyLocation = empObj.companyId.companyLocation;
        }
        return empObj;
    });

    console.log(`Found ${employers.length} employers.`);
    if (formattedEmployers.length > 0) {
         console.log('Sample Employer with populated data:', JSON.stringify(formattedEmployers[0], null, 2));
    }

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

verifyFix();
