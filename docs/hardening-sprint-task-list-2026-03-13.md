# Sales OS v1 — Hardening Sprint Task List

Source files:
- `/Users/janet/clawd/agents/chris-camillo/dinesh-sales-os-hardening-sprint.md`
- `/Users/janet/clawd/sales-os-v1/docs/hardening-sprint-assessment-2026-03-13.md`

## Sprint objective
Harden the existing Sales OS v1 into a faster, clearer, lower-friction rep execution cockpit for Josh and Paul.

## Priority 1 — Compress and simplify the main operating surface
### Goal
Reduce visual sprawl and make the first screen faster to scan under call pressure.

### Tasks
- [ ] audit every visible panel on the main dashboard
- [ ] rank panels by operator value under live call pressure
- [ ] merge, collapse, or deprioritize low-value sections
- [ ] tighten spacing and information density without making the UI harder to read
- [ ] ensure the main surface answers:
  - what matters now
  - what needs follow-up
  - what is stale
  - what is next

### Done when
- the main view feels lighter and faster
- lower-value surfaces no longer compete equally with primary actions

## Priority 2 — Harden call disposition + next-step capture
### Goal
Make post-call logging extremely fast and consistent.

### Tasks
- [ ] review current outcome taxonomy
- [ ] simplify or tighten outcome options where useful
- [ ] introduce more structured next-step capture
- [ ] reduce clicks/typing after a call
- [ ] make outcome → stage → next action more explicit in the UI

### Done when
- a rep can log the result of a call and set the next move in seconds
- stage progression feels coherent and low-friction

## Priority 3 — Build a stale follow-up wedge
### Goal
Make dropped follow-up obvious and actionable.

### Tasks
- [ ] define what counts as stale follow-up
- [ ] label waiting-on-rep vs waiting-on-prospect
- [ ] create due-now / stale / safe-to-ignore distinctions
- [ ] surface stale follow-up in the action center prominently
- [ ] reduce the chance that old follow-up gets buried inside general activity

### Done when
- stale follow-up is hard to miss
- reps can work from a real follow-up queue rather than just reading status

## Priority 4 — Clarify booking progression
### Goal
Turn booking from a loose handoff into a clean tracked state.

### Tasks
- [ ] define clean booking states:
  - not sent
  - sent
  - awaiting booking
  - booked
  - completed
- [ ] reflect these states in UI copy and status treatment
- [ ] align next-action guidance with booking state
- [ ] improve visibility of booking position for each account
- [ ] separate booked accounts from merely sent-booking-link accounts

### Done when
- booking feels like an operational state machine rather than a link-out convenience

## Priority 5 — Sharpen prioritization and action ranking
### Goal
Make the app decide better what matters most today.

### Tasks
- [ ] strengthen action-center ranking logic
- [ ] improve today’s priorities selection
- [ ] surface aging/high-leverage accounts more clearly
- [ ] reduce decorative metrics that do not drive action
- [ ] ensure the app points reps toward the next best action, not just more information

### Done when
- reps can trust the app to show what they should do next
- action center feels operational, not decorative

## Priority 6 — Live bug/UX sweep
### Goal
Tighten the real app after hardening changes land.

### Tasks
- [ ] walk the live flow from queue → call logging → follow-up → booking state
- [ ] identify awkward copy, rough transitions, and dead weight
- [ ] fix friction points discovered in real usage
- [ ] remove surfaces that add noise without increasing rep speed

### Done when
- the app feels materially better in actual use, not just in structure

## Anti-scope-creep rules
Do not build during this sprint unless a real blocker emerges:
- auth / permissions system
- outbound email execution
- outbound SMS execution
- payment/Stripe flow
- CRM expansion beyond the current rep loop
- generic admin/management reporting layers
- architectural abstraction work that does not improve rep speed
- speculative automation platform features

## Sprint success criteria
This sprint is successful when:
- the app is faster to scan and use
- call logging and next-step capture are sharper
- stale follow-up is obvious
- booking state is clearer
- prioritization is more useful
- clutter is reduced
- the product feels more like a rep operating system and less like an engineer dashboard
