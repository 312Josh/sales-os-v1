export async function sendPostmarkEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string
  subject: string
  html: string
  text: string
  from?: string
}) {
  const token = process.env.POSTMARK_API_TOKEN
  if (!token) {
    throw new Error('POSTMARK_API_TOKEN is missing')
  }

  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': token,
    },
    body: JSON.stringify({
      From: from || 'salesos@updates.conceptos.ai',
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
      MessageStream: 'outbound',
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Postmark send failed: ${response.status} ${body}`)
  }

  return await response.json()
}
