import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const csvPath = process.argv[2]
if (!csvPath) {
  console.error('Usage: node scripts/import-master-csv.mjs <csv-path>')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n')
  const headers = splitCsvLine(lines[0])
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = splitCsvLine(line)
    const row = {}
    headers.forEach((h, i) => row[h] = values[i] || '')
    return row
  })
}

function splitCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

function slug(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}

function normWebsite(v) {
  const x = (v || '').trim()
  if (!x) return ''
  return x.replace(/\/$/, '')
}

function marketToTag(market, existing) {
  const m = (existing || market || '').toLowerCase()
  if (m.includes('boston')) return 'boston'
  if (m.includes('chicago')) return 'chicago'
  return existing || market || ''
}

function guessVertical(vertical, niche) {
  const v = (vertical || '').toLowerCase()
  const n = (niche || '').toLowerCase()
  const val = v || n
  if (['law', 'legal', 'cpa', 'accounting', 'financial advisor', 'wealth management'].some(k => val.includes(k))) return 'professional_services'
  if (['restaurant', 'hospitality', 'med spa'].some(k => val.includes(k))) return 'restaurant'
  return 'field_service'
}

function makeRow(r, idx) {
  const id = `donna-${slug(r.business_name) || idx}`
  const tracking = `${slug(r.business_name).slice(0,8)}${String(idx).padStart(2,'0')}`.slice(0, 12)
  const vertical = guessVertical(r.vertical, r.niche)
  return {
    id,
    business_name: r.business_name,
    market: r.market || r.market_tag || '',
    niche: (r.niche || '').toLowerCase().replace(/\s+/g, '_'),
    city: r.city || '',
    suburb: r.suburb || '',
    website: normWebsite(r.website),
    phone: r.phone || '',
    email: r.email || '',
    contact_form_url: r.contact_form_url || '',
    decision_maker: r.decision_maker || '',
    decision_maker_title: r.decision_maker_title || '',
    linkedin_url: r.linkedin_url || '',
    weak_site_signal: '',
    weak_intake_signal: '',
    no_chat_signal: false,
    no_booking_signal: false,
    owner_operated_signal: '',
    audit_summary: '',
    outreach_hook: '',
    site_score: 3,
    intake_score: 3,
    owner_fit_score: 3,
    fit_score: 3,
    priority_score: 50,
    priority_reason: 'Imported from Donna master CSV — awaiting audit and enrichment.',
    pipeline_stage: 'call_queued',
    assigned_rep: r.assigned_rep === 'Paul' ? 'Paul' : 'Josh',
    notes: r.notes || '',
    vertical,
    market_tag: marketToTag(r.market, r.market_tag),
    priority_bucket: 'warm',
    contact_form_present: !!r.contact_form_url,
    chat_present: false,
    online_booking_present: false,
    contact_status: 'new',
    tracking_token: tracking,
    site_audit_status: 'not_started',
  }
}

const csv = fs.readFileSync(csvPath, 'utf8')
const rows = parseCsv(csv)
const mapped = rows.map(makeRow)

const { error } = await supabase.from('prospects').upsert(mapped, { onConflict: 'id' })
if (error) {
  console.error(error)
  process.exit(1)
}

console.log(`Imported ${mapped.length} prospects from ${csvPath}`)
console.log(`Josh: ${mapped.filter(r => r.assigned_rep === 'Josh').length}`)
console.log(`Paul: ${mapped.filter(r => r.assigned_rep === 'Paul').length}`)
