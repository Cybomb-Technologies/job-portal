const mongoose = require('mongoose');

const companySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    website: { type: String },
    companyEmail: { type: String },
    companyLocation: { type: String },
    companyCategory: { type: String },
    companyType: { type: String },
    foundedYear: { type: String },
    employeeCount: { type: String },
    profilePicture: { type: String }, // Company Logo
    bannerPicture: { type: String },
    about: { type: String },
    employerVerification: {
        level: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Unverified', 'Pending', 'Verified', 'Rejected'],
            default: 'Unverified'
        },
        domainVerified: {
            type: Boolean,
            default: false
        },
        documents: [{
            type: {
                type: String,
                enum: ['GST', 'CIN', 'MSME', 'Other']
            },
            fileUrl: String,
            status: {
                type: String,
                enum: ['Pending', 'Approved', 'Rejected'],
                default: 'Pending'
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            },
            rejectionReason: String
        }]
    },
    whyJoinUs: {
        videos: [{
            url: String,
            description: String
        }],
        blogs: [{
            title: String,
            content: String,
            date: {
                type: Date,
                default: Date.now
            }
        }]
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['Admin', 'Recruiter'],
            default: 'Recruiter'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    companyId: {
        type: String,
        unique: true
    }
  },
  {
    timestamps: true,
  }
);

// Generate Custom Company ID
companySchema.pre('save', async function(next) {
    if (!this.companyId) {
        this.companyId = `COMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    next();
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
