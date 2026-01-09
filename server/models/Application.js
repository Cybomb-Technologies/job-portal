const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: String, // URL to resume
      required: true,
    },
    coverLetter: {
      type: String,
    },
    screeningAnswers: [{
        question: String,
        answer: String
    }],
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired'],
      default: 'Applied',
    },
    applicationId: {
        type: String,
        unique: true
    }
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications from same user to same job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Generate Custom Application ID
applicationSchema.pre('save', async function(next) {
    if (!this.applicationId) {
        this.applicationId = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    next();
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
