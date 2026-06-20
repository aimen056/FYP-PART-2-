const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  contact: { 
    type: String,
    trim: true
  },
  dob: { 
    type: Date 
  },
  country: { 
    type: String,
    default: 'Pakistan'
  },
  city: { 
    type: String,
    trim: true
  },
  diseases: { 
    type: [String],
    default: []
  },
  wantsAlerts: { 
    type: Boolean,
    default: false
  },
  resetToken: { 
    type: String 
  },
  tokenExpiry: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Remove sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetToken;
  delete user.tokenExpiry;
  return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;