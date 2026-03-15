export async function sendTwilioSms({ to, body }: { to: string; body: string }) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!sid || !token || !from) {
    throw new Error('Twilio env is incomplete')
  }

  const creds = Buffer.from(`${sid}:${token}`).toString('base64')
  const form = new URLSearchParams({ To: to, From: from, Body: body })

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })

  if (!response.ok) {
    const bodyText = await response.text()
    throw new Error(`Twilio send failed: ${response.status} ${bodyText}`)
  }

  return await response.json()
}
