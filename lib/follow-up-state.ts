import type { CallLog, FollowUpDraft, Prospect } from '@/lib/types'

export type FollowUpState = 'needs_rep_follow_up' | 'waiting_on_prospect' | 'stale_follow_up' | 'clear'

export function getLatestCall(calls: CallLog[], prospectId: string) {
  return calls.filter((call) => call.prospectId === prospectId).sort((a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime())[0]
}

export function getLatestFollowUp(followUps: FollowUpDraft[], prospectId: string) {
  return followUps.filter((item) => item.prospectId === prospectId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
}

export function getFollowUpState(prospect: Prospect, calls: CallLog[], followUps: FollowUpDraft[]): FollowUpState {
  const latestCall = getLatestCall(calls, prospect.id)
  const latestFollowUp = getLatestFollowUp(followUps, prospect.id)

  if (prospect.pipelineStage !== 'called' && prospect.pipelineStage !== 'follow_up_sent') {
    return 'clear'
  }

  if (prospect.pipelineStage === 'called') {
    return 'needs_rep_follow_up'
  }

  if (!latestFollowUp) {
    return 'stale_follow_up'
  }

  const ageHours = (Date.now() - new Date(latestFollowUp.createdAt).getTime()) / 36e5
  if (ageHours > 24) {
    return 'stale_follow_up'
  }

  if (latestCall?.outcome === 'interested' || latestCall?.outcome === 'send_info') {
    return 'waiting_on_prospect'
  }

  return 'needs_rep_follow_up'
}

export function getFollowUpLabel(state: FollowUpState) {
  const labels: Record<FollowUpState, string> = {
    needs_rep_follow_up: 'Needs rep follow-up',
    waiting_on_prospect: 'Waiting on prospect',
    stale_follow_up: 'Stale follow-up',
    clear: 'Clear',
  }
  return labels[state]
}
