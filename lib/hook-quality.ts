import type { Prospect } from './types'

export function getSharperTalkTrack(prospect: Prospect) {
  const opener = prospect.callOpener || prospect.outreachHook
  const commercialRisk = prospect.noBookingSignal
    ? 'There is still too much friction between interest and a booked conversation.'
    : 'The path exists, but it is softer than it should be for a business like this.'
  const leverage = prospect.idealPitchAngle || prospect.priorityReason
  return `${opener} ${commercialRisk} The pitch angle here is: ${leverage}`
}

export function getShortHook(prospect: Prospect) {
  return `${prospect.businessName}: ${prospect.idealPitchAngle || prospect.outreachHook}`
}
