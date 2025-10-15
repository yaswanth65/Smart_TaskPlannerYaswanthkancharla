/**
 * aiService: Google Generative Language (Gemini) integration.
 * Exposes generatePlan(goal) => { tasks: [...] }
 *
 * This implementation asks the model to return strict JSON (array of tasks) first. It will
 * attempt to parse JSON; if parsing fails it falls back to a best-effort text parser, and
 * finally to an offline mock plan to allow development without the API.
 */
const axios = require('axios');

// Google Generative Language REST endpoint (public API key usage)
const GOOGLE_GENAI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models';

/**
 * Try to parse JSON from model output. Return array of tasks or null.
 */
function tryParseJson(text) {
  try {
    // model may return code fences or plain JSON
    const cleaned = text.replace(/```(?:json)?\s*|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    // if object with tasks field
    if (parsed && Array.isArray(parsed.tasks)) return parsed.tasks;
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Best-effort text parser fallback (keeps previous simple heuristics).
 */
function parseTextToTasks(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const tasks = [];
  for (const line of lines) {
    const m = line.match(/(?:\d+\.|-)\s*(.*?)\s*(?:[-:|—]\s*(.*))?$/);
    if (m) {
      const namePart = m[1] || line;
      const rest = m[2] || '';
      const durationMatch = rest.match(/(\d+\s*(?:days?|weeks?|hrs?|hours?))/i);
      const dependsMatch = rest.match(/depends?\s*(?:on)?:?\s*([^,;\)\n]+)/i);
      tasks.push({
        name: namePart.trim(),
        dependsOn: dependsMatch ? dependsMatch[1].split(/,|and/).map(s => s.trim()).filter(Boolean) : [],
        duration: durationMatch ? durationMatch[1].trim() : '',
        deadline: ''
      });
    }
  }
  return tasks;
}

// No OpenRouter logic — Gemini-only path implemented below.

/**
 * Call Google Generative Language REST API with timeout and retry logic.
 */
async function callGoogleGenAI(goal, apiKey, modelName, maxRetries = 2) {
  if (!apiKey) throw new Error('No Google API key provided');
  const model = modelName || process.env.GOOGLE_MODEL || 'gemini-2.0-flash-001';

  // Normalize model name so we don't end up with 'models/models/...' in the URL.
  // GOOGLE_GENAI_ENDPOINT already includes the '/models' segment.
  const modelNameOnly = model.replace(/^models\//, '');
  const url = `${GOOGLE_GENAI_ENDPOINT}/${modelNameOnly}:generateContent?key=${encodeURIComponent(apiKey)}`;

  // Build prompt to ask for strict JSON array of tasks
  const prompt = `Break down this goal into actionable tasks with suggested durations, dependencies and deadlines.\n\nGoal: ${goal}\n\nReturn ONLY valid JSON. The top level should be an array of tasks. Each task should be an object with keys: name (string), dependsOn (array of strings), duration (string), deadline (string). Example output:\n[ { "name": "Market research", "dependsOn": [], "duration": "2 days", "deadline": "Day 2" }, ... ]`;

  const payload = {
    "contents": [{
      "parts": [{
        "text": prompt
      }]
    }],
    "generationConfig": {
      "temperature": 0.2,
      "maxOutputTokens": 1024
    }
  };

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000, // 15 second timeout
      });

      // Google Generative Language API response format
      if (res.data && res.data.candidates && res.data.candidates[0] && res.data.candidates[0].content) {
        const content = res.data.candidates[0].content;
        if (content.parts && content.parts[0] && content.parts[0].text) {
          return content.parts[0].text;
        }
      }
      // Fallback extraction
      if (res.data && res.data.text) return res.data.text;
      return JSON.stringify(res.data);
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

async function generatePlan(goal, logger) {
  const startTime = Date.now();
  const googleKey = process.env.GOOGLE_API_KEY || process.env.GENERATIVE_API_KEY || process.env.GEMINI_API_KEY;
  const model = process.env.GOOGLE_MODEL || 'gemini-2.0-flash-001';
  
  try {
    if (!googleKey) throw new Error('No Google Generative Language API key configured (GOOGLE_API_KEY)');
    
    logger?.info({ goal, model }, 'Starting AI plan generation');
    const text = await callGoogleGenAI(goal, googleKey, model);
    const latencyMs = Date.now() - startTime;

    // Try strict JSON parse first
    const jsonParsed = tryParseJson(text || '');
    if (jsonParsed && jsonParsed.length) {
      logger?.info({ latencyMs, parseStatus: 'json' }, 'AI plan generated successfully');
      return { 
        tasks: jsonParsed, 
        raw: text, 
        parseStatus: 'json',
        aiModel: model,
        latencyMs 
      };
    }

    // Fallback to text parsing
    const tasks = parseTextToTasks(text || '');
    if (tasks && tasks.length) {
      logger?.info({ latencyMs, parseStatus: 'text' }, 'AI plan parsed as text');
      return { 
        tasks, 
        raw: text, 
        parseStatus: 'text',
        aiModel: model,
        latencyMs 
      };
    }

    // final fallback
    throw new Error('Failed to parse model output');
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    logger?.warn({ error: err.message, latencyMs }, 'AI call failed, returning mock plan');
    
    const mock = [
      { name: 'Research and define target market', dependsOn: [], duration: '2 days', deadline: '' },
      { name: 'Design MVP', dependsOn: ['Research and define target market'], duration: '4 days', deadline: '' },
      { name: 'Build MVP', dependsOn: ['Design MVP'], duration: '5 days', deadline: '' },
      { name: 'Test & iterate', dependsOn: ['Build MVP'], duration: '2 days', deadline: '' }
    ];
    return { 
      tasks: mock, 
      raw: `mock (error: ${err.message})`, 
      parseStatus: 'mock',
      aiModel: model,
      latencyMs 
    };
  }
}

module.exports = { generatePlan };
