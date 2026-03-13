import { getBookingState } from './booking-state'
import { getFollowUpState } from './follow-up-state'
import type { CallLog, FollowUpDraft, MeetingRecord, Prospect } from './types'

export function getPriorityWeight(prospect: Prospect, calls: CallLog[], followUps: FollowUpDraft[], meetings: MeetingRecord[]) {
  const followUpState = getFollowUpState(prospect, calls, followUps)
  const meeting = meetings.find((item) => item.prospectId === prospect.id)
  const bookingState = getBookingState(prospect, meeting)

  let score = prospect.priorityScore * 10

  if (followUpState === 'stale_follow_up') score += 100
  if (followUpState === 'needs_rep_follow_up') score += 70
  if (followUpState === 'waiting_on_prospect') score += 20

  if (bookingState === 'awaiting_booking') score += 40
  if (bookingState === 'booked') score += 30
  if (prospect.pipelineStage === 'call_queued') score += 50
  if (prospect.pipelineStage === 'called') score += 40
  if (prospect.pipelineStage === 'follow_up_sent') score += 35
  if (prospect.pipelineStage === 'meeting_booked') score += 25

  return score
}

export function getPriorityReasonLine(prospect: Prospect, calls: CallLog[], followUps: FollowUpDraft[], meetings: MeetingRecord[]) {
  const followUpState = getFollowUpState(prospect, calls, followUps)
  const meeting = meetings.find((item) => item.prospectId === prospect.id)
  const bookingState = getBookingState(prospect, meeting)
  return `${prospect.priorityReason} Follow-up: ${followUpState}. Booking: ${bookingState}.`
}
