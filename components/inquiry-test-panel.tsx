import { generateInquiryText } from '@/lib/inquiry-templates'
import type { InquiryTest, Prospect } from '@/lib/types'

export function InquiryTestPanel({ prospect, inquiryTest }: { prospect: Prospect; inquiryTest?: InquiryTest }) {
  const draftText = generateInquiryText(prospect)
  return (
    <div className="card compact-card">
      <h3 style={{ marginTop: 0 }}>Inquiry / speed test</h3>
      {inquiryTest ? (
        <div className="stack">
          <div><strong>Status:</strong><div className="muted">{inquiryTest.testStatus}</div></div>
          <div><strong>Inquiry text:</strong><div className="muted">{inquiryTest.inquiryText || draftText}</div></div>
          <div><strong>Channel:</strong><div className="muted">{inquiryTest.inquiryChannel || 'Not set'}</div></div>
          <div><strong>Grade:</strong><div className="muted">{inquiryTest.grade || 'Ungraded'}</div></div>
          <div><strong>Response time:</strong><div className="muted">{inquiryTest.responseTimeMinutes ?? 'Pending'} minutes</div></div>
          <div className="muted">Human approval is required before submission. Full external submission flow is the next implementation step.</div>
        </div>
      ) : (
        <div className="stack">
          <div><strong>Prepared inquiry draft:</strong><div className="muted">{draftText}</div></div>
          <div className="muted">Rep can queue this prospect for an inquiry/speed test. Submission is approval-gated and not yet wired live.</div>
        </div>
      )}
    </div>
  )
}
