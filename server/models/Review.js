const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    employeeEmail: {
        type: String,
        required: function() { return this.reviewerType === 'Employee'; }
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the Employer user
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    reviewerType: {
        type: String,
        enum: ['Public', 'Employee'],
        default: 'Public'
    },
    role: {
        type: String, // e.g. "Software Engineer"
        required: function() { return this.reviewerType === 'Employee'; }
    },
    department: {
        type: String, // e.g. "IT"
        required: function() { return this.reviewerType === 'Employee'; }
    },
    isVerified: {
        type: Boolean,
        default: function() { return this.reviewerType === 'Public'; } // Public reviews are verified by login, employees need domain check
    },
    verificationToken: {
        type: String
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    isAnonymous: {
        type: Boolean,
        default: function() { return this.reviewerType === 'Employee'; }
    }
}, {
    timestamps: true
});

// Index for performance
reviewSchema.index({ company: 1, isVerified: 1, isHidden: 1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
