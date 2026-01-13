const express = require('express');
const router = express.Router();
const { sendVerificationOTP, verifyEmailOTP, uploadDocuments, getVerificationStatus } = require('../controllers/verificationController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure Multer for Document Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/verification/');
    },
    filename: function (req, file, cb) {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Routes
router.post('/send-otp', protect, sendVerificationOTP);
router.post('/verify-otp', protect, verifyEmailOTP);
router.post('/upload-docs', protect, upload.single('document'), uploadDocuments);
router.get('/status', protect, getVerificationStatus);

module.exports = router;
