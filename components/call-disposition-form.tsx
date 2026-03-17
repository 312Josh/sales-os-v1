"use client"

import { useState } from "react"
import { Phone, PhoneMissed, UserCheck, UserX, Send, Calendar, Clock, X, CheckCircle } from "lucide-react"
import { logCallOutcomeAction } from "@/lib/actions"
import { getDefaultNextStep, QUICK_NEXT_STEPS } from "@/lib/next-step"
import type { Prospect, CallOutcome } from "@/lib/types"

const OUTCOME_GROUPS = [
  {
    label: "No Contact",
    items: [
      { value: "no_answer" as CallOutcome, label: "No Answer", icon: PhoneMissed, color: "text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100" },
      { value: "left_voicemail" as CallOutcome, label: "Left VM", icon: Phone, color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100" },
      { value: "gatekeeper" as CallOutcome, label: "Gatekeeper", icon: UserX, color: "text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100" },
      { value: "wrong_number" as CallOutcome, label: "Wrong #", icon: X, color: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100" },
    ],
  },
  {
    label: "Made Contact",
    items: [
      { value: "spoke_with_owner" as CallOutcome, label: "Owner", icon: UserCheck, color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100" },
      { value: "spoke_with_staff" as CallOutcome, label: "Staff", icon: UserCheck, color: "text-sky-600 bg-sky-50 border-sky-200 hover:bg-sky-100" },
      { value: "interested" as CallOutcome, label: "Interested", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
      { value: "not_interested" as CallOutcome, label: "Not Interested", icon: X, color: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100" },
    ],
  },
  {
    label: "Next Step",
    items: [
      { value: "send_info" as CallOutcome, label: "Send Info", icon: Send, color: "text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100" },
      { value: "book_meeting" as CallOutcome, label: "Book Meeting", icon: Calendar, color: "text-green-600 bg-green-50 border-green-200 hover:bg-green-100" },
      { value: "follow_up_later" as CallOutcome, label: "Follow Up Later", icon: Clock, color: "text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100" },
    ],
  },
]

export function CallDispositionForm({ prospect }: { prospect: Prospect }) {
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const defaultNextStep = selectedOutcome ? getDefaultNextStep(selectedOutcome) : QUICK_NEXT_STEPS[0]
  const [nextStep, setNextStep] = useState(defaultNextStep)

  function handleOutcomeClick(outcome: CallOutcome) {
    setSelectedOutcome(outcome)
    setNextStep(getDefaultNextStep(outcome))
  }

  async function handleSubmit() {
    if (!selectedOutcome) return
    setSubmitting(true)
    await logCallOutcomeAction(prospect.id, selectedOutcome, notes, nextStep)
    setSelectedOutcome(null)
    setNotes("")
    setSubmitting(false)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h3 className="font-bold text-sm text-sales-900 mb-3">Log Call Outcome</h3>

      {/* Outcome tap grid */}
      <div className="space-y-3 mb-4">
        {OUTCOME_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{group.label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isSelected = selectedOutcome === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleOutcomeClick(item.value)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all min-h-[40px] ${
                      isSelected
                        ? "ring-2 ring-blue-500 border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                        : item.color
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Next step + notes (only show after outcome selected) */}
      {selectedOutcome && (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Next Step</label>
            <select
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {QUICK_NEXT_STEPS.map((step) => (
                <option key={step} value={step}>{step}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Notes <span className="text-slate-300 font-normal">(optional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Quick note if relevant..."
              rows={2}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors min-h-[44px]"
          >
            {submitting ? "Saving..." : `Log: ${selectedOutcome.replace(/_/g, " ")}`}
          </button>
        </div>
      )}
    </div>
  )
}
