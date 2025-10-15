const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing /api/generate-plan endpoint...');
    
    const response = await axios.post('http://127.0.0.1:5002/api/generate-plan', {
      goal: 'Launch a one-page marketing site in 3 days'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success! Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error: No response received');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAPI();