import { getFollowUpLabel, getFollowUpState } from '@/lib/follow-up-state'
import type { CallLog, FollowUpDraft, MeetingRecord, Prospect } from '@/lib/types'

export function SecondaryInsights({
  calls,
  followUps,
  meetings,
  prospects,
}: {
  calls: CallLog[]
  followUps: FollowUpDraft[]
  meetings: MeetingRecord[]
  prospects: Prospect[]
}) {
  const recent = [
    ...calls.slice(0, 3).map((call) => ({ id: call.id, label: `Call: ${call.outcome}`, meta: call.nextStep || 'No next step' })),
    ...followUps.slice(0, 3).map((item) => ({ id: item.id, label: `Draft: ${item.channel}`, meta: item.status })),
    ...meetings.slice(0, 3).map((item) => ({ id: item.id, label: `Booking: ${item.status}`, meta: `${item.rep} • ${item.bookingUrl}` })),
  ].slice(0, 6)

  const stale = prospects.filter((p) => getFollowUpState(p, calls, followUps) === 'stale_follow_up').length
  const byRep = {
    Josh: prospects.filter((p) => p.assignedRep === 'Josh').length,
    Paul: prospects.filter((p) => p.assignedRep === 'Paul').length,
  }

  return (
    <div className="stack">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Secondary insights</h3>
        <div className="row">
          <span className="badge">Josh: {byRep.Josh}</span>
          <span className="badge">Paul: {byRep.Paul}</span>
          <span className="badge">Meetings: {meetings.length}</span>
          <span className="badge">Stale follow-up: {stale}</span>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Recent signal</h3>
        <div className="stack">
          {recent.map((item) => (
            <div key={item.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{item.label}</strong>
              <div className="muted">{item.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
