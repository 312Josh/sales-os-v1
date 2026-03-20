import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('ref')
  if (!token) return new NextResponse('', { status: 204 })

  try {
    const supabase = getSupabase()
    const { data: prospect } = await supabase
      .from('prospects')
      .select('id')
      .eq('tracking_token', token)
      .single()

    if (prospect) {
      await supabase.from('prospects').update({
        email_opened_at: new Date().toISOString(),
      }).eq('id', prospect.id)

      await supabase.from('engagement_events').insert({
        id: createId('eng'),
        prospect_id: prospect.id,
        event_type: 'email_opened',
      })

      await supabase.from('activity_log').insert({
        id: createId('activity'),
        prospect_id: prospect.id,
        event_type: 'email_opened',
        summary: '📬 Email opened',
      })
    }
  } catch (error) {
    console.error('Email open tracking error:', error)
  }

  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  return new NextResponse(pixel, {
    status: 200,
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' },
  })
}
