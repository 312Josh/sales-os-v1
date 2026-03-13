export type SalesUser = {
  id: 'josh' | 'paul'
  name: 'Josh' | 'Paul'
  role: 'rep'
  bookingUrlEnv: 'CALCOM_BOOKING_URL_JOSH' | 'CALCOM_BOOKING_URL_PAUL'
}

export const SALES_USERS: SalesUser[] = [
  {
    id: 'josh',
    name: 'Josh',
    role: 'rep',
    bookingUrlEnv: 'CALCOM_BOOKING_URL_JOSH',
  },
  {
    id: 'paul',
    name: 'Paul',
    role: 'rep',
    bookingUrlEnv: 'CALCOM_BOOKING_URL_PAUL',
  },
]
