# Sales OS v1 — Hardening Sprint Assessment

Source of truth:
- `/Users/janet/clawd/agents/chris-camillo/dinesh-sales-os-hardening-sprint.md`

## 1. Blunt product truth

### What’s already strong
- The foundation is real, not fake:
  - live deployed app
  - real Supabase backend
  - real CRUD path
  - real production URL
- The app already has the right product spine:
  - queue
  - prospect detail
  - call logging
  - follow-up state
  - booking handoff
  - stage progression
- It is already shaped more like a rep cockpit than a CRM, which is exactly why it is worth hardening.

### What’s awkward or slow
- The UI is still too panel-heavy.
- It surfaces a lot, but not all of it earns screen space.
- The rep still has to visually parse too many sections instead of being pulled through a tight operating loop.
- Call disposition and next-step capture work, but are not yet optimized for speed under fatigue.
- The app is useful, but not yet friction-minimized.

### What exists but is not yet productized
- Follow-up visibility exists, but stale follow-up is not yet strong enough.
- Booking exists, but booking state is still too soft.
- Action center exists, but is not yet ruthless enough about what matters now.
- Prioritization exists, but still feels like a smart summary, not an operator command surface.

### What is still a real gap
- No truly tight post-call-in-5-seconds flow
- No strong stale-follow-up wedge
- No fully disciplined booking state
- No UI compression / hierarchy strong enough for real rep pressure
- Too much engineer-shaped layout density and too little guided workflow

## 2. Must-fix-before-heavy-use list

### A. Faster call disposition flow
Must reduce the time from:
- call ends
- log outcome
- set next step
- move on

### B. Clearer follow-up state
Need stronger visibility into:
- due now
- stale
- waiting on rep
- waiting on prospect
- can ignore today

### C. Stronger booking-state clarity
Need a cleaner distinction between:
- booking not sent
- booking sent
- awaiting booking
- booked
- completed

### D. Less clutter / better hierarchy
The app needs fewer equal-weight surfaces and more obvious hierarchy.

### E. Tighter next-action discipline
Every account should feel like it has:
- one clear next move
- one current owner
- one obvious reason it matters

## 3. Prioritized execution plan

### First: compress and simplify the main operating surface
- reduce visual sprawl
- make the screen scan faster
- collapse or deprioritize lower-value surfaces
- promote today / next / stale / waiting above everything else

### Second: harden call disposition + next-step capture
- sharpen outcome taxonomy
- structure next-step capture
- reduce form friction
- make outcome → stage → next action more automatic and legible

### Third: build a real stale follow-up operating wedge
- explicit stale follow-up state
- follow-up due buckets
- waiting-on-rep vs waiting-on-prospect
- stronger action-center ranking using recency + urgency

### Fourth: clarify booking progression as operational state
- clearer booking states
- better display of where each account is in booking flow
- better next action tied to booking status
- cleaner wording and transitions

### Fifth: sharpen prioritization logic
- better needs-action-today logic
- stronger stale/high-leverage sorting
- remove decorative metrics if they do not drive action

### Sixth: bug/UX sweep after hardening changes
- manual live walkthrough
- remove awkward copy
- fix rough transitions
- eliminate anything that slows the rep down

## 4. Anti-scope-creep list
Do not build in this sprint:
- full auth system
- rep-specific permission system
- outbound email engine
- outbound SMS engine
- payment/Stripe flow
- generic CRM object expansion
- manager/admin reporting theater
- multi-tenant architecture
- deep automation platform features
- vanity dashboard expansion
- broad abstraction work that does not improve rep speed

## 5. Use-ready checklist

### Rep-speed
- [ ] reps can log a call + next step in seconds
- [ ] main screen is faster to scan than a spreadsheet
- [ ] low-value clutter is reduced

### Follow-up control
- [ ] stale follow-up is obvious
- [ ] today’s follow-up queue is obvious
- [ ] waiting-on-rep vs waiting-on-prospect is obvious

### Booking clarity
- [ ] booking status is unambiguous
- [ ] booking next steps are obvious
- [ ] booking state supports action, not guessing

### Prioritization
- [ ] action center reliably surfaces what matters now
- [ ] high-priority and aging accounts are easy to identify
- [ ] reps can trust the app to tell them what to do next

### Product quality
- [ ] no major workflow ambiguity
- [ ] no obviously awkward operator flow
- [ ] app feels like a rep operating system, not an internal demo

## 6. Final positioning line
Sales OS v1 is a call-centered rep execution cockpit that helps two outbound reps move prospects through calls, follow-up, booking, and stage progression with less friction and fewer dropped balls.
