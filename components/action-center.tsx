import type { MeetingRecord, Prospect } from '@/lib/types'

export function ActionCenter({ prospects, meetings }: { prospects: Prospect[]; meetings: MeetingRecord[] }) {
  const needsFollowUp = prospects.filter((p) => p.pipelineStage === 'follow_up_sent' || p.pipelineStage === 'called')
  const meetingReady = prospects.filter((p) => p.pipelineStage === 'meeting_booked')
  const staleQueued = prospects.filter((p) => p.pipelineStage === 'call_queued').slice(0, 5)
  const repBuckets = {
    Josh: prospects.filter((p) => p.assignedRep === 'Josh'),
    Paul: prospects.filter((p) => p.assignedRep === 'Paul'),
  }

  return (
    <div className="stack">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Rep action center</h2>
        <div className="row">
          <span className="badge">Needs follow-up: {needsFollowUp.length}</span>
          <span className="badge">Meeting ready: {meetingReady.length}</span>
          <span className="badge">Open meetings: {meetings.length}</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Needs follow-up now</h3>
        <div className="stack">
          {needsFollowUp.length === 0 ? <div className="muted">No follow-up actions queued right now.</div> : needsFollowUp.map((p) => (
            <div key={p.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{p.businessName}</strong>
              <div className="muted">{p.assignedRep} • {p.pipelineStage}</div>
              <div className="muted">Next angle: {p.outreachHook}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Stale queued prospects</h3>
        <div className="stack">
          {staleQueued.map((p) => (
            <div key={p.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{p.businessName}</strong>
              <div className="muted">{p.assignedRep} • Priority {p.priorityScore}</div>
              <div className="muted">Weakness: {p.weakIntakeSignal}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Rep workload</h3>
        <div className="stack">
          {Object.entries(repBuckets).map(([rep, items]) => (
            <div key={rep} className="row" style={{ justifyContent: 'space-between', borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <span>{rep}</span>
              <strong>{items.length} accounts</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
