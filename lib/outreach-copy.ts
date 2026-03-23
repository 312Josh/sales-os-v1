import type { Prospect } from '@/lib/types'
import { getProspectDriveAssets } from '@/lib/drive-assets'

function nicheAngle(prospect: Prospect) {
  const niche = (prospect.niche || prospect.vertical || '').toLowerCase()
  if (niche.includes('electrical')) return 'quote requests and emergency calls are probably leaking on mobile'
  if (niche.includes('insurance')) return 'the trust + quote-request flow feels dated and likely drops inbound leads'
  if (niche.includes('tree')) return 'high-intent estimate requests are not getting the clean, fast path they should'
  if (niche.includes('restoration')) return 'urgent water-damage leads need a faster, clearer path to call and convert'
  if (niche.includes('architecture')) return 'high-value project inquiries are not getting enough trust and conversion framing'
  if (niche.includes('moving')) return 'estimate requests are not getting enough trust and conversion friction removed'
  return 'the site is leaving inbound leads on the table'
}

export function getProspectDisplayName(prospect: Prospect) {
  return prospect.decisionMaker || prospect.businessName
}

export function getProofScreenshotUrl(prospect: Prospect) {
  const driveAssets = getProspectDriveAssets(prospect.businessName)
  return driveAssets.gifUrl || driveAssets.screenshotUrl || prospect.proofScreenshotUrl || `/api/proof-screenshot/${prospect.id}`
}

export function buildOutreachTemplates(prospect: Prospect) {
  const name = getProspectDisplayName(prospect)
  const proofUrl = prospect.proofUrl || `https://sales-os-v1.vercel.app/proof/${String(prospect.businessName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
  const driveAssets = getProspectDriveAssets(prospect.businessName)
  const screenshotUrl = getProofScreenshotUrl(prospect)
  const issue = nicheAngle(prospect)
  const auditLine = prospect.siteAuditSummary || prospect.priorityReason || issue

  const iMessageText = `Hey ${name} — I mocked up a quick improvement concept for ${prospect.businessName}. The big issue is that ${issue}. Here’s the proof page: ${proofUrl}`
  const emailSubject = `${prospect.businessName}: quick idea to improve lead conversion`
  const emailBody = `Hi ${name},\n\nI put together a quick proof page for ${prospect.businessName}. The main gap I noticed is that ${issue}.\n\nProof page: ${proofUrl}\n\nAudit note: ${auditLine}.\n\nIf useful, I can walk you through the changes and how they'd tighten up conversion.\n\n— Paul\nCoGrow`
  const smsFallbackText = `Hi ${name} — Paul from CoGrow. I made a quick proof page for ${prospect.businessName}: ${proofUrl}. Main issue: ${issue}. Want me to send the screenshot too?`

  return {
    iMessageText,
    emailSubject,
    emailBody,
    smsFallbackText,
    screenshotUrl,
    proofUrl,
    gifUrl: driveAssets.gifUrl,
    videoUrl: driveAssets.videoUrl,
  }
}
