export default function StatsCards({ stats }) {
  const cards = [
    { label: 'Today',      value: stats?.today,    sub: 'bookings' },
    { label: 'This Week',  value: stats?.week,     sub: 'bookings' },
    { label: 'This Month', value: stats?.month,    sub: 'bookings' },
    { label: 'All Time',   value: stats?.all_time, sub: 'total'    },
  ]

  return (
    <div className="stats-grid">
      {cards.map(c => (
        <div key={c.label} className="stat-card">
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">{c.value ?? '–'}</div>
          <div className="stat-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
