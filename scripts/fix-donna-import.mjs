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
const { data: rows, error } = await supabase.from('prospects').select('id,business_name,decision_maker,owner_operated_signal,contact_form_url').like('id', 'donna-%')
if (error) throw error

for (const row of rows) {
  const patch = {}
  if (['field_service', 'restaurant', 'professional_services'].includes(row.decision_maker || '')) {
    patch.decision_maker = ''
  }
  if (['chicago', 'boston'].includes(row.owner_operated_signal || '')) {
    if (['donna-ballyhoo-hospitality','donna-episcope-hospitality','donna-the-fifty-50-group','donna-hogsalt','donna-one-off-hospitality'].includes(row.id)) {
      patch.owner_operated_signal = 'vertical:restaurant | market:chicago'
    } else if (['donna-boston-law-group-pc','donna-mazzo-law','donna-breakstone-white-gluck','donna-feinberg-alban-pc'].includes(row.id)) {
      patch.owner_operated_signal = 'vertical:professional_services | market:boston'
    } else {
      patch.owner_operated_signal = 'vertical:field_service | market:chicago'
    }
  }
  if ((row.contact_form_url || '').includes('.css') || (row.contact_form_url || '').includes('plugins/')) {
    patch.contact_form_url = ''
  }
  if (Object.keys(patch).length) {
    const { error: updateError } = await supabase.from('prospects').update(patch).eq('id', row.id)
    if (updateError) throw updateError
  }
}

console.log(JSON.stringify({ fixed: rows.length }, null, 2))
