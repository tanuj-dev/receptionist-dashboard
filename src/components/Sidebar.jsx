export default function Sidebar({ businesses, selectedId, onSelect, onLogout, onAddBusiness }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>🤖 AI Receptionist</h1>
        <p>Admin Dashboard</p>
      </div>

      <div className="sidebar-label">Businesses</div>

      <nav className="biz-list">
        <button
          className={`biz-item ${selectedId === '' ? 'active' : ''}`}
          onClick={() => onSelect('', 'All Businesses')}
        >
          <span className="biz-dot gold" />
          All Businesses
        </button>

        {businesses.map(b => (
          <button
            key={b.id}
            className={`biz-item ${selectedId === b.id ? 'active' : ''}`}
            onClick={() => onSelect(b.id, b.name)}
          >
            <span className="biz-dot" />
            {b.name}
          </button>
        ))}

        {/* Add new business button */}
        <button className="biz-item biz-add" onClick={onAddBusiness}>
          <span className="biz-add-icon">＋</span>
          Add Business
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}
