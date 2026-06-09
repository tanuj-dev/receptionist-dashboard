import { useState } from 'react'
import { adminLogin, clientLogin } from '../api'
import logo from '../assets/logo.png'

export default function Login({ onLogin }) {
  const [mode,     setMode]     = useState('choice')
  const [bizId,    setBizId]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

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

  const Logo = () => (
    <div className="login-logo">
      <img src={logo} alt="RingReply" />
    </div>
  )

  // ── Choice screen ──
  if (mode === 'choice') return (
    <div className="login-page">
      <div className="login-card">
        <Logo />
        <h1>RingReply</h1>
        <p>AI Receptionist Platform — Sign in to continue</p>

        <div className="choice-grid">
          <button className="choice-btn" onClick={() => { setMode('admin'); setError('') }}>
            <div className="choice-btn-icon" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white" opacity="0.9"/>
                <path d="M9 12l2 2 4-4" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="choice-btn-text">
              <h3>Admin</h3>
              <p>Manage all businesses & settings</p>
            </div>
          </button>
          <button className="choice-btn" onClick={() => { setMode('client'); setError('') }}>
            <div className="choice-btn-icon" style={{ background: 'linear-gradient(135deg, #0d9488, #06b6d4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" fill="white" opacity="0.9"/>
                <path d="M9 22V12h6v10" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="choice-btn-text">
              <h3>Business Owner</h3>
              <p>View bookings & manage schedule</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  // ── Admin login ──
  if (mode === 'admin') return (
    <div className="login-page">
      <div className="login-card">
        <Logo />
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
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#94a3b8', cursor:'pointer' }}
           onClick={() => { setMode('choice'); setPassword(''); setError('') }}>
          ← Back
        </p>
      </div>
    </div>
  )

  // ── Client login ──
  return (
    <div className="login-page">
      <div className="login-card">
        <Logo />
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
            style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#94a3b8', cursor:'pointer' }}
           onClick={() => { setMode('choice'); setPassword(''); setBizId(''); setError('') }}>
          ← Back
        </p>
      </div>
    </div>
  )
}
