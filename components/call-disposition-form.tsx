import { logCallOutcome } from '@/lib/data'
import { getDefaultNextStep, QUICK_NEXT_STEPS } from '@/lib/next-step'
import type { Prospect } from '@/lib/types'

const outcomes = [
  'no_answer','left_voicemail','gatekeeper','wrong_number','spoke_with_owner','spoke_with_staff','interested','not_interested','send_info','book_meeting','follow_up_later'
] as const

export function CallDispositionForm({ prospect }: { prospect: Prospect }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Fast call outcome logger</h3>
      <div className="muted" style={{ marginBottom: 12 }}>Log the result fast, keep the next step structured, move on.</div>
      <form action={logCallOutcome} className="stack">
        <input type="hidden" name="prospectId" value={prospect.id} />
        <label>
          Outcome
          <select name="outcome" defaultValue="no_answer">
            {outcomes.map((outcome) => <option key={outcome} value={outcome}>{outcome}</option>)}
          </select>
        </label>
        <label>
          Structured next step
          <select name="nextStep" defaultValue={getDefaultNextStep('no_answer')}>
            {QUICK_NEXT_STEPS.map((step) => <option key={step} value={step}>{step}</option>)}
          </select>
        </label>
        <label>
          Call notes
          <textarea name="notes" placeholder="Short note only if it matters." />
        </label>
        <button type="submit">Log call + next step</button>
      </form>
    </div>
  )
}
