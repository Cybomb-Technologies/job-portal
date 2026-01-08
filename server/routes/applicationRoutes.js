const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  applyToJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const uploadDir = 'uploads/';
      if (!fs.existsSync(uploadDir)){
          fs.mkdirSync(uploadDir);
      }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Resumes Only! (pdf, doc, docx)');
        }
    }
});

router.post('/', protect, upload.single('resume'), applyToJob);
router.get('/my-applications', protect, getMyApplications);
router.get('/job/:jobId', protect, getJobApplications);
router.put('/:id/status', protect, updateApplicationStatus);

module.exports = router;
