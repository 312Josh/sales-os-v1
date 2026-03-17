'use server'

import { revalidatePath } from 'next/cache'
import { getDataProvider } from './providers'
import { getStageForOutcome } from './next-step'
import type { CallOutcome, FollowUpDraft, Prospect, SalesOsData } from './types'

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

export async function createProspectAction(formData: FormData) {
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
    priorityReason: String(formData.get('priorityReason') || 'New prospect added.'),
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
  revalidatePath('/prospects')
}

export async function importProspectsAction(formData: FormData) {
  const raw = String(formData.get('json') || '[]')
  const parsed = JSON.parse(raw) as Prospect[]
  const data = await readData()
  for (const item of parsed) {
    data.prospects.push({
      ...item,
      id: item.id || createTimestampedId('prospect'),
    })
  }
  await writeData(data)
  revalidatePath('/')
  revalidatePath('/prospects')
}

export async function logCallOutcomeAction(prospectId: string, outcome: CallOutcome, notes: string, nextStep: string) {
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
