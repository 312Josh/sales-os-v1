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

const prospectId = `verify-${Date.now()}`
const callId = `verify-call-${Date.now()}`
const proposalId = `verify-proposal-${Date.now()}`

const insertProspect = await supabase.from('prospects').insert({
  id: prospectId,
  business_name: 'Verification Roofing Co.',
  market: 'Field Service',
  niche: 'Roofing',
  city: 'Dallas',
  suburb: 'North Dallas',
  website: 'https://verification-roofing.example.com',
  phone: '(214) 555-0112',
  contact_form_url: 'https://verification-roofing.example.com/contact',
  decision_maker: 'Dana Price',
  linkedin_url: '',
  weak_site_signal: 'Generic homepage and weak trust proof.',
  weak_intake_signal: 'No fast estimate request path.',
  no_chat_signal: true,
  no_booking_signal: true,
  owner_operated_signal: 'Owner-led copy and local review replies.',
  audit_summary: 'Strong fit for call-first outreach validation.',
  outreach_hook: 'Your estimate path is costing you high-intent leads.',
  site_score: 4,
  intake_score: 5,
  owner_fit_score: 5,
  fit_score: 5,
  priority_score: 5,
  priority_reason: 'Verification prospect for live CRUD testing.',
  pipeline_stage: 'call_queued',
  assigned_rep: 'Josh',
  notes: 'Created by verification script'
})
if (insertProspect.error) throw insertProspect.error

const insertCall = await supabase.from('call_logs').insert({
  id: callId,
  prospect_id: prospectId,
  outcome: 'interested',
  notes: 'Owner asked for follow-up details.',
  called_at: new Date().toISOString(),
  next_step: 'Send booking link'
})
if (insertCall.error) throw insertCall.error

const updateProspect = await supabase.from('prospects').update({ pipeline_stage: 'follow_up_sent' }).eq('id', prospectId)
if (updateProspect.error) throw updateProspect.error

const insertProposal = await supabase.from('proposals').insert({
  id: proposalId,
  prospect_id: prospectId,
  offer_summary: 'Call-centered Sales OS setup and follow-up workflow',
  payment_link: 'https://buy.stripe.com/test-link',
  status: 'sent'
})
if (insertProposal.error) throw insertProposal.error

const verifyProspect = await supabase.from('prospects').select('id,pipeline_stage').eq('id', prospectId).single()
if (verifyProspect.error) throw verifyProspect.error

console.log(JSON.stringify({
  insertedProspect: prospectId,
  insertedCall: callId,
  insertedProposal: proposalId,
  finalStage: verifyProspect.data.pipeline_stage
}, null, 2))
