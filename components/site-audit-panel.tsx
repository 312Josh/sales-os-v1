import { runProspectSiteAudit } from '@/lib/data'
import type { Prospect } from '@/lib/types'

function formatMs(value?: number) {
  if (value === undefined) return '—'
  return `${Math.round(value)} ms`
}

function formatCls(value?: number) {
  if (value === undefined) return '—'
  return value.toFixed(2)
}

export function SiteAuditPanel({ prospect }: { prospect: Prospect }) {
  return (
    <div className="card compact-card">
      <h3 style={{ marginTop: 0 }}>SEO / site health audit</h3>
      <div className="stack">
        <div className="muted">
          Lightweight audit for Monday-call wedges: PageSpeed + on-page scan + internal link check. No paid dependencies because I enjoy not being blocked by missing keys.
        </div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <span className="badge">Status: {prospect.siteAuditStatus || 'not_started'}</span>
          <span className="badge">Grade: {prospect.siteHealthGrade || '—'}</span>
          <span className="badge">PageSpeed: {prospect.pagespeedScore ?? '—'}</span>
          <span className="badge">LCP: {formatMs(prospect.lcpMs)}</span>
          <span className="badge">CLS: {formatCls(prospect.clsScore)}</span>
        </div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <span className="badge">Broken links: {prospect.brokenLinksCount ?? '—'}</span>
          <span className="badge">Missing meta: {prospect.missingMetaCount ?? '—'}</span>
          <span className="badge">Missing alt: {prospect.missingAltCount ?? '—'}</span>
        </div>
        <div><strong>Summary:</strong><div className="muted">{prospect.siteAuditSummary || 'No site audit run yet.'}</div></div>
        <div><strong>Audited at:</strong><div className="muted">{prospect.siteAuditAt || 'Not yet run'}</div></div>
        <form action={runProspectSiteAudit}>
          <input type="hidden" name="prospectId" value={prospect.id} />
          <button type="submit">Run site audit now</button>
        </form>
      </div>
    </div>
  )
}
