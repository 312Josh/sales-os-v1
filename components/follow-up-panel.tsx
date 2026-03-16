import { getBookingNextAction, getBookingState, getBookingStateLabel } from '@/lib/booking-state'
import { approveFollowUp, markFollowUpCopied, markFollowUpSentManually, sendBookingLink, sendFollowUpEmail, sendFollowUpSms, stopFollowUpForBooking, stopFollowUpSequence } from '@/lib/data'
import type { FollowUpDraft, MeetingRecord, Prospect } from '@/lib/types'

function buildMailtoLink(item: FollowUpDraft) {
  const subject = encodeURIComponent(item.subject || '')
  const body = encodeURIComponent(item.message)
  return `mailto:?subject=${subject}&body=${body}`
}

export function FollowUpPanel({
  prospect,
  followUps,
  meeting
}: {
  prospect: Prospect
  followUps: FollowUpDraft[]
  meeting?: MeetingRecord
}) {
  return (
    <div className="stack">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Generated follow-up drafts</h3>
        {followUps.length === 0 ? (
          <div className="muted">Log a call outcome like no answer, interested, or send info to generate channel-specific follow-up drafts.</div>
        ) : (
          <div className="stack">
            {followUps.map((item) => (
              <div key={item.id} style={{ borderTop: '1px solid #e7ebf3', paddingTop: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{item.channel.toUpperCase()} • {item.trigger}</strong>
                  <span className="badge">{item.status}</span>
                </div>
                {item.subject ? <div className="muted">Subject: {item.subject}</div> : null}
                <div className="muted" style={{ marginTop: 6 }}>{item.message}</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Send channel: {item.sendChannel || item.channel} • Send status: {item.sendStatus || 'queued'} • Sequence: {item.sequenceStatus || 'active'}
                </div>
                <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
                  <form action={approveFollowUp}>
                    <input type="hidden" name="followUpId" value={item.id} />
                    <button className="secondary" type="submit">Mark approved</button>
                  </form>
                  {item.executionState === 'ready_to_send' ? (
                    <>
                      <button
                        type="button"
                        className="secondary"
                        onClick={async () => {
                          await navigator.clipboard.writeText(`${item.subject ? `Subject: ${item.subject}\n\n` : ''}${item.message}`)
                          const formData = new FormData()
                          formData.set('followUpId', item.id)
                          await markFollowUpCopied(formData)
                        }}
                      >
                        Copy full draft
                      </button>
                      {item.channel === 'email' ? (
                        <a href={buildMailtoLink(item)} target="_blank" rel="noreferrer">
                          <button type="button" className="secondary">Open in Gmail/mail</button>
                        </a>
                      ) : null}
                      <form action={markFollowUpSentManually}>
                        <input type="hidden" name="followUpId" value={item.id} />
                        <button type="submit">Mark sent manually</button>
                      </form>
                    </>
                  ) : null}
                  {item.executionState === 'ready_to_send' && item.channel === 'email' ? (
                    <form action={sendFollowUpEmail} className="row">
                      <input type="hidden" name="followUpId" value={item.id} />
                      <input name="toEmail" placeholder="Recipient email" type="email" />
                      <button type="submit">Send via Resend</button>
                    </form>
                  ) : null}
                  {item.executionState === 'ready_to_send' && item.channel === 'sms' ? (
                    <form action={sendFollowUpSms} className="row">
                      <input type="hidden" name="followUpId" value={item.id} />
                      <input name="testTo" placeholder="Safe test number only" />
                      <button type="submit">Send test SMS</button>
                    </form>
                  ) : null}
                  {item.sequenceStatus !== 'stopped' && item.sequenceStatus !== 'completed' ? (
                    <form action={stopFollowUpSequence}>
                      <input type="hidden" name="followUpId" value={item.id} />
                      <button className="secondary" type="submit">Stop sequence</button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Booking handoff</h3>
        <div className="muted" style={{ marginBottom: 12 }}>
          Route the next conversation to the assigned rep with a real Cal.com booking link. Google Meet is handled by the booking layer.
        </div>
        <div className="row">
          <form action={sendBookingLink}>
          <input type="hidden" name="prospectId" value={prospect.id} />
            <button type="submit">Prepare booking handoff for {prospect.assignedRep}</button>
          </form>
          <form action={stopFollowUpForBooking}>
            <input type="hidden" name="prospectId" value={prospect.id} />
            <button className="secondary" type="submit">Stop follow-ups for booking</button>
          </form>
        </div>
        {meeting ? (
          <div className="stack" style={{ marginTop: 12 }}>
            <div className="muted">Booking state: {getBookingStateLabel(getBookingState(prospect, meeting))}</div>
            <div className="muted">Operational next step: {getBookingNextAction(getBookingState(prospect, meeting))}</div>
            <div className="muted">Raw meeting status: {meeting.status}</div>
            <div className="muted">Booking URL: <a href={meeting.bookingUrl} target="_blank">{meeting.bookingUrl}</a></div>
            <div className="muted">Meet handoff: {meeting.googleMeetUrl}</div>
            <a href={meeting.bookingUrl} target="_blank"><button type="button">Open live booking page</button></a>
          </div>
        ) : null}
      </div>


    </div>
  )
}
