"use client"

import { Phone, MessageSquare, Eye, Mail, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Prospect } from "@/lib/types"

function isCallReady(prospect: Prospect): boolean {
  return (
    prospect.contactStatus === 'replied' ||
    !!prospect.proofViewedAt ||
    !!prospect.emailClickedAt ||
    prospect.pipelineStage === 'meeting_booked'
  )
}

function getEngagementSignals(prospect: Prospect): { label: string; icon: typeof Phone; color: string }[] {
  const signals: { label: string; icon: typeof Phone; color: string }[] = []
  if (prospect.contactStatus === 'replied') {
    signals.push({ label: 'Replied to SMS', icon: MessageSquare, color: 'bg-green-500 text-white' })
  }
  if (prospect.proofViewedAt) {
    signals.push({ label: `Viewed proof${prospect.proofViewCount && prospect.proofViewCount > 1 ? ` (${prospect.proofViewCount}x)` : ''}`, icon: Eye, color: 'bg-blue-500 text-white' })
  }
  if (prospect.emailClickedAt) {
    signals.push({ label: 'Clicked email', icon: Mail, color: 'bg-violet-500 text-white' })
  }
  if (prospect.emailOpenedAt && !prospect.emailClickedAt) {
    signals.push({ label: 'Opened email', icon: Mail, color: 'bg-violet-300 text-white' })
  }
  return signals
}

export function CallReadySection({ prospects }: { prospects: Prospect[] }) {
  const callReady = prospects.filter(isCallReady)

  if (callReady.length === 0) return null

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-sales-900 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-green-500" />
        📞 Call Ready — Engaged Prospects ({callReady.length})
      </h2>
      <div className="space-y-2">
        {callReady.map((prospect) => {
          const signals = getEngagementSignals(prospect)
          return (
            <Card key={prospect.id} className="border-green-200 bg-green-50/30 hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-sales-900 truncate">{prospect.businessName}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 shrink-0">{prospect.assignedRep}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {signals.map((signal, idx) => {
                      const Icon = signal.icon
                      return (
                        <Badge key={idx} className={`text-[9px] px-1.5 py-0 ${signal.color} border-0`}>
                          <Icon className="w-2.5 h-2.5 mr-0.5" />
                          {signal.label}
                        </Badge>
                      )
                    })}
                  </div>
                  {prospect.decisionMaker && (
                    <p className="text-xs text-slate-500 mt-1">{prospect.decisionMaker}{prospect.decisionMakerTitle ? ` · ${prospect.decisionMakerTitle}` : ''}</p>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {prospect.phone && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white text-xs h-9 px-4 rounded-lg" asChild>
                      <a href={`tel:${prospect.phone}`}>
                        <Phone className="w-3 h-3 mr-1" /> Call Now
                      </a>
                    </Button>
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
