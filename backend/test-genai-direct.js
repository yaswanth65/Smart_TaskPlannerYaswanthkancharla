require('dotenv').config();
const axios = require('axios');

(async () => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || 'MISSING';
  const model = process.env.GOOGLE_MODEL || 'gemini-2.0-flash-001';
  // Normalize model name (remove leading 'models/' if present)
  const modelNameOnly = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelNameOnly}:generateContent?key=${encodeURIComponent(apiKey)}`;

    console.log('URL:', url);
    console.log('API Key (first 8 chars):', apiKey && apiKey !== 'MISSING' ? apiKey.substring(0,8) : apiKey);
    const payload = {
      contents: [{ parts: [{ text: 'Test prompt for debugging: Say hello' }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 100 }
    };

    const res = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
    console.log('Status:', res.status);
    console.log('Response data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Request failed with status', err.response.status);
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
})();