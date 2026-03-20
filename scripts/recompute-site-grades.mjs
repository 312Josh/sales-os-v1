import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing Supabase env')
const supabase = createClient(url, key, { auth: { persistSession: false } })

function gradeSiteAudit(metrics) {
  const score = metrics.pagespeed_score
  const lcp = metrics.lcp_ms
  const cls = metrics.cls_score
  const broken = metrics.broken_links_count ?? 0
  const missingMeta = metrics.missing_meta_count ?? 0
  const missingAlt = metrics.missing_alt_count ?? 0
  const riskPoints =
    (score == null ? 1 : score < 35 ? 4 : score < 50 ? 3 : score < 70 ? 2 : score < 85 ? 1 : 0) +
    (lcp == null ? 0 : lcp > 5000 ? 4 : lcp > 3500 ? 3 : lcp > 2500 ? 2 : lcp > 1800 ? 1 : 0) +
    (cls == null ? 0 : cls > 0.3 ? 4 : cls > 0.18 ? 3 : cls > 0.1 ? 2 : cls > 0.05 ? 1 : 0) +
    (broken >= 6 ? 5 : broken >= 3 ? 4 : broken >= 1 ? 2 : 0) +
    (missingMeta >= 1 ? 2 : 0) +
    (missingAlt >= 20 ? 4 : missingAlt >= 10 ? 3 : missingAlt >= 5 ? 2 : missingAlt >= 1 ? 1 : 0)
  if (riskPoints >= 11) return 'D'
  if (riskPoints >= 7) return 'C'
  if (riskPoints >= 3) return 'B'
  return 'A'
}

;(async()=>{
  const { data, error } = await supabase.from('prospects').select('id,site_audit_status,pagespeed_score,lcp_ms,cls_score,broken_links_count,missing_meta_count,missing_alt_count,site_health_grade').in('site_audit_status',['complete','failed'])
  if (error) throw error
  let updated = 0
  for (const row of data) {
    if (row.site_audit_status !== 'complete') continue
    const grade = gradeSiteAudit(row)
    if (grade !== row.site_health_grade) {
      await supabase.from('prospects').update({
        site_health_grade: grade,
        priority_score: grade === 'D' ? 85 : grade === 'C' ? 75 : grade === 'B' ? 60 : 45,
        priority_bucket: grade === 'D' || grade === 'C' ? 'hot' : 'warm',
      }).eq('id', row.id)
      updated++
    }
  }
  const { data: failed } = await supabase.from('prospects').select('id').eq('site_audit_status','failed')
  for (const row of (failed||[])) {
    await supabase.from('prospects').update({
      priority_score: 80,
      priority_bucket: 'hot',
      priority_reason: 'Site audit failed — possible broken, blocked, or unstable website.',
    }).eq('id', row.id)
  }
  console.log(`Recomputed grades for ${updated} prospects; boosted ${(failed||[]).length} failed audits`)
})().catch(err=>{console.error(err);process.exit(1)})
