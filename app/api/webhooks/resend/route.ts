import { NextRequest, NextResponse } from "next/server"
import { Webhook } from "svix"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase credentials")
  return createClient(url, key, { auth: { persistSession: false } })
}

function getWebhookSecret() {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) throw new Error('RESEND_WEBHOOK_SECRET is missing')
  return secret
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
    const data = event?.data || {}
    const emailTo = data?.to?.[0] || data?.to || ''
    const tags = Array.isArray(data?.tags) ? data.tags : []
    const prospectTag = tags.find((tag: any) => tag?.name === 'prospect_slug')?.value || null

    const supabase = getSupabase()
    let prospect = null
    if (prospectTag) {
      const result = await supabase.from('prospects').select('id,email,email_open_count,email_click_count').eq('id', prospectTag).maybeSingle()
      prospect = result.data
    }
    if (!prospect && emailTo) {
      const result = await supabase.from('prospects').select('id,email,email_open_count,email_click_count').eq('email', emailTo).maybeSingle()
      prospect = result.data
    }

    const now = new Date().toISOString()
    if (prospect) {
      const patch: Record<string, any> = {}
      if (eventType === 'email.opened') {
        patch.email_opened_at = now
        patch.email_open_count = (prospect.email_open_count || 0) + 1
        patch.contact_status = 'email_opened'
      } else if (eventType === 'email.clicked') {
        patch.email_clicked_at = now
        patch.email_click_count = (prospect.email_click_count || 0) + 1
        patch.contact_status = 'email_clicked'
      } else if (eventType === 'email.delivered') {
        patch.email_sent_at = now
        patch.contact_status = 'email_sent'
      } else if (eventType === 'email.bounced') {
        patch.email_bounced_at = now
        patch.contact_status = 'email_bounced'
      }

      if (Object.keys(patch).length) await supabase.from('prospects').update(patch).eq('id', prospect.id)

      await supabase.from('email_events').insert({
        prospect_id: prospect.id,
        email_to: emailTo || prospect.email || 'unknown',
        event_type: eventType.replace('email.', ''),
        metadata: event,
      })
    } else {
      await supabase.from('email_events').insert({
        prospect_id: null,
        email_to: emailTo || 'unknown',
        event_type: eventType.replace('email.', ''),
        metadata: event,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Resend webhook error:', error)
    return NextResponse.json({ ok: false, error: error?.message || 'Webhook failed' }, { status: 400 })
  }
}
