import type { Prospect } from './types'

export function describePriority(prospect: Prospect) {
  return `${prospect.priorityReason} Site ${prospect.siteScore}/5, intake ${prospect.intakeScore}/5, owner fit ${prospect.ownerFitScore}/5, offer fit ${prospect.fitScore}/5.`
}

export function isHighPriority(prospect: Prospect) {
  return prospect.priorityScore >= 4
}
