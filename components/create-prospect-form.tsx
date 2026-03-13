import { createProspect, importProspects } from '@/lib/data'

export function CreateProspectForm({ markets, niches }: { markets: string[]; niches: string[] }) {
  return (
    <div className="stack">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Create prospect</h3>
        <form action={createProspect} className="stack">
          <div className="row">
            <label style={{ flex: 1 }}>Business name<input name="businessName" required /></label>
            <label style={{ flex: 1 }}>Phone<input name="phone" required /></label>
          </div>
          <div className="row">
            <label style={{ flex: 1 }}>Market<select name="market">{markets.map((market) => <option key={market}>{market}</option>)}</select></label>
            <label style={{ flex: 1 }}>Niche<select name="niche">{niches.map((niche) => <option key={niche}>{niche}</option>)}</select></label>
          </div>
          <div className="row">
            <label style={{ flex: 1 }}>City<input name="city" /></label>
            <label style={{ flex: 1 }}>Suburb<input name="suburb" /></label>
            <label style={{ flex: 1 }}>Assigned rep<select name="assignedRep"><option>Josh</option><option>Paul</option></select></label>
          </div>
          <label>Website<input name="website" /></label>
          <label>Decision maker<input name="decisionMaker" /></label>
          <label>Weak site signal<input name="weakSiteSignal" /></label>
          <label>Weak intake signal<input name="weakIntakeSignal" /></label>
          <label>Audit summary<textarea name="auditSummary" /></label>
          <label>Outreach hook<textarea name="outreachHook" /></label>
          <label>Notes<textarea name="notes" /></label>
          <button type="submit">Add prospect</button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Import prospects (JSON array)</h3>
        <form action={importProspects} className="stack">
          <label>
            JSON
            <textarea name="json" placeholder='[{"businessName":"...","market":"Field Service", ...}]' />
          </label>
          <button className="secondary" type="submit">Import JSON</button>
        </form>
      </div>
    </div>
  )
}
