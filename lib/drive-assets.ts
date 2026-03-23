const DRIVE_VIEW_BASE = 'https://drive.google.com/uc?export=view&id='

export type DriveAsset = {
  screenshotId?: string
  gifId?: string
  videoId?: string
}

export const PROSPECT_DRIVE_ASSETS: Record<string, DriveAsset> = {
  // Fill with Google Drive file IDs from the shared folder.
  // Example:
  // 'Orland Electric Services': { screenshotId: 'abc123', gifId: 'def456' },
}

export function toDriveViewUrl(fileId?: string | null) {
  if (!fileId) return undefined
  return `${DRIVE_VIEW_BASE}${fileId}`
}

export function getProspectDriveAssets(businessName?: string | null): DriveAsset & {
  screenshotUrl?: string
  gifUrl?: string
  videoUrl?: string
} {
  if (!businessName) return {}
  const asset = PROSPECT_DRIVE_ASSETS[businessName] || {}
  return {
    ...asset,
    screenshotUrl: toDriveViewUrl(asset.screenshotId),
    gifUrl: toDriveViewUrl(asset.gifId),
    videoUrl: toDriveViewUrl(asset.videoId),
  }
}
