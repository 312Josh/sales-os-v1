import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

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
