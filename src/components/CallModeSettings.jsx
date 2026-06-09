import { useState, useEffect } from 'react'
import { getToken } from '../api'

const API = import.meta.env.VITE_API_URL || ''

async function fetchCallMode() {
  const token = getToken()
  const res = await fetch(`${API}/client/api/call-mode`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

async function saveCallMode(call_mode) {
  const token = getToken()
  const res = await fetch(`${API}/client/api/call-mode`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ call_mode }),
  })
  return res.json()
}

export default function CallModeSettings() {
  const [callMode, setCallMode]       = useState('always')
  const [twilioNumber, setTwilioNumber] = useState('')
  const [dialCode, setDialCode]       = useState('')
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [copied, setCopied]           = useState(false)
  const [saved, setSaved]             = useState(false)

  useEffect(() => {
    fetchCallMode().then(data => {
      setCallMode(data.call_mode || 'always')
      setTwilioNumber(data.twilio_number || '')
      setDialCode(data.dial_code || '')
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await saveCallMode(callMode)
    setSaving(false)
    if (res.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      // Refresh dial code
      fetchCallMode().then(data => setDialCode(data.dial_code || ''))
    }
  }

  function handleCopy() {
    const code = callMode === 'always'
      ? `*21*${twilioNumber}#`
      : `*61*${twilioNumber}#`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="sched-section">Loading call settings…</div>

  return (
    <div className="sched-card" style={{ marginTop: 24 }}>
      <h3 className="sched-title">📞 Call Handling Mode</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
        Choose how calls reach your AI receptionist.
      </p>

      {/* Mode selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>

        {/* Option 1 — Always Forward */}
        <label
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
            border: `2px solid ${callMode === 'always' ? 'var(--accent)' : 'var(--border)'}`,
            background: callMode === 'always' ? 'rgba(99,102,241,0.08)' : 'var(--surface)',
            transition: 'all 0.2s',
          }}
        >
          <input
            type="radio" name="call_mode" value="always"
            checked={callMode === 'always'}
            onChange={() => setCallMode('always')}
            style={{ marginTop: 3 }}
          />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Always Forward (Recommended)</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              All calls go directly to AI. Best for dedicated business numbers.
              You receive notifications for every booking.
            </div>
            {callMode === 'always' && twilioNumber && (
              <div style={{
                marginTop: 10, padding: '8px 12px', borderRadius: 8,
                background: 'var(--surface-2)', fontFamily: 'monospace',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span>Dial: <strong>*21*{twilioNumber}#</strong></span>
                <button
                  type="button" onClick={handleCopy}
                  style={{
                    marginLeft: 'auto', padding: '3px 10px', borderRadius: 6,
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text)', cursor: 'pointer', fontSize: 12,
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </label>

        {/* Option 2 — Ring First */}
        <label
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
            border: `2px solid ${callMode === 'ring_first' ? 'var(--accent)' : 'var(--border)'}`,
            background: callMode === 'ring_first' ? 'rgba(99,102,241,0.08)' : 'var(--surface)',
            transition: 'all 0.2s',
          }}
        >
          <input
            type="radio" name="call_mode" value="ring_first"
            checked={callMode === 'ring_first'}
            onChange={() => setCallMode('ring_first')}
            style={{ marginTop: 3 }}
          />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Ring First, Then AI</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Your phone rings for ~15 seconds. If you do not pick up, AI answers.
              Good if you want to take some calls personally.
            </div>
            {callMode === 'ring_first' && twilioNumber && (
              <div style={{
                marginTop: 10, padding: '8px 12px', borderRadius: 8,
                background: 'var(--surface-2)', fontSize: 13, display: 'flex',
                flexDirection: 'column', gap: 4,
              }}>
                <div style={{ fontFamily: 'monospace' }}>No answer: <strong>*61*{twilioNumber}#</strong></div>
                <div style={{ fontFamily: 'monospace' }}>When busy: <strong>*67*{twilioNumber}#</strong></div>
                <button
                  type="button" onClick={handleCopy}
                  style={{
                    marginTop: 6, padding: '3px 10px', borderRadius: 6, width: 'fit-content',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text)', cursor: 'pointer', fontSize: 12,
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy No-Answer Code'}
                </button>
              </div>
            )}
          </div>
        </label>

      </div>

      {!twilioNumber && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          color: '#fbbf24', fontSize: 13,
        }}>
          ⚠️ Twilio number not set. Ask your admin to set it in the business settings.
        </div>
      )}

      <button
        onClick={handleSave} disabled={saving}
        className="btn-save"
        style={{ minWidth: 140 }}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  )
}
