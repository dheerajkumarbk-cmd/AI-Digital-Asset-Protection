const { initFirestore } = require('./utils/firebase');
const { analyzeWithGemini } = require('./utils/gemini');
const exifParser = require('exif-parser');

const db = initFirestore();

function computeRiskFromActivity(activity) {
  // activity: {type, count, ip, location}
  let score = 'LOW';
  if (activity.count && activity.count > 20) score = 'MEDIUM';
  if (activity.newLocation) score = 'HIGH';
  return {
    label: score,
    details: {
      highDownloadRule: activity.count > 20,
      newLocationRule: !!activity.newLocation,
    },
  };
}

async function simulateAttackHandler(req, res) {
  const body = req.body || {};
  // types: downloads, new_location
  const type = body.type || 'downloads';
  const base = { time: Date.now(), source: body.source || 'simulator' };

  let activity = { ...base };
  if (type === 'downloads') {
    const count = body.count || 30;
    activity.type = 'multiple_downloads';
    activity.count = count;
    activity.risk = computeRiskFromActivity({ count });
  } else if (type === 'new_location') {
    activity.type = 'login_new_location';
    activity.newLocation = true;
    activity.ip = body.ip || '198.51.100.7';
    activity.location = body.location || 'Unknown';
    activity.risk = computeRiskFromActivity({ newLocation: true });
  }

  try {
    if (db) await db.collection('logs').add(activity);
  } catch (e) {
    console.warn('Firestore write failed:', e.message);
  }

  // Ask Gemini for human-friendly explanation
  const ai = await analyzeWithGemini(`Activity: ${JSON.stringify(activity)}\nRisk: ${activity.risk.label}`);
  return res.json({ activity, ai });
}

async function analyzeTextHandler(req, res) {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });

  // Simple mock rules
  const offensive = /\b(shit|damn|kill)\b/i.test(text);
  const leak = /password|secret|api[_-]?key|private/i.test(text);
  const textRisk = offensive || leak ? 'MEDIUM' : 'LOW';

  const ai = await analyzeWithGemini(`Analyze text for offensive tone and strategic leaks: ${text}`);

  const rewrite = (ai.rewrites && ai.rewrites[0]) || (offensive ? text.replace(/(shit|damn|kill)/gi, '***') : text);

  const result = {
    text,
    textRisk,
    offensive,
    leak,
    safer: rewrite,
    ai,
  };

  try {
    if (db) await db.collection('text_analyses').add({ ...result, time: Date.now() });
  } catch (e) {
    console.warn('Firestore write failed:', e.message);
  }

  res.json(result);
}

async function analyzeImageHandler(req, res) {
  const { dataUrl, filename } = req.body || {};
  if (!dataUrl) return res.status(400).json({ error: 'dataUrl required (base64 image)' });

  // dataUrl: data:image/jpeg;base64,...
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return res.status(400).json({ error: 'invalid dataUrl' });
  const mime = matches[1];
  const b64 = matches[2];
  const buffer = Buffer.from(b64, 'base64');

  // Extract EXIF (mock-friendly)
  let metadata = {};
  try {
    const parser = exifParser.create(buffer);
    metadata = parser.parse().tags || {};
  } catch (e) {
    metadata = {};
  }

  // Basic keyword detection in filename (mock)
  const risks = [];
  if (filename && /secret|private|confidential/i.test(filename)) risks.push('Contains sensitive filename keywords');

  // Sanitize: for demo we don't rewrite image bytes, but we present "sanitized" metadata as empty
  const sanitizedMetadata = {};

  const analysis = {
    filename: filename || 'upload',
    mime,
    detected: risks,
    beforeMetadata: metadata,
    afterMetadata: sanitizedMetadata,
  };

  try {
    if (db) await db.collection('image_analyses').add({ ...analysis, time: Date.now() });
  } catch (e) {
    console.warn('Firestore write failed:', e.message);
  }

  res.json(analysis);
}

async function dashboardHandler(req, res) {
  // Pull recent logs and compute simple summary
  const out = { recent: [], counts: { LOW: 0, MEDIUM: 0, HIGH: 0 }, alerts: [] };
  try {
    if (!db) return res.json(out);
    const q = await db.collection('logs').orderBy('time', 'desc').limit(25).get();
    q.forEach(doc => {
      const d = doc.data();
      out.recent.push(d);
      const l = (d.risk && d.risk.label) || 'LOW';
      if (!out.counts[l]) out.counts[l] = 0;
      out.counts[l]++;
      if (l === 'HIGH') out.alerts.push({ message: 'High risk event', item: d });
    });
  } catch (e) {
    console.warn('Dashboard read failed:', e.message);
  }

  res.json(out);
}

module.exports = {
  simulateAttackHandler,
  analyzeTextHandler,
  analyzeImageHandler,
  dashboardHandler,
  computeRiskFromActivity,
};
