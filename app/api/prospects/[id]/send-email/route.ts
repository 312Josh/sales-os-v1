import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { buildOutreachTemplates } from '@/lib/outreach-copy'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const key = process.env.RESEND_API_KEY
    if (!key) return NextResponse.json({ ok: false, error: 'Missing RESEND_API_KEY' }, { status: 500 })

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

    const inlineImageUrl = prospect.proof_screenshot_url || undefined
    const greeting = `Hey ${prospect.decision_maker?.trim() || 'there'}`
    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px">
      <p style="margin:0 0 16px">${greeting},</p>
      <p style="margin:0 0 16px">We rebuilt your website for <strong>${prospect.business_name}</strong>.</p>
      ${inlineImageUrl ? `<p style="margin:0 0 20px"><img src="${inlineImageUrl}" alt="${prospect.business_name} website preview" style="display:block;width:100%;max-width:560px;height:auto;border:1px solid #e2e8f0;border-radius:12px" /></p>` : ''}
      <p style="margin:0 0 16px">Take a look here: <a href="${templates.proofUrl}" style="color:#2563eb">${templates.proofUrl}</a></p>
      <p style="margin:0 0 16px">If you like what you see, I'd love to spend 10 minutes walking you through it.</p>
      <p style="margin:0">— Paul, CoGrow</p>
    </div>`
    const resend = new Resend(key)
    const result = await resend.emails.send({
      from: 'Paul @ CoGrow <paul@cogrow.ai>',
      to: [prospect.email],
      replyTo: 'paul@cogrow.ai',
      subject: `${prospect.business_name}, we rebuilt your website`,
      text: templates.emailBody,
      html,
    })

    if (result.error) return NextResponse.json({ ok: false, error: result.error.message, statusCode: result.error.statusCode }, { status: 500 })
    return NextResponse.json({ ok: true, id: result.data?.id || null })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
}
