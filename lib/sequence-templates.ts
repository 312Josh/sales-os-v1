import type { Prospect } from './types'

export interface SequenceStep {
  stepNumber: number
  dayOffset: number
  channel: 'email' | 'sms'
  getSubject?: (p: Prospect) => string
  getMessage: (p: Prospect, proofUrl: string) => string
}

const STEPS: SequenceStep[] = [
  {
    stepNumber: 0,
    dayOffset: 0,
    channel: 'email',
    getSubject: (p) => `We tested ${p.businessName} — here's what we found`,
    getMessage: (p, proofUrl) =>
      `Hi ${p.decisionMaker || 'there'},\n\nWe ran a response time test on ${p.businessName} and found some opportunities worth looking at.\n\n${p.siteAuditSummary ? `Key finding: ${p.siteAuditSummary}\n\n` : ''}See the full breakdown here: ${proofUrl}\n\nWorth a quick look — most owners are surprised by what we find.\n\nBest,\nJosh Mellender\nCoGrow`,
  },
  {
    stepNumber: 1,
    dayOffset: 1,
    channel: 'sms',
    getMessage: (p, proofUrl) =>
      `Hi ${p.decisionMaker || 'there'}, sent you an email about ${p.businessName}'s response time. Worth a look — ${proofUrl}`,
  },
  {
    stepNumber: 2,
    dayOffset: 3,
    channel: 'sms',
    getMessage: (p, proofUrl) =>
      `Hey ${p.decisionMaker || 'there'} — did you get a chance to see the site we built for ${p.businessName}? ${proofUrl}`,
  },
  {
    stepNumber: 3,
    dayOffset: 5,
    channel: 'email',
    getSubject: (p) => {
      const hours = p.lcpMs ? Math.round(p.lcpMs / 3600000) : null
      return hours
        ? `Your competitor responds in 12 min. ${p.businessName} took ${hours} hours.`
        : `Your competitor responds in 12 min. ${p.businessName} took much longer.`
    },
    getMessage: (p, proofUrl) =>
      `Hi ${p.decisionMaker || 'there'},\n\nIn our industry, the first business to respond wins 78% of the time.\n\nWe tested ${p.businessName} against competitors in your area. The gap is significant.\n\nSee the comparison: ${proofUrl}\n\nThis is costing you real revenue every week. Happy to walk through the numbers if you have 10 minutes.\n\nJosh Mellender\nCoGrow`,
  },
  {
    stepNumber: 4,
    dayOffset: 7,
    channel: 'sms',
    getMessage: (p) =>
      `Last message — ${p.businessName} is leaving money on the table every week. Reply YES and I'll send the numbers.`,
  },
]

export function getSequenceSteps(): SequenceStep[] {
  return STEPS
}

export function getProofUrl(prospect: Prospect): string {
  const token = prospect.trackingToken || ''
  const vertical = prospect.vertical || 'field_service'

  if (['plumbing', 'hvac', 'electrical', 'garage_door', 'appliance'].includes(prospect.niche || '') || vertical === 'field_service') {
    return `https://plumbing-os.vercel.app/api/generate-proof?ref=${token}`
  }
  if (vertical === 'professional_services' || ['law', 'cpa'].includes(prospect.niche || '')) {
    return `https://professional-services-os.vercel.app/api/generate-proof?ref=${token}`
  }
  return `https://sales-os-v1.vercel.app/api/track/proof-view?ref=${token}`
}
