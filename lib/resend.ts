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

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from = 'Sales OS <onboarding@resend.dev>',
  replyTo,
  headers,
  tags,
}: {
  to: string
  subject: string
  text: string
  html?: string
  from?: string
  replyTo?: string
  headers?: Record<string, string>
  tags?: { name: string; value: string }[]
}) {
  const resend = getResendClient()

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
    replyTo,
    headers,
    tags,
  })

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`)
  }

  return { id: data?.id || '', status: 'sent' }
}
