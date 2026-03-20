export type SiteAuditStatus = 'not_started' | 'queued' | 'running' | 'complete' | 'failed'
export type SiteHealthGrade = 'A' | 'B' | 'C' | 'D'

export type SiteAudit = {
  id: string
  prospectId: string
  status: SiteAuditStatus
  auditedAt?: string
  pagespeedScore?: number
  lcpMs?: number
  clsScore?: number
  brokenLinksCount?: number
  missingMetaCount?: number
  missingAltCount?: number
  grade?: SiteHealthGrade
  summary?: string
  findings: string[]
  error?: string
}

function safeNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function extractMetric(lighthouse: any, key: string): number | undefined {
  return safeNumber(lighthouse?.audits?.[key]?.numericValue)
}

function summarizeOpportunity(lighthouse: any, key: string): string | undefined {
  const details = lighthouse?.audits?.[key]
  const score = safeNumber(details?.score)
  if (score === undefined || score >= 0.9) return undefined
  const title = details?.title || key
  const displayValue = details?.displayValue ? ` (${details.displayValue})` : ''
  return `${title}${displayValue}`
}

function normalizeUrl(baseUrl: string, href: string) {
  try {
    return new URL(href, baseUrl).toString()
  } catch {
    return null
  }
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SalesOSAudit/1.0; +https://sales-os-v1.vercel.app)'
    },
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`HTML fetch failed: ${response.status}`)
  }

  return await response.text()
}

function countMatches(content: string, regex: RegExp) {
  return [...content.matchAll(regex)].length
}

function extractLinks(html: string) {
  return [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]).filter(Boolean)
}

async function countBrokenInternalLinks(baseUrl: string, html: string) {
  const base = new URL(baseUrl)
  const internal = Array.from(new Set(
    extractLinks(html)
      .filter((href) => !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#') && !href.startsWith('javascript:'))
      .map((href) => normalizeUrl(baseUrl, href))
      .filter((href): href is string => Boolean(href))
      .filter((href) => new URL(href).host === base.host)
  )).slice(0, 12)

  let broken = 0
  for (const link of internal) {
    try {
      const response = await fetch(link, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SalesOSAudit/1.0; +https://sales-os-v1.vercel.app)'
        },
      })
      if (response.status >= 400) broken += 1
    } catch {
      broken += 1
    }
  }

  return broken
}

export function gradeSiteAudit(metrics: {
  pagespeedScore?: number
  lcpMs?: number
  clsScore?: number
  brokenLinksCount?: number
  missingMetaCount?: number
  missingAltCount?: number
}): SiteHealthGrade {
  const score = metrics.pagespeedScore
  const lcp = metrics.lcpMs
  const cls = metrics.clsScore
  const broken = metrics.brokenLinksCount ?? 0
  const missingMeta = metrics.missingMetaCount ?? 0
  const missingAlt = metrics.missingAltCount ?? 0

  // Severity model: worse sites should surface harder for sales.
  // Weight on-page problems more heavily because PSI is often unavailable.
  const riskPoints =
    (score === undefined ? 1 : score < 35 ? 4 : score < 50 ? 3 : score < 70 ? 2 : score < 85 ? 1 : 0) +
    (lcp === undefined ? 0 : lcp > 5000 ? 4 : lcp > 3500 ? 3 : lcp > 2500 ? 2 : lcp > 1800 ? 1 : 0) +
    (cls === undefined ? 0 : cls > 0.3 ? 4 : cls > 0.18 ? 3 : cls > 0.1 ? 2 : cls > 0.05 ? 1 : 0) +
    (broken >= 6 ? 5 : broken >= 3 ? 4 : broken >= 1 ? 2 : 0) +
    (missingMeta >= 1 ? 2 : 0) +
    (missingAlt >= 20 ? 4 : missingAlt >= 10 ? 3 : missingAlt >= 5 ? 2 : missingAlt >= 1 ? 1 : 0)

  if (riskPoints >= 11) return 'D'
  if (riskPoints >= 7) return 'C'
  if (riskPoints >= 3) return 'B'
  return 'A'
}

export function buildSiteAuditSummary(audit: SiteAudit) {
  const findings = audit.findings.slice(0, 5)
  if (findings.length === 0) {
    findings.push('No major site issues were captured in the lightweight audit pass.')
  }
  return findings.join(' • ')
}

export async function runSiteAudit(prospectId: string, website: string): Promise<SiteAudit> {
  const audit: SiteAudit = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    prospectId,
    status: 'running',
    findings: [],
  }

  try {
    const encoded = encodeURIComponent(website)
    let lighthouse: any = undefined
    let categories: any = undefined

    try {
      const psiResponse = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encoded}&strategy=mobile&category=PERFORMANCE&category=SEO`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SalesOSAudit/1.0; +https://sales-os-v1.vercel.app)'
        },
        redirect: 'follow',
      })

      if (!psiResponse.ok) {
        throw new Error(`PageSpeed failed: ${psiResponse.status}`)
      }

      const psi = await psiResponse.json()
      lighthouse = psi?.lighthouseResult
      categories = lighthouse?.categories

      audit.pagespeedScore = safeNumber(categories?.performance?.score) !== undefined
        ? Math.round((safeNumber(categories?.performance?.score) || 0) * 100)
        : undefined
      audit.lcpMs = extractMetric(lighthouse, 'largest-contentful-paint')
      audit.clsScore = extractMetric(lighthouse, 'cumulative-layout-shift')
    } catch (error) {
      audit.findings.push(error instanceof Error ? error.message : 'PageSpeed unavailable for this run')
    }

    const html = await fetchHtml(website)
    audit.missingMetaCount = countMatches(html, /<meta[^>]+name=["']description["'][^>]+content=["']\s*["'][^>]*>/gi) === 0 ? 1 : 0
    audit.missingAltCount = countMatches(html, /<img(?![^>]*alt=)[^>]*>/gi)
    audit.brokenLinksCount = await countBrokenInternalLinks(website, html)

    const opportunities = [
      summarizeOpportunity(lighthouse, 'render-blocking-resources'),
      summarizeOpportunity(lighthouse, 'uses-optimized-images'),
      summarizeOpportunity(lighthouse, 'uses-text-compression'),
      summarizeOpportunity(lighthouse, 'unused-css-rules'),
      summarizeOpportunity(lighthouse, 'unused-javascript'),
    ].filter(Boolean) as string[]

    if (audit.pagespeedScore !== undefined) {
      audit.findings.push(`Performance score ${audit.pagespeedScore}/100`)
    }
    if (audit.lcpMs !== undefined) {
      audit.findings.push(`LCP ${Math.round(audit.lcpMs)}ms`)
    }
    if (audit.clsScore !== undefined) {
      audit.findings.push(`CLS ${audit.clsScore.toFixed(2)}`)
    }
    if ((audit.brokenLinksCount || 0) > 0) {
      audit.findings.push(`${audit.brokenLinksCount} broken internal link${audit.brokenLinksCount === 1 ? '' : 's'}`)
    }
    if ((audit.missingMetaCount || 0) > 0) {
      audit.findings.push(`${audit.missingMetaCount} missing meta description issue${audit.missingMetaCount === 1 ? '' : 's'}`)
    }
    if ((audit.missingAltCount || 0) > 0) {
      audit.findings.push(`${audit.missingAltCount} image${audit.missingAltCount === 1 ? '' : 's'} missing alt text`)
    }

    audit.findings.push(...opportunities.slice(0, Math.max(0, 5 - audit.findings.length)))
    if (audit.pagespeedScore === undefined) {
      audit.findings.push('PageSpeed API did not return usable data on this run; on-page scan still completed.')
    }
    audit.grade = gradeSiteAudit(audit)
    audit.summary = buildSiteAuditSummary(audit)
    audit.auditedAt = new Date().toISOString()
    audit.status = 'complete'
    return audit
  } catch (error) {
    audit.status = 'failed'
    audit.error = error instanceof Error ? error.message : 'Unknown site audit failure'
    audit.auditedAt = new Date().toISOString()
    audit.summary = audit.error
    return audit
  }
}
