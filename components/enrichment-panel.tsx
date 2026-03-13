import type { Prospect } from '@/lib/types'

export function EnrichmentPanel({ prospect }: { prospect: Prospect }) {
  return (
    <div className="card compact-card">
      <h3 style={{ marginTop: 0 }}>Enrichment context</h3>
      <div className="stack">
        <div><strong>Enrichment summary:</strong><div className="muted">{prospect.enrichmentSummary || 'No enrichment summary yet.'}</div></div>
        <div className="row">
          {prospect.employeeBand ? <span className="badge">Team {prospect.employeeBand}</span> : null}
          {prospect.serviceArea ? <span className="badge">Area {prospect.serviceArea}</span> : null}
          {prospect.responseRisk ? <span className="badge">Response risk {prospect.responseRisk}</span> : null}
          <span className="badge">Booking {prospect.hasOnlineBooking ? 'present' : 'missing'}</span>
        </div>
        <div><strong>Owner evidence:</strong><div className="muted">{prospect.ownerEvidence || prospect.ownerOperatedSignal}</div></div>
        <div><strong>Local proof:</strong><div className="muted">{prospect.localProofSummary || 'Not captured yet.'}</div></div>
        <div><strong>Ideal pitch angle:</strong><div className="muted">{prospect.idealPitchAngle || prospect.priorityReason}</div></div>
        <div><strong>Suggested opener:</strong><div className="muted">{prospect.callOpener || prospect.outreachHook}</div></div>
      </div>
    </div>
  )
}
