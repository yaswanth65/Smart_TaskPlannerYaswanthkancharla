const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://127.0.0.1:5000/api/generate-plan', { goal: 'Learn to play piano' }, { headers: { 'Content-Type': 'application/json' }});
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Request error:', err.message);
    }
  }
})();