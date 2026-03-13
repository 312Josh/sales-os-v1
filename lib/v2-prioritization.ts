import { getBookingSyncStatus } from './booking-automation'
import { getFollowUpState } from './follow-up-state'
import type { CallLog, FollowUpDraft, MeetingRecord, Prospect } from './types'

export function getV2PriorityScore(prospect: Prospect, calls: CallLog[], followUps: FollowUpDraft[], meetings: MeetingRecord[]) {
  const followUpState = getFollowUpState(prospect, calls, followUps)
  const meeting = meetings.find((item) => item.prospectId === prospect.id)
  const bookingSync = getBookingSyncStatus(meeting)

  let score = prospect.priorityScore * 10
  score += prospect.fitScore * 8
  score += prospect.intakeScore * 6
  score += prospect.siteScore * 4
  if (prospect.responseRisk === 'low') score += 10
  if (prospect.responseRisk === 'high') score -= 5
  if (prospect.hasOnlineBooking === false) score += 8

  if (followUpState === 'stale_follow_up') score += 100
  if (followUpState === 'needs_rep_follow_up') score += 65
  if (followUpState === 'waiting_on_prospect') score += 20

  if (bookingSync === 'awaiting_calcom_completion') score += 35
  if (bookingSync === 'confirmed') score += 20
  if (bookingSync === 'complete') score -= 10

  return score
}

export function getV2PriorityLabel(prospect: Prospect, calls: CallLog[], followUps: FollowUpDraft[], meetings: MeetingRecord[]) {
  const score = getV2PriorityScore(prospect, calls, followUps, meetings)
  if (score >= 180) return 'Move now'
  if (score >= 130) return 'High leverage'
  if (score >= 90) return 'Active watch'
  return 'Lower urgency'
}
