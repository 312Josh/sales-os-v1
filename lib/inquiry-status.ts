export function getInquiryStatusCopy(status?: string) {
  const copy: Record<string, string> = {
    not_started: 'No inquiry test started',
    queued: 'Queued for prep',
    ready_for_approval: 'Ready for rep approval',
    approved: 'Approved and ready for live submission once provider wiring exists',
    submitted: 'Submitted externally',
    monitoring: 'Monitoring for first response',
    graded: 'Graded and logged',
    expired: 'Expired without usable response',
  }
  return copy[status || 'not_started'] || status || 'Unknown'
}
