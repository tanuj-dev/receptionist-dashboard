import { useState, useEffect } from 'react'
import { fetchSchedule, updateSchedule, fetchLeaves, addLeave, deleteLeave } from '../api'

const DAYS      = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const DURATIONS = [15, 20, 30, 45, 60]

export default function ScheduleManager() {
  const [tab, setTab] = useState('hours')

  // ── Working-hours state ──────────────────────────────────────────────
  const [workingDays,   setWorkingDays]   = useState([])
  const [startTime,     setStartTime]     = useState('09:00')
  const [endTime,       setEndTime]       = useState('18:00')
  const [slotDuration,  setSlotDuration]  = useState(30)
  const [saving,        setSaving]        = useState(false)
  const [saveMsg,       setSaveMsg]       = useState('')

  // ── Leaves state ─────────────────────────────────────────────────────
  const [leaves,      setLeaves]      = useState([])
  const [leaveDate,   setLeaveDate]   = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [addingLeave, setAddingLeave] = useState(false)

  // Load on mount
  useEffect(() => {
    fetchSchedule().then(data => {
      if (!data || data.error) return
      setWorkingDays(data.working_days  || [])
      setStartTime(  data.start_time    || '09:00')
      setEndTime(    data.end_time      || '18:00')
      setSlotDuration(data.slot_duration || 30)
    })
    loadLeaves()
  }, [])

  function loadLeaves() {
    fetchLeaves().then(data => {
      if (Array.isArray(data)) setLeaves(data)
    })
  }

  function toggleDay(day) {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleSaveSchedule() {
    if (workingDays.length === 0) { setSaveMsg('⚠️ Select at least one working day.'); return }
    if (startTime >= endTime)     { setSaveMsg('⚠️ Opening time must be before closing time.'); return }
    setSaving(true); setSaveMsg('')
    await updateSchedule({ working_days: workingDays, start_time: startTime, end_time: endTime, slot_duration: slotDuration })
    setSaving(false); setSaveMsg('✅ Schedule saved!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function handleAddLeave(e) {
    e.preventDefault()
    if (!leaveDate) return
    setAddingLeave(true)
    await addLeave(leaveDate, leaveReason)
    setLeaveDate(''); setLeaveReason('')
    setAddingLeave(false)
    loadLeaves()
  }

  async function handleDeleteLeave(id) {
    await deleteLeave(id)
    loadLeaves()
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="schedule-manager">

      {/* Tabs */}
      <div className="schedule-tabs">
        <button className={`schedule-tab${tab==='hours'  ? ' active' : ''}`} onClick={() => setTab('hours')}>
          ⏰ Working Hours
        </button>
        <button className={`schedule-tab${tab==='leaves' ? ' active' : ''}`} onClick={() => setTab('leaves')}>
          🏖️ Leaves &amp; Holidays
        </button>
      </div>

      {/* ── Working Hours ── */}
      {tab === 'hours' && (
        <div className="schedule-card">
          <div className="schedule-card-header">
            <h3>Working Hours &amp; Slot Settings</h3>
            <p>Changes apply immediately — callers will see the updated slots.</p>
          </div>

          {/* Days */}
          <div className="sched-section">
            <label className="sched-label">Open on these days</label>
            <div className="day-grid">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`day-chip${workingDays.includes(day) ? ' active' : ''}`}
                  onClick={() => toggleDay(day)}
                >
                  {day.slice(0,3)}
                </button>
              ))}
            </div>
          </div>

          {/* Time + Duration */}
          <div className="sched-row">
            <div className="sched-section">
              <label className="sched-label">Opening Time</label>
              <input
                type="time" value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="sched-input"
              />
            </div>
            <div className="sched-section">
              <label className="sched-label">Closing Time</label>
              <input
                type="time" value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="sched-input"
              />
            </div>
            <div className="sched-section">
              <label className="sched-label">Slot Duration</label>
              <select
                value={slotDuration}
                onChange={e => setSlotDuration(Number(e.target.value))}
                className="sched-input"
              >
                {DURATIONS.map(d => (
                  <option key={d} value={d}>{d} minutes</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          {startTime && endTime && startTime < endTime && (() => {
            const slots = previewSlots(startTime, endTime, slotDuration)
            return (
              <div className="sched-preview">
                <span className="sched-preview-label">Preview — {slots.length} slot{slots.length !== 1 ? 's' : ''} available</span>
                {slots.map(t => (
                  <span key={t} className="sched-slot-chip">{t}</span>
                ))}
              </div>
            )
          })()}

          <div className="sched-actions">
            <button className="btn-save" onClick={handleSaveSchedule} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Schedule'}
            </button>
            {saveMsg && (
              <span className={`save-msg ${saveMsg.startsWith('⚠') ? 'warn' : 'ok'}`}>
                {saveMsg}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Leaves & Holidays ── */}
      {tab === 'leaves' && (
        <div className="schedule-card">
          <div className="schedule-card-header">
            <h3>Leaves &amp; Holidays</h3>
            <p>Callers won't be offered any slots on these dates — even if it's a working day.</p>
          </div>

          {/* Add leave form */}
          <form onSubmit={handleAddLeave} className="leave-form">
            <div className="leave-inputs">
              <div className="sched-section">
                <label className="sched-label">Date</label>
                <input
                  type="date" value={leaveDate}
                  onChange={e => setLeaveDate(e.target.value)}
                  className="sched-input" required
                  min={todayStr()}
                />
              </div>
              <div className="sched-section" style={{ flex: 1 }}>
                <label className="sched-label">Reason <span style={{ fontWeight:400, color:'var(--muted)' }}>(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. National Holiday, Staff Training, Personal…"
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  className="sched-input"
                />
              </div>
              <div className="sched-section" style={{ justifyContent: 'flex-end' }}>
                <label className="sched-label">&nbsp;</label>
                <button type="submit" className="btn-save" disabled={addingLeave || !leaveDate}>
                  {addingLeave ? 'Adding…' : '+ Add Leave'}
                </button>
              </div>
            </div>
          </form>

          {/* Leaves list */}
          <div className="leaves-list">
            {leaves.length === 0 ? (
              <div className="leaves-empty">
                <span style={{ fontSize: 32 }}>🏖️</span>
                <p>No leaves scheduled. Add a date above to block it.</p>
              </div>
            ) : (
              <>
                <div className="leaves-count">{leaves.length} date{leaves.length !== 1 ? 's' : ''} blocked</div>
                {leaves.map(leave => (
                  <div key={leave.id} className="leave-item">
                    <span className="leave-icon">📅</span>
                    <div className="leave-info">
                      <div className="leave-date-text">{formatLeaveDate(leave.date)}</div>
                      {leave.reason && <div className="leave-reason">{leave.reason}</div>}
                    </div>
                    <button
                      className="btn-del-leave"
                      onClick={() => handleDeleteLeave(leave.id)}
                      title="Remove leave"
                    >🗑️</button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function formatLeaveDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

function previewSlots(start, end, duration) {
  const slots = []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let minutes = sh * 60 + sm
  const endMin = eh * 60 + em
  while (minutes + duration <= endMin) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    const ampm = h < 12 ? 'AM' : 'PM'
    const h12 = h % 12 || 12
    slots.push(`${h12}:${String(m).padStart(2,'0')} ${ampm}`)
    minutes += duration
  }
  return slots
}
