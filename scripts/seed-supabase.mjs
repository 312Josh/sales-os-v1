import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const envPath = path.join(process.cwd(), '.env.local')
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx), line.slice(idx + 1)]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const seed = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'seed.json'), 'utf8'))

const prospects = seed.prospects.map((p) => ({
  id: p.id,
  business_name: p.businessName,
  market: p.market,
  niche: p.niche,
  city: p.city,
  suburb: p.suburb,
  website: p.website,
  phone: p.phone,
  contact_form_url: p.contactFormUrl,
  decision_maker: p.decisionMaker,
  linkedin_url: p.linkedInUrl,
  weak_site_signal: p.weakSiteSignal,
  weak_intake_signal: p.weakIntakeSignal,
  no_chat_signal: p.noChatSignal,
  no_booking_signal: p.noBookingSignal,
  owner_operated_signal: p.ownerOperatedSignal,
  audit_summary: p.auditSummary,
  outreach_hook: p.outreachHook,
  site_score: p.siteScore,
  intake_score: p.intakeScore,
  owner_fit_score: p.ownerFitScore,
  fit_score: p.fitScore,
  priority_score: p.priorityScore,
  priority_reason: p.priorityReason,
  pipeline_stage: p.pipelineStage,
  assigned_rep: p.assignedRep,
  notes: p.notes,
}))

const inquiries = seed.inquiryTests.map((i) => ({
  id: i.id,
  prospect_id: i.prospectId,
  inquiry_submitted_at: i.inquirySubmittedAt || null,
  first_response_at: i.firstResponseAt || null,
  response_channel: i.responseChannel || null,
  response_time_minutes: i.responseTimeMinutes || null,
  grade: i.grade || null,
  test_status: i.testStatus,
}))

const p1 = await supabase.from('prospects').upsert(prospects)
if (p1.error) throw p1.error
const p2 = await supabase.from('inquiry_tests').upsert(inquiries)
if (p2.error) throw p2.error
console.log('Seeded Supabase with prospects and inquiry tests')
