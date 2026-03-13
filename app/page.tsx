import { ProspectDetail } from '@/components/prospect-detail'
import { FollowUpPanel } from '@/components/follow-up-panel'
import { CommandRail } from '@/components/command-rail'
import { SecondaryInsights } from '@/components/secondary-insights'
import { FollowUpQueue } from '@/components/follow-up-queue'
import { getSalesOsData } from '@/lib/data'

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

  return (
    <main className="page">
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ marginBottom: 8 }}>Call-Centered Sales OS v1</h1>
        <div className="muted">Rep workflow shell for Josh and Paul — queue first, context first, fast logging first.</div>
        <div className="row" style={{ marginTop: 10 }}>
          <a href="/prospects"><button type="button" className="secondary">Open Prospect Ops</button></a>
        </div>
      </div>


      <CommandRail prospects={data.prospects} meetings={data.meetings} calls={data.calls} followUps={data.followUps} />
      <FollowUpQueue prospects={data.prospects} calls={data.calls} followUps={data.followUps} meetings={data.meetings} />

      <div className="kpis">
        <div className="kpi"><div className="muted">Queued calls</div><strong>{queuedCount}</strong></div>
        <div className="kpi"><div className="muted">Follow-up sent</div><strong>{followUpCount}</strong></div>
        <div className="kpi"><div className="muted">Meetings booked</div><strong>{meetingCount}</strong></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr' }}>
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
        </div>
        <div className="stack">
          {selectedProspect ? <ProspectDetail prospect={selectedProspect} calls={calls} /> : <div className="card">No prospects loaded.</div>}
          {selectedProspect ? <FollowUpPanel prospect={selectedProspect} followUps={followUps} meeting={meeting} proposal={proposal} /> : null}
        </div>
        <div>
          <SecondaryInsights calls={data.calls} followUps={data.followUps} meetings={data.meetings} prospects={data.prospects} />
        </div>
      </div>
    </main>
  )
}
