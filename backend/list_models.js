const fs = require('fs');

function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const s = fs.readFileSync('.env', 'utf8');
    const m = s.match(/^GEMINI_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  } catch (e) {}
  console.error('No GEMINI_API_KEY found (set env or backend/.env)');
  process.exit(1);
}

(async function(){
  const key = loadKey();
  const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key);
  try {
    const res = await fetch(url);
    const j = await res.json();
    if (!j.models) {
      console.error('Unexpected response:', JSON.stringify(j,null,2));
      process.exit(1);
    }
    j.models.forEach(m => {
      const methods = m.supportedGenerationMethods || m.supported_generation_methods || m.supportedGenerationMethods || m.supported_generation_methods;
      // normalize property names
      const supported = m.supportedGenerationMethods || m.supported_generation_methods || m.supported_generation_methods || m.supportedGenerationMethods;
      const methodsList = supported || m.supported_generation_methods || m.supportedGenerationMethods || m.supported_generation_methods || [];
      if (Array.isArray(methodsList) && methodsList.includes('generateContent')) {
        console.log(m.name);
      }
    });
  } catch (e) {
    console.error('Request failed:', e.message || e);
    process.exit(1);
  }
})();
