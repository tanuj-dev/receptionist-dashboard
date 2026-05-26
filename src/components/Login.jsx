import { useState } from 'react'
import { adminLogin, clientLogin, fetchBusinesses } from '../api'

export default function Login({ onLogin }) {
  const [mode,       setMode]       = useState('choice')  // choice | admin | client
  const [businesses, setBusinesses] = useState([])
  const [bizId,      setBizId]      = useState('')
  const [password,   setPassword]   = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)

  async function goAdmin() {
    setMode('admin'); setError('')
  }

  async function goClient() {
    setLoading(true)
    try {
      // Fetch business list for the dropdown
      // We call a public endpoint — businesses list is not sensitive (just names)
      const res = await fetch('/admin/api/businesses', {
        headers: { 'Authorization': 'Bearer invalid' }
      })
      // We expect 401 but we need names — let's use a public endpoint
      // Actually let's just hardcode or use client login directly
    } catch (_) {}
    setLoading(false)
    setMode('client'); setError('')
  }

  async function handleAdminSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const data = await adminLogin(password)
      onLogin(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleClientSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const data = await clientLogin(bizId, password)
      onLogin(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── Choice screen ────────────────────────────────────────────────────
  if (mode === 'choice') return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🤖</div>
        <h1>AI Receptionist</h1>
        <p>Who are you signing in as?</p>

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button
            className="btn-login"
            style={{ background: '#11418A' }}
            onClick={goAdmin}
          >
            🔐 Admin
          </button>
          <button
            className="btn-login"
            style={{ background: '#0d9488' }}
            onClick={() => { setMode('client'); setError('') }}
          >
            🏢 Business Owner
          </button>
        </div>
      </div>
    </div>
  )

  // ── Admin login ───────────────────────────────────────────────────────
  if (mode === 'admin') return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🔐</div>
        <h1>Admin Login</h1>
        <p>Full access to all businesses</p>
        <form onSubmit={handleAdminSubmit}>
          <div className="form-group">
            <label>Admin Password</label>
            <input
              type="password" placeholder="Enter admin password"
              value={password} onChange={e => setPassword(e.target.value)}
              autoFocus required
            />
          </div>
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#94a3b8', cursor:'pointer' }}
           onClick={() => { setMode('choice'); setPassword(''); setError('') }}>
          ← Back
        </p>
      </div>
    </div>
  )

  // ── Client login ──────────────────────────────────────────────────────
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🏢</div>
        <h1>Business Login</h1>
        <p>Access your booking dashboard</p>
        <form onSubmit={handleClientSubmit}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Business ID</label>
            <input
              type="text" placeholder="e.g. tanuj_dental"
              value={bizId} onChange={e => setBizId(e.target.value)}
              autoFocus required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" placeholder="Your dashboard password"
              value={password} onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="btn-login"
            style={{ background: '#0d9488' }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#94a3b8', cursor:'pointer' }}
           onClick={() => { setMode('choice'); setPassword(''); setBizId(''); setError('') }}>
          ← Back
        </p>
      </div>
    </div>
  )
}
