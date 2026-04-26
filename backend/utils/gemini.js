const axios = require('axios');

async function analyzeWithGemini(prompt, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      explanation: `Mocked Gemini explanation for: ${prompt.slice(0, 200)}`,
      recommendations: ['Review access controls', 'Sanitize metadata before publishing'],
    };
  }

  // Use the recommended Gemini endpoint and model (gemini-pro)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        parts: [{ text: String(prompt) }]
      }
    ]
  };

  try {
    const res = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });
    const data = res.data || {};

    // Try to extract useful text from known response shapes
    let explanation = '';
    try {
      if (data.candidates && data.candidates[0]) {
        const c = data.candidates[0];
        if (c.content && Array.isArray(c.content) && c.content[0] && c.content[0].text) {
          explanation = c.content.map(x => x.text || '').join('\n');
        } else if (c.output) {
          explanation = c.output;
        } else {
          explanation = JSON.stringify(c).slice(0, 2000);
        }
      } else if (data.results && data.results[0] && data.results[0].content) {
        explanation = JSON.stringify(data.results[0].content).slice(0,2000);
      } else {
        explanation = JSON.stringify(data).slice(0,2000);
      }
    } catch (e) {
      explanation = JSON.stringify(data).slice(0,2000);
    }

    return { explanation, raw: data };
  } catch (err) {
    // Log full error response when available
    if (err.response) {
      console.error('Gemini API error', err.response.status, JSON.stringify(err.response.data));
      return { explanation: `Gemini API error: ${err.response.status} - ${err.response.data && err.response.data.error && err.response.data.error.message ? err.response.data.error.message : JSON.stringify(err.response.data)}`, raw: err.response.data };
    }
    console.error('Gemini request failed', err.message || err);
    return { explanation: `Gemini request failed: ${err.message || err}`, raw: null };
  }
}

module.exports = { analyzeWithGemini };
