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

/**
 * POST /api/track/proof-view
 * Tracks when a prospect views a proof page
 * Body: { token: string }
 * Also supports GET with ?ref=token for pixel/redirect tracking
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ ok: false }, { status: 400 })

    const supabase = getSupabase()
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''

    // Look up prospect by tracking token
    const { data: prospect } = await supabase
      .from('prospects')
      .select('id, business_name, proof_view_count')
      .eq('tracking_token', token)
      .single()

    if (!prospect) return NextResponse.json({ ok: false, error: 'unknown token' }, { status: 404 })

    // Log engagement event
    await supabase.from('engagement_events').insert({
      id: createId('eng'),
      prospect_id: prospect.id,
      event_type: 'proof_viewed',
      ip_address: ip,
    })

    // Update prospect
    await supabase.from('prospects').update({
      proof_viewed_at: new Date().toISOString(),
      proof_view_count: (prospect.proof_view_count || 0) + 1,
    }).eq('id', prospect.id)

    // Activity log
    await supabase.from('activity_log').insert({
      id: createId('activity'),
      prospect_id: prospect.id,
      event_type: 'proof_viewed',
      summary: `👁️ Viewed proof page (view #${(prospect.proof_view_count || 0) + 1})`,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Proof view tracking error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

/**
 * GET /api/track/proof-view?ref=token
 * Tracking pixel / redirect approach
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('ref')
  if (!token) return new NextResponse('', { status: 204 })

  try {
    const supabase = getSupabase()
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''

    const { data: prospect } = await supabase
      .from('prospects')
      .select('id, proof_view_count')
      .eq('tracking_token', token)
      .single()

    if (prospect) {
      await supabase.from('engagement_events').insert({
        id: createId('eng'),
        prospect_id: prospect.id,
        event_type: 'proof_viewed',
        ip_address: ip,
      })

      await supabase.from('prospects').update({
        proof_viewed_at: new Date().toISOString(),
        proof_view_count: (prospect.proof_view_count || 0) + 1,
      }).eq('id', prospect.id)

      await supabase.from('activity_log').insert({
        id: createId('activity'),
        prospect_id: prospect.id,
        event_type: 'proof_viewed',
        summary: `👁️ Viewed proof page (view #${(prospect.proof_view_count || 0) + 1})`,
      })
    }
  } catch (error) {
    console.error('Proof view GET tracking error:', error)
  }

  // Return 1x1 transparent pixel
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  return new NextResponse(pixel, {
    status: 200,
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' },
  })
}
