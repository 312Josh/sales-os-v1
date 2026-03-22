import { getSalesOsData } from '@/lib/data'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default async function ProofPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getSalesOsData()
  const prospect = data.prospects.find((p) => slugify(p.businessName) === slug || p.id === slug)

  if (!prospect) return notFound()

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-slate-500">CoGrow Proof</p>
          <h1 className="text-3xl font-bold text-sales-900 mt-1">{prospect.businessName}</h1>
          <p className="text-slate-600 mt-2">Why this business is a strong outreach target.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold text-sales-900 mb-2">Website</h2>
            <a href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
              {prospect.website}
            </a>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold text-sales-900 mb-2">Opportunity Summary</h2>
            <p className="text-slate-700 text-sm">{prospect.siteAuditSummary || prospect.priorityReason || prospect.notes || 'Proof assets are being prepared.'}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Site Grade</div>
            <div className="text-2xl font-bold text-sales-900 mt-1">{prospect.siteHealthGrade || '—'}</div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Priority</div>
            <div className="text-2xl font-bold text-sales-900 mt-1">{prospect.priorityScore}</div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Market</div>
            <div className="text-2xl font-bold text-sales-900 mt-1">{prospect.marketTag || prospect.market || '—'}</div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
          <p className="font-medium">Proof assets route is now live.</p>
          <p className="text-sm mt-2">Screenshot/video blocks can render here as those URLs are added to the prospect record.</p>
        </div>
      </div>
    </main>
  )
}
