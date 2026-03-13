import { getBookingNextAction, getBookingState, getBookingStateLabel } from '@/lib/booking-state'
import { approveFollowUp, createProposal, markProposalPaid, sendBookingLink } from '@/lib/data'
import type { FollowUpDraft, MeetingRecord, ProposalRecord, Prospect } from '@/lib/types'

export function FollowUpPanel({
  prospect,
  followUps,
  meeting,
  proposal,
}: {
  prospect: Prospect
  followUps: FollowUpDraft[]
  meeting?: MeetingRecord
  proposal?: ProposalRecord
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
                  Email sending path is now standardized around Postmark. SMS execution remains deferred.
                </div>
                <form action={approveFollowUp} style={{ marginTop: 10 }}>
                  <input type="hidden" name="followUpId" value={item.id} />
                  <button className="secondary" type="submit">Mark approved</button>
                </form>
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
        <form action={sendBookingLink}>
          <input type="hidden" name="prospectId" value={prospect.id} />
          <button type="submit">Prepare booking handoff for {prospect.assignedRep}</button>
        </form>
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
