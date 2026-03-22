import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing Supabase env')
const supabase = createClient(url, key, { auth: { persistSession: false } })

function parseCsv(path) {
  const text = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n').trim().split('\n')
  const headers = text[0].split(',').map(s => s.trim().replace(/^"|"$/g, ''))
  return text.slice(1).filter(Boolean).map((line) => {
    const vals = line.match(/(".*?"|[^,]+)/g) || []
    const row = {}
    headers.forEach((h, i) => row[h] = (vals[i] || '').replace(/^"|"$/g, '').trim())
    return row
  })
}

const batch1 = new Set(parseCsv('/Users/janet/clawd/agents/donna-paulsen/prospects_master_sales_os.csv').map(r => r.business_name))
const batch2 = parseCsv('/Users/janet/clawd/agents/donna-paulsen/prospects_batch2_master_sales_os.csv')
  .map(r => r.business_name)
  .filter(name => !batch1.has(name))

const { data, error } = await supabase
  .from('prospects')
  .select('id,business_name,notes')
  .in('business_name', batch2)
  .eq('site_audit_status', 'failed')

if (error) throw error

let updated = 0
for (const row of data || []) {
  const note = [row.notes, 'QUARANTINED: Batch 2 website unverifiable / non-resolving; do not use for outreach until re-sourced.'].filter(Boolean).join(' | ')
  const { error: upErr } = await supabase
    .from('prospects')
    .update({
      pipeline_stage: 'closed_lost',
      priority_bucket: 'cold',
      priority_score: 0,
      priority_reason: 'Quarantined — Batch 2 website unverifiable / non-resolving.',
      notes: note,
    })
    .eq('id', row.id)
  if (upErr) throw upErr
  updated++
}

console.log(`Quarantined ${updated} failed Batch 2 prospects`)
