"use client"

import { useState } from "react"
import { AlertTriangle, Clock, User, UserCheck, ChevronDown, ChevronUp, Phone, MessageSquare, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { CallLog, FollowUpDraft, Prospect } from "@/lib/types"

type StaleItem = {
  prospect: Prospect
  lastFollowUp: FollowUpDraft | undefined
  lastCall: CallLog | undefined
  ageHours: number
  owner: "rep" | "prospect"
  urgency: "overdue" | "due_now" | "aging"
}

function classifyStaleItems(
  prospects: Prospect[],
  calls: CallLog[],
  followUps: FollowUpDraft[]
): StaleItem[] {
  const items: StaleItem[] = []

  for (const prospect of prospects) {
    // Only care about called / follow_up_sent stages
    if (prospect.pipelineStage !== "called" && prospect.pipelineStage !== "follow_up_sent") continue

    const prospectFollowUps = followUps
      .filter((f) => f.prospectId === prospect.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const prospectCalls = calls
      .filter((c) => c.prospectId === prospect.id)
      .sort((a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime())

    const lastFollowUp = prospectFollowUps[0]
    const lastCall = prospectCalls[0]

    // Calculate age from latest activity
    const latestTimestamp = lastFollowUp
      ? Math.max(new Date(lastFollowUp.createdAt).getTime(), lastCall ? new Date(lastCall.calledAt).getTime() : 0)
      : lastCall
      ? new Date(lastCall.calledAt).getTime()
      : 0

    if (!latestTimestamp) continue
    const ageHours = (Date.now() - latestTimestamp) / 36e5

    // Skip if recent (< 12 hours)
    if (ageHours < 12) continue

    // Determine owner
    const isWaitingOnProspect =
      lastCall?.outcome === "interested" ||
      lastCall?.outcome === "send_info" ||
      lastCall?.outcome === "book_meeting" ||
      prospect.pipelineStage === "follow_up_sent"
    const owner: "rep" | "prospect" = isWaitingOnProspect ? "prospect" : "rep"

    // Urgency tiers
    let urgency: "overdue" | "due_now" | "aging"
    if (ageHours >= 48) urgency = "overdue"
    else if (ageHours >= 24) urgency = "due_now"
    else urgency = "aging"

    items.push({ prospect, lastFollowUp, lastCall, ageHours, owner, urgency })
  }

  // Sort: overdue first, then due_now, then aging; within each tier, rep-owned first
  const urgencyWeight = { overdue: 0, due_now: 1, aging: 2 }
  const ownerWeight = { rep: 0, prospect: 1 }
  items.sort((a, b) => {
    const uw = urgencyWeight[a.urgency] - urgencyWeight[b.urgency]
    if (uw !== 0) return uw
    const ow = ownerWeight[a.owner] - ownerWeight[b.owner]
    if (ow !== 0) return ow
    return b.ageHours - a.ageHours
  })

  return items
}

const URGENCY_STYLES = {
  overdue: "bg-red-50 border-red-200 text-red-700",
  due_now: "bg-amber-50 border-amber-200 text-amber-700",
  aging: "bg-slate-50 border-slate-200 text-slate-600",
}

const URGENCY_BADGE = {
  overdue: "bg-red-500 text-white",
  due_now: "bg-amber-500 text-white",
  aging: "bg-slate-400 text-white",
}

const URGENCY_LABEL = {
  overdue: "Overdue",
  due_now: "Due Now",
  aging: "Aging",
}

function formatAge(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
}

export function StaleFollowUpWedge({
  prospects,
  calls,
  followUps,
}: {
  prospects: Prospect[]
  calls: CallLog[]
  followUps: FollowUpDraft[]
}) {
  const [collapsed, setCollapsed] = useState(false)
  const items = classifyStaleItems(prospects, calls, followUps)

  if (items.length === 0) return null

  const overdueCount = items.filter((i) => i.urgency === "overdue").length
  const dueNowCount = items.filter((i) => i.urgency === "due_now").length
  const repOwned = items.filter((i) => i.owner === "rep").length

  return (
    <div className="mb-6">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="font-bold text-sm text-amber-800">
            Follow-Up Attention ({items.length})
          </span>
          {overdueCount > 0 && (
            <Badge className="text-[10px] bg-red-500 text-white border-0">{overdueCount} overdue</Badge>
          )}
          {dueNowCount > 0 && (
            <Badge className="text-[10px] bg-amber-500 text-white border-0">{dueNowCount} due now</Badge>
          )}
          {repOwned > 0 && (
            <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">{repOwned} need rep action</Badge>
          )}
        </div>
        {collapsed ? <ChevronDown className="w-4 h-4 text-amber-500" /> : <ChevronUp className="w-4 h-4 text-amber-500" />}
      </button>

      {/* Items */}
      {!collapsed && (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <Card key={item.prospect.id} className={`border ${URGENCY_STYLES[item.urgency]}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">{item.prospect.businessName}</span>
                      <Badge className={`text-[9px] px-1.5 py-0 ${URGENCY_BADGE[item.urgency]} border-0`}>
                        {URGENCY_LABEL[item.urgency]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatAge(item.ageHours)} since last touch
                      </span>
                      <span className="flex items-center gap-1">
                        {item.owner === "rep" ? (
                          <><User className="w-3 h-3 text-red-500" /> Waiting on {item.prospect.assignedRep}</>
                        ) : (
                          <><UserCheck className="w-3 h-3 text-blue-500" /> Waiting on prospect</>
                        )}
                      </span>
                    </div>
                    {item.lastCall && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Last outcome: {item.lastCall.outcome.replace(/_/g, " ")}
                        {item.lastCall.nextStep ? ` → ${item.lastCall.nextStep}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {item.prospect.phone && (
                      <Button size="sm" variant="outline" className="text-xs h-8 px-2 rounded-lg" asChild>
                        <a href={`tel:${item.prospect.phone}`}>
                          <Phone className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
