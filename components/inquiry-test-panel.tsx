import { approveInquiryTest, gradeInquiryTest, queueInquiryTest, submitInquiryTest } from '@/lib/data'
import { generateInquiryText } from '@/lib/inquiry-templates'
import { getInquiryStatusCopy } from '@/lib/inquiry-status'
import type { InquiryTest, Prospect } from '@/lib/types'

export function InquiryTestPanel({ prospect, inquiryTest }: { prospect: Prospect; inquiryTest?: InquiryTest }) {
  const draftText = generateInquiryText(prospect)
  return (
    <div className="card compact-card">
      <h3 style={{ marginTop: 0 }}>Inquiry / speed test</h3>
      {inquiryTest ? (
        <div className="stack">
          <div><strong>Status:</strong><div className="muted">{getInquiryStatusCopy(inquiryTest.testStatus)}</div></div>
          <div><strong>Inquiry text:</strong><div className="muted">{inquiryTest.inquiryText || draftText}</div></div>
          <div><strong>Channel:</strong><div className="muted">{inquiryTest.inquiryChannel || 'Not set'}</div></div>
          <div><strong>Submitted at:</strong><div className="muted">{inquiryTest.inquirySubmittedAt || 'Not submitted yet'}</div></div>
          <div><strong>Grade:</strong><div className="muted">{inquiryTest.grade || 'Ungraded'}</div></div>
          {inquiryTest.grade === 'C' || inquiryTest.grade === 'D' ? <div className="badge">Priority call target from inquiry result</div> : null}
          <div><strong>Response time:</strong><div className="muted">{inquiryTest.responseTimeMinutes ?? 'Pending'} minutes</div></div>
          <div className="muted">Human approval is required before submission. Monitoring and grading are scaffolded in the cockpit, but live external submission/monitoring is still deferred.</div>
          {inquiryTest.testStatus === 'ready_for_approval' ? (
            <form action={approveInquiryTest}>
              <input type="hidden" name="inquiryId" value={inquiryTest.id} />
              <button type="submit">Approve inquiry test</button>
            </form>
          ) : null}
          {inquiryTest.testStatus === 'approved' ? (
            <form action={submitInquiryTest}>
              <input type="hidden" name="inquiryId" value={inquiryTest.id} />
              <button type="submit">Mark submitted + start monitoring</button>
              <div className="muted">Use this only when the real external submission has actually happened.</div>
            </form>
          ) : null}
          {inquiryTest.testStatus === 'monitoring' ? (
            <form action={gradeInquiryTest} className="stack">
              <input type="hidden" name="inquiryId" value={inquiryTest.id} />
              <label>
                Grade
                <select name="grade" defaultValue="C">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </label>
              <label>
                Response channel
                <select name="responseChannel" defaultValue="email">
                  <option value="email">email</option>
                  <option value="sms">sms</option>
                  <option value="phone">phone</option>
                  <option value="web">web</option>
                </select>
              </label>
              <label>
                Response time (minutes)
                <input name="responseTimeMinutes" type="number" min="0" defaultValue="60" />
              </label>
              <button type="submit">Grade inquiry test</button>
            </form>
          ) : null}
        </div>
      ) : (
        <div className="stack">
          <div><strong>Prepared inquiry draft:</strong><div className="muted">{draftText}</div></div>
          <div className="muted">Rep can queue this prospect for an inquiry/speed test. Submission is approval-gated; live external submission still needs provider wiring.</div>
          <form action={queueInquiryTest} className="stack">
            <input type="hidden" name="prospectId" value={prospect.id} />
            <input type="hidden" name="inquiryText" value={draftText} />
            <label>
              Inquiry channel
              <select name="inquiryChannel" defaultValue="form">
                <option value="form">form</option>
                <option value="email">email</option>
                <option value="phone">phone</option>
              </select>
            </label>
            <button type="submit">Queue inquiry test</button>
          </form>
        </div>
      )}
    </div>
  )
}
