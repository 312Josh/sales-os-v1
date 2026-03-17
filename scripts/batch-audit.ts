/**
 * Batch site audit script
 * Runs PageSpeed + HTML audits on all prospects with websites
 * Writes results back to Supabase
 * Throttled: 3 second delay between audits to respect rate limits
 * 
 * Usage: npx tsx scripts/batch-audit.ts
 */

import { createClient } from '@supabase/supabase-js'
import { runSiteAudit } from '../lib/site-audit'
import { gradeSiteAudit } from '../lib/site-audit'

const THROTTLE_MS = 3000 // 3s between audits to avoid PageSpeed 429s

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  // Fetch all prospects with websites that haven't been audited
  const { data: prospects, error } = await supabase
    .from('prospects')
    .select('id, business_name, website, site_audit_status')
    .neq('website', '')
    .order('priority_score', { ascending: false })

  if (error) {
    console.error('Failed to fetch prospects:', error.message)
    process.exit(1)
  }

  const toAudit = (prospects || []).filter(
    (p: any) => p.website && p.site_audit_status !== 'complete'
  )

  console.log(`Found ${toAudit.length} prospects to audit (of ${prospects?.length} with websites)`)

  let completed = 0
  let failed = 0

  for (const prospect of toAudit) {
    const name = prospect.business_name
    let website = prospect.website
    if (!website.startsWith('http')) website = `https://${website}`

    console.log(`\n[${completed + failed + 1}/${toAudit.length}] Auditing: ${name} (${website})`)

    // Mark as running
    await supabase.from('prospects').update({ site_audit_status: 'running' }).eq('id', prospect.id)

    const audit = await runSiteAudit(prospect.id, website)

    if (audit.status === 'complete') {
      // Recalculate priority score based on audit
      const basePriority = 50 // base score for having a website
      const siteBonus = audit.grade === 'D' ? 30 : audit.grade === 'C' ? 20 : audit.grade === 'B' ? 10 : 0
      const newPriority = basePriority + siteBonus
      const bucket = newPriority >= 70 ? 'hot' : newPriority >= 40 ? 'warm' : 'cold'

      const { error: updateError } = await supabase.from('prospects').update({
        site_audit_status: audit.status,
        site_audit_at: audit.auditedAt,
        pagespeed_score: audit.pagespeedScore ?? null,
        lcp_ms: audit.lcpMs ?? null,
        cls_score: audit.clsScore ?? null,
        broken_links_count: audit.brokenLinksCount ?? 0,
        missing_meta_count: audit.missingMetaCount ?? 0,
        missing_alt_count: audit.missingAltCount ?? 0,
        site_health_grade: audit.grade,
        site_audit_summary: audit.summary,
        priority_score: newPriority,
        priority_bucket: bucket,
        priority_reason: `Site health ${audit.grade} — ${audit.summary?.slice(0, 120) || 'audit complete'}`,
      }).eq('id', prospect.id)

      if (updateError) {
        console.log(`  ❌ DB update failed: ${updateError.message}`)
        failed++
      } else {
        console.log(`  ✅ Grade: ${audit.grade} | Score: ${audit.pagespeedScore ?? 'N/A'} | Priority: ${newPriority} (${bucket})`)
        completed++
      }
    } else {
      await supabase.from('prospects').update({
        site_audit_status: 'failed',
        site_audit_summary: audit.error || 'Audit failed',
      }).eq('id', prospect.id)
      console.log(`  ❌ Audit failed: ${audit.error}`)
      failed++
    }

    // Throttle
    if (completed + failed < toAudit.length) {
      await new Promise(resolve => setTimeout(resolve, THROTTLE_MS))
    }
  }

  console.log(`\n✅ Batch audit complete: ${completed} succeeded, ${failed} failed, ${toAudit.length} total`)
}

main().catch((err) => {
  console.error('Batch audit crashed:', err)
  process.exit(1)
})
