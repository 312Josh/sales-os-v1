import { getInquiryStatusCopy } from '@/lib/inquiry-status'
import type { InquiryTest } from '@/lib/types'

export function InquiryAuditLog({ inquiryTest }: { inquiryTest?: InquiryTest }) {
  if (!inquiryTest) {
    return (
      <div className="card compact-card">
        <h3 style={{ marginTop: 0 }}>Inquiry audit log</h3>
        <div className="muted">No inquiry test activity logged for this prospect yet.</div>
      </div>
    )
  }

  return (
    <div className="card compact-card">
      <h3 style={{ marginTop: 0 }}>Inquiry audit log</h3>
      <div className="stack">
        <div><strong>Test status:</strong><div className="muted">{getInquiryStatusCopy(inquiryTest.testStatus)}</div></div>
        <div><strong>Inquiry text:</strong><div className="muted">{inquiryTest.inquiryText || 'Not stored yet'}</div></div>
        <div><strong>Submitted at:</strong><div className="muted">{inquiryTest.inquirySubmittedAt || 'Not submitted yet'}</div></div>
        <div><strong>First response at:</strong><div className="muted">{inquiryTest.firstResponseAt || 'No response captured yet'}</div></div>
        <div><strong>Response channel:</strong><div className="muted">{inquiryTest.responseChannel || 'Not captured yet'}</div></div>
        <div><strong>Response time:</strong><div className="muted">{inquiryTest.responseTimeMinutes ?? 'Pending'} minutes</div></div>
        <div><strong>Grade:</strong><div className="muted">{inquiryTest.grade || 'Ungraded'}</div></div>
        <div><strong>Graded at:</strong><div className="muted">{inquiryTest.gradedAt || 'Not graded yet'}</div></div>
      </div>
    </div>
  )
}
