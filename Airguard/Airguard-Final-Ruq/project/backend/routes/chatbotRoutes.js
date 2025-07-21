const express = require("express");
const { chatWithAI } = require("../controllers/chatbotController");
const axios = require('axios'); // For the test route

const router = express.Router();

router.post("/", chatWithAI);

// Add a temporary test route for debugging
router.get("/test-api", async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      message: "Test failed: OPENROUTER_API_KEY is not defined in the environment.",
      found: false,
    });
  }

  if (apiKey.length < 10) {
    return res.status(500).json({
        message: "Test failed: OPENROUTER_API_KEY seems too short to be a real key.",
        found: true,
        keyIsShort: true,
      });
  }

  try {
    // A simple, cheap API call to test the key
    await axios.get('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    res.status(200).json({
        message: "SUCCESS: The API key is working correctly!",
        found: true,
        keyIsValid: true,
    });
  } catch (error) {
    res.status(500).json({
        message: `Test failed: The API key was found but is invalid or rejected by OpenRouter. Error: ${error.message}`,
        found: true,
        keyIsValid: false,
        error: {
            status: error.response?.status,
            data: error.response?.data,
        }
    });
  }
});

module.exports = router;