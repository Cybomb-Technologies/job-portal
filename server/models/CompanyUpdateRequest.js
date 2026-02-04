const mongoose = require('mongoose');

const companyUpdateRequestSchema = mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedChanges: {
      type: Object, // JSON object storing the fields to be updated
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminComments: {
      type: String,
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: {
        type: Date
    }
  },
  {
    timestamps: true,
  }
);

const CompanyUpdateRequest = mongoose.model('CompanyUpdateRequest', companyUpdateRequestSchema);

module.exports = CompanyUpdateRequest;
