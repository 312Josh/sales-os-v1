import { getNextAction } from '@/lib/next-action'
import { getPriorityReasonLine, getPriorityWeight } from '@/lib/prioritization'
import { isPriorityInquiryGrade } from '@/lib/inquiry-grading'
import { getV2PriorityLabel, getV2PriorityScore } from '@/lib/v2-prioritization'
import type { CallLog, FollowUpDraft } from '@/lib/types'
import type { MeetingRecord, Prospect } from '@/lib/types'

export function CommandRail({ prospects, meetings, calls, followUps, inquiryTests }: { prospects: Prospect[]; meetings: MeetingRecord[]; calls: CallLog[]; followUps: FollowUpDraft[]; inquiryTests: any[] }) {
  const active = prospects
    .filter((p) => ['call_queued', 'called', 'follow_up_sent', 'meeting_booked'].includes(p.pipelineStage))
    .sort((a, b) => getV2PriorityScore(b, calls, followUps, meetings) - getV2PriorityScore(a, calls, followUps, meetings))
    .slice(0, 8)

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h2 style={{ marginTop: 0 }}>Today’s command rail</h2>
      <div className="stack">
        {active.map((prospect) => {
          const inquiry = inquiryTests.find((item) => item.prospectId === prospect.id)
          const meeting = meetings.find((item) => item.prospectId === prospect.id)
          return (
            <a key={prospect.id} href={`/?prospectId=${prospect.id}`} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{prospect.businessName}</strong>
              <div className="muted">{prospect.assignedRep} • {prospect.pipelineStage}</div>
              <div className="muted">Next: {getNextAction(prospect, meeting)}</div>
              <div className="muted">Priority: {getV2PriorityLabel(prospect, calls, followUps, meetings)}</div>
              <div className="muted">{getPriorityReasonLine(prospect, calls, followUps, meetings)}</div>
              {isPriorityInquiryGrade(inquiry?.grade) ? <div className="badge">Inquiry wedge: grade {inquiry?.grade} priority target</div> : null}
              {inquiry?.testStatus === 'approved' ? <div className="badge">Inquiry approved — ready once provider exists</div> : null}
            </a>
          )
        })}
      </div>
    </div>
  )
}
