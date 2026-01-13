const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companyName: {
        type: String,
    },
    website: { type: String },
    companyEmail: { type: String }, // Public contact email
    companyLocation: { type: String },
    companyCategory: { type: String }, // e.g. IT Services, Healthcare
    companyType: { type: String }, // e.g. Private, Public, Startup
    foundedYear: { type: String }, 
    employeeCount: { type: String }, // e.g. 10-50, 100+
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ['Job Seeker', 'Employer'],
      required: true,
    },
    googleId: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    title: {
        type: String,
    },
    skills: {
        type: [String],
        default: []
    },
    about: {
        type: String,
    },
    currentLocation: {
        type: String,
    },
    preferredLocations: {
        type: [String],
        default: []
    },
    experience: [{
        title: String,
        company: String,
        startMonth: String,
        startYear: String,
        endMonth: String,
        endYear: String,
        description: String
    }],
    education: [{
        institute: String,
        university: String,
        degree: String,
        fieldOfStudy: String,
        startYear: String,
        endYear: String
    }],
    certifications: [String],
    resume: {
        type: String, // Path to file (Active Resume)
    },
    resumes: [{
        name: String,
        file: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    chatUsage: {
        date: { type: Date, default: null },
        count: { type: Number, default: 0 }
    },
    userId: {
        type: String,
        unique: true
    },
    employerVerification: {
        level: {
            type: Number,
            default: 0, // 0: Unverified, 1: Identity Verified, 2: Legal Verified
        },
        status: {
            type: String,
            enum: ['Unverified', 'Pending', 'Verified', 'Rejected'],
            default: 'Unverified'
        },
        emailVerified: {
            type: Boolean,
            default: false
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
        }],
        verificationScore: {
            type: Number,
            default: 0
        },
        verificationOTP: String,
        verificationOTPExpire: Date
    }
  },
  {
    timestamps: true,
  }
);

// Generate Custom User ID
userSchema.pre('save', async function(next) {
    if (!this.userId) {
        this.userId = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Generate and hash password token
const crypto = require('crypto');
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
