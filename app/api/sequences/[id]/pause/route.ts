import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * POST /api/sequences/[id]/pause
 * Pauses an active sequence
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data: seq } = await supabase
      .from('sequences')
      .select('id, prospect_id, status')
      .eq('id', id)
      .single()

    if (!seq) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
    }

    if (seq.status === 'paused') {
      // Resume
      await supabase.from('sequences').update({ status: 'active' }).eq('id', id)

      await supabase.from('activity_log').insert({
        id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        prospect_id: seq.prospect_id,
        event_type: 'sequence_resumed',
        summary: `▶️ Outreach sequence resumed`,
      })

      return NextResponse.json({ status: 'active' })
    }

    await supabase.from('sequences').update({ status: 'paused' }).eq('id', id)

    await supabase.from('activity_log').insert({
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prospect_id: seq.prospect_id,
      event_type: 'sequence_paused',
      summary: `⏸️ Outreach sequence paused`,
    })

    return NextResponse.json({ status: 'paused' })
  } catch (error) {
    console.error('Sequence pause error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
