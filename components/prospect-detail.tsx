import { updateProspectStage } from '@/lib/data'
import { CallDispositionForm } from '@/components/call-disposition-form'
import { EnrichmentPanel } from '@/components/enrichment-panel'
import { HookPanel } from '@/components/hook-panel'
import { InquiryTestPanel } from '@/components/inquiry-test-panel'
import { InquiryAuditLog } from '@/components/inquiry-audit-log'
import type { CallLog, Prospect } from '@/lib/types'

const stages = ['sourced','audited','call_queued','called','follow_up_sent','meeting_booked','proposal_sent','paid','closed_lost'] as const

export function ProspectDetail({ prospect, calls, inquiryTest }: { prospect: Prospect; calls: CallLog[]; inquiryTest?: any }) {
  return (
    <div className="stack">
      <EnrichmentPanel prospect={prospect} />
      <HookPanel prospect={prospect} />
      <InquiryTestPanel prospect={prospect} inquiryTest={inquiryTest} />
      <InquiryAuditLog inquiryTest={inquiryTest} />

      <div className="card compact-card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: '0 0 8px' }}>{prospect.businessName}</h2>
            <div className="muted">{prospect.market} • {prospect.niche} • {prospect.city}</div>
          </div>
          <div>
            <span className="badge">{prospect.assignedRep}</span>
            <span className="badge">Priority {prospect.priorityScore}</span>
            <span className="badge">Site {prospect.siteScore}</span>
            <span className="badge">Intake {prospect.intakeScore}</span>
          </div>
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <span className="badge">Phone {prospect.phone}</span>
          <span className="badge">Decision maker: {prospect.decisionMaker || 'Unknown'}</span>
          <span className="badge">Stage: {prospect.pipelineStage}</span>
        </div>
        <div className="stack" style={{ marginTop: 16 }}>
          <div><strong>Weak site signal:</strong><div className="muted">{prospect.weakSiteSignal}</div></div>
          <div><strong>Weak intake signal:</strong><div className="muted">{prospect.weakIntakeSignal}</div></div>
          <div><strong>Audit summary:</strong><div className="muted">{prospect.auditSummary}</div></div>
          <div><strong>Priority reason:</strong><div className="muted">{prospect.priorityReason}</div></div>
          <div><strong>Opener / outreach hook:</strong><div className="muted">{prospect.outreachHook}</div></div>
          <div><strong>Notes:</strong><div className="muted">{prospect.notes || 'No notes yet.'}</div></div>
        </div>
      </div>

      <CallDispositionForm prospect={prospect} />

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Update pipeline stage</h3>
        <form action={updateProspectStage} className="row" style={{ alignItems: 'end' }}>
          <input type="hidden" name="prospectId" value={prospect.id} />
          <label style={{ flex: 1 }}>
            Stage
            <select name="pipelineStage" defaultValue={prospect.pipelineStage}>
              {stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
            </select>
          </label>
          <button type="submit">Save stage</button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Recent call history</h3>
        <div className="stack">
          {calls.length === 0 ? <div className="muted">No calls logged yet.</div> : calls.map((call) => (
            <div key={call.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{call.outcome}</strong>
              <div className="muted">{new Date(call.calledAt).toLocaleString()}</div>
              <div className="muted">{call.notes || 'No notes'}</div>
              <div className="muted">Next: {call.nextStep || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
