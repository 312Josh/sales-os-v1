import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ prospectId: string }> }) {
  const { prospectId } = await params
  const supabase = getSupabaseAdmin()
  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, proof_screenshot_url')
    .eq('id', prospectId)
    .single()

  if (!prospect) return NextResponse.json({ ok: false, error: 'Prospect not found' }, { status: 404 })

  const target = prospect.proof_screenshot_url || `/proof-screenshots/${prospectId}.png`
  return NextResponse.redirect(new URL(target, _request.url))
}
