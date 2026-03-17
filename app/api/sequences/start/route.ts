import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSequenceSteps } from '@/lib/sequence-templates'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * POST /api/sequences/start
 * Body: { prospect_id: string }
 * Creates 1 sequence + 5 scheduled steps
 */
export async function POST(request: NextRequest) {
  try {
    const { prospect_id } = await request.json()
    if (!prospect_id) {
      return NextResponse.json({ error: 'prospect_id required' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Check prospect exists
    const { data: prospect } = await supabase
      .from('prospects')
      .select('id, business_name')
      .eq('id', prospect_id)
      .single()

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    // Check for existing active sequence
    const { data: existing } = await supabase
      .from('sequences')
      .select('id')
      .eq('prospect_id', prospect_id)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Active sequence already exists', sequence_id: existing.id }, { status: 409 })
    }

    // Create sequence
    const { data: sequence, error: seqError } = await supabase
      .from('sequences')
      .insert({ prospect_id })
      .select('id')
      .single()

    if (seqError || !sequence) {
      console.error('Failed to create sequence:', seqError)
      return NextResponse.json({ error: 'Failed to create sequence' }, { status: 500 })
    }

    // Create steps
    const now = new Date()
    const steps = getSequenceSteps().map((step) => {
      const scheduledAt = new Date(now.getTime() + step.dayOffset * 24 * 60 * 60 * 1000)
      return {
        sequence_id: sequence.id,
        step_number: step.stepNumber,
        channel: step.channel,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending',
      }
    })

    const { error: stepsError } = await supabase
      .from('sequence_steps')
      .insert(steps)

    if (stepsError) {
      console.error('Failed to create steps:', stepsError)
      return NextResponse.json({ error: 'Failed to create steps' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prospect_id,
      event_type: 'sequence_started',
      summary: `🚀 Outreach sequence started — 5 touchpoints over 7 days`,
    })

    return NextResponse.json({
      sequence_id: sequence.id,
      steps_created: 5,
    })
  } catch (error) {
    console.error('Sequence start error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
