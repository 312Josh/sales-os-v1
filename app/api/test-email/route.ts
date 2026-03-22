import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const to = body.to || 'josh@cogrow.ai'
    const key = process.env.RESEND_API_KEY
    if (!key) return NextResponse.json({ ok: false, error: 'Missing RESEND_API_KEY' }, { status: 500 })

    const resend = new Resend(key)
    const result = await resend.emails.send({
      from: 'Paul @ CoGrow <paul@cogrow.ai>',
      to: [to],
      replyTo: 'paul@cogrow.ai',
      subject: 'Sales OS test email',
      text: `Sales OS test email at ${new Date().toISOString()}`,
      html: `<p>Sales OS test email at ${new Date().toISOString()}</p>`,
    })

    if (result.error) {
      return NextResponse.json({ ok: false, error: result.error.message, statusCode: result.error.statusCode }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: result.data?.id || null })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
}
