const axios = require('axios');

exports.chatWithAI = async (req, res) => {
  console.log('Received request:', req.body);
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error('OpenRouter API key not configured or not available in the environment.');
    }

    const { message } = req.body;
    if (!message) {
      throw new Error('No message provided');
    }

    const prompt = `
      You are AirGuard, an expert air quality assistant. Your role is to answer questions about air quality, explain concepts like AQI (Air Quality Index), and provide health precautions for various air quality conditions. Use clear, concise, and accurate responses. If the user asks about specific locations or real-time data, inform them that you can provide general advice only. For example:
      - AQI (Air Quality Index) measures air pollution levels, ranging from 0 to 500. Lower values (0-50) indicate good air quality, while higher values (151-200 and above) indicate unhealthy conditions.
      - Precautions for high AQI include staying indoors, using air purifiers, and wearing N95 masks outdoors.
      User Query: ${message}
    `;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1-distill-qwen-7b',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`, // Use the key read inside the function
          'X-Title': 'AirGuard',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
    );

    const botResponse = response.data.choices[0]?.message.content || 'Sorry, I could not process your request.';
    res.json({ message: botResponse });
  } catch (error) {
    console.error('Chat error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    const fallback = `
      ⚠️ Sorry, I'm having trouble responding. Here are general air quality tips:
      - AQI 0-50: Good, no precautions needed.
      - AQI 51-100: Moderate, sensitive groups should reduce outdoor activity.
      - AQI 101+: Unhealthy, stay indoors, use air purifiers, wear N95 masks.
      Please try again or ask about AQI or precautions.
    `;
    res.status(500).json({ message: fallback });
  }
};