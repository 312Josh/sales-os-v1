import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { buildOutreachTemplates } from '@/lib/outreach-copy'
import { sendEmail } from '@/lib/resend'
import { buildTrackedUrl } from '@/lib/email-tracking'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()
    const { data: prospect, error } = await supabase.from('prospects').select('*').eq('id', id).single()
    if (error || !prospect) return NextResponse.json({ ok: false, error: 'Prospect not found' }, { status: 404 })
    if (!prospect.email) return NextResponse.json({ ok: false, error: 'Prospect has no email' }, { status: 400 })

    const templates = buildOutreachTemplates({
      id: prospect.id,
      businessName: prospect.business_name,
      market: prospect.market,
      niche: prospect.niche,
      city: prospect.city,
      suburb: prospect.suburb,
      website: prospect.website,
      phone: prospect.phone,
      email: prospect.email,
      contactFormUrl: prospect.contact_form_url,
      decisionMaker: prospect.decision_maker,
      linkedInUrl: prospect.linkedin_url,
      weakSiteSignal: prospect.weak_site_signal,
      weakIntakeSignal: prospect.weak_intake_signal,
      noChatSignal: prospect.no_chat_signal,
      noBookingSignal: prospect.no_booking_signal,
      ownerOperatedSignal: prospect.owner_operated_signal,
      auditSummary: prospect.audit_summary,
      outreachHook: prospect.outreach_hook,
      siteScore: prospect.site_score,
      intakeScore: prospect.intake_score,
      ownerFitScore: prospect.owner_fit_score,
      fitScore: prospect.fit_score,
      priorityScore: prospect.priority_score,
      priorityReason: prospect.priority_reason,
      pipelineStage: prospect.pipeline_stage,
      assignedRep: prospect.assigned_rep,
      notes: prospect.notes,
      vertical: prospect.vertical,
      marketTag: prospect.market_tag,
      priorityBucket: prospect.priority_bucket,
      decisionMakerTitle: prospect.decision_maker_title,
      proofUrl: prospect.proof_url,
      proofScreenshotUrl: prospect.proof_screenshot_url,
      proofVideoUrl: prospect.proof_video_url,
      proofStatus: prospect.proof_status,
      siteAuditSummary: prospect.site_audit_summary,
    } as any)

    const body = await request.json().catch(() => ({}))
    const mediaMode = body.mediaMode === 'gif' || body.mediaMode === 'none' ? body.mediaMode : 'screenshot'
    const proofBase = String(prospect.proof_url || '').replace(/\/$/, '')
    const screenshotUrl = proofBase ? `${proofBase}/screenshot.png` : undefined
    const gifUrl = proofBase ? `${proofBase}/demo.gif` : undefined
    const inlineImageUrl = mediaMode === 'gif' ? gifUrl : mediaMode === 'none' ? undefined : screenshotUrl
    const greeting = `Hey ${prospect.decision_maker?.trim() || 'there'}`
    const signatureHtml = `<table style="font-family:Arial,sans-serif;font-size:14px;color:#333;margin-top:20px;"><tr><td style="padding-right:15px;border-right:2px solid #dc2626;"><strong style="font-size:16px;color:#111;">Paul Janastas</strong><br/><span style="color:#dc2626;font-size:13px;">Co-Founder</span></td><td style="padding-left:15px;"><strong>CoGrow</strong> | cogrow.ai<br/>(508) 263-0137<br/>paul@cogrow.ai</td></tr></table>`
    const trackingUrl = buildTrackedUrl(prospect.id, templates.proofUrl)
    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px">
      <p style="margin:0 0 16px">${greeting},</p>
      <p style="margin:0 0 16px">We rebuilt your website for <strong>${prospect.business_name}</strong>.</p>
      ${inlineImageUrl ? `<p style="margin:0 0 20px"><img src="${inlineImageUrl}" alt="${prospect.business_name} website preview" style="display:block;width:100%;max-width:560px;height:auto;border:1px solid #e2e8f0;border-radius:12px" /></p>` : ''}
      <p style="margin:0 0 16px">Take a look here: <a href="${trackingUrl}" style="color:#2563eb">${templates.proofUrl}</a></p>
      <p style="margin:0 0 16px">If you like what you see, I'd love to spend 10 minutes walking you through it.</p>
      ${signatureHtml}
    </div>`
    const result = await sendEmail({
      to: prospect.email,
      subject: `${prospect.business_name}, we rebuilt your website`,
      text: templates.emailBody,
      html,
      from: 'Paul @ CoGrow <paul@cogrow.ai>',
      replyTo: 'paul@cogrow.ai',
      headers: { 'X-Prospect-Tracking-Token': prospect.tracking_token || '' },
      tags: [{ name: 'prospect_slug', value: prospect.id }],
    })

    const sentAt = new Date().toISOString()
    await supabase.from('prospects').update({
      contact_status: 'email_sent',
      last_contacted_at: sentAt,
      email_sent_at: sentAt,
    }).eq('id', prospect.id)

    await supabase.from('activity_log').insert({
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prospect_id: prospect.id,
      event_type: 'email_sent',
      summary: '✉️ Email sent via Resend',
    })

    return NextResponse.json({ ok: true, id: result.id || null, status: result.status || null })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
}
