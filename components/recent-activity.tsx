import type { ActivityItem, Prospect } from '@/lib/types'

function relativeTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function RecentActivity({
  activity,
  prospects,
}: {
  activity: ActivityItem[]
  prospects: Prospect[]
}) {
  const prospectById = new Map(prospects.map((p) => [p.id, p]))

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-sales-900">Recent Activity</h2>
        <span className="text-xs text-slate-400">Last 50 events</span>
      </div>

      <div className="space-y-3">
        {activity.length === 0 ? (
          <div className="text-sm text-slate-500">No activity yet.</div>
        ) : (
          activity.slice(0, 20).map((item) => {
            const prospect = prospectById.get(item.prospectId)
            return (
              <div key={item.id} className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-sales-900 break-words">{item.summary}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {prospect?.businessName || item.prospectId}
                      {prospect?.assignedRep ? ` • ${prospect.assignedRep}` : ''}
                      {item.eventType ? ` • ${item.eventType}` : ''}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 shrink-0" title={new Date(item.createdAt).toLocaleString()}>
                    {relativeTime(item.createdAt)}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
