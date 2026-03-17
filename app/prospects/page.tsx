import { getSalesOsData } from '@/lib/data'
import { ProspectsTable } from '@/components/prospects-table'
import { CreateProspectForm } from '@/components/create-prospect-form'

export const dynamic = 'force-dynamic'

export default async function ProspectOpsPage() {
  const data = await getSalesOsData()

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-sales-900">Prospect Ops</h1>
        <p className="text-sm text-slate-500 mt-1">Manage, add, and import prospects. {data.prospects.length} total.</p>
      </div>

      <ProspectsTable prospects={data.prospects} />

      <div className="mt-8">
        <CreateProspectForm markets={data.markets} niches={data.niches} />
      </div>

      <footer className="mt-12 pb-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} <a href="https://cogrow.ai" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">CoGrow</a>. All rights reserved.
      </footer>
    </main>
  )
}
