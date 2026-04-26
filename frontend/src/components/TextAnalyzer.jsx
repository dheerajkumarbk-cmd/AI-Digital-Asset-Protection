import React, { useState } from 'react'

export default function TextAnalyzer() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)

  const analyze = async () => {
    const res = await fetch('/api/analyze-text', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) })
    const j = await res.json();
    setResult(j)
  }

  return (
    <div>
      <h2>Text Analyzer</h2>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={6} style={{width:'100%'}} />
      <div style={{marginTop:8}}>
        <button onClick={analyze}>Analyze</button>
      </div>
      {result && (
        <div className="result">
          <h4>Risk: <span className={`pill ${result.textRisk.toLowerCase()}`}>{result.textRisk}</span></h4>
          <p><strong>Offensive:</strong> {String(result.offensive)}</p>
          <p><strong>Strategic leak:</strong> {String(result.leak)}</p>
          <h5>AI Explanation</h5>
          <pre style={{whiteSpace:'pre-wrap'}}>{result.ai && result.ai.explanation}</pre>
          <h5>Safer Rewrite</h5>
          <div className="card">{result.safer}</div>
        </div>
      )}
    </div>
  )
}
