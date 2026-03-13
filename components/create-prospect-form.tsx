import { createProspect, importProspects } from '@/lib/data'

export function CreateProspectForm({ markets, niches }: { markets: string[]; niches: string[] }) {
  return (
    <details className="card" style={{ marginTop: 18 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Add or import prospects</summary>
      <div className="stack" style={{ marginTop: 16 }}>
        <div className="card" style={{ boxShadow: 'none', padding: 0 }}>
          <h3 style={{ marginTop: 0 }}>Create prospect</h3>
          <form action={createProspect} className="stack">
            <div className="row">
              <label style={{ flex: 1 }}>Business name<input name="businessName" required /></label>
              <label style={{ flex: 1 }}>Phone<input name="phone" required /></label>
            </div>
            <div className="row">
              <label style={{ flex: 1 }}>Market<select name="market">{markets.map((market) => <option key={market}>{market}</option>)}</select></label>
              <label style={{ flex: 1 }}>Niche<select name="niche">{niches.map((niche) => <option key={niche}>{niche}</option>)}</select></label>
              <label style={{ flex: 1 }}>Assigned rep<select name="assignedRep"><option>Josh</option><option>Paul</option></select></label>
            </div>
            <div className="row">
              <label style={{ flex: 1 }}>City<input name="city" /></label>
              <label style={{ flex: 1 }}>Suburb<input name="suburb" /></label>
            </div>
            <label>Weak intake signal<input name="weakIntakeSignal" /></label>
            <label>Outreach hook<textarea name="outreachHook" /></label>
            <button type="submit">Add prospect</button>
          </form>
        </div>

        <div className="card" style={{ boxShadow: 'none', padding: 0 }}>
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
    </details>
  )
}
