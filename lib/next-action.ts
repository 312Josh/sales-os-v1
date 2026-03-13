import type { MeetingRecord, Prospect } from '@/lib/types'

export function getNextAction(prospect: Prospect, meeting?: MeetingRecord) {
  if (prospect.pipelineStage === 'call_queued') return 'Call now'
  if (prospect.pipelineStage === 'called') return 'Log follow-up plan'
  if (prospect.pipelineStage === 'follow_up_sent') return meeting ? 'Wait for booking' : 'Send booking handoff'
  if (prospect.pipelineStage === 'meeting_booked') return 'Prepare discovery call'
  if (prospect.pipelineStage === 'proposal_sent') return 'Hold until payment decision'
  if (prospect.pipelineStage === 'paid') return 'Onboarding next'
  if (prospect.pipelineStage === 'closed_lost') return 'No action'
  return 'Review account'
}
