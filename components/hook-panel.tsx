import { getCommercialRiskLine, getTalkTrack, getWhyThisMatters } from '@/lib/hook-generation'
import type { Prospect } from '@/lib/types'

export function HookPanel({ prospect }: { prospect: Prospect }) {
  return (
    <div className="card compact-card">
      <h3 style={{ marginTop: 0 }}>Audit + outreach hooks</h3>
      <div className="stack">
        <div><strong>Why this matters:</strong><div className="muted">{getWhyThisMatters(prospect)}</div></div>
        <div><strong>Commercial risk:</strong><div className="muted">{getCommercialRiskLine(prospect)}</div></div>
        <div><strong>Suggested talk track:</strong><div className="muted">{getTalkTrack(prospect)}</div></div>
      </div>
    </div>
  )
}
