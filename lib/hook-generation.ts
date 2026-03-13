import type { Prospect } from './types'

export function getCommercialRiskLine(prospect: Prospect) {
  if (prospect.noBookingSignal && prospect.noChatSignal) {
    return 'High-intent prospects have no low-friction path to convert.'
  }
  if (prospect.noBookingSignal) {
    return 'Interested leads still face too much friction before they can book.'
  }
  return 'The conversion path exists, but it is softer than it should be.'
}

export function getTalkTrack(prospect: Prospect) {
  return [
    prospect.callOpener || prospect.outreachHook,
    getCommercialRiskLine(prospect),
    prospect.idealPitchAngle || prospect.priorityReason,
  ].join(' ')
}

export function getWhyThisMatters(prospect: Prospect) {
  return `${prospect.businessName} is a fit because ${prospect.enrichmentSummary || prospect.priorityReason}`
}
