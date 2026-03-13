import { CreateProspectForm } from '@/components/create-prospect-form'
import { ProspectDetail } from '@/components/prospect-detail'
import { FollowUpPanel } from '@/components/follow-up-panel'
import { ReportingPanel } from '@/components/reporting-panel'
import { ActionCenter } from '@/components/action-center'
import { RecentActivity } from '@/components/recent-activity'
import { StageDiscipline } from '@/components/stage-discipline'
import { QuickFilters } from '@/components/quick-filters'
import { getSalesOsData } from '@/lib/data'
import { SALES_USERS } from '@/lib/users'

export default function Home({ searchParams }: { searchParams?: Promise<{ prospectId?: string }> }) {
  const resolvedParams = searchParams ? undefined : undefined
  void resolvedParams
  return <PageContent initialProspectIdPromise={searchParams} />
}

async function PageContent({ initialProspectIdPromise }: { initialProspectIdPromise?: Promise<{ prospectId?: string }> }) {
  const data = await getSalesOsData()
  const params = initialProspectIdPromise ? await initialProspectIdPromise : undefined
  const queue = [...data.prospects].sort((a, b) => b.priorityScore - a.priorityScore)
  const selectedProspect = queue.find((prospect) => prospect.id === params?.prospectId) ?? queue[0]
  const calls = data.calls.filter((call) => call.prospectId === selectedProspect?.id)
  const followUps = data.followUps.filter((item) => item.prospectId === selectedProspect?.id)
  const meeting = data.meetings.find((item) => item.prospectId === selectedProspect?.id)
  const proposal = data.proposals.find((item) => item.prospectId === selectedProspect?.id)
  const queuedCount = data.prospects.filter((prospect) => prospect.pipelineStage === 'call_queued').length
  const followUpCount = data.prospects.filter((prospect) => prospect.pipelineStage === 'follow_up_sent').length
  const meetingCount = data.prospects.filter((prospect) => prospect.pipelineStage === 'meeting_booked').length
  const paidCount = data.prospects.filter((prospect) => prospect.pipelineStage === 'paid').length
  const inquiryQueued = data.inquiryTests.filter((test) => test.testStatus !== 'not_started').length

  return (
    <main className="page">
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ marginBottom: 8 }}>Call-Centered Sales OS v1</h1>
        <div className="muted">Rep workflow shell for Josh and Paul — queue first, context first, fast logging first.</div>
      </div>


      <div className="card" style={{ marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>Active users</h2>
        <div className="row">
          {SALES_USERS.map((user) => (
            <div key={user.id} className="badge" style={{ padding: '10px 14px' }}>
              {user.name} • {user.role}
            </div>
          ))}
        </div>
      </div>

      <QuickFilters prospects={data.prospects} />

      <div className="kpis">
        <div className="kpi"><div className="muted">Queued calls</div><strong>{queuedCount}</strong></div>
        <div className="kpi"><div className="muted">Follow-up sent</div><strong>{followUpCount}</strong></div>
        <div className="kpi"><div className="muted">Meetings booked</div><strong>{meetingCount}</strong></div>
        <div className="kpi"><div className="muted">Paid deals</div><strong>{paidCount}</strong></div>
        <div className="kpi"><div className="muted">Inquiry tests</div><strong>{inquiryQueued}</strong></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 0.9fr 0.9fr 0.9fr 0.9fr' }}>
        <div className="stack">
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Daily call queue</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Why call now</th>
                  <th>Owner</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((prospect) => (
                  <tr key={prospect.id}>
                    <td>
                      <a href={`/?prospectId=${prospect.id}`}>
                        <strong>{prospect.businessName}</strong>
                        <div className="muted">{prospect.phone}</div>
                        <div className="muted">{prospect.city} • {prospect.niche}</div>
                      </a>
                    </td>
                    <td>
                      <div className="muted">{prospect.weakIntakeSignal}</div>
                      <div style={{ marginTop: 6 }}><span className="badge">Priority {prospect.priorityScore}</span></div>
                    </td>
                    <td>
                      <div>{prospect.assignedRep}</div>
                      <div className="muted">{prospect.decisionMaker || 'Unknown'}</div>
                    </td>
                    <td><span className="badge">{prospect.pipelineStage}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CreateProspectForm markets={data.markets} niches={data.niches} />
        </div>
        <div className="stack">
          {selectedProspect ? <ProspectDetail prospect={selectedProspect} calls={calls} /> : <div className="card">No prospects loaded.</div>}
          {selectedProspect ? <FollowUpPanel prospect={selectedProspect} followUps={followUps} meeting={meeting} proposal={proposal} /> : null}
        </div>
        <div>
          <ReportingPanel prospects={data.prospects} inquiryTests={data.inquiryTests} />
        </div>
        <div>
          <ActionCenter prospects={data.prospects} meetings={data.meetings} />
        </div>
        <div>
          <RecentActivity calls={data.calls} followUps={data.followUps} meetings={data.meetings} prospects={data.prospects} />
        </div>
        <div>
          <StageDiscipline prospects={data.prospects} meetings={data.meetings} />
        </div>
      </div>
    </main>
  )
}
