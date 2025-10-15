require('dotenv').config();
const { generatePlan } = require('./src/services/aiService');

(async () => {
  try {
    console.log('Calling aiService.generatePlan("Learn to play guitar")...');
    const res = await generatePlan('Learn to play guitar');
    console.log('Result:');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error calling aiService:', err);
  }
})();