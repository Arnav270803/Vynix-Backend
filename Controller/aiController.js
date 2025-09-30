import axios from 'axios';

// Send a prompt to Grok 4 via OpenRouter
const sendPrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate prompt
    if (!prompt) {
      return res.json({ success: false, message: 'Prompt is required' });
    }

    // Make API call to OpenRouter
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'x-ai/grok-4-fast:free',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.YOUR_SITE_URL,
          'X-Title': process.env.YOUR_SITE_NAME,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract Grok's response
    const grokResponse = response.data.choices[0].message.content;

    // Send response in the same format as your other controllers
    res.json({ success: true, response: grokResponse });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get a sample response (for testing with GET request)
const testPrompt = async (req, res) => {
  try {
    // Use a hardcoded prompt for simplicity
    const prompt = 'What is the capital of France?';

    // Make API call to OpenRouter
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'x-ai/grok-4-fast:free',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.YOUR_SITE_URL,
          'X-Title': process.env.YOUR_SITE_NAME,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract Grok's response
    const grokResponse = response.data.choices[0].message.content;

    // Send response
    res.json({ success: true, response: grokResponse });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { sendPrompt, testPrompt };