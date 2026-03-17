import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

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
 * Validate Twilio request signature
 * https://www.twilio.com/docs/usage/security#validating-requests
 */
function validateTwilioSignature(url: string, params: Record<string, string>, signature: string): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) {
    console.warn('TWILIO_AUTH_TOKEN not set — skipping signature validation')
    return true // allow in dev without auth token
  }

  // Build the data string: URL + sorted params
  const sortedKeys = Object.keys(params).sort()
  let data = url
  for (const key of sortedKeys) {
    data += key + params[key]
  }

  const expected = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64')

  return signature === expected
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * POST /api/sms/inbound
 * Twilio webhook handler for inbound SMS
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let params: Record<string, string> = {}

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      formData.forEach((value, key) => {
        params[key] = String(value)
      })
    } else {
      // Try JSON fallback
      params = await request.json()
    }

    // Validate Twilio signature
    const twilioSignature = request.headers.get('x-twilio-signature') || ''
    const requestUrl = request.url
    if (!validateTwilioSignature(requestUrl, params, twilioSignature)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const from = params.From || ''
    const to = params.To || ''
    const body = params.Body || ''
    const messageSid = params.MessageSid || params.SmsSid || ''

    if (!from) {
      return twimlResponse()
    }

    const supabase = getSupabase()

    // Look up prospect by phone number
    const cleanFrom = cleanPhone(from)
    const { data: prospects } = await supabase
      .from('prospects')
      .select('id, business_name, phone')

    // Match by cleaned phone number (handles formatting differences)
    const prospect = (prospects || []).find((p: any) => {
      const prospectPhone = cleanPhone(p.phone || '')
      return prospectPhone && (
        cleanFrom.endsWith(prospectPhone) ||
        prospectPhone.endsWith(cleanFrom) ||
        cleanFrom === prospectPhone
      )
    })

    // Log the SMS
    const smsLogId = createId('sms')
    await supabase.from('sms_logs').insert({
      id: smsLogId,
      prospect_id: prospect?.id || null,
      direction: 'inbound',
      from_number: from,
      to_number: to,
      body: body,
      provider_message_id: messageSid,
    })

    // If matched to a prospect, update status and log activity
    if (prospect) {
      await supabase.from('prospects').update({
        contact_status: 'replied',
        last_contacted_at: new Date().toISOString(),
      }).eq('id', prospect.id)

      const summary = `📱 Replied via SMS: ${body.slice(0, 80)}${body.length > 80 ? '...' : ''}`
      await supabase.from('activity_log').insert({
        id: createId('activity'),
        prospect_id: prospect.id,
        event_type: 'sms_inbound',
        summary,
      })

      console.log(`SMS from ${from} matched to prospect ${prospect.business_name}: "${body.slice(0, 50)}"`)
    } else {
      console.log(`SMS from ${from} — no matching prospect found`)
    }

    return twimlResponse()
  } catch (error) {
    console.error('Inbound SMS handler error:', error)
    return twimlResponse()
  }
}

/**
 * Return valid TwiML response (empty — no auto-reply)
 */
function twimlResponse() {
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    }
  )
}
