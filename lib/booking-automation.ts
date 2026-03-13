import type { MeetingRecord, Prospect } from './types'

export function getBookingSyncStatus(meeting?: MeetingRecord) {
  if (!meeting) return 'not_started'
  if (meeting.status === 'completed') return 'complete'
  if (meeting.status === 'booked') return 'confirmed'
  if (meeting.status === 'booking_sent') return 'awaiting_calcom_completion'
  return 'pending'
}

export function getBookingAgingLabel(meeting?: MeetingRecord) {
  if (!meeting) return 'No booking handoff yet'
  const basis = meeting.bookedTime || meeting.proposedTime
  if (!basis) return 'Sent recently'
  const ageHours = (Date.now() - new Date(basis).getTime()) / 36e5
  if (ageHours > 48) return 'Needs booking follow-up'
  if (ageHours > 24) return 'Watch booking progress'
  return 'Fresh booking motion'
}

export function getBookingOpsLine(prospect: Prospect, meeting?: MeetingRecord) {
  const sync = getBookingSyncStatus(meeting)
  const aging = getBookingAgingLabel(meeting)
  return `${prospect.assignedRep} booking state: ${sync}. ${aging}.`
}
