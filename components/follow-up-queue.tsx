import { getFollowUpLabel, getFollowUpState } from '@/lib/follow-up-state'
import { getPriorityWeight } from '@/lib/prioritization'
import type { MeetingRecord } from '@/lib/types'
import type { CallLog, FollowUpDraft, Prospect } from '@/lib/types'

export function FollowUpQueue({ prospects, calls, followUps, meetings }: { prospects: Prospect[]; calls: CallLog[]; followUps: FollowUpDraft[]; meetings: MeetingRecord[] }) {
  const actionable = prospects
    .map((prospect) => ({
      prospect,
      state: getFollowUpState(prospect, calls, followUps),
    }))
    .filter((item) => item.state !== 'clear')
    .sort((a, b) => {
      const weight: Record<string, number> = { stale_follow_up: 0, needs_rep_follow_up: 1, waiting_on_prospect: 2, clear: 3 }
      const stateDelta = weight[a.state] - weight[b.state]
      if (stateDelta !== 0) return stateDelta
      return getPriorityWeight(b.prospect, calls, followUps, meetings) - getPriorityWeight(a.prospect, calls, followUps, meetings)
    })

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h2 style={{ marginTop: 0 }}>Follow-up queue</h2>
      <div className="stack">
        {actionable.length === 0 ? <div className="muted">No follow-up pressure right now.</div> : actionable.map(({ prospect, state }) => (
          <a key={prospect.id} href={`/?prospectId=${prospect.id}`} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
            <strong>{prospect.businessName}</strong>
            <div className="muted">{prospect.assignedRep} • {getFollowUpLabel(state)}</div>
            <div className="muted">{prospect.outreachHook}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
