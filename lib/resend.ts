import { Resend } from 'resend'

let _resend: Resend | null = null
function getResendClient(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const resend = getResendClient()

  const { data, error } = await resend.emails.send({
    from: 'Sales OS <onboarding@resend.dev>',
    to,
    subject,
    text,
  })

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`)
  }

  return { id: data?.id || '', status: 'sent' }
}
