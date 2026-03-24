import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase credentials")
  return createClient(url, key, { auth: { persistSession: false } })
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const event = body?.type || body?.data?.type || body?.event || ''
    const emailId = body?.data?.email_id || body?.data?.emailId || body?.data?.object?.id || body?.email_id || null
    const to = body?.data?.to?.[0] || body?.data?.to || body?.to || ''
    const headers = body?.data?.headers || {}
    const trackingToken = headers['X-Prospect-Tracking-Token'] || headers['x-prospect-tracking-token'] || body?.data?.tags?.tracking_token || null

    const supabase = getSupabase()
    let prospect = null
    if (trackingToken) {
      const result = await supabase.from('prospects').select('id,business_name,email_open_count,email_click_count').eq('tracking_token', trackingToken).maybeSingle()
      prospect = result.data
    }
    if (!prospect && to) {
      const result = await supabase.from('prospects').select('id,business_name,email_open_count,email_click_count').eq('email', to).maybeSingle()
      prospect = result.data
    }

    if (prospect) {
      const now = new Date().toISOString()
      const patch: Record<string, any> = {}
      let activitySummary = `Email event: ${event}`
      if (event.includes('open')) {
        patch.email_opened_at = now
        patch.email_open_count = (prospect.email_open_count || 0) + 1
        patch.contact_status = 'email_opened'
        activitySummary = '📬 Email opened'
      } else if (event.includes('click')) {
        patch.email_clicked_at = now
        patch.email_click_count = (prospect.email_click_count || 0) + 1
        patch.contact_status = 'email_clicked'
        activitySummary = '🔗 Clicked email link'
      } else if (event.includes('reply')) {
        patch.email_replied_at = now
        patch.contact_status = 'replied'
        activitySummary = '💬 Replied to email'
      } else if (event.includes('sent') || event.includes('delivered')) {
        patch.email_sent_at = now
        patch.contact_status = 'email_sent'
        patch.last_contacted_at = now
        activitySummary = '✉️ Email sent'
      }

      if (Object.keys(patch).length) {
        await supabase.from('prospects').update(patch).eq('id', prospect.id)
      }

      await supabase.from('engagement_events').insert({
        id: createId('eng'),
        prospect_id: prospect.id,
        event_type: event || 'resend_event',
        metadata: JSON.stringify({ emailId, to }),
      })

      await supabase.from('activity_log').insert({
        id: createId('activity'),
        prospect_id: prospect.id,
        event_type: event || 'resend_event',
        summary: activitySummary,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Resend webhook error:', error)
    return NextResponse.json({ ok: false, error: error?.message || 'Webhook failed' }, { status: 500 })
  }
}
