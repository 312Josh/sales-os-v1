import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import fs from 'fs'

const env = Object.fromEntries(
  fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx), line.slice(idx + 1)]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const targets = {
  'Boston Moving Service': 'https://bmoving.cogrow.ai',
  'Orland Electric Services': 'https://orlandelectric.cogrow.ai',
  'RetireMax Insurance': 'https://retiremax.cogrow.ai',
  'Boston AB': 'https://bostonab.cogrow.ai',
  'Boston Harbor Water Restoration': 'https://bostonharborwater.cogrow.ai',
  'Certified Tree Services': 'https://certifiedtree.cogrow.ai',
  'CJ Tree Services MA': 'https://cjtree.cogrow.ai',
  'Boston Paint Company': 'https://bostonpaint.cogrow.ai',
  'Excel Electrical Technologies': 'https://excelelectric.cogrow.ai',
  'Pro Electric': 'https://proelectric.cogrow.ai',
  'A+ Electrical Services': 'https://apluselectric.cogrow.ai',
  'Armor Garage Doors': 'https://armorgarage.cogrow.ai',
  'Stephco Cleaning': 'https://stephco.cogrow.ai',
  'KJ Heating and Cooling': 'https://kjheatcool.cogrow.ai',
  'Avid Engineers': 'https://avidengineers.cogrow.ai',
}

function issueFor(row) {
  const niche = String(row.niche || row.vertical || '').toLowerCase()
  if (niche.includes('electrical')) return 'quote requests and emergency calls are probably leaking on mobile'
  if (niche.includes('insurance')) return 'the trust + quote-request flow feels dated and likely drops inbound leads'
  if (niche.includes('tree')) return 'high-intent estimate requests are not getting the clean, fast path they should'
  if (niche.includes('restoration')) return 'urgent water-damage leads need a faster, clearer path to call and convert'
  if (niche.includes('architecture') || niche.includes('engineer')) return 'high-value project inquiries are not getting enough trust and conversion framing'
  if (niche.includes('moving')) return 'estimate requests are not getting enough trust and conversion friction removed'
  if (niche.includes('garage')) return 'service request urgency and trust are not translating cleanly into booked jobs'
  if (niche.includes('clean')) return 'quote intent is not getting a clean, trust-heavy path to conversion'
  return 'the site is leaving inbound leads on the table'
}

const names = Object.keys(targets)
const { data, error } = await supabase.from('prospects').select('*').in('business_name', names)
if (error) throw error

const byName = new Map((data || []).map((row) => [row.business_name, row]))
const missing = names.filter((name) => !byName.has(name))

for (const [name, row] of byName.entries()) {
  const proofUrl = targets[name]
  const update = await supabase
    .from('prospects')
    .update({
      proof_url: proofUrl,
      proof_status: 'ready',
      proof_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id)
  if (update.error) throw update.error
}

const drafts = []
for (const name of names.filter((item) => byName.has(item))) {
  const row = byName.get(name)
  const decisionMaker = row.decision_maker || row.business_name
  const issue = issueFor(row)
  const proofUrl = targets[name]
  const auditLine = row.site_audit_summary || row.priority_reason || row.audit_summary || issue

  drafts.push({
    id: randomUUID(),
    prospect_id: row.id,
    trigger: 'manual',
    channel: 'email',
    subject: `${name}: quick idea to improve lead conversion`,
    message: `Hi ${decisionMaker},\n\nI put together a quick proof page for ${name}. The main gap I noticed is that ${issue}.\n\nProof page: ${proofUrl}\n\nAudit note: ${auditLine}.\n\nIf useful, I can walk you through the changes and how they'd tighten up conversion.\n\n— Paul\nCoGrow`,
    status: 'ready',
  })

  drafts.push({
    id: randomUUID(),
    prospect_id: row.id,
    trigger: 'manual',
    channel: 'sms',
    subject: null,
    message: `Hey ${decisionMaker} — I mocked up a quick improvement concept for ${name}. The big issue is that ${issue}. Here’s the proof page: ${proofUrl}`,
    status: 'ready',
  })
}

if (drafts.length) {
  const inserted = await supabase.from('follow_up_drafts').insert(drafts)
  if (inserted.error) throw inserted.error
}

console.log(JSON.stringify({ updated: byName.size, missing, insertedDrafts: drafts.length }, null, 2))
