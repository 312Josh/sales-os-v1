import type { Prospect } from '@/lib/types'
import { getProspectDriveAssets } from '@/lib/drive-assets'

export function getProspectDisplayName(prospect: Prospect) {
  const name = prospect.decisionMaker?.trim()
  return name || 'there'
}

export function getProofScreenshotUrl(prospect: Prospect) {
  const driveAssets = getProspectDriveAssets(prospect.businessName)
  if (prospect.proofScreenshotUrl && !prospect.proofScreenshotUrl.includes('drive.google.com')) {
    return prospect.proofScreenshotUrl
  }
  return `/proof-screenshots/${prospect.id}.png`
}

export function buildOutreachTemplates(prospect: Prospect) {
  const name = getProspectDisplayName(prospect)
  const proofUrl = prospect.proofUrl || `https://sales-os-v1.vercel.app/proof/${String(prospect.businessName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
  const driveAssets = getProspectDriveAssets(prospect.businessName)
  const screenshotUrl = getProofScreenshotUrl(prospect)

  const iMessageText = `Hey ${name} — we rebuilt ${prospect.businessName}'s website. Here’s the link: ${proofUrl}`
  const emailSubject = `${prospect.businessName}, we rebuilt your website`
  const emailBody = `Hey ${name},\n\nWe rebuilt your website for ${prospect.businessName} and put together a live preview for you.\n\nYou can view it here: ${proofUrl}\n\nIf you want, I can walk you through the changes and show you how we'd tighten up the customer flow from first visit to booked call.\n\n— Paul, CoGrow`
  const smsFallbackText = `Hey ${name} — we rebuilt ${prospect.businessName}'s website. Here’s the preview: ${proofUrl}`

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
