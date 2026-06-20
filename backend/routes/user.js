const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get all users (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password -resetToken -tokenExpiry');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

module.exports = router;
