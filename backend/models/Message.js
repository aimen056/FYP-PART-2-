const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  to: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  acknowledged: { 
    type: Boolean, 
    default: false 
  },
  acknowledgedAt: { 
    type: Date 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);