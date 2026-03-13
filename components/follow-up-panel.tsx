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
          Route the next conversation to the assigned rep with a booking link. Google Meet is assumed to be handled through the booking layer.
        </div>
        <form action={sendBookingLink}>
          <input type="hidden" name="prospectId" value={prospect.id} />
          <button type="submit">Send booking link for {prospect.assignedRep}</button>
        </form>
        {meeting ? (
          <div className="stack" style={{ marginTop: 12 }}>
            <div className="muted">Status: {meeting.status}</div>
            <div className="muted">Booking URL: {meeting.bookingUrl}</div>
            <div className="muted">Meet handoff: {meeting.googleMeetUrl}</div>
          </div>
        ) : null}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Proposal / payment handoff</h3>
        <form action={createProposal} className="stack">
          <input type="hidden" name="prospectId" value={prospect.id} />
          <label>
            Offer summary
            <textarea name="offerSummary" placeholder="Website + call-support follow-up system, booking handoff, and pipeline cleanup for your team." defaultValue={proposal?.offerSummary || ''} />
          </label>
          <label>
            Payment link
            <input name="paymentLink" placeholder="https://buy.stripe.com/..." defaultValue={proposal?.paymentLink || ''} />
          </label>
          <button type="submit">Save proposal handoff</button>
        </form>
        {proposal ? (
          <div className="stack" style={{ marginTop: 12 }}>
            <div className="muted">Proposal status: {proposal.status}</div>
            <div className="muted">Payment link: {proposal.paymentLink || 'Not added yet'}</div>
            <form action={markProposalPaid}>
              <input type="hidden" name="proposalId" value={proposal.id} />
              <button className="secondary" type="submit">Mark paid</button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  )
}
