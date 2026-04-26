import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import ImageScanner from './components/ImageScanner'
import TextAnalyzer from './components/TextAnalyzer'

export default function App() {
  const [view, setView] = useState('dashboard')
  return (
    <div className="app">
      <header className="top">
        <h1>ADAP — Asset Protection</h1>
        <nav>
          <button onClick={() => setView('dashboard')}>Dashboard</button>
          <button onClick={() => setView('image')}>Upload Image</button>
          <button onClick={() => setView('text')}>Text Analyzer</button>
        </nav>
      </header>
      <main>
        {view === 'dashboard' && <Dashboard />}
        {view === 'image' && <ImageScanner />}
        {view === 'text' && <TextAnalyzer />}
      </main>
    </div>
  )
}
