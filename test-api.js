const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing the plans API...');
    const response = await axios.post('http://localhost:5000/api/plans', {
      goal: 'Learn to cook Italian pasta'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Success! AI Service is working');
    console.log('Generated plan:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
  }
}

testAPI();