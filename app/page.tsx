import { getSalesOsData } from '@/lib/data'
import { CallQueue } from '@/components/call-queue'
import { StaleFollowUpWedge } from '@/components/stale-followup-wedge'
import { TodaysFocus } from '@/components/todays-focus'
import { CallReadySection } from '@/components/call-ready'

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

      {/* Call Ready — engaged prospects go first */}
      <CallReadySection prospects={data.prospects} />

      {/* Today's Focus — top 5 actions ranked by priority */}
      <TodaysFocus prospects={data.prospects} calls={data.calls} followUps={data.followUps} meetings={data.meetings} />

      {/* Stale Follow-Up Wedge */}
      <StaleFollowUpWedge prospects={data.prospects} calls={data.calls} followUps={data.followUps} />

      {/* Call Queue */}
      <CallQueue prospects={queue} meetings={data.meetings} calls={data.calls} />

      {/* Footer */}
      <footer className="mt-12 pb-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} <a href="https://cogrow.ai" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">CoGrow</a>. All rights reserved.
      </footer>
    </main>
  )
}
