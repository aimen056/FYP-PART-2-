const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

// Send message (admin only)


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { to, subject, content } = req.body;
    
    const message = new Message({
      from: req.user.id, // Now using your existing auth middleware
      to,
      subject,
      content
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ to: req.params.userId })
      .populate('from', 'name email')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge message
router.patch('/:id/acknowledge', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { 
        acknowledged: true,
        acknowledgedAt: Date.now(),
        isRead: true
      },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread message count
router.get('/unread-count/:userId', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({ 
      to: req.params.userId,
      isRead: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;