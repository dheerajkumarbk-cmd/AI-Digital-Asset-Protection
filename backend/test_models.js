const fs = require('fs');

function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const s = fs.readFileSync('.env', 'utf8');
    const m = s.match(/^GEMINI_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  } catch (e) {}
  console.error('No GEMINI_API_KEY found (set env or .env in backend)');
  process.exit(1);
}

const key = loadKey();

const models = [
  'models/gemini-3.1-flash-preview',
  'models/gemini-3-flash-preview',
  'models/gemini-3.1-pro-preview',
  'models/gemini-3-pro-preview',
  'models/gemini-pro-latest',
  'models/gemini-flash-latest',
  'models/gemini-2.5-flash',
  'models/gemini-2.5-flash-lite',
  'models/gemini-2.5-flash-lite',
  'models/gemini-2.5-pro',
];

(async function(){
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const body = { contents: [{ parts: [{ text: 'Test connectivity from local test' }] }] };
    console.log('\nTesting', model);
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), timeout: 20000 });
      const status = res.status;
      let text = '';
      try { text = await res.text(); } catch(e) { text = '<no-body>'; }
      if (status === 200) {
        // try parse json
        try {
          const j = JSON.parse(text);
          console.log('SUCCESS', model);
          console.log(JSON.stringify(j, null, 2).slice(0, 2000));
          process.exit(0);
        } catch (e) {
          console.log('200 OK but invalid JSON body');
          console.log(text.slice(0,1000));
          process.exit(0);
        }
      } else {
        console.log('Status', status);
        try { const j = JSON.parse(text); console.log(JSON.stringify(j, null, 2).slice(0,1000)); } catch(e){ console.log(text.slice(0,1000)); }
        // continue to next model
      }
    } catch (err) {
      console.log('Request failed:', err.message || err);
    }
  }
  console.error('No model returned a 200 OK response');
  process.exit(2);
})();
