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
  const target = request.nextUrl.searchParams.get('to')
  if (!token || !target) return NextResponse.redirect('https://sales-os-v1.vercel.app')

  try {
    const supabase = getSupabase()
    const { data: prospect } = await supabase
      .from('prospects')
      .select('id')
      .eq('tracking_token', token)
      .single()

    if (prospect) {
      await supabase.from('prospects').update({
        email_clicked_at: new Date().toISOString(),
      }).eq('id', prospect.id)

      await supabase.from('engagement_events').insert({
        id: createId('eng'),
        prospect_id: prospect.id,
        event_type: 'email_clicked',
        metadata: target,
      })

      await supabase.from('activity_log').insert({
        id: createId('activity'),
        prospect_id: prospect.id,
        event_type: 'email_clicked',
        summary: '🔗 Clicked email link',
      })
    }
  } catch (error) {
    console.error('Email click tracking error:', error)
  }

  return NextResponse.redirect(target)
}
