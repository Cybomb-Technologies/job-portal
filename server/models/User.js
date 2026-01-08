const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
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
        degree: String,
        fieldOfStudy: String,
        startYear: String,
        endYear: String
    }],
    certifications: [String],
    resume: {
        type: String, // Path to file
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    chatUsage: {
        date: { type: Date, default: null },
        count: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
  }
);

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
