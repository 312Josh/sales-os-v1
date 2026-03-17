import { revalidatePath } from 'next/cache'
import { getDataProvider } from './providers'
import { getCalcomBookingLink } from './calcom'
import { getStageForOutcome } from './next-step'
import { autoGradeInquiry } from './inquiry-grading'
import { sendTwilioSms } from './twilio'
import { sendEmail } from './resend'
import { runSiteAudit } from './site-audit'
import type { CallOutcome, FollowUpDraft, MeetingRecord, ProposalRecord, Prospect, SalesOsData, PipelineStage } from './types'

const provider = getDataProvider()

async function readData(): Promise<SalesOsData> {
  return await provider.read()
}

async function writeData(data: SalesOsData) {
  await provider.write(data)
}

function createTimestampedId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createFollowUps(prospect: Prospect, outcome: CallOutcome): FollowUpDraft[] {
  const now = new Date().toISOString()
  const drafts: FollowUpDraft[] = []

  if (outcome === 'no_answer' || outcome === 'left_voicemail') {
    drafts.push({
      id: createTimestampedId('fu-email'),
      prospectId: prospect.id,
      trigger: outcome,
      channel: 'email',
      subject: `Tried to reach ${prospect.businessName}`,
      message: `Hey ${prospect.decisionMaker || 'there'}, I just tried calling. Quick reason for the outreach: ${prospect.outreachHook} If useful, I can send a few ideas and a quick booking link.`,
      status: 'draft',
      executionState: 'pending',
      sendChannel: 'sms',
      sendStatus: 'queued',
      sequenceStep: 1,
      sequenceStatus: 'active',
      manualSendStatus: 'not_sent',
      createdAt: now,
    })
    drafts.push({
      id: createTimestampedId('fu-sms'),
      prospectId: prospect.id,
      trigger: outcome,
      channel: 'sms',
      message: `Just tried calling — quick reason for the outreach: ${prospect.weakIntakeSignal} Happy to send a few ideas if helpful.`,
      status: 'draft',
      executionState: 'pending',
      sendChannel: 'email',
      sendStatus: 'queued',
      sequenceStep: 1,
      sequenceStatus: 'active',
      manualSendStatus: 'not_sent',
      createdAt: now,
    })
  }

  if (outcome === 'spoke_with_owner' || outcome === 'interested' || outcome === 'send_info') {
    drafts.push({
      id: createTimestampedId('fu-email'),
      prospectId: prospect.id,
      trigger: outcome,
      channel: 'email',
      subject: `${prospect.businessName} follow-up recap`,
      message: `Good talking today. Based on what we discussed, the clearest gap is: ${prospect.weakIntakeSignal} The simplest next step is a short walkthrough and booking conversation.`,
      status: 'draft',
      executionState: 'pending',
      sendChannel: 'email',
      sendStatus: 'queued',
      sequenceStep: 1,
      sequenceStatus: 'active',
      manualSendStatus: 'not_sent',
      createdAt: now,
    })
    drafts.push({
      id: createTimestampedId('fu-sms'),
      prospectId: prospect.id,
      trigger: outcome,
      channel: 'sms',
      message: `Good speaking today — I can show you a faster path from inbound interest to booked conversation. Want the booking link?`,
      status: 'draft',
      executionState: 'pending',
      sendChannel: 'email',
      sendStatus: 'queued',
      sequenceStep: 1,
      sequenceStatus: 'active',
      manualSendStatus: 'not_sent',
      createdAt: now,
    })
  }

  return drafts
}

export async function getSalesOsData() {
  return await readData()
}

export async function logCallOutcome(formData: FormData) {
  'use server'

  const prospectId = String(formData.get('prospectId'))
  const outcome = String(formData.get('outcome')) as CallOutcome
  const notes = String(formData.get('notes') || '')
  const nextStep = String(formData.get('nextStep') || '')
  const data = await readData()
  const prospect = data.prospects.find((item) => item.id === prospectId)
  if (!prospect) return

  data.calls.unshift({
    id: createTimestampedId('call'),
    prospectId,
    outcome,
    notes,
    nextStep,
    calledAt: new Date().toISOString(),
  })

  prospect.pipelineStage = getStageForOutcome(outcome)
  if (notes) {
    prospect.notes = [prospect.notes, notes].filter(Boolean).join(' | ')
  }

  const drafts = createFollowUps(prospect, outcome)
  data.followUps = [...drafts, ...data.followUps]

  await writeData(data)
  revalidatePath('/')
}

export async function updateProspectStage(formData: FormData) {
  'use server'
  const prospectId = String(formData.get('prospectId'))
  const stage = String(formData.get('pipelineStage')) as PipelineStage
  const data = await readData()
  const prospect = data.prospects.find((item) => item.id === prospectId)
  if (!prospect) return
  prospect.pipelineStage = stage
  await writeData(data)
  revalidatePath('/')
}

export async function createProspect(formData: FormData) {
  'use server'
  const data = await readData()
  const prospect: Prospect = {
    id: createTimestampedId('prospect'),
    businessName: String(formData.get('businessName') || ''),
    market: String(formData.get('market') || ''),
    niche: String(formData.get('niche') || ''),
    city: String(formData.get('city') || ''),
    suburb: String(formData.get('suburb') || ''),
    website: String(formData.get('website') || ''),
    phone: String(formData.get('phone') || ''),
    contactFormUrl: String(formData.get('contactFormUrl') || ''),
    decisionMaker: String(formData.get('decisionMaker') || ''),
    linkedInUrl: String(formData.get('linkedInUrl') || ''),
    weakSiteSignal: String(formData.get('weakSiteSignal') || ''),
    weakIntakeSignal: String(formData.get('weakIntakeSignal') || ''),
    noChatSignal: String(formData.get('noChatSignal') || '') === 'on',
    noBookingSignal: String(formData.get('noBookingSignal') || '') === 'on',
    ownerOperatedSignal: String(formData.get('ownerOperatedSignal') || ''),
    auditSummary: String(formData.get('auditSummary') || ''),
    outreachHook: String(formData.get('outreachHook') || ''),
    siteScore: Number(formData.get('siteScore') || 3),
    intakeScore: Number(formData.get('intakeScore') || 3),
    ownerFitScore: Number(formData.get('ownerFitScore') || 3),
    fitScore: Number(formData.get('fitScore') || 3),
    priorityScore: Number(formData.get('priorityScore') || 3),
    priorityReason: String(formData.get('priorityReason') || 'New prospect added without full scoring yet.'),
    pipelineStage: 'sourced',
    assignedRep: String(formData.get('assignedRep') || 'Josh') as 'Josh' | 'Paul',
    notes: String(formData.get('notes') || ''),
    priorityBucket: '',
    decisionMakerTitle: String(formData.get('decisionMakerTitle') || ''),
    contactFormPresent: String(formData.get('contactFormPresent') || '') === 'on',
    chatPresent: String(formData.get('chatPresent') || '') === 'on',
    onlineBookingPresent: String(formData.get('onlineBookingPresent') || '') === 'on',
  }
  data.prospects.unshift(prospect)
  await writeData(data)
  revalidatePath('/')
}

export async function importProspects(formData: FormData) {
  'use server'
  const raw = String(formData.get('json') || '[]')
  const parsed = JSON.parse(raw) as Prospect[]
  const data = await readData()
  for (const item of parsed) {
    data.prospects.push({
      ...item,
      id: item.id || `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    })
  }
  await writeData(data)
  revalidatePath('/')
}


export async function queueInquiryTest(formData: FormData) {
  'use server'
  const prospectId = String(formData.get('prospectId'))
  const inquiryText = String(formData.get('inquiryText') || '')
  const inquiryChannel = String(formData.get('inquiryChannel') || 'form') as 'form' | 'email' | 'phone'
  const data = await readData()
  const existing = data.inquiryTests.find((item) => item.prospectId === prospectId)
  if (existing) {
    existing.testStatus = 'ready_for_approval'
    existing.inquiryText = inquiryText
    existing.inquiryChannel = inquiryChannel
  } else {
    data.inquiryTests.unshift({
      id: createTimestampedId('inq'),
      prospectId,
      inquiryText,
      inquiryChannel,
      testStatus: 'ready_for_approval',
    })
  }

  const prospect = data.prospects.find((item) => item.id === prospectId)
  if (prospect) {
    prospect.siteAuditStatus = 'queued'
  }

  await writeData(data)
  revalidatePath('/')
}

export async function runProspectSiteAudit(formData: FormData) {
  'use server'
  const prospectId = String(formData.get('prospectId'))
  const data = await readData()
  const prospect = data.prospects.find((item) => item.id === prospectId)
  if (!prospect?.website) return

  prospect.siteAuditStatus = 'running'
  await writeData(data)

  const audit = await runSiteAudit(prospect.id, prospect.website)
  prospect.siteAuditStatus = audit.status
  prospect.siteAuditAt = audit.auditedAt
  prospect.pagespeedScore = audit.pagespeedScore
  prospect.lcpMs = audit.lcpMs
  prospect.clsScore = audit.clsScore
  prospect.brokenLinksCount = audit.brokenLinksCount
  prospect.missingMetaCount = audit.missingMetaCount
  prospect.missingAltCount = audit.missingAltCount
  prospect.siteHealthGrade = audit.grade
  prospect.siteAuditSummary = audit.summary

  if (audit.grade === 'C' || audit.grade === 'D') {
    prospect.priorityReason = `${prospect.priorityReason} Site health ${audit.grade} — ${audit.summary}`.trim()
    prospect.auditSummary = audit.summary || prospect.auditSummary
  }

  await writeData(data)
  revalidatePath('/')
}

export async function approveInquiryTest(formData: FormData) {
  'use server'
  const inquiryId = String(formData.get('inquiryId'))
  const data = await readData()
  const inquiry = data.inquiryTests.find((item) => item.id === inquiryId)
  if (!inquiry) return
  inquiry.testStatus = 'approved'
  await writeData(data)
  revalidatePath('/')
}

export async function submitInquiryTest(formData: FormData) {
  'use server'
  const inquiryId = String(formData.get('inquiryId'))
  const data = await readData()
  const inquiry = data.inquiryTests.find((item) => item.id === inquiryId)
  if (!inquiry) return
  inquiry.testStatus = 'monitoring'
  inquiry.inquirySubmittedAt = new Date().toISOString()
  await writeData(data)
  revalidatePath('/')
}

export async function gradeInquiryTest(formData: FormData) {
  'use server'
  const inquiryId = String(formData.get('inquiryId'))
  const requestedGrade = String(formData.get('grade') || '') as 'A' | 'B' | 'C' | 'D'
  const responseChannel = String(formData.get('responseChannel') || '') as 'email' | 'sms' | 'phone' | 'web'
  const responseTimeMinutes = Number(formData.get('responseTimeMinutes') || 0)
  const data = await readData()
  const inquiry = data.inquiryTests.find((item) => item.id === inquiryId)
  if (!inquiry) return
  inquiry.grade = requestedGrade || autoGradeInquiry(responseTimeMinutes)
  inquiry.responseChannel = responseChannel
  inquiry.responseTimeMinutes = responseTimeMinutes
  inquiry.firstResponseAt = new Date().toISOString()
  inquiry.gradedAt = new Date().toISOString()
  inquiry.testStatus = 'graded'
  await writeData(data)
  revalidatePath('/')
}
export async function approveFollowUp(formData: FormData) {
  'use server'
  const followUpId = String(formData.get('followUpId'))
  const data = await readData()
  const followUp = data.followUps.find((item) => item.id === followUpId)
  if (!followUp) return
  followUp.status = 'approved'
  followUp.executionState = 'ready_to_send'
  await writeData(data)
  revalidatePath('/')
}


export async function markFollowUpSent(formData: FormData) {
  'use server'
  const followUpId = String(formData.get('followUpId'))
  const data = await readData()
  const followUp = data.followUps.find((item) => item.id === followUpId)
  if (!followUp) return
  followUp.status = 'sent'
  followUp.executionState = 'sent'
  followUp.sendStatus = 'sent'
  followUp.sentAt = new Date().toISOString()
  followUp.sequenceStatus = 'completed'
  followUp.manualSendStatus = 'sent_manually'
  await writeData(data)
  revalidatePath('/')
}


export async function sendFollowUpEmail(formData: FormData) {
  'use server'
  const followUpId = String(formData.get('followUpId'))
  const toEmail = String(formData.get('toEmail') || '')
  const data = await readData()
  const followUp = data.followUps.find((item) => item.id === followUpId)
  if (!followUp) return
  if (!toEmail) throw new Error('Recipient email required')
  const result = await sendEmail({
    to: toEmail,
    subject: followUp.subject || 'Follow-up from Sales OS',
    text: followUp.message,
  })
  followUp.status = 'sent'
  followUp.executionState = 'sent'
  followUp.sendStatus = 'sent'
  followUp.sentAt = new Date().toISOString()
  followUp.providerId = result.id || ''
  followUp.sendChannel = 'email'
  followUp.sequenceStatus = 'completed'
  followUp.manualSendStatus = 'sent_manually'
  await writeData(data)
  revalidatePath('/')
}

export async function sendFollowUpSms(formData: FormData) {
  'use server'
  const followUpId = String(formData.get('followUpId'))
  const testTo = String(formData.get('testTo') || '')
  const data = await readData()
  const followUp = data.followUps.find((item) => item.id === followUpId)
  if (!followUp) return
  if (!testTo) throw new Error('Test destination number required')
  const result = await sendTwilioSms({ to: testTo, body: followUp.message })
  followUp.status = 'sent'
  followUp.executionState = 'sent'
  followUp.sendStatus = 'sent'
  followUp.sentAt = new Date().toISOString()
  followUp.providerId = result.sid || ''
  followUp.sequenceStatus = 'completed'
  followUp.manualSendStatus = 'sent_manually'
  await writeData(data)
  revalidatePath('/')
}
export async function stopFollowUpSequence(formData: FormData) {
  'use server'
  const followUpId = String(formData.get('followUpId'))
  const data = await readData()
  const followUp = data.followUps.find((item) => item.id === followUpId)
  if (!followUp) return
  followUp.sequenceStatus = 'stopped'
  followUp.stopReason = 'manual'
  await writeData(data)
  revalidatePath('/')
}

export async function markFollowUpCopied(formData: FormData) {
  'use server'
  const followUpId = String(formData.get('followUpId'))
  const data = await readData()
  const followUp = data.followUps.find((item) => item.id === followUpId)
  if (!followUp) return
  followUp.manualSendStatus = 'copied'
  await writeData(data)
  revalidatePath('/')
}

export async function markFollowUpSentManually(formData: FormData) {
  'use server'
  const followUpId = String(formData.get('followUpId'))
  const data = await readData()
  const followUp = data.followUps.find((item) => item.id === followUpId)
  if (!followUp) return
  followUp.status = 'sent'
  followUp.executionState = 'sent'
  followUp.sendStatus = 'sent'
  followUp.sentAt = new Date().toISOString()
  followUp.sequenceStatus = 'completed'
  followUp.manualSendStatus = 'sent_manually'
  await writeData(data)
  revalidatePath('/')
}

export async function stopFollowUpForBooking(formData: FormData) {
  'use server'
  const prospectId = String(formData.get('prospectId'))
  const data = await readData()
  const matches = data.followUps.filter((item) => item.prospectId === prospectId && item.sequenceStatus !== 'completed' && item.sequenceStatus !== 'stopped')
  for (const followUp of matches) {
    followUp.sequenceStatus = 'stopped'
    followUp.stopReason = 'booking'
  }
  await writeData(data)
  revalidatePath('/')
}
export async function sendBookingLink(formData: FormData) {
  'use server'
  const prospectId = String(formData.get('prospectId'))
  const data = await readData()
  const prospect = data.prospects.find((item) => item.id === prospectId)
  if (!prospect) return
  const booking = await getCalcomBookingLink(prospect.assignedRep)
  const bookingUrl = booking.bookingUrl
  const existing = data.meetings.find((meeting) => meeting.prospectId === prospectId)
  if (existing) {
    existing.status = 'booking_sent'
  } else {
    const meeting: MeetingRecord = {
      id: createTimestampedId('meeting'),
      prospectId,
      rep: prospect.assignedRep,
      bookingUrl,
      googleMeetUrl: `Handled by Cal.com booking workflow for ${prospect.assignedRep}`,
      status: 'booking_sent',
    }
    data.meetings.unshift(meeting)
  }
  prospect.pipelineStage = 'meeting_booked'
  await writeData(data)
  revalidatePath('/')
}

export async function createProposal(formData: FormData) {
  'use server'
  const prospectId = String(formData.get('prospectId'))
  const offerSummary = String(formData.get('offerSummary') || '')
  const paymentLink = String(formData.get('paymentLink') || '')
  const data = await readData()
  const prospect = data.prospects.find((item) => item.id === prospectId)
  if (!prospect) return

  const existing = data.proposals.find((proposal) => proposal.prospectId === prospectId)
  if (existing) {
    existing.offerSummary = offerSummary
    existing.paymentLink = paymentLink
    existing.status = 'sent'
  } else {
    const proposal: ProposalRecord = {
      id: createTimestampedId('proposal'),
      prospectId,
      offerSummary,
      paymentLink,
      status: 'sent',
    }
    data.proposals.unshift(proposal)
  }

  prospect.pipelineStage = 'proposal_sent'
  await writeData(data)
  revalidatePath('/')
}

export async function markProposalPaid(formData: FormData) {
  'use server'
  const proposalId = String(formData.get('proposalId'))
  const data = await readData()
  const proposal = data.proposals.find((item) => item.id === proposalId)
  if (!proposal) return
  proposal.status = 'paid'
  const prospect = data.prospects.find((item) => item.id === proposal.prospectId)
  if (prospect) prospect.pipelineStage = 'paid'
  await writeData(data)
  revalidatePath('/')
}
