import type { Prospect } from '@/lib/types'

export function QuickFilters({ prospects }: { prospects: Prospect[] }) {
  const byRep = {
    Josh: prospects.filter((p) => p.assignedRep === 'Josh').length,
    Paul: prospects.filter((p) => p.assignedRep === 'Paul').length,
  }

  const byStage = prospects.reduce<Record<string, number>>((acc, prospect) => {
    acc[prospect.pipelineStage] = (acc[prospect.pipelineStage] || 0) + 1
    return acc
  }, {})

  const needsAction = prospects.filter((p) => ['call_queued', 'called', 'follow_up_sent'].includes(p.pipelineStage)).length

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h2 style={{ marginTop: 0 }}>Quick filters</h2>
      <div className="stack">
        <div className="row">
          <span className="badge">Needs action today: {needsAction}</span>
          <span className="badge">Josh: {byRep.Josh}</span>
          <span className="badge">Paul: {byRep.Paul}</span>
        </div>
        <div className="row">
          {Object.entries(byStage).map(([stage, count]) => (
            <span key={stage} className="badge">{stage}: {count}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
