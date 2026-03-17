import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * POST /api/sequences/[id]/stop
 * Stops a sequence permanently
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const reason = body.reason || 'manual_stop'

    const supabase = getSupabase()

    const { data: seq } = await supabase
      .from('sequences')
      .select('id, prospect_id')
      .eq('id', id)
      .single()

    if (!seq) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
    }

    await supabase.from('sequences').update({
      status: 'stopped',
      stopped_reason: reason,
    }).eq('id', id)

    // Cancel all pending steps
    await supabase.from('sequence_steps').update({
      status: 'cancelled',
    }).eq('sequence_id', id).eq('status', 'pending')

    await supabase.from('activity_log').insert({
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prospect_id: seq.prospect_id,
      event_type: 'sequence_stopped',
      summary: `⏹️ Outreach sequence stopped — ${reason}`,
    })

    return NextResponse.json({ status: 'stopped', reason })
  } catch (error) {
    console.error('Sequence stop error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
