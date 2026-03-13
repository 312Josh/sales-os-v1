export type PipelineStage =
  | 'sourced'
  | 'audited'
  | 'call_queued'
  | 'called'
  | 'follow_up_sent'
  | 'meeting_booked'
  | 'proposal_sent'
  | 'paid'
  | 'closed_lost'

export type CallOutcome =
  | 'no_answer'
  | 'left_voicemail'
  | 'gatekeeper'
  | 'wrong_number'
  | 'spoke_with_owner'
  | 'spoke_with_staff'
  | 'interested'
  | 'not_interested'
  | 'send_info'
  | 'book_meeting'
  | 'follow_up_later'

export type InquiryTest = {
  id: string
  prospectId: string
  inquirySubmittedAt?: string
  firstResponseAt?: string
  responseChannel?: 'email' | 'sms' | 'phone' | 'web'
  responseTimeMinutes?: number
  grade?: 'A' | 'B' | 'C' | 'D'
  testStatus: 'not_started' | 'queued' | 'submitted' | 'graded'
}

export type Prospect = {
  employeeBand?: string
  serviceArea?: string
  hasOnlineBooking?: boolean
  responseRisk?: 'low' | 'medium' | 'high'
  ownerEvidence?: string
  localProofSummary?: string
  idealPitchAngle?: string
  callOpener?: string
  enrichmentSummary?: string
  id: string
  businessName: string
  market: string
  niche: string
  city: string
  suburb: string
  website: string
  phone: string
  contactFormUrl: string
  decisionMaker: string
  linkedInUrl: string
  weakSiteSignal: string
  weakIntakeSignal: string
  noChatSignal: boolean
  noBookingSignal: boolean
  ownerOperatedSignal: string
  auditSummary: string
  outreachHook: string
  siteScore: number
  intakeScore: number
  ownerFitScore: number
  fitScore: number
  priorityScore: number
  priorityReason: string
  pipelineStage: PipelineStage
  assignedRep: 'Josh' | 'Paul'
  notes: string
}

export type CallLog = {
  id: string
  prospectId: string
  outcome: CallOutcome
  notes: string
  calledAt: string
  nextStep: string
}

export type FollowUpDraft = {
  id: string
  prospectId: string
  trigger: CallOutcome | 'manual'
  channel: 'email' | 'sms'
  subject?: string
  message: string
  status: 'draft' | 'approved' | 'ready' | 'sent'
  executionState?: 'pending' | 'ready_to_send' | 'sent'
  createdAt: string
}

export type MeetingRecord = {
  id: string
  prospectId: string
  rep: 'Josh' | 'Paul'
  bookingUrl: string
  googleMeetUrl: string
  status: 'not_started' | 'booking_sent' | 'booked' | 'completed'
  proposedTime?: string
  bookedTime?: string
}

export type ProposalRecord = {
  id: string
  prospectId: string
  offerSummary: string
  paymentLink: string
  status: 'not_started' | 'draft' | 'sent' | 'paid'
}

export type SalesOsData = {
  markets: string[]
  niches: string[]
  prospects: Prospect[]
  calls: CallLog[]
  followUps: FollowUpDraft[]
  meetings: MeetingRecord[]
  proposals: ProposalRecord[]
  inquiryTests: InquiryTest[]
  bookingLinks: Record<'Josh' | 'Paul', string>
}
