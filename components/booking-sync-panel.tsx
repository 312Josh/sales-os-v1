import { getBookingAgingLabel, getBookingOpsLine, getBookingSyncStatus } from '@/lib/booking-automation'
import type { MeetingRecord, Prospect } from '@/lib/types'

export function BookingSyncPanel({ prospects, meetings }: { prospects: Prospect[]; meetings: MeetingRecord[] }) {
  const bookingAccounts = prospects.filter((prospect) => ['follow_up_sent', 'meeting_booked'].includes(prospect.pipelineStage))

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Booking sync watch</h3>
      <div className="stack">
        {bookingAccounts.length === 0 ? <div className="muted">No booking-dependent accounts right now.</div> : bookingAccounts.map((prospect) => {
          const meeting = meetings.find((item) => item.prospectId === prospect.id)
          return (
            <div key={prospect.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{prospect.businessName}</strong>
              <div className="muted">{getBookingOpsLine(prospect, meeting)}</div>
              <div className="muted">Sync status: {getBookingSyncStatus(meeting)}</div>
              <div className="muted">Aging: {getBookingAgingLabel(meeting)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
