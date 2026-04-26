import React, { useState } from 'react'

function toDataUrl(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => res(e.target.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  })
}

export default function ImageScanner(){
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)

  const upload = async () => {
    if (!file) return alert('choose file')
    const dataUrl = await toDataUrl(file)
    const res = await fetch('/api/analyze-image', { method:'POST', headers: { 'content-type':'application/json'}, body: JSON.stringify({ dataUrl, filename: file.name }) })
    const j = await res.json();
    setResult(j)
  }

  return (
    <div>
      <h2>Image Upload Scanner</h2>
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
      <div style={{marginTop:8}}>
        <button onClick={upload}>Scan Image</button>
      </div>
      {result && (
        <div className="result">
          <h4>Detected Risks</h4>
          <ul>{result.detected.map((d,i)=><li key={i}>{d}</li>)}</ul>
          <h4>Metadata (before)</h4>
          <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(result.beforeMetadata, null, 2)}</pre>
          <h4>Metadata (after)</h4>
          <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(result.afterMetadata, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
