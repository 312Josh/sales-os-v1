import { CreateProspectForm } from '@/components/create-prospect-form'
import { getSalesOsData } from '@/lib/data'

export default async function ProspectOpsPage() {
  const data = await getSalesOsData()

  return (
    <main className="page">
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ marginBottom: 8 }}>Prospect Ops</h1>
        <div className="muted">Add and import prospects without cluttering the live rep operating surface.</div>
      </div>
      <CreateProspectForm markets={data.markets} niches={data.niches} />
    </main>
  )
}
