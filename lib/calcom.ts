export type CalcomBookingLinkInfo = {
  bookingUrl: string
  source: 'env'
  rep: 'Josh' | 'Paul'
  status: 'ready'
}

export async function getCalcomBookingLink(rep: 'Josh' | 'Paul'): Promise<CalcomBookingLinkInfo> {
  const apiKey = process.env.CALCOM_API_KEY
  const envKey = rep === 'Josh' ? 'CALCOM_BOOKING_URL_JOSH' : 'CALCOM_BOOKING_URL_PAUL'
  const bookingUrl = process.env[envKey]

  if (!apiKey) {
    throw new Error('CALCOM_API_KEY is missing')
  }

  if (!bookingUrl) {
    throw new Error(`${envKey} is missing`)
  }

  return {
    bookingUrl,
    source: 'env',
    rep,
    status: 'ready',
  }
}
