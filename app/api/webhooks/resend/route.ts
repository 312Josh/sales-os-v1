import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { buildProspectUpdateForEvent, getEmailEventType, getEmailTo, resolveProspectForEvent } from '@/lib/email-tracking'

function getWebhookSecret() {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) throw new Error('RESEND_WEBHOOK_SECRET is missing')
  return secret
}

function createActivitySummary(eventType: string, emailTo: string) {
  switch (eventType) {
    case 'opened':
      return '👁️ Email opened'
    case 'clicked':
      return '🔗 Email link clicked'
    case 'delivered':
      return '📤 Email delivered'
    case 'bounced':
      return '🔴 Email bounced'
    default:
      return `Email event: ${eventType}${emailTo ? ` (${emailTo})` : ''}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const headers = {
      'svix-id': request.headers.get('svix-id') || '',
      'svix-timestamp': request.headers.get('svix-timestamp') || '',
      'svix-signature': request.headers.get('svix-signature') || '',
    }

    const wh = new Webhook(getWebhookSecret())
    const event = wh.verify(payload, headers) as any
    const eventType = String(event?.type || '')
    const normalizedEventType = getEmailEventType(eventType)
    const emailTo = getEmailTo(event)
    const occurredAt = String(event?.created_at || new Date().toISOString())

    const supabase = getSupabaseAdmin()
    const prospect = await resolveProspectForEvent(event)

    if (prospect) {
      const patch = buildProspectUpdateForEvent(eventType, prospect, occurredAt)
      if (Object.keys(patch).length) {
        await supabase.from('prospects').update(patch).eq('id', prospect.id)
      }

      await supabase.from('activity_log').insert({
        id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        prospect_id: prospect.id,
        event_type: `email_${normalizedEventType}`,
        summary: createActivitySummary(normalizedEventType, emailTo || prospect.email || ''),
      })
    }

    await supabase.from('email_events').insert({
      prospect_id: prospect?.id || null,
      email_to: emailTo || prospect?.email || 'unknown',
      event_type: normalizedEventType,
      metadata: event,
      created_at: occurredAt,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Resend webhook error:', error)
    return NextResponse.json({ ok: false, error: error?.message || 'Webhook failed' }, { status: 400 })
  }
}
