import type { CallLog, FollowUpDraft, MeetingRecord, Prospect } from '@/lib/types'

export function RecentActivity({
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
  const activity = [
    ...calls.slice(0, 5).map((call) => ({
      id: call.id,
      title: `Call logged: ${call.outcome}`,
      subtitle: `${call.prospectId} • ${call.nextStep || 'No next step'}`,
      at: call.calledAt,
    })),
    ...followUps.slice(0, 5).map((item) => ({
      id: item.id,
      title: `Follow-up draft: ${item.channel}`,
      subtitle: `${item.prospectId} • ${item.status}`,
      at: item.createdAt,
    })),
    ...meetings.slice(0, 5).map((meeting) => ({
      id: meeting.id,
      title: `Meeting handoff: ${meeting.status}`,
      subtitle: `${meeting.prospectId} • ${meeting.rep}`,
      at: meeting.bookedTime || meeting.proposedTime || new Date().toISOString(),
    })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8)

  const todaysPriorities = prospects
    .filter((p) => ['call_queued', 'called', 'follow_up_sent'].includes(p.pipelineStage))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5)

  return (
    <div className="stack">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Today’s priorities</h2>
        <div className="stack">
          {todaysPriorities.map((p) => (
            <div key={p.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{p.businessName}</strong>
              <div className="muted">{p.assignedRep} • {p.pipelineStage}</div>
              <div className="muted">Reason: {p.priorityReason}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Recent activity</h3>
        <div className="stack">
          {activity.length === 0 ? <div className="muted">No activity recorded yet.</div> : activity.map((item) => (
            <div key={item.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{item.title}</strong>
              <div className="muted">{item.subtitle}</div>
              <div className="muted">{new Date(item.at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
