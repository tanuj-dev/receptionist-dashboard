import { useState } from 'react'
import { createBusiness } from '../api'

const DAYS      = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const DURATIONS = [15, 20, 30, 45, 60]
const BIZ_TYPES = ['Dental','Salon','Barber','Clinic','Physiotherapy','Spa','Gym','Other']

export default function CreateBusinessModal({ onClose, onCreated }) {
  // Basic info
  const [name,          setName]         = useState('')
  const [bizId,         setBizId]        = useState('')
  const [bizType,       setBizType]      = useState('dental')
  const [email,         setEmail]        = useState('')
  const [password,      setPassword]     = useState('')
  const [twilioNumber,  setTwilioNumber] = useState('')
  const [callMode,      setCallMode]     = useState('always')

  // Services
  const [services, setServices] = useState([''])

  // Schedule
  const [workingDays,  setWorkingDays]  = useState(['Monday','Tuesday','Wednesday','Thursday','Friday'])
  const [startTime,    setStartTime]    = useState('09:00')
  const [endTime,      setEndTime]      = useState('18:00')
  const [slotDuration, setSlotDuration] = useState(30)

  // UI state
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleNameChange(v) {
    setName(v)
    // Auto-generate ID: lowercase, spaces→underscores, strip special chars
    setBizId(v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''))
  }

  function toggleDay(day) {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  function addService()          { setServices(p => [...p, '']) }
  function removeService(i)      { setServices(p => p.filter((_, idx) => idx !== i)) }
  function updateService(i, val) { setServices(p => p.map((s, idx) => idx === i ? val : s)) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const cleanServices = services.map(s => s.trim()).filter(Boolean)

    if (!name.trim())           return setError('Business name is required.')
    if (!bizId.trim())          return setError('Business ID is required.')
    if (cleanServices.length === 0) return setError('Add at least one service.')
    if (workingDays.length === 0)   return setError('Select at least one working day.')
    if (!password.trim())       return setError('Client dashboard password is required.')
    if (!twilioNumber.trim())   return setError('Twilio number is required.')
    if (startTime >= endTime)   return setError('Opening time must be before closing time.')

    setSaving(true)
    try {
      const res = await createBusiness({
        id:              bizId.trim(),
        name:            name.trim(),
        type:            bizType,
        services:        cleanServices,
        working_days:    workingDays,
        start_time:      startTime,
        end_time:        endTime,
        slot_duration:   slotDuration,
        contact_email:   email.trim(),
        client_password: password.trim(),
        twilio_number:   twilioNumber.trim(),
        call_mode:       callMode,
      })
      if (res.error) { setError(res.error); return }
      onCreated(res)   // pass back {id, name} so sidebar can refresh
    } catch {
      setError('Could not reach server. Is Flask running?')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>🏢 Add New Business</h2>
            <p>Fill in the details — the business will be live immediately.</p>
          </div>
          <button className="modal-close" onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="modal-error">⚠️ {error}</div>}

          <div className="modal-grid">

            {/* ── Left column ── */}
            <div className="modal-col">
              <div className="sched-section">
                <label className="sched-label">Business Name *</label>
                <input
                  type="text" placeholder="e.g. Tanuj Dental Clinic"
                  value={name} onChange={e => handleNameChange(e.target.value)}
                  className="sched-input" autoFocus
                />
              </div>

              <div className="sched-section">
                <label className="sched-label">Business ID *</label>
                <input
                  type="text" placeholder="e.g. tanuj_dental"
                  value={bizId}
                  onChange={e => setBizId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="sched-input"
                />
                <span className="field-hint">Auto-generated. Used as login ID. Only a–z, 0–9, _</span>
              </div>

              <div className="sched-section">
                <label className="sched-label">Business Type</label>
                <select value={bizType} onChange={e => setBizType(e.target.value)} className="sched-input">
                  {BIZ_TYPES.map(t => (
                    <option key={t} value={t.toLowerCase()}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="sched-section">
                <label className="sched-label">Contact Email <span className="optional-tag">optional</span></label>
                <input
                  type="email" placeholder="owner@clinic.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="sched-input"
                />
              </div>

              <div className="sched-section">
                <label className="sched-label">Client Dashboard Password *</label>
                <input
                  type="text" placeholder="Password the business owner will use to log in"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="sched-input"
                />
              </div>

              <div className="sched-section">
                <label className="sched-label">Twilio Number *</label>
                <input
                  type="text" placeholder="e.g. +12394238893"
                  value={twilioNumber} onChange={e => setTwilioNumber(e.target.value)}
                  className="sched-input"
                />
                <span className="field-hint">The Twilio number assigned to this business. Required for AI to receive calls.</span>
              </div>

              <div className="sched-section">
                <label className="sched-label">Call Mode</label>
                <select value={callMode} onChange={e => setCallMode(e.target.value)} className="sched-input">
                  <option value="always">Always Forward — AI answers all calls</option>
                  <option value="ring_first">Ring First — phone rings, then AI answers</option>
                </select>
                <span className="field-hint">
                  {callMode === 'always'
                    ? `Dial code: *21*${twilioNumber || '[twilio_number]'}#`
                    : `Dial: *61*${twilioNumber || '[twilio_number]'}# (no answer) + *67*${twilioNumber || '[twilio_number]'}# (busy)`
                  }
                </span>
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="modal-col">
              <div className="sched-section">
                <label className="sched-label">Services *</label>
                <div className="services-list">
                  {services.map((s, i) => (
                    <div key={i} className="service-row">
                      <input
                        type="text" placeholder={`Service ${i + 1}, e.g. Cleaning`}
                        value={s} onChange={e => updateService(i, e.target.value)}
                        className="sched-input"
                      />
                      {services.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-service"
                          onClick={() => removeService(i)}
                        >✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-add-service" onClick={addService}>
                  + Add Service
                </button>
              </div>

              <div className="sched-section" style={{ marginTop: 8 }}>
                <label className="sched-label">Working Days *</label>
                <div className="day-grid">
                  {DAYS.map(day => (
                    <button
                      key={day} type="button"
                      className={`day-chip${workingDays.includes(day) ? ' active' : ''}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sched-row" style={{ marginTop: 16 }}>
                <div className="sched-section">
                  <label className="sched-label">Opens</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="sched-input" />
                </div>
                <div className="sched-section">
                  <label className="sched-label">Closes</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="sched-input" />
                </div>
                <div className="sched-section">
                  <label className="sched-label">Slot</label>
                  <select value={slotDuration} onChange={e => setSlotDuration(Number(e.target.value))} className="sched-input">
                    {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Creating…' : '🏢 Create Business'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
