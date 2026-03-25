import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const to = body.to || 'josh@cogrow.ai'
    const result = await sendEmail({
      to,
      from: 'Paul @ CoGrow <paul@cogrow.ai>',
      replyTo: 'paul@cogrow.ai',
      subject: 'Sales OS test email',
      text: `Sales OS test email at ${new Date().toISOString()}`,
      html: `<p>Sales OS test email at ${new Date().toISOString()}</p>`,
    })

    return NextResponse.json({ ok: true, id: result.id || null, status: result.status || null })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
}
