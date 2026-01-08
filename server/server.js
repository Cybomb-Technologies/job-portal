const express = require('express');
const dotenv = require('dotenv');

// Load env vars immediately
dotenv.config();

console.log("Debug: GEMINI_API_KEY is " + (process.env.GEMINI_API_KEY ? "LOADED" : "MISSING"));
if (process.env.GEMINI_API_KEY) {
    console.log("Debug: Key Length: " + process.env.GEMINI_API_KEY.length);
}

const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

const path = require('path');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
