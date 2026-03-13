import type { InquiryTest, Prospect } from '@/lib/types'

export function ReportingPanel({ prospects, inquiryTests }: { prospects: Prospect[]; inquiryTests: InquiryTest[] }) {
  const byStage = prospects.reduce<Record<string, number>>((acc, prospect) => {
    acc[prospect.pipelineStage] = (acc[prospect.pipelineStage] || 0) + 1
    return acc
  }, {})

  const highPriority = prospects.filter((prospect) => prospect.priorityScore >= 4)
  const gradedTests = inquiryTests.filter((test) => test.grade)

  return (
    <div className="stack">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Checkpoint 3 reporting</h2>
        <div className="row">
          <span className="badge">High priority targets: {highPriority.length}</span>
          <span className="badge">Inquiry tests: {inquiryTests.length}</span>
          <span className="badge">Graded tests: {gradedTests.length}</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Pipeline by stage</h3>
        <div className="stack">
          {Object.entries(byStage).map(([stage, count]) => (
            <div key={stage} className="row" style={{ justifyContent: 'space-between' }}>
              <span>{stage}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Inquiry test architecture</h3>
        <div className="stack">
          {inquiryTests.map((test) => (
            <div key={test.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{test.prospectId}</strong>
              <div className="muted">Status: {test.testStatus}</div>
              <div className="muted">Grade: {test.grade || 'Unscored'}</div>
              <div className="muted">Response channel: {test.responseChannel || 'Pending'}</div>
              <div className="muted">Response time: {test.responseTimeMinutes ?? 'Pending'} minutes</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Scoring model preview</h3>
        <div className="stack">
          {highPriority.map((prospect) => (
            <div key={prospect.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
              <strong>{prospect.businessName}</strong>
              <div className="muted">Site {prospect.siteScore} • Intake {prospect.intakeScore} • Owner fit {prospect.ownerFitScore} • Offer fit {prospect.fitScore}</div>
              <div className="muted">Reason: {prospect.priorityReason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
