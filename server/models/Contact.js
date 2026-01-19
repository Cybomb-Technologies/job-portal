const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    message: {
        type: String,
        required: [true, 'Please add a message']
    },
    status: {
        type: String,
        enum: ['New', 'Read', 'Replied'],
        default: 'New'
    },
    reply: {
        type: String // To store the reply content if any
    },
    repliedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for Admin functionality
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
