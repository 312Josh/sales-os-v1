import type { MeetingRecord, Prospect } from './types'

export type BookingState = 'not_sent' | 'sent' | 'awaiting_booking' | 'booked' | 'completed'

export function getBookingState(prospect: Prospect, meeting?: MeetingRecord): BookingState {
  if (!meeting) return 'not_sent'
  if (meeting.status === 'completed') return 'completed'
  if (meeting.status === 'booked') return 'booked'
  if (meeting.status === 'booking_sent' && prospect.pipelineStage === 'meeting_booked') return 'awaiting_booking'
  return 'sent'
}

export function getBookingStateLabel(state: BookingState) {
  const labels: Record<BookingState, string> = {
    not_sent: 'Booking not sent',
    sent: 'Booking sent',
    awaiting_booking: 'Awaiting booking',
    booked: 'Booked',
    completed: 'Completed',
  }
  return labels[state]
}

export function getBookingNextAction(state: BookingState) {
  const actions: Record<BookingState, string> = {
    not_sent: 'Send booking handoff',
    sent: 'Confirm prospect received link',
    awaiting_booking: 'Wait for booking completion',
    booked: 'Prepare discovery call',
    completed: 'Advance post-meeting follow-up',
  }
  return actions[state]
}
