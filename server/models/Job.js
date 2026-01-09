const mongoose = require('mongoose');

const jobSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
    },
    companyDescription: {
      type: String,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    type: {
      type: String,
      required: true,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid'], 
      default: 'Full-time'
    },
    salaryMin: {
      type: Number,
      required: true,
    },
    salaryMax: {
      type: Number,
      required: true,
    },
    experienceMin: {
      type: Number,
      required: true,
    },
    experienceMax: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    jobRole: {
        type: String,
    },
    functionalArea: {
        type: String,
    },
    education: {
        type: String,
    },
    benefits: {
        type: [String],
    },
    preScreeningQuestions: {
        type: [String],
    },
    status: {
        type: String,
        enum: ['Active', 'Closed'],
        default: 'Active'
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
        type: String,
        unique: true
    }
  },
  {
    timestamps: true,
  }
);

// Generate Custom Job ID
jobSchema.pre('save', async function(next) {
    if (!this.jobId) {
        this.jobId = `JOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    next();
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
