import type { Prospect } from '@/lib/types'
import { getProspectDriveAssets } from '@/lib/drive-assets'

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

  const iMessageText = `Hey ${name}, I put together a new website for ${prospect.businessName}. Take a look: ${proofUrl}. If you like what you see, I'd love to spend 10 minutes walking you through it. — Paul, CoGrow`
  const emailSubject = `${prospect.businessName}, we rebuilt your website`
  const emailBody = `Hey ${name},\n\nI put together a new website for ${prospect.businessName}. Take a look: ${proofUrl}.\n\nIf you like what you see, I'd love to spend 10 minutes walking you through it.\n\n— Paul, CoGrow`
  const smsFallbackText = `Hey ${name}, I put together a new website for ${prospect.businessName}. Take a look: ${proofUrl}. If you like what you see, I'd love to spend 10 minutes walking you through it. — Paul, CoGrow`

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
