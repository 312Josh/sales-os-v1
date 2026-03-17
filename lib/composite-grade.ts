import type { Prospect, CallLog } from './types'

export type CompositeGrade = 'A' | 'B' | 'C' | 'D'

/**
 * Composite prospect grade
 * 50% response time score (from inquiry test or call outcomes)
 * 30% site health score (from PageSpeed audit)
 * 20% niche fit score (from prospect metadata)
 */

function getResponseScore(prospect: Prospect, calls: CallLog[]): number {
  // If we have inquiry test data with a grade
  if (prospect.siteAuditStatus === 'complete') {
    // Use call history as proxy for responsiveness
    const prospectCalls = calls.filter(c => c.prospectId === prospect.id)
    if (prospectCalls.length === 0) return 50 // unknown = neutral

    const lastCall = prospectCalls.sort((a, b) =>
      new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime()
    )[0]

    // Score based on best outcome
    const outcomeScores: Record<string, number> = {
      interested: 100,
      book_meeting: 100,
      spoke_with_owner: 80,
      send_info: 70,
      spoke_with_staff: 60,
      follow_up_later: 50,
      left_voicemail: 40,
      no_answer: 30,
      gatekeeper: 20,
      not_interested: 10,
      wrong_number: 0,
    }

    return outcomeScores[lastCall.outcome] ?? 50
  }

  // No calls yet — score based on signals
  let score = 50
  if (prospect.contactFormPresent || prospect.contactFormUrl) score += 10
  if (prospect.chatPresent) score += 15
  if (prospect.onlineBookingPresent) score += 10
  if (prospect.noBookingSignal) score -= 10
  if (prospect.noChatSignal) score -= 5

  return Math.max(0, Math.min(100, score))
}

function getSiteHealthScore(prospect: Prospect): number {
  if (!prospect.siteHealthGrade) return 50 // unaudited = neutral

  const gradeScores: Record<string, number> = {
    D: 100, // worst site = best sales opportunity
    C: 75,
    B: 50,
    A: 25, // great site = harder to sell improvement
  }

  return gradeScores[prospect.siteHealthGrade] ?? 50
}

function getNicheFitScore(prospect: Prospect): number {
  // High-value verticals for CoGrow
  const highFitVerticals = ['field_service', 'plumbing', 'hvac', 'electrical', 'garage_door', 'appliance']
  const medFitVerticals = ['professional_services', 'law', 'cpa', 'financial_advisor']
  const highFitNiches = ['plumbing', 'hvac', 'electrical', 'garage_door', 'appliance']

  const vertical = prospect.vertical || ''
  const niche = prospect.niche || ''

  if (highFitVerticals.includes(vertical) || highFitNiches.includes(niche)) return 90
  if (medFitVerticals.includes(vertical) || ['law', 'cpa'].includes(niche)) return 70
  if (vertical === 'restaurant' || niche === 'restaurant') return 50

  return 40 // unknown
}

export function computeCompositeScore(prospect: Prospect, calls: CallLog[]): number {
  const responseScore = getResponseScore(prospect, calls)
  const siteScore = getSiteHealthScore(prospect)
  const nicheScore = getNicheFitScore(prospect)

  return Math.round(responseScore * 0.5 + siteScore * 0.3 + nicheScore * 0.2)
}

export function computeCompositeGrade(prospect: Prospect, calls: CallLog[]): CompositeGrade {
  const score = computeCompositeScore(prospect, calls)
  if (score >= 70) return 'A'
  if (score >= 55) return 'B'
  if (score >= 40) return 'C'
  return 'D'
}

export function getGradeColor(grade: CompositeGrade): string {
  switch (grade) {
    case 'A': return 'bg-red-500 text-white border-red-500' // red = call now
    case 'B': return 'bg-orange-500 text-white border-orange-500'
    case 'C': return 'bg-yellow-400 text-yellow-900 border-yellow-400'
    case 'D': return 'bg-slate-300 text-slate-600 border-slate-300' // gray = don't bother
  }
}

export function getGradeLabel(grade: CompositeGrade): string {
  switch (grade) {
    case 'A': return 'Call Now'
    case 'B': return 'High Priority'
    case 'C': return 'Medium'
    case 'D': return 'Low Priority'
  }
}
