import { useState, useEffect, useCallback } from 'react'
import logo from '../assets/logo.png'
import { fetchBusinesses, fetchStats, fetchBookings, getClientBiz } from '../api'
import Sidebar from './Sidebar'
import StatsCards from './StatsCards'
import BookingsTable from './BookingsTable'
import ScheduleManager from './ScheduleManager'
import CreateBusinessModal from './CreateBusinessModal'
import CallModeSettings from './CallModeSettings'

export default function Dashboard({ role, onLogout }) {
  const isAdmin   = role === 'admin'
  const clientBiz = getClientBiz()   // { id, name } for client users

  const [businesses,   setBusinesses]  = useState([])
  const [selectedId,   setSelectedId]  = useState(isAdmin ? '' : clientBiz?.id || '')
  const [selectedName, setSelectedName]= useState(isAdmin ? 'All Businesses' : clientBiz?.name || '')
  const [stats,        setStats]       = useState(null)
  const [bookings,     setBookings]    = useState([])
  const [loading,      setLoading]     = useState(true)
  const [search,       setSearch]      = useState('')
  const [statusFilter, setStatusFilter]= useState('')
  const [clientView,      setClientView]      = useState('bookings') // 'bookings' | 'schedule' | 'callmode'
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Admin: load businesses list for sidebar
  useEffect(() => {
    if (isAdmin) fetchBusinesses().then(setBusinesses)
  }, [isAdmin])

  const loadData = useCallback(async () => {
    setLoading(true)
    const bizId = isAdmin ? selectedId : clientBiz?.id
    const [s, b] = await Promise.all([
      fetchStats(bizId),
      fetchBookings(bizId, statusFilter, search),
    ])
    setStats(s)
    setBookings(b)
    setLoading(false)
  }, [selectedId, statusFilter, search, isAdmin])

  useEffect(() => { loadData() }, [loadData])

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(loadData, 30000)
    return () => clearInterval(t)
  }, [loadData])

  function selectBusiness(id, name) {
    setSelectedId(id)
    setSelectedName(name)
  }

  return (
    <div className="app">
      {/* Sidebar — admin only (client has no business switcher) */}
      {isAdmin && (
        <Sidebar
          businesses={businesses}
          selectedId={selectedId}
          onSelect={selectBusiness}
          onLogout={onLogout}
          onAddBusiness={() => setShowCreateModal(true)}
        />
      )}

      {/* Client gets a slim left bar with nav: Bookings / Schedule */}
      {!isAdmin && (
        <aside className="sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="RingReply" />
            <div className="sidebar-header-text">
              <h1>{clientBiz?.name}</h1>
              <p>Business Dashboard</p>
            </div>
          </div>
          <div className="biz-list" style={{ marginTop: 8 }}>
            <button
              className={`biz-item${clientView === 'bookings' ? ' active' : ''}`}
              onClick={() => setClientView('bookings')}
            >
              <span>📋</span> Bookings
            </button>
            <button
              className={`biz-item${clientView === 'schedule' ? ' active' : ''}`}
              onClick={() => setClientView('schedule')}
            >
              <span>⚙️</span> Schedule &amp; Leaves
            </button>
            <button
              className={`biz-item${clientView === 'callmode' ? ' active' : ''}`}
              onClick={() => setClientView('callmode')}
            >
              <span>📞</span> Call Mode
            </button>
          </div>
          <div style={{ flex: 1 }} />
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={onLogout}>🚪 Sign Out</button>
          </div>
        </aside>
      )}

      <div className="main">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-title">
            <h2>
              {!isAdmin && clientView === 'schedule'
                ? 'Schedule & Leaves'
                : selectedName}
            </h2>
            <p>
              {isAdmin
                ? (selectedId ? `Bookings for ${selectedName}` : 'All businesses')
                : clientView === 'schedule'
                  ? 'Manage working hours and holidays'
                  : 'Your appointment bookings'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isAdmin && (
              <span style={{
                background: '#e0f2fe', color: '#0369a1',
                fontSize: 11, fontWeight: 700, padding: '4px 10px',
                borderRadius: 20
              }}>
                Business Owner
              </span>
            )}
            {isAdmin && (
              <span style={{
                background: '#fef3c7', color: '#92400e',
                fontSize: 11, fontWeight: 700, padding: '4px 10px',
                borderRadius: 20
              }}>
                Admin
              </span>
            )}
            <div className="live-badge">
              <span className="live-dot" /> Live
            </div>
          </div>
        </div>

        <div className="content">
          {/* Call Mode view — client only */}
          {!isAdmin && clientView === 'callmode' ? (
            <CallModeSettings />
          ) : !isAdmin && clientView === 'schedule' ? (
            <ScheduleManager />
          ) : (
            <>
              <StatsCards stats={stats} />

              {/* Filters */}
              <div className="filters">
                <input
                  type="text"
                  placeholder="🔍  Search by name or phone…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button className="btn-refresh" onClick={loadData}>↻ Refresh</button>
              </div>

              <BookingsTable
                bookings={bookings}
                loading={loading}
                onRefresh={loadData}
              />
            </>
          )}
        </div>
      </div>
      {/* Create Business Modal — admin only */}
      {showCreateModal && (
        <CreateBusinessModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newBiz) => {
            setShowCreateModal(false)
            // Refresh sidebar list and auto-select the new business
            fetchBusinesses().then(list => {
              setBusinesses(list)
              setSelectedId(newBiz.id)
              setSelectedName(newBiz.name)
            })
          }}
        />
      )}
    </div>
  )
}
