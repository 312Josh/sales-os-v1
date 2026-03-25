import { getSalesOsData } from '@/lib/data'
import { notFound } from 'next/navigation'
import { buildOutreachTemplates } from '@/lib/outreach-copy'

export const dynamic = 'force-dynamic'

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default async function ProofPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getSalesOsData()
  const prospect = data.prospects.find((p) => slugify(p.businessName) === slug || p.id === slug)

  if (!prospect) return notFound()

  const outreach = buildOutreachTemplates(prospect)

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

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-sales-900">Website preview</p>
              <p className="text-xs text-slate-500 mt-1">Live proof screenshot used in outreach</p>
            </div>
            <div className="bg-slate-50 p-4">
              <img
                src={outreach.screenshotUrl}
                alt={`${prospect.businessName} website proof preview`}
                className="w-full rounded-xl border border-slate-200 bg-white object-contain"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-sales-900">Preview link</p>
              <a href={outreach.proofUrl} className="mt-2 block break-all text-sm text-blue-600 hover:underline">
                {outreach.proofUrl}
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-sales-900">Outreach email</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">Subject</p>
              <p className="mt-1 text-sm text-slate-800">{outreach.emailSubject}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{outreach.emailBody}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
