"use client"

import { Phone, Send, Calendar, AlertTriangle, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Prospect, CallLog, FollowUpDraft, MeetingRecord } from "@/lib/types"
import { getBookingState } from "@/lib/booking-state"
import { computeCompositeGrade, getGradeColor } from "@/lib/composite-grade"

type FocusAction = {
  prospect: Prospect
  action: string
  reason: string
  priority: number
  icon: typeof Phone
  color: string
}

function buildFocusActions(
  prospects: Prospect[],
  calls: CallLog[],
  followUps: FollowUpDraft[],
  meetings: MeetingRecord[]
): FocusAction[] {
  const actions: FocusAction[] = []

  for (const prospect of prospects) {
    const prospectCalls = calls.filter(c => c.prospectId === prospect.id)
    const prospectFollowUps = followUps.filter(f => f.prospectId === prospect.id)
    const meeting = meetings.find(m => m.prospectId === prospect.id)
    const bookingState = getBookingState(prospect, meeting)
    const latestCall = prospectCalls.sort((a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime())[0]
    const latestFollowUp = prospectFollowUps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

    // Prospects in call queue — only show A and B grades
    if (prospect.pipelineStage === "call_queued") {
      const grade = computeCompositeGrade(prospect, calls)
      if (grade !== 'A' && grade !== 'B') continue
      actions.push({
        prospect,
        action: "Call now",
        reason: prospect.priorityReason?.slice(0, 80) || prospect.outreachHook?.slice(0, 80) || "Queued for outreach",
        priority: grade === 'A' ? 200 + prospect.priorityScore : 100 + prospect.priorityScore,
        icon: Phone,
        color: grade === 'A' ? "text-red-600" : "text-orange-600",
      })
      continue
    }

    // Booking sent but not yet booked — nudge
    if (bookingState === "sent" || bookingState === "awaiting_booking") {
      const meetingSentAt = meeting?.proposedTime || meeting?.bookedTime
      actions.push({
        prospect,
        action: "Follow up on booking",
        reason: `Booking link sent — no confirmation yet`,
        priority: 90,
        icon: Calendar,
        color: "text-violet-600",
      })
      continue
    }

    // Called but no follow-up sent yet
    if (prospect.pipelineStage === "called" && !latestFollowUp) {
      actions.push({
        prospect,
        action: "Send follow-up",
        reason: `Called (${latestCall?.outcome?.replace(/_/g, " ") || "unknown"}) — no follow-up yet`,
        priority: 85,
        icon: Send,
        color: "text-blue-600",
      })
      continue
    }

    // Follow-up sent but stale (>24h)
    if (prospect.pipelineStage === "follow_up_sent" && latestFollowUp) {
      const ageHours = (Date.now() - new Date(latestFollowUp.createdAt).getTime()) / 36e5
      if (ageHours > 24) {
        actions.push({
          prospect,
          action: "Re-engage",
          reason: `Follow-up sent ${Math.round(ageHours)}h ago — no response`,
          priority: 70 + Math.min(ageHours, 30),
          icon: AlertTriangle,
          color: "text-amber-600",
        })
      }
    }
  }

  // Sort by priority desc, take top 5
  actions.sort((a, b) => b.priority - a.priority)
  return actions.slice(0, 5)
}

export function TodaysFocus({
  prospects,
  calls,
  followUps,
  meetings,
}: {
  prospects: Prospect[]
  calls: CallLog[]
  followUps: FollowUpDraft[]
  meetings: MeetingRecord[]
}) {
  const actions = buildFocusActions(prospects, calls, followUps, meetings)

  if (actions.length === 0) return null

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-sales-900 mb-3 flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-blue-600" />
        Today&apos;s Focus
      </h2>
      <div className="space-y-2">
        {actions.map((item, idx) => {
          const Icon = item.icon
          const grade = computeCompositeGrade(item.prospect, calls)
          const gradeColor = getGradeColor(grade)
          return (
            <Card key={`${item.prospect.id}-${idx}`} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <Badge className={`text-[11px] font-bold px-2 py-0.5 ${gradeColor} shrink-0`}>{grade}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-sales-900 truncate">{item.prospect.businessName}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 shrink-0">{item.prospect.assignedRep}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{item.reason}</p>
                </div>
                <div className="shrink-0">
                  {item.icon === Phone && item.prospect.phone ? (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8 px-3 rounded-lg" asChild>
                      <a href={`tel:${item.prospect.phone}`}>
                        <Phone className="w-3 h-3 mr-1" /> Call
                      </a>
                    </Button>
                  ) : (
                    <span className={`text-xs font-medium ${item.color}`}>{item.action}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
