import type { Prospect } from '@/lib/types'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export type ResendWebhookEvent = {
  type?: string
  created_at?: string
  data?: {
    to?: string[] | string
    tags?: { name?: string; value?: string }[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

export type ProspectEmailEngagement = {
  emailStatus: 'bounced' | 'clicked' | 'opened' | 'sent' | 'none'
  emailLabel: string
  emailBadgeClass: string
  activityLabel: string | null
  activityAt?: string
  hotLead: boolean
  sortWeight: number
}

const STATUS_BADGES: Record<ProspectEmailEngagement['emailStatus'], { label: string; className: string; weight: number }> = {
  bounced: { label: '🔴 Bounced', className: 'bg-rose-50 text-rose-700 border-rose-200', weight: -10 },
  clicked: { label: '🔗 Clicked', className: 'bg-amber-50 text-amber-700 border-amber-200', weight: 40 },
  opened: { label: '👁️ Opened', className: 'bg-blue-50 text-blue-700 border-blue-200', weight: 20 },
  sent: { label: '📤 Sent', className: 'bg-violet-50 text-violet-700 border-violet-200', weight: 5 },
  none: { label: '—', className: 'bg-slate-50 text-slate-500 border-slate-200', weight: 0 },
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://sales-os-v1.vercel.app'
}

export function sanitizeTrackingDestination(url: string | null | undefined) {
  if (!url) return null

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return parsed.toString()
  } catch {
    return null
  }
}

export function buildTrackedUrl(prospectId: string, destinationUrl: string) {
  const safeDestination = sanitizeTrackingDestination(destinationUrl)
  if (!safeDestination) return destinationUrl

  return `${getBaseUrl()}/api/track/${encodeURIComponent(prospectId)}?url=${encodeURIComponent(safeDestination)}`
}

export function addTrackingToHtml(html: string, prospectId: string) {
  return html.replace(/href=["'](https?:\/\/[^"']+)["']/gi, (_match, url) => {
    const trackedUrl = buildTrackedUrl(prospectId, url)
    return `href="${trackedUrl}"`
  })
}

export function getEmailEventType(eventType: string) {
  return eventType.replace(/^email\./, '')
}

export function getEmailTo(event: ResendWebhookEvent) {
  const to = event?.data?.to
  if (Array.isArray(to)) return String(to[0] || '')
  return typeof to === 'string' ? to : ''
}

export function getProspectTag(event: ResendWebhookEvent) {
  const tags = Array.isArray(event?.data?.tags) ? event.data?.tags : []
  const match = tags.find((tag) => tag?.name === 'prospect_slug')
  return match?.value ? String(match.value) : null
}

export async function resolveProspectForEvent(event: ResendWebhookEvent) {
  const supabase = getSupabaseAdmin()
  const prospectTag = getProspectTag(event)
  const emailTo = getEmailTo(event)

  if (prospectTag) {
    const { data } = await supabase
      .from('prospects')
      .select('id,email,email_open_count,email_click_count,contact_status')
      .eq('id', prospectTag)
      .maybeSingle()
    if (data) return data
  }

  if (emailTo) {
    const { data } = await supabase
      .from('prospects')
      .select('id,email,email_open_count,email_click_count,contact_status')
      .eq('email', emailTo)
      .maybeSingle()
    if (data) return data
  }

  return null
}

export function buildProspectUpdateForEvent(eventType: string, prospect: any, occurredAt: string) {
  const patch: Record<string, unknown> = {}

  if (eventType === 'email.opened') {
    patch.email_opened_at = occurredAt
    patch.email_open_count = (prospect?.email_open_count || 0) + 1
    if (prospect?.contact_status !== 'email_clicked') patch.contact_status = 'email_opened'
  }

  if (eventType === 'email.clicked') {
    patch.email_clicked_at = occurredAt
    patch.email_click_count = (prospect?.email_click_count || 0) + 1
    patch.contact_status = 'email_clicked'
  }

  if (eventType === 'email.delivered') {
    patch.email_sent_at = occurredAt
    if (!prospect?.contact_status || prospect.contact_status === 'new' || prospect.contact_status === 'contacted') {
      patch.contact_status = 'email_sent'
    }
  }

  if (eventType === 'email.bounced') {
    patch.email_bounced_at = occurredAt
    patch.contact_status = 'email_bounced'
  }

  return patch
}

export function getRelativeTimeLabel(dateString?: string) {
  if (!dateString) return null
  const timestamp = new Date(dateString).getTime()
  if (Number.isNaN(timestamp)) return null

  const diffMs = Date.now() - timestamp
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

export function getProspectEmailEngagement(prospect: Prospect): ProspectEmailEngagement {
  const bounced = Boolean(prospect.emailBouncedAt || prospect.contactStatus === 'email_bounced')
  const clicked = (prospect.emailClickCount || 0) > 0 || Boolean(prospect.emailClickedAt)
  const opened = (prospect.emailOpenCount || 0) > 0 || Boolean(prospect.emailOpenedAt)
  const sent = Boolean(prospect.emailSentAt || prospect.lastContactedAt || prospect.contactStatus === 'email_sent')

  let status: ProspectEmailEngagement['emailStatus'] = 'none'
  let activityAt: string | undefined
  let activityLabel: string | null = null

  if (bounced) {
    status = 'bounced'
    activityAt = prospect.emailBouncedAt
    activityLabel = 'Bounced'
  } else if (clicked) {
    status = 'clicked'
    activityAt = prospect.emailClickedAt || prospect.emailOpenedAt
    activityLabel = 'Clicked'
  } else if (opened) {
    status = 'opened'
    activityAt = prospect.emailOpenedAt
    activityLabel = 'Opened'
  } else if (sent) {
    status = 'sent'
    activityAt = prospect.emailSentAt || prospect.lastContactedAt
    activityLabel = 'Sent'
  }

  const openCount = prospect.emailOpenCount || 0
  const clickCount = prospect.emailClickCount || 0
  const hotLead = openCount >= 3 || clickCount >= 1
  const config = STATUS_BADGES[status]

  let label = config.label
  if (status === 'opened' && openCount > 0) label = `👁️ Opened ${openCount}x`
  if (status === 'clicked' && clickCount > 0) label = `🔗 Clicked ${clickCount}x`

  const relative = getRelativeTimeLabel(activityAt)
  const detail = activityLabel && relative ? `${activityLabel} ${relative}` : null

  return {
    emailStatus: status,
    emailLabel: label,
    emailBadgeClass: config.className,
    activityLabel: detail,
    activityAt,
    hotLead,
    sortWeight: config.weight + (hotLead ? 50 : 0) + openCount + clickCount * 10,
  }
}
