import { getBookingNextAction, getBookingState } from './booking-state'
import type { MeetingRecord, Prospect } from '@/lib/types'

export function getNextAction(prospect: Prospect, meeting?: MeetingRecord) {
  if (prospect.pipelineStage === 'call_queued') return 'Call now'
  if (prospect.pipelineStage === 'called') return 'Log follow-up plan'
  if (prospect.pipelineStage === 'follow_up_sent' || prospect.pipelineStage === 'meeting_booked') {
    return getBookingNextAction(getBookingState(prospect, meeting))
  }
  if (prospect.pipelineStage === 'proposal_sent') return 'Hold until payment decision'
  if (prospect.pipelineStage === 'paid') return 'Onboarding next'
  if (prospect.pipelineStage === 'closed_lost') return 'No action'
  return 'Review account'
}
