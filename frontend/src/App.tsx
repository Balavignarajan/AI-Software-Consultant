import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { api } from './api/client'

type HealthResponse = {
  success: boolean
  message: string
  timestamp: string
}

type BackendStatus = 'checking' | 'connected' | 'disconnected'

function Home() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking')
  const [message, setMessage] = useState<string | null>(null)
  const [timestamp, setTimestamp] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    api
      .get<HealthResponse>('/api/health')
      .then((response) => {
        if (cancelled) return
        setBackendStatus('connected')
        setMessage(response.data.message)
        setTimestamp(response.data.timestamp)
      })
      .catch(() => {
        if (cancelled) return
        setBackendStatus('disconnected')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="home">
      <h1>AI Software Consultant</h1>

      <section className="status-block">
        <p className="label">Frontend Status:</p>
        <p>🟢 Running</p>
      </section>

      <section className="status-block">
        <p className="label">Backend Status:</p>
        {backendStatus === 'checking' && <p>🟡 Checking...</p>}
        {backendStatus === 'connected' && <p>🟢 Connected</p>}
        {backendStatus === 'disconnected' && <p>🔴 Disconnected</p>}
      </section>

      {backendStatus === 'connected' && (
        <>
          <section className="status-block">
            <p className="label">Message:</p>
            <p>{message}</p>
          </section>

          <section className="status-block">
            <p className="label">Timestamp:</p>
            <p>{timestamp}</p>
          </section>
        </>
      )}

      {backendStatus === 'disconnected' && (
        <section className="status-block">
          <p className="label">Error:</p>
          <p>Unable to connect to backend.</p>
        </section>
      )}
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
