const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Customer Support Conversation'
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
      },
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      read: {
        type: Boolean,
        default: false
      }
    }
  ],
  status: {
    type: String,
    enum: ['active', 'resolved', 'pending'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt and lastMessage fields when new messages are added
ConversationSchema.pre('save', function(next) {
  const now = Date.now();
  this.updatedAt = now;
  
  // If messages were added or modified, update lastMessage timestamp
  if (this.isModified('messages')) {
    this.lastMessage = now;
  }
  
  next();
});

module.exports = mongoose.model('Conversation', ConversationSchema); 