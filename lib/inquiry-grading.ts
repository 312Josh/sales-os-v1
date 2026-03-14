export function autoGradeInquiry(responseTimeMinutes?: number) {
  if (responseTimeMinutes == null || Number.isNaN(responseTimeMinutes)) return 'D'
  if (responseTimeMinutes < 5) return 'A'
  if (responseTimeMinutes < 60) return 'B'
  if (responseTimeMinutes < 1440) return 'C'
  return 'D'
}

export function isPriorityInquiryGrade(grade?: string) {
  return grade === 'C' || grade === 'D'
}
