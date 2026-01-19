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
    salaryType: {
      type: String,
      enum: ['Fixed', 'Range', 'Starting From'],
      default: 'Range'
    },
    salaryFrequency: {
      type: String,
      enum: ['Year', 'Month', 'Week', 'Hour'],
      default: 'Year'
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
    fieldOfStudy: {
        type: String,
    },
    benefits: {
        type: [String],
    },
    preScreeningQuestions: {
        type: [String],
    },
    recruitmentDuration: {
        type: String,
        default: 'Immediate'
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
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    jobId: {
        type: String,
        unique: true
    },
    applyMethod: {
        type: String,
        enum: ['direct', 'website'],
        default: 'direct'
    },
    applyUrl: {
        type: String
    },
    interviewTime: {
        type: String
    },
    interviewVenue: {
        type: String
    },
    interviewContact: {
        type: String
    },
    openings: {
        type: Number,
        default: 1
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

// Indexes for Search Performance
jobSchema.index({ title: 'text', company: 'text', skills: 'text', description: 'text' });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ companyId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ experienceMin: 1 });
jobSchema.index({ salaryMin: 1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
