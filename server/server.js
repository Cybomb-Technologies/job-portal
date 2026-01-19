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
const candidateRoutes = require('./routes/candidateRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Vite default port
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`User ${userId} joined room`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = require('./middleware/limiter');
app.use(limiter);

// Attach io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Database Connection
connectDB();

const path = require('path');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/verification', require('./routes/verificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/contact', contactRoutes);
// app.use('/api/scrape', require('./routes/scrapingRoutes')); // Removed in favor of custom reviews

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
