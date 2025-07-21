const express = require("express");
const { chatWithAI } = require("../controllers/chatbotController");
const axios = require('axios'); // For the test route

const router = express.Router();

router.post("/", chatWithAI);

// Final Test Route: Perform the exact POST request that is failing.
router.get("/test-api", async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      message: "Test failed: OPENROUTER_API_KEY is not defined.",
    });
  }

  const payload = {
    model: 'deepseek/deepseek-r1-distill-qwen-7b',
    messages: [{ role: 'user', content: 'What is the capital of France?' }],
  };

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.status(200).json({
        message: "SUCCESS: The POST request from the test route worked!",
        data: response.data,
    });
  } catch (error) {
    res.status(500).json({
        message: `FAIL: The POST request from the test route failed with the same error. This points to an API key permission issue.`,
        error: {
            status: error.response?.status,
            data: error.response?.data,
        }
    });
  }
});

module.exports = router;