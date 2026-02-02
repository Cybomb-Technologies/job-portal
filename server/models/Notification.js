const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Optional: Could be a company user or job seeker
    },
    type: {
        type: String,
        enum: ['JOB_ALERT', 'NEW_APPLICATION', 'FOLLOW', 'NEW_ISSUE', 'ISSUE_UPDATE', 'CONTACT_FORM', 'SYSTEM', 'NEW_MESSAGE'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        // Can reference Job, Application, or User depending on type
        // We won't set a hard 'ref' here to keep it flexible, or we can deal with population manually
    },
    relatedModel: {
        type: String,
        enum: ['Job', 'Application', 'User', 'Issue', 'Contact', 'Message'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
