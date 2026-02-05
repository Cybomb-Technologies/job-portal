const mongoose = require('mongoose');

const aiChatSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ['user', 'ai'],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// TTL Index: Delete documents 7 days (604800 seconds) after they are created
aiChatSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

const AIChat = mongoose.model('AIChat', aiChatSchema);

module.exports = AIChat;
