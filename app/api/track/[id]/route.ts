import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeTrackingDestination } from '@/lib/email-tracking'

function createActivityId() {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const destination = sanitizeTrackingDestination(request.nextUrl.searchParams.get('url'))

  if (!destination) {
    return NextResponse.redirect('https://sales-os-v1.vercel.app', { status: 302 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const forwarded = request.headers.get('x-forwarded-for') || ''
    const ip = forwarded.split(',')[0]?.trim() || null
    const userAgent = request.headers.get('user-agent') || null

    const { data: prospect } = await supabase
      .from('prospects')
      .select('id,email,email_click_count')
      .eq('id', id)
      .maybeSingle()

    await supabase.from('link_clicks').insert({
      prospect_slug: id,
      destination_url: destination,
      user_agent: userAgent,
      ip_address: ip,
    })

    if (prospect) {
      const clickedAt = new Date().toISOString()
      await supabase.from('prospects').update({
        email_clicked_at: clickedAt,
        email_click_count: (prospect.email_click_count || 0) + 1,
        contact_status: 'email_clicked',
      }).eq('id', id)

      await supabase.from('email_events').insert({
        prospect_id: id,
        email_to: prospect.email || 'unknown',
        event_type: 'clicked',
        metadata: { destination_url: destination, source: 'redirect', user_agent: userAgent, ip_address: ip },
        created_at: clickedAt,
      })

      await supabase.from('activity_log').insert({
        id: createActivityId(),
        prospect_id: id,
        event_type: 'email_clicked',
        summary: '🔗 Tracked link clicked',
      })
    }
  } catch (error) {
    console.error('Link tracking error:', error)
  }

  return NextResponse.redirect(destination, { status: 302 })
}
