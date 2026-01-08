const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

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

const sampleJobs = [
    {
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      salaryMin: 120000,
      salaryMax: 150000,
      experienceMin: 3,
      experienceMax: 5,
      description: "We are looking for a talented Frontend Developer to join our team. You will be responsible for building modern web applications using React, TypeScript, and Tailwind CSS.",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "GraphQL"],
    },
    {
      title: "Product Manager",
      company: "StartUpXYZ",
      location: "Remote",
      type: "Full-time",
      salaryMin: 100000,
      salaryMax: 130000,
      experienceMin: 4,
      experienceMax: 8,
      description: "Lead product development initiatives and work closely with engineering teams to deliver exceptional user experiences.",
      skills: ["Product Management", "Agile", "User Research", "Data Analysis"],
    },
    {
      title: "UX Designer",
      company: "DesignStudio",
      location: "New York, NY",
      type: "Contract",
      salaryMin: 80000,
      salaryMax: 100000, 
      experienceMin: 2,
      experienceMax: 3,
      description: "Create beautiful and intuitive user interfaces for our enterprise clients.",
      skills: ["Figma", "UI/UX", "Prototyping", "User Testing"],
    },
    {
      title: "DevOps Engineer",
      company: "CloudSystems",
      location: "Austin, TX",
      type: "Full-time",
      salaryMin: 110000,
      salaryMax: 140000,
      experienceMin: 3,
      experienceMax: 6,
      description: "Build and maintain our cloud infrastructure and CI/CD pipelines.",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    },
    {
      title: "Data Scientist",
      company: "DataAnalytics Co.",
      location: "Boston, MA",
      type: "Full-time",
      salaryMin: 130000,
      salaryMax: 160000,
      experienceMin: 5,
      experienceMax: 10,
      description: "Apply machine learning techniques to solve complex business problems.",
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "PyTorch"],
    },
    {
      title: "Backend Developer",
      company: "API Masters",
      location: "Remote",
      type: "Full-time",
      salaryMin: 115000,
      salaryMax: 145000,
      experienceMin: 4,
      experienceMax: 7,
      description: "Develop scalable backend services and APIs for our platform.",
      skills: ["Node.js", "Python", "PostgreSQL", "Redis", "Microservices"],
    },
  ];

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing data...');
        await Application.deleteMany();
        await Job.deleteMany();
        await User.deleteMany();

        console.log('Creating users...');
        const employer = await User.create({
            name: 'John Employer',
            email: 'employer@example.com',
            password: 'password123',
            role: 'Employer'
        });

        const candidate = await User.create({
            name: 'Jane Candidate',
            email: 'candidate@example.com',
            password: 'password123',
            role: 'Job Seeker'
        });

        console.log('Creating jobs...');
        const jobsWithEmployer = sampleJobs.map(job => ({
            ...job,
            postedBy: employer._id
        }));

        const createdJobs = await Job.insertMany(jobsWithEmployer);

        console.log('Creating applications...');
        // Create 2 applications for the first job
        await Application.create({
            job: createdJobs[0]._id,
            applicant: candidate._id,
            employer: employer._id,
            resume: 'https://example.com/resume.pdf',
            coverLetter: 'I am excited about this opportunity!',
            status: 'Applied'
        });

        console.log('Data Imported!');
        process.exit();

    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

seedData();
