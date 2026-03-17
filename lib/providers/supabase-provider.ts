import { createClient } from '@supabase/supabase-js'
import type { CallLog, FollowUpDraft, InquiryTest, MeetingRecord, ProposalRecord, Prospect, SalesOsData } from '@/lib/types'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase provider requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

function mapProspectToRow(prospect: Prospect) {
  return {
    id: prospect.id,
    business_name: prospect.businessName,
    market: prospect.market,
    niche: prospect.niche,
    city: prospect.city,
    suburb: prospect.suburb,
    website: prospect.website,
    phone: prospect.phone,
    contact_form_url: prospect.contactFormUrl,
    decision_maker: prospect.decisionMaker,
    linkedin_url: prospect.linkedInUrl,
    weak_site_signal: prospect.weakSiteSignal,
    weak_intake_signal: prospect.weakIntakeSignal,
    no_chat_signal: prospect.noChatSignal,
    no_booking_signal: prospect.noBookingSignal,
    owner_operated_signal: prospect.ownerOperatedSignal,
    audit_summary: prospect.auditSummary,
    outreach_hook: prospect.outreachHook,
    site_score: prospect.siteScore,
    intake_score: prospect.intakeScore,
    owner_fit_score: prospect.ownerFitScore,
    fit_score: prospect.fitScore,
    priority_score: prospect.priorityScore,
    priority_reason: prospect.priorityReason,
    pipeline_stage: prospect.pipelineStage,
    assigned_rep: prospect.assignedRep,
    notes: prospect.notes,
    vertical: prospect.vertical || '',
    market_tag: prospect.marketTag || '',
    priority_bucket: prospect.priorityBucket || '',
    decision_maker_title: prospect.decisionMakerTitle || '',
    contact_form_present: prospect.contactFormPresent ?? false,
    chat_present: prospect.chatPresent ?? false,
    online_booking_present: prospect.onlineBookingPresent ?? false,
    contact_status: prospect.contactStatus || 'new',
    last_contacted_at: prospect.lastContactedAt || null,
    site_audit_status: prospect.siteAuditStatus || 'not_started',
    site_audit_at: prospect.siteAuditAt || null,
    pagespeed_score: prospect.pagespeedScore ?? null,
    lcp_ms: prospect.lcpMs ?? null,
    cls_score: prospect.clsScore ?? null,
    broken_links_count: prospect.brokenLinksCount ?? 0,
    missing_meta_count: prospect.missingMetaCount ?? 0,
    missing_alt_count: prospect.missingAltCount ?? 0,
    site_health_grade: prospect.siteHealthGrade || null,
    site_audit_summary: prospect.siteAuditSummary || null,
  }
}

function mapCallToRow(call: CallLog) {
  return {
    id: call.id,
    prospect_id: call.prospectId,
    outcome: call.outcome,
    notes: call.notes,
    called_at: call.calledAt,
    next_step: call.nextStep,
  }
}

function mapFollowUpToRow(item: FollowUpDraft) {
  return {
    id: item.id,
    prospect_id: item.prospectId,
    trigger: item.trigger,
    channel: item.channel,
    subject: item.subject || null,
    message: item.message,
    status: item.status,
    created_at: item.createdAt,
  }
}

function mapMeetingToRow(item: MeetingRecord) {
  return {
    id: item.id,
    prospect_id: item.prospectId,
    rep: item.rep,
    booking_url: item.bookingUrl,
    google_meet_url: item.googleMeetUrl,
    status: item.status,
    proposed_time: item.proposedTime || null,
    booked_time: item.bookedTime || null,
  }
}

function mapProposalToRow(item: ProposalRecord) {
  return {
    id: item.id,
    prospect_id: item.prospectId,
    offer_summary: item.offerSummary,
    payment_link: item.paymentLink,
    status: item.status,
  }
}

function mapInquiryToRow(item: InquiryTest) {
  return {
    id: item.id,
    prospect_id: item.prospectId,
    inquiry_submitted_at: item.inquirySubmittedAt || null,
    first_response_at: item.firstResponseAt || null,
    response_channel: item.responseChannel || null,
    response_time_minutes: item.responseTimeMinutes || null,
    grade: item.grade || null,
    test_status: item.testStatus,
  }
}

export async function readSupabaseData(): Promise<SalesOsData> {
  const supabase = getClient()
  const [prospects, calls, followUps, meetings, proposals, inquiryTests] = await Promise.all([
    supabase.from('prospects').select('*').order('priority_score', { ascending: false }),
    supabase.from('call_logs').select('*').order('called_at', { ascending: false }),
    supabase.from('follow_up_drafts').select('*').order('created_at', { ascending: false }),
    supabase.from('meetings').select('*').order('booked_time', { ascending: false, nullsFirst: true }),
    supabase.from('proposals').select('*').order('id', { ascending: false }),
    supabase.from('inquiry_tests').select('*').order('id', { ascending: false }),
  ])

  if ([prospects, calls, followUps, meetings, proposals, inquiryTests].some((r) => r.error)) {
    throw new Error('Failed to read one or more Supabase tables')
  }

  return {
    markets: ['Field Service', 'Professional Services'],
    niches: ['HVAC', 'Plumbing', 'Electrical', 'Med Spa', 'Legal'],
    prospects: (prospects.data || []).map((row: any) => ({
      id: row.id,
      businessName: row.business_name,
      market: row.market,
      niche: row.niche,
      city: row.city,
      suburb: row.suburb,
      website: row.website,
      phone: row.phone,
      contactFormUrl: row.contact_form_url,
      decisionMaker: row.decision_maker,
      linkedInUrl: row.linkedin_url,
      weakSiteSignal: row.weak_site_signal,
      weakIntakeSignal: row.weak_intake_signal,
      noChatSignal: row.no_chat_signal,
      noBookingSignal: row.no_booking_signal,
      ownerOperatedSignal: row.owner_operated_signal,
      auditSummary: row.audit_summary,
      outreachHook: row.outreach_hook,
      siteScore: row.site_score,
      intakeScore: row.intake_score,
      ownerFitScore: row.owner_fit_score,
      fitScore: row.fit_score,
      priorityScore: row.priority_score,
      priorityReason: row.priority_reason,
      pipelineStage: row.pipeline_stage,
      assignedRep: row.assigned_rep,
      notes: row.notes,
      vertical: row.vertical || '',
      marketTag: row.market_tag || '',
      priorityBucket: row.priority_bucket || '',
      decisionMakerTitle: row.decision_maker_title || '',
      contactFormPresent: row.contact_form_present ?? false,
      chatPresent: row.chat_present ?? false,
      onlineBookingPresent: row.online_booking_present ?? false,
      contactStatus: row.contact_status || 'new',
      lastContactedAt: row.last_contacted_at || undefined,
      siteAuditStatus: row.site_audit_status || 'not_started',
      siteAuditAt: row.site_audit_at || undefined,
      pagespeedScore: row.pagespeed_score ?? undefined,
      lcpMs: row.lcp_ms ?? undefined,
      clsScore: row.cls_score ?? undefined,
      brokenLinksCount: row.broken_links_count ?? 0,
      missingMetaCount: row.missing_meta_count ?? 0,
      missingAltCount: row.missing_alt_count ?? 0,
      siteHealthGrade: row.site_health_grade || undefined,
      siteAuditSummary: row.site_audit_summary || undefined,
    })),
    calls: (calls.data || []).map((row: any) => ({
      id: row.id,
      prospectId: row.prospect_id,
      outcome: row.outcome,
      notes: row.notes,
      calledAt: row.called_at,
      nextStep: row.next_step,
    })),
    followUps: (followUps.data || []).map((row: any) => ({
      id: row.id,
      prospectId: row.prospect_id,
      trigger: row.trigger,
      channel: row.channel,
      subject: row.subject || undefined,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
    })),
    meetings: (meetings.data || []).map((row: any) => ({
      id: row.id,
      prospectId: row.prospect_id,
      rep: row.rep,
      bookingUrl: row.booking_url,
      googleMeetUrl: row.google_meet_url,
      status: row.status,
      proposedTime: row.proposed_time || undefined,
      bookedTime: row.booked_time || undefined,
    })),
    proposals: (proposals.data || []).map((row: any) => ({
      id: row.id,
      prospectId: row.prospect_id,
      offerSummary: row.offer_summary,
      paymentLink: row.payment_link,
      status: row.status,
    })),
    inquiryTests: (inquiryTests.data || []).map((row: any) => ({
      id: row.id,
      prospectId: row.prospect_id,
      inquirySubmittedAt: row.inquiry_submitted_at || undefined,
      firstResponseAt: row.first_response_at || undefined,
      responseChannel: row.response_channel || undefined,
      responseTimeMinutes: row.response_time_minutes || undefined,
      grade: row.grade || undefined,
      testStatus: row.test_status,
    })),
    bookingLinks: {
      Josh: process.env.CALCOM_BOOKING_URL_JOSH || 'https://cal.com/josh-mellender-f4rrsl',
      Paul: process.env.CALCOM_BOOKING_URL_PAUL || 'https://cal.com/paul-placeholder',
    },
  }
}

export async function writeSupabaseData(data: SalesOsData): Promise<void> {
  const supabase = getClient()

  const results = await Promise.all([
    supabase.from('prospects').upsert(data.prospects.map(mapProspectToRow)),
    supabase.from('call_logs').upsert(data.calls.map(mapCallToRow)),
    supabase.from('follow_up_drafts').upsert(data.followUps.map(mapFollowUpToRow)),
    supabase.from('meetings').upsert(data.meetings.map(mapMeetingToRow)),
    supabase.from('proposals').upsert(data.proposals.map(mapProposalToRow)),
    supabase.from('inquiry_tests').upsert(data.inquiryTests.map(mapInquiryToRow)),
  ])

  const failed = results.find((r) => r.error)
  if (failed?.error) {
    throw new Error(failed.error.message)
  }
}
