import type { CallOutcome, PipelineStage } from './types'

export const QUICK_NEXT_STEPS = [
  'Call back tomorrow morning',
  'Send follow-up recap',
  'Send booking handoff',
  'Waiting on prospect reply',
  'No further action',
] as const

export function getDefaultNextStep(outcome: CallOutcome) {
  const map: Record<CallOutcome, string> = {
    no_answer: 'Call back tomorrow morning',
    left_voicemail: 'Call back tomorrow afternoon',
    gatekeeper: 'Try alternate contact path',
    wrong_number: 'No further action',
    spoke_with_owner: 'Send follow-up recap',
    spoke_with_staff: 'Call back for owner',
    interested: 'Send booking handoff',
    not_interested: 'No further action',
    send_info: 'Send follow-up recap',
    book_meeting: 'Waiting on booking completion',
    follow_up_later: 'Call back next week',
  }
  return map[outcome]
}

export function getStageForOutcome(outcome: CallOutcome): PipelineStage {
  const stageMap: Record<CallOutcome, PipelineStage> = {
    no_answer: 'called',
    left_voicemail: 'called',
    gatekeeper: 'called',
    wrong_number: 'closed_lost',
    spoke_with_owner: 'called',
    spoke_with_staff: 'called',
    interested: 'follow_up_sent',
    not_interested: 'closed_lost',
    send_info: 'follow_up_sent',
    book_meeting: 'meeting_booked',
    follow_up_later: 'called',
  }
  return stageMap[outcome]
}
