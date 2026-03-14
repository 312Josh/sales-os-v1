import { getFollowUpLabel, getFollowUpState } from '@/lib/follow-up-state'
import { getPriorityWeight } from '@/lib/prioritization'
import { getV2PriorityLabel, getV2PriorityScore } from '@/lib/v2-prioritization'
import { isPriorityInquiryGrade } from '@/lib/inquiry-grading'
import type { MeetingRecord } from '@/lib/types'
import type { CallLog, FollowUpDraft, Prospect } from '@/lib/types'

export function FollowUpQueue({ prospects, calls, followUps, meetings, inquiryTests }: { prospects: Prospect[]; calls: CallLog[]; followUps: FollowUpDraft[]; meetings: MeetingRecord[]; inquiryTests: any[] }) {
  const actionable = prospects
    .map((prospect) => ({
      prospect,
      inquiry: inquiryTests.find((item) => item.prospectId === prospect.id),
      state: getFollowUpState(prospect, calls, followUps),
    }))
    .filter((item) => item.state !== 'clear')
    .sort((a, b) => {
      const weight: Record<string, number> = { stale_follow_up: 0, needs_rep_follow_up: 1, waiting_on_prospect: 2, clear: 3 }
      const stateDelta = weight[a.state] - weight[b.state]
      if (stateDelta !== 0) return stateDelta
      return getV2PriorityScore(b.prospect, calls, followUps, meetings) - getV2PriorityScore(a.prospect, calls, followUps, meetings)
    })

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h2 style={{ marginTop: 0 }}>Follow-up queue</h2>
      <div className="stack">
        {actionable.length === 0 ? <div className="muted">No follow-up pressure right now.</div> : actionable.map(({ prospect, state, inquiry }) => (
          <a key={prospect.id} href={`/?prospectId=${prospect.id}`} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
            <strong>{prospect.businessName}</strong>
            <div className="muted">{prospect.assignedRep} • {getFollowUpLabel(state)}</div>
            <div className="muted">{prospect.outreachHook}</div>
            <div className="muted">Priority: {getV2PriorityLabel(prospect, calls, followUps, meetings)}</div>
            {isPriorityInquiryGrade(inquiry?.grade) ? <div className="badge">Inquiry grade {inquiry?.grade} = stronger call target</div> : null}
          </a>
        ))}
      </div>
    </div>
  )
}
