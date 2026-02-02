const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    performerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    performerName: {
        type: String,
        required: true
    },
    performerEmail: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN', 
            'JOB_CREATE', 
            'JOB_MODIFY', 
            'JOB_DELETE', 
            'JOB_DEACTIVATE', 
            'WHY_JOIN_US_UPDATE', 
            'REVIEW_HIDE', 
            'APPLICANT_STATUS_CHANGE'
        ]
    },
    details: {
        type: String,
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    targetModel: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

activityLogSchema.index({ companyId: 1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
