import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSequenceSteps, getProofUrl } from '@/lib/sequence-templates'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY not set')
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Josh Mellender <josh@cogrow.ai>',
        to: [to],
        subject,
        text: body,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`Resend error: ${res.status} ${err}`)
      return false
    }

    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

async function sendSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.error('Twilio credentials not set')
    return false
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: body,
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error(`Twilio error: ${res.status} ${err}`)
      return false
    }

    return true
  } catch (error) {
    console.error('SMS send error:', error)
    return false
  }
}

/**
 * POST /api/cron/sequence-runner
 * Called hourly by Vercel cron. Fires due sequence steps.
 */
export async function POST(request: NextRequest) {
  // Verify cron secret if set
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = getSupabase()
  const templates = getSequenceSteps()
  const now = new Date().toISOString()

  // Find all due steps: pending, scheduled <= now, parent sequence active
  const { data: dueSteps, error: stepsErr } = await supabase
    .from('sequence_steps')
    .select('id, sequence_id, step_number, channel, scheduled_at')
    .eq('status', 'pending')
    .lte('scheduled_at', now)

  if (stepsErr || !dueSteps?.length) {
    return NextResponse.json({ processed: 0, message: dueSteps ? 'No due steps' : stepsErr?.message })
  }

  // Get parent sequences
  const sequenceIds = [...new Set(dueSteps.map(s => s.sequence_id))]
  const { data: sequences } = await supabase
    .from('sequences')
    .select('id, prospect_id, status')
    .in('id', sequenceIds)

  if (!sequences?.length) {
    return NextResponse.json({ processed: 0, message: 'No sequences found' })
  }

  const activeSequences = new Map(
    sequences.filter(s => s.status === 'active').map(s => [s.id, s])
  )

  // Get prospects for active sequences
  const prospectIds = [...new Set(
    sequences.filter(s => s.status === 'active').map(s => s.prospect_id)
  )]
  const { data: prospects } = await supabase
    .from('prospects')
    .select('*')
    .in('id', prospectIds)

  const prospectMap = new Map((prospects || []).map(p => [p.id, p]))

  let processed = 0
  let autoStopped = 0
  let sent = 0
  let failed = 0

  for (const step of dueSteps) {
    const seq = activeSequences.get(step.sequence_id)
    if (!seq) {
      // Sequence not active — skip
      continue
    }

    const prospect = prospectMap.get(seq.prospect_id)
    if (!prospect) continue

    // AUTO-STOP CHECK
    const shouldStop =
      prospect.contact_status === 'replied' ||
      prospect.proof_viewed_at != null ||
      prospect.email_clicked_at != null

    if (shouldStop) {
      // Stop the entire sequence
      await supabase.from('sequences').update({
        status: 'stopped',
        stopped_reason: 'prospect_engaged',
      }).eq('id', seq.id)

      // Cancel all pending steps
      await supabase.from('sequence_steps').update({
        status: 'cancelled',
      }).eq('sequence_id', seq.id).eq('status', 'pending')

      await supabase.from('activity_log').insert({
        id: createId('activity'),
        prospect_id: seq.prospect_id,
        event_type: 'sequence_auto_stopped',
        summary: `🛑 Sequence auto-stopped — prospect engaged (${
          prospect.contact_status === 'replied' ? 'replied to SMS' :
          prospect.proof_viewed_at ? 'viewed proof' : 'clicked email'
        })`,
      })

      activeSequences.delete(seq.id)
      autoStopped++
      processed++
      continue
    }

    // FIRE THE STEP
    const template = templates.find(t => t.stepNumber === step.step_number)
    if (!template) continue

    // Map DB row to Prospect shape for templates
    const p = {
      id: prospect.id,
      businessName: prospect.business_name,
      decisionMaker: prospect.decision_maker,
      website: prospect.website,
      trackingToken: prospect.tracking_token,
      vertical: prospect.vertical,
      niche: prospect.niche,
      siteAuditSummary: prospect.site_audit_summary,
      lcpMs: prospect.lcp_ms,
    } as any

    const proofUrl = getProofUrl(p)
    const message = template.getMessage(p, proofUrl)

    let success = false

    if (template.channel === 'email') {
      const email = prospect.email
      if (email) {
        const subject = template.getSubject?.(p) || `Update from CoGrow about ${prospect.business_name}`
        success = await sendEmail(email, subject, message)
      } else {
        console.warn(`No email for prospect ${prospect.id} — skipping email step`)
      }
    } else if (template.channel === 'sms') {
      const phone = prospect.phone
      if (phone) {
        success = await sendSms(phone, message)
      } else {
        console.warn(`No phone for prospect ${prospect.id} — skipping SMS step`)
      }
    }

    // Update step status
    await supabase.from('sequence_steps').update({
      status: success ? 'sent' : 'failed',
      sent_at: success ? new Date().toISOString() : null,
    }).eq('id', step.id)

    // Update sequence current_step
    await supabase.from('sequences').update({
      current_step: step.step_number,
    }).eq('id', seq.id)

    // Activity log
    const channelLabel = template.channel === 'email' ? '📧' : '📱'
    await supabase.from('activity_log').insert({
      id: createId('activity'),
      prospect_id: seq.prospect_id,
      event_type: `sequence_step_${success ? 'sent' : 'failed'}`,
      summary: `${channelLabel} Step ${step.step_number + 1}/5 ${success ? 'sent' : 'FAILED'} — ${template.channel} (Day ${template.dayOffset})`,
    })

    if (success) sent++
    else failed++
    processed++
  }

  return NextResponse.json({ processed, sent, failed, autoStopped })
}

// Also support GET for Vercel cron
export async function GET(request: NextRequest) {
  return POST(request)
}
