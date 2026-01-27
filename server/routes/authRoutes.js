const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
    authUser, 
    registerUser, 
    googleLogin, 
    forgotPassword, 
    resetPassword, 
    getUserProfile, 
    updateUserProfile,
    changePassword,
    deleteAccount,
    getPublicUserProfile,
    getCompanies,
    followCompany,
    unfollowCompany,
    verifyOtp,
    resendOtp
} = require('../controllers/authController');

const router = express.Router();

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check File Type
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    // Mimetype check can be tricky for docs, sometimes lax check or specific mime types needed
    // For simplicity allowing if extension matches standard types
    if (extname) {
        return cb(null, true);
    } else {
        cb('Images, PDFs, and Docs only!');
    }
}

const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', authUser);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'bannerPicture', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ]), updateUserProfile)
    .delete(protect, deleteAccount);

router.put('/update-password', protect, changePassword);
router.get('/user/:id', getPublicUserProfile);
router.get('/companies', getCompanies);
router.post('/follow/:id', protect, followCompany);
router.delete('/unfollow/:id', protect, unfollowCompany);

module.exports = router;
