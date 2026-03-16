import { getSalesOsData } from '@/lib/data'
import { CallQueue } from '@/components/call-queue'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const data = await getSalesOsData()
  const queue = [...data.prospects].sort((a, b) => b.priorityScore - a.priorityScore)
  const queuedCount = data.prospects.filter(p => p.pipelineStage === 'call_queued').length
  const followUpCount = data.prospects.filter(p => p.pipelineStage === 'follow_up_sent').length
  const meetingCount = data.prospects.filter(p => p.pipelineStage === 'meeting_booked').length
  const totalCount = data.prospects.length

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Prospects</p>
          <p className="text-2xl font-bold text-sales-900 mt-0.5">{totalCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Queued Calls</p>
          <p className="text-2xl font-bold text-blue-600 mt-0.5">{queuedCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Follow-ups Sent</p>
          <p className="text-2xl font-bold text-amber-600 mt-0.5">{followUpCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Meetings Booked</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">{meetingCount}</p>
        </div>
      </div>

      {/* Call Queue */}
      <CallQueue prospects={queue} />
    </main>
  )
}
