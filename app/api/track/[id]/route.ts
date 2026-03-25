import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const destination = request.nextUrl.searchParams.get('url')
  if (!destination) return NextResponse.redirect('https://sales-os-v1.vercel.app')

  try {
    const supabase = getSupabase()
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
      await supabase.from('prospects').update({
        email_clicked_at: new Date().toISOString(),
        email_click_count: (prospect.email_click_count || 0) + 1,
        contact_status: 'email_clicked',
      }).eq('id', id)

      await supabase.from('email_events').insert({
        prospect_id: id,
        email_to: prospect.email || 'unknown',
        event_type: 'clicked',
        metadata: { destination_url: destination, source: 'redirect' },
      })
    }
  } catch (error) {
    console.error('Link tracking error:', error)
  }

  return NextResponse.redirect(destination, { status: 302 })
}
