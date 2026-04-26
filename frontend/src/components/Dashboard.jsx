import React, { useEffect, useState } from 'react'

export default function Dashboard() {
  const [data, setData] = useState({ recent: [], counts: { LOW: 0, MEDIUM: 0, HIGH: 0 }, alerts: [] })

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(() => {} )
  }, [])

  const simulate = async (type) => {
    const body = { type };
    const res = await fetch('/api/simulate-attack', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)})
    const j = await res.json();
    alert('Simulated: ' + JSON.stringify(j.activity.risk))
    setData(d => ({ ...d, recent: [j.activity, ...d.recent].slice(0,25) }))
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="summary">
        <div className="card low">LOW: {data.counts.LOW}</div>
        <div className="card med">MEDIUM: {data.counts.MEDIUM}</div>
        <div className="card high">HIGH: {data.counts.HIGH}</div>
      </div>

      <div style={{marginTop:12}}>
        <button onClick={() => simulate('downloads')}>Simulate Download Spike</button>
        <button onClick={() => simulate('new_location')}>Simulate New Location</button>
      </div>

      <h3>Recent Activities</h3>
      <ul className="log-list">
        {data.recent.map((r, i) => (
          <li key={i} className={`log ${r.risk && r.risk.label ? r.risk.label.toLowerCase() : ''}`}>
            <div><strong>{r.type}</strong> — Risk: <span className={`pill ${r.risk && r.risk.label ? r.risk.label.toLowerCase() : 'low'}`}>{r.risk && r.risk.label}</span></div>
            <div className="meta">{r.time ? new Date(r.time).toLocaleString() : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
