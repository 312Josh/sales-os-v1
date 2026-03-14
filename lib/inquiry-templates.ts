import type { Prospect } from './types'

export function generateInquiryText(prospect: Prospect) {
  const templates: Record<string, string> = {
    Electrical: 'I have an outlet in my kitchen that stopped working and another one that sparks when I plug something in. Can someone come look at it today or tomorrow?',
    'Garage door': 'My garage door will not close all the way — it goes down halfway then comes back up. Can someone come take a look today?',
    Plumbing: 'My kitchen sink is backing up and I have already tried drain cleaner twice. Can someone come out today or tomorrow?',
    HVAC: 'My AC unit is running but not cooling. It has been getting worse the last few days. Can someone come check it out?',
    Roofing: 'I noticed some shingles missing after the last storm and I think I see a small leak in my attic. Can someone come give me an estimate?',
    Locksmith: 'I am locked out of my house. How quickly can someone get here?',
    'Appliance repair': 'My dishwasher will not drain. It has been sitting with water in the bottom for two days. Can someone come look at it?',
  }

  const base = templates[prospect.niche] || `I need help with ${prospect.niche.toLowerCase()} service. Can someone come out today or tomorrow? What does it usually cost?`
  return `${base} Service area: ${prospect.serviceArea || prospect.city}.`
}
