require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const handlers = require('./handlers');
// DEBUG: show loaded Gemini key (removed after verification)
console.log('Loaded Key:', process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.slice(0,8) + '...');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

app.get('/dashboard', handlers.dashboardHandler);
app.post('/simulate-attack', handlers.simulateAttackHandler);
app.post('/analyze-text', handlers.analyzeTextHandler);
app.post('/analyze-image', handlers.analyzeImageHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend dev server running on http://localhost:${port}`));

module.exports = app;
