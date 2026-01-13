// Comprehensive list of Job Titles across various industries
export const commonJobTitles = [
    // Tech & Engineering
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer", 
    "DevOps Engineer", "Data Scientist", "Product Manager", "UI/UX Designer", "Mobile Developer",
    "QA Engineer", "System Administrator", "Database Administrator", "Cloud Architect",
    "Solution Architect", "Technical Lead", "Engineering Manager", "CTO", "CEO", "Founder",
    "Co-Founder", "Project Manager", "Business Analyst", "Marketing Manager", "Sales Manager",
    "Content Writer", "Graphic Designer", "HR Manager", "Recruiter", "Accountant",
    "Financial Analyst", "Data Analyst", "Machine Learning Engineer", "AI Researcher",
    "Game Developer", "Blockchain Developer", "Security Engineer", "Network Engineer",
    "Site Reliability Engineer", "Release Engineer", "Scrum Master", "Product Owner",
    "Technical Writer", "Support Engineer", "Sales Engineer", "Developer Advocate",
    "Intern", "Junior Developer", "Senior Developer", "Staff Engineer", "Principal Engineer",
    "Android Developer", "iOS Developer", "Flutter Developer", "React Native Developer",
    "Embedded Systems Engineer", "Firmware Engineer", "Hardware Engineer", "Robotics Engineer",
    "Computer Vision Engineer", "NLP Engineer", "Big Data Engineer", "ETL Developer",
    "Data Engineer", "Analytics Engineer", "Business Intelligence Developer",
    "Cyber Security Analyst", "Information Security Manager", "Penetration Tester",
    "Ethical Hacker", "Security Architect", "Network Administrator", "Systems Engineer",
    "Cloud Engineer", "AWS Solutions Architect", "Azure Architect", "GCP Architect",
    "IT Manager", "IT Support Specialist", "Help Desk Technician", "IT Director",
    "Chief Information Officer (CIO)", "Chief Information Security Officer (CISO)",
    "Chief Product Officer (CPO)", "Chief Data Officer (CDO)", "Chief Marketing Officer (CMO)",
    "Chief Financial Officer (CFO)", "Chief Operating Officer (COO)", "President", "Vice President",
    "Director of Engineering", "Head of Product", "Head of Design", "Head of Marketing",
    "Creative Director", "Art Director", "Visual Designer", "Interaction Designer",
    "User Researcher", "UX Writer", "Product Designer", "Web Designer", "Motion Designer",
    "3D Artist", "Animator", "Video Editor", "Sound Designer", "Music Producer",
    
    // Marketing & Sales
    "Digital Marketing Manager", "SEO Specialist", "SEM Specialist", "Social Media Manager",
    "Content Marketing Manager", "Email Marketing Specialist", "Growth Hacker",
    "Brand Manager", "Public Relations Manager", "Communications Manager", "Events Manager",
    "Account Manager", "Account Executive", "Business Development Manager", "Sales Representative",
    "Sales Director", "Customer Success Manager", "Customer Support Representative",

    // Operations & HR
    "Operations Manager", "Supply Chain Manager", "Logistics Manager", "Procurement Manager",
    "Human Resources Generalist", "Talent Acquisition Specialist", "HR Business Partner",
    "Compensation and Benefits Manager", "Learning and Development Manager", "Office Manager",
    "Executive Assistant", "Administrative Assistant",

    // Finance & Legal
    "Investment Banker", "Private Equity Associate", "Venture Capitalist", "Portfolio Manager",
    "Risk Manager", "Compliance Officer", "Auditor", "Tax Consultant", "Legal Counsel",
    "Corporate Lawyer", "Paralegal", "Contract Administrator",

    // Healthcare & Science
    "Medical Doctor", "Nurse", "Pharmacist", "Biomedical Engineer", "Biotechnologist",
    "Clinical Research Associate", "Lab Technician", "Research Scientist", "Chemist",
    "Physicist", "Mathematician", "Statistician", "Psychologist", "Counselor",

    // Education
    "Professor", "Lecturer", "Teacher", "Principal", "Academic Advisor", "Researcher",
    "Curriculum Developer", "Instructional Designer", "Librarian", "Trainer",

    // Creative & Freelance
    "Freelancer", "Consultant", "Contractor", "Photographer", "Videographer", "Writer",
    "Editor", "Blogger", "Influencer", "Artist", "Musician"
].sort();

// Comprehensive list of Technical and Professional Skills
export const commonSkills = [
    // Programming Languages
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
    "PHP", "Ruby", "HTML", "CSS", "SQL", "NoSQL", "R", "Matlab", "Scala", "Groovy", "Perl",
    "Shell Scripting", "Bash", "PowerShell", "Assembly", "Dart", "Lua", "Haskell", "Elixir",
    "Clojure", "F#", "Objective-C", "Visual Basic .NET", "Julia", "Solidity", "Vyper",

    // Frontend Development
    "React", "Angular", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "SvelteKit", "Gatsby",
    "Remix", "SolidJS", "Alpine.js", "jQuery", "Bootstrap", "Tailwind CSS", "Sass", "Less",
    "Styled Components", "Material UI", "Chakra UI", "Ant Design", "Radix UI", "Three.js",
    "WebGL", "D3.js", "Redux", "MobX", "Zustand", "Recoil", "Context API", "React Query",
    "SWR", "Apollo Client", "GraphQL", "Webpack", "Vite", "Parcel", "Rollup", "Babel",

    // Backend Development
    "Node.js", "Express.js", "NestJS", "Koa", "Fastify", "Django", "Flask", "FastAPI",
    "Spring Boot", "Hibernate", "ASP.NET Core", "Entity Framework", "Laravel", "Symfony",
    "CodeIgniter", "Ruby on Rails", "Phoenix", "Gin", "Echo", "Fiber", "Actix", "Rocket",
    "Socket.io", "gRPC", "WebSockets", "Microservices", "Serverless", "REST API",

    // Database & Storage
    "PostgreSQL", "MySQL", "MariaDB", "SQLite", "Oracle Database", "Microsoft SQL Server",
    "MongoDB", "Cassandra", "CouchDB", "Redis", "Memcached", "Elasticsearch", "Solr",
    "DynamoDB", "Firestore", "Cosmos DB", "Neo4j", "ArangoDB", "Supabase", "Firebase",

    // DevOps & Cloud
    "Docker", "Kubernetes", "Podman", "Vagrant", "Ansible", "Terraform", "Puppet", "Chef",
    "Jenkins", "GitLab CI", "GitHub Actions", "CircleCI", "Travis CI", "Azure DevOps",
    "AWS", "Azure", "Google Cloud", "DigitalOcean", "Heroku", "Vercel", "Netlify",
    "Linode", "Cloudflare", "Nginx", "Apache", "Linux", "Unix", "Ubuntu", "CentOS", "Debian",
    "Red Hat", "Fedora", "Arch Linux", "Kali Linux", "Windows Server",

    // Mobile Development
    "React Native", "Flutter", "Ionic", "Cordova", "Xamarin", "NativeScript", "Android Studio",
    "Xcode", "Jetpack Compose", "SwiftUI", "UIKit", "Cocoa Touch", "Expo",

    // Data Science & AI
    "Machine Learning", "Deep Learning", "Data Science", "Artificial Intelligence",
    "Natural Language Processing", "Computer Vision", "Reinforcement Learning",
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "Matplotlib",
    "Seaborn", "Plotly", "OpenCV", "NLTK", "Spacy", "Hugging Face", "LangChain", "LLMs",
    "Generative AI", "Big Data", "Spark", "Hadoop", "Kafka", "Airflow", "Databricks",
    "Snowflake", "Tableau", "Power BI", "Looker", "Excel",

    // Blockchain & Web3
    "Blockchain", "Smart Contracts", "Ethereum", "Bitcoin", "Web3.js", "Ethers.js",
    "Hardhat", "Truffle", "Ganache", "IPFS", "DeFi", "NFTs", "Consensus Algorithms",

    // Testing
    "Jest", "Mocha", "Chai", "Jasmine", "Karma", "Cypress", "Playwright", "Puppeteer",
    "Selenium", "Appium", "JUnit", "TestNG", "PyTest", "RSpec", "PHPUnit",

    // Soft Skills
    "Communication", "Teamwork", "Problem Solving", "Critical Thinking", "Leadership",
    "Time Management", "Adaptability", "Creativity", "Emotional Intelligence", "Negotiation",
    "Conflict Resolution", "Public Speaking", "Mentoring", "Decision Making", "Empathy",
    "Collaboration", "Active Listening", "Accountability", "Patience", "Resilience"
].sort();

// Comprehensive list of Academic Degrees
export const commonDegrees = [
    "High School Diploma", "GED", "Associate of Arts (AA)", "Associate of Science (AS)",
    "Associate of Applied Science (AAS)", "Bachelor of Arts (BA)", "Bachelor of Science (BS)",
    "Bachelor of Fine Arts (BFA)", "Bachelor of Technology (B.Tech)", "Bachelor of Engineering (B.E)",
    "Bachelor of Business Administration (BBA)", "Bachelor of Commerce (B.Com)",
    "Bachelor of Computer Applications (BCA)", "Bachelor of Architecture (B.Arch)",
    "Bachelor of Education (B.Ed)", "Bachelor of Laws (LLB)", "Bachelor of Nursing (BSN)",
    "Master of Arts (MA)", "Master of Science (MS)", "Master of Fine Arts (MFA)",
    "Master of Technology (M.Tech)", "Master of Engineering (M.E)",
    "Master of Business Administration (MBA)", "Master of Computer Applications (MCA)",
    "Master of Public Health (MPH)", "Master of Social Work (MSW)", "Master of Education (M.Ed)",
    "Master of Laws (LLM)", "Master of Architecture (M.Arch)", "Doctor of Philosophy (PhD)",
    "Juris Doctor (JD)", "Doctor of Medicine (MD)", "Doctor of Dental Surgery (DDS)",
    "Doctor of Pharmacy (PharmD)", "Doctor of Education (EdD)", "Doctor of Psychology (PsyD)",
    "Diploma", "Post Graduate Diploma", "Certificate", "Professional Certificate", "Nanodegree"
].sort();

// Comprehensive list of Fields of Study (Majors)
export const commonFieldsOfStudy = [
    "Computer Science", "Information Technology", "Software Engineering", "Computer Engineering",
    "Data Science", "Artificial Intelligence", "Cybersecurity", "Information Systems",
    "Network Engineering", "Web Development", "Game Development", "Robotics",
    "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering",
    "Aerospace Engineering", "Biomedical Engineering", "Industrial Engineering", "Systems Engineering",
    "Mathematics", "Statistics", "Physics", "Chemistry", "Biology", "Biotechnology",
    "Environmental Science", "Geology", "Astronomy", "Microbiology", "Genetics", "Neuroscience",
    "Business Administration", "Management", "Finance", "Accounting", "Marketing", "Economics",
    "International Business", "Entrepreneurship", "Human Resources", "Supply Chain Management",
    "Operations Management", "Hospitality Management", "Sports Management",
    "Psychology", "Sociology", "Political Science", "Anthropology", "Philosophy", "History",
    "English Literature", "Creative Writing", "Journalism", "Communications", "Public Relations",
    "Education", "Special Education", "Early Childhood Education", "Curriculum and Instruction",
    "Law", "Criminology", "Criminal Justice", "Forensic Science", "International Relations",
    "Medicine", "Nursing", "Pharmacy", "Public Health", "Health Administration", "Nutrition",
    "Physiotherapy", "Occupational Therapy", "Dentistry", "Veterinary Medicine",
    "Fine Arts", "Graphic Design", "Industrial Design", "Fashion Design", "Interior Design",
    "Film Studies", "Music", "Theatre Arts", "Photography", "Animation", "Architecture"
].sort();

// Popular Benefits
export const commonBenefits = [
    "Health Insurance", "Dental Insurance", "Vision Insurance", "Life Insurance", "Disability Insurance",
    "401(k) / Retirement Plan", "Paid Time Off (PTO)", "Sick Leave", "Parental Leave", "Remote Work",
    "Flexible Schedule", "Gym Membership", "Professional Development", "Tuition Reimbursement",
    "Stock Options / Equity", "Performance Bonus", "Sign-on Bonus", "Relocation Assistance",
    "Free Food / Snacks", "Commuter Benefits", "Employee Discounts", "Company Retreats",
    "Pet Friendly", "Wellness Program", "Mental Health Support"
].sort();

// Popular Pre-screening Questions
export const commonPreScreeningQuestions = [
    "How many years of experience do you have in this field?",
    "Are you willing to relocate?",
    "What is your expected salary?",
    "Do you have a valid work visa?",
    "Why do you want to work for our company?",
    "What are your strengths and weaknesses?",
    "Describe a challenging project you worked on.",
    "Are you comfortable working in a remote/hybrid environment?",
    "When can you start?",
    "Do you have any certifications relevant to this role?"
];

// Common Functional Areas
export const commonFunctionalAreas = [
    "IT Software - Application Programming", "IT Software - DBA / Datawarehousing",
    "IT Software - Embedded / EDA / VLSI / ASIC / Chip Design", "IT Software - ERP / CRM",
    "IT Software - Mainframe", "IT Software - Middleware", "IT Software - Mobile",
    "IT Software - Network Administration / Security", "IT Software - QA & Testing",
    "IT Software - Systems / EDP / MIS", "IT Software - Other",
    "Analytics & Business Intelligence", "Banking / Insurance", "BPO / KPO / LPO / Customer Service",
    "Construction / Engineering / Cement / Metals", "Content / Journalism", "Corporate Planning / Consulting",
    "Design / Creative / Art", "Education / Teaching / Training", "Export / Import / Merchandising",
    "Finance / Accounts / Audit / Tax", "Healthcare / Medical", "HR / Administration / IR",
    "Legal / Law", "Marketing / Advertising / MR / PR", "Production / Maintenance / Quality",
    "Purchase / Logistics / Supply Chain", "Real Estate / Property", "Sales / Business Development",
    "Strategy / Management Consulting Cases", "Telecom / ISP", "Travel / Airlines / Hospitality"
].sort();

// Common Recruitment Durations
export const commonRecruitmentDurations = [
    "Immediate",
    "Within 1 Week",
    "Within 2 Weeks",
    "2 to 3 Weeks",
    "1 Month",
    "More than 1 Month"
];

// Comprehensive list of Company Categories (Industries)
export const commonCompanyCategories = [
    "IT Services", "Software Development", "Ecommerce", "Fintech", "Healthtech", 
    "Edtech", "Human Resources", "Digital Marketing", "Advertising", "Real Estate",
    "Hospitality", "Healthcare", "Manufacturing", "Automotive", "Logistics",
    "Retail", "Finance", "Education", "Consulting", "Entertainment",
    "Media", "Telecommunications", "Agriculture", "Construction", "Legal Services",
    "Non-profit", "Design", "Research & Development", "Internet of Things", "Cybersecurity",
    "Artificial Intelligence", "Cloud Computing", "Blockchain", "Gaming", "Pharma",
    "Biotech", "Energy", "Food & Beverage", "Apparel & Fashion", "Electronics"
].sort();

// Common Company Types (Legal Structures)
export const commonCompanyTypes = [
    "Private Limited", "Public Limited", "Partnership", "Proprietorship", 
    "Startup", "NGO", "Educational Institute", "Government Agency", 
    "MNC", "SME", "Self-employed", "Other"
].sort();
