import { createClient } from '@supabase/supabase-js'
import { runSiteAudit } from '../lib/site-audit.ts'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing Supabase env')
const supabase = createClient(url, key, { auth: { persistSession: false } })

;(async()=>{
  const { data, error } = await supabase
    .from('prospects')
    .select('id,business_name,website,pipeline_stage')
    .eq('pipeline_stage', 'call_queued')
    .like('id', 'donna-%')
    .order('business_name')
  if (error) throw error
  console.log(`Found ${data.length} active verified prospects to audit`)

  let ok = 0, failed = 0
  for (const [idx, p] of data.entries()) {
    const website = p.website?.startsWith('http') ? p.website : `https://${p.website}`
    console.log(`\n[${idx+1}/${data.length}] Auditing: ${p.business_name} (${website})`)
    try {
      const audit = await runSiteAudit(p.id, website)
      const update = {
        site_audit_status: audit.status,
        site_audit_at: audit.auditedAt || null,
        pagespeed_score: audit.pagespeedScore ?? null,
        lcp_ms: audit.lcpMs ?? null,
        cls_score: audit.clsScore ?? null,
        broken_links_count: audit.brokenLinksCount ?? 0,
        missing_meta_count: audit.missingMetaCount ?? 0,
        missing_alt_count: audit.missingAltCount ?? 0,
        site_health_grade: audit.grade || null,
        site_audit_summary: audit.summary || null,
        priority_score: audit.status === 'failed' ? 80 : audit.grade === 'D' ? 85 : audit.grade === 'C' ? 75 : audit.grade === 'B' ? 60 : 45,
        priority_bucket: audit.status === 'failed' || audit.grade === 'D' || audit.grade === 'C' ? 'hot' : 'warm',
        priority_reason: audit.status === 'failed'
          ? 'Site audit failed — possible broken, blocked, or unstable website.'
          : `Website Grade: ${audit.grade} — ${audit.summary || 'audit completed'}`,
      }
      await supabase.from('prospects').update(update).eq('id', p.id)
      if (audit.status === 'failed') {
        failed++
        console.log(`  ❌ Audit failed: ${audit.error}`)
      } else {
        ok++
        console.log(`  ✅ Grade: ${audit.grade} | Score: ${audit.pagespeedScore ?? 'N/A'} | Priority: ${update.priority_score}`)
      }
    } catch (e) {
      failed++
      console.log(`  ❌ Script failed: ${e.message}`)
    }
  }
  console.log(`\n✅ Active verified audit complete: ${ok} succeeded, ${failed} failed, ${data.length} total`)
})().catch(err=>{console.error(err);process.exit(1)})
