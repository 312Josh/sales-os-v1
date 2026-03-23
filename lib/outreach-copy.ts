import type { Prospect } from '@/lib/types'

export function getProspectDisplayName(prospect: Prospect) {
  return prospect.decisionMaker || 'there'
}

export function getProofScreenshotUrl(prospect: Prospect) {
  return prospect.proofScreenshotUrl || `/api/proof-screenshot/${prospect.id}`
}

export function buildOutreachTemplates(prospect: Prospect) {
  const name = getProspectDisplayName(prospect)
  const proofUrl = prospect.proofUrl || prospect.website
  const screenshotUrl = getProofScreenshotUrl(prospect)
  const issue = prospect.siteAuditSummary || prospect.priorityReason || 'there are clear conversion leaks on the site'

  const iMessageText = `Hey ${name} — I put together a quick preview for ${prospect.businessName}. Your current site looks like it's leaking leads because ${issue}. Here’s the proof page: ${proofUrl}`
  const emailSubject = `${prospect.businessName}: quick website win I mocked up`
  const emailBody = `Hi ${name},\n\nI put together a quick proof page for ${prospect.businessName} showing how the site could convert more moving leads.\n\nProof page: ${proofUrl}\nScreenshot: ${screenshotUrl}\n\nThe short version: ${issue}.\n\nIf useful, I can walk you through it and show the exact changes.\n\n— Paul\nCoGrow`
  const smsFallbackText = `Hi ${name} — Paul from CoGrow. I made a quick proof page for ${prospect.businessName}: ${proofUrl}. Want me to text over the screenshot too?`

  return { iMessageText, emailSubject, emailBody, smsFallbackText, screenshotUrl, proofUrl }
}
