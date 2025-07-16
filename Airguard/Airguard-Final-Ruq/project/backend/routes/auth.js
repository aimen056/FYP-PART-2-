require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // For email verification API
const User = require('../models/User'); // Import your User model

const router = express.Router();
router.use(express.json());

// Helper function to validate Gmail format
const isValidGmail = (email) => {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(email);
};

// Helper function to verify email existence using a third-party service
const verifyEmailExistence = async (email) => {
  try {
    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/`, {
      params: {
        api_key: process.env.EMAIL_VERIFICATION_API_KEY,
        email: email,
      },
    });

    console.log("Email verification response:", response.data);
    return response.data.deliverability === 'DELIVERABLE'; // Check deliverability instead of status
  } catch (error) {
    console.error('Email verification error:', error.response?.data || error.message);
    return false; // Assume invalid on error
  }
};

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log("Received data:", req.body);
    const { name, email, password, contact, dob, country, city, diseases, wantsAlerts } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check Gmail format
    if (!isValidGmail(email)) {
      console.log("Invalid Gmail format");
      return res.status(400).json({ error: 'Please provide a valid Gmail address' });
    }

    // Verify email existence
    const isEmailValid = await verifyEmailExistence(email);
    console.log("Email verification result:", isEmailValid);
    if (!isEmailValid) {
      console.log("Email verification failed");
      return res.status(400).json({ error: 'The provided Gmail address does not exist or is invalid' });
    }

    // Check for existing email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      console.log("Email already in use");
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Check for existing username
    const nameExists = await User.findOne({ name });
    if (nameExists) {
      console.log("Username already taken");
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Proceed with registration
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name, email, password: hashedPassword, contact, dob, country, city, diseases, wantsAlerts,
    });
    await newUser.save();
    console.log("User saved:", newUser);

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save the token and expiry time in the user document
    user.resetToken = hashedToken;
    user.tokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send the reset token to the user's email
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link is valid for 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent!' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password route
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Validate required fields
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Hash the token to match the one stored in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user by the token and check if it's still valid
    const user = await User.findOne({
      resetToken: hashedToken,
      tokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;