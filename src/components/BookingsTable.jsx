import { useState } from 'react'
import { cancelBooking } from '../api'

export default function BookingsTable({ bookings, loading, onRefresh }) {
  const [cancelling, setCancelling] = useState(null)

  async function handleCancel(id) {
    if (!window.confirm(`Cancel booking #${id}? This cannot be undone.`)) return
    setCancelling(id)
    await cancelBooking(id)
    await onRefresh()
    setCancelling(null)
  }

  function splitDT(dt) {
    if (!dt) return ['–', '–']
    const parts = dt.split(' ')
    return [parts[0] || '–', parts[1] || '–']
  }

  if (loading) {
    return (
      <div className="table-wrap">
        <table>
          <tbody>
            <tr className="loading-row">
              <td colSpan={9}>Loading bookings…</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  if (!bookings.length) {
    return (
      <div className="table-wrap">
        <div className="empty-state">
          <div className="icon">📭</div>
          No bookings found.
        </div>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Service</th>
            <th>Date</th>
            <th>Time</th>
            <th>Booked On</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => {
            const [date, time] = splitDT(b.appointment_datetime)
            const bookedOn = b.created_at ? b.created_at.substring(0, 10) : '–'
            return (
              <tr key={b.id}>
                <td><strong>#{b.id}</strong></td>
                <td>{b.customer_name || '–'}</td>
                <td>{b.customer_phone || '–'}</td>
                <td>{b.service || '–'}</td>
                <td>{date}</td>
                <td>{time}</td>
                <td>{bookedOn}</td>
                <td>
                  <span className={`badge ${b.status}`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  {b.status === 'confirmed' ? (
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancel(b.id)}
                      disabled={cancelling === b.id}
                    >
                      {cancelling === b.id ? '…' : 'Cancel'}
                    </button>
                  ) : (
                    <button className="btn-cancel" disabled>Cancelled</button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
