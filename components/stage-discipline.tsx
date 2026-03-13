import { getNextAction } from '@/lib/next-action'
import type { MeetingRecord, Prospect } from '@/lib/types'

export function StageDiscipline({ prospects, meetings }: { prospects: Prospect[]; meetings: MeetingRecord[] }) {
  const rows = prospects.map((prospect) => ({
    prospect,
    meeting: meetings.find((m) => m.prospectId === prospect.id),
  }))

  return (
    <div className="stack">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Stage discipline</h2>
        <div className="stack">
          {rows.map(({ prospect, meeting }) => (
            <div key={prospect.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{prospect.businessName}</strong>
              <div className="muted">Stage: {prospect.pipelineStage}</div>
              <div className="muted">Next action: {getNextAction(prospect, meeting)}</div>
              {meeting ? <div className="muted">Meeting status: {meeting.status}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
