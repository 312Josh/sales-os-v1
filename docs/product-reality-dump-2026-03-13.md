# Sales OS v1 — Product Reality Dump

## 1. Exact repo/path
Local repo:
- `/Users/janet/clawd/sales-os-v1`

GitHub repo:
- `https://github.com/312Josh/sales-os-v1`

## 2. Live URL(s)
Production:
- `https://sales-os-v1.vercel.app`

Recent Vercel deployment URL:
- `https://sales-os-v1-9a99d97um-joshmellender-gmailcoms-projects.vercel.app`

## 3. What the product currently is in one sentence
It is a **live internal two-rep sales cockpit** for Josh and Paul that tracks prospects, calls, follow-up state, booking handoff, and deal-stage movement on top of a real Supabase backend.

## 4. What workflows are actually working right now

### Core prospect workflow
- view daily call queue
- click into a prospect detail
- see audit context, scoring, notes, weak-site / weak-intake signals
- assign/use Josh vs Paul as reps

### Call workflow
- log call outcomes
- add notes
- add next step
- update stage via server action

### Follow-up workflow
- generate follow-up drafts from outcomes
- view drafts in app
- approve drafts in app

### Booking workflow
- prepare booking handoff
- persist booking handoff state
- open a live Cal.com booking page from the app

### Pipeline/reporting workflow
- see KPI counts
- see reporting by stage
- see inquiry-test architecture records
- see action center
- see today’s priorities
- see recent activity
- see stage discipline / next-action guidance
- see quick filters
- see rep workload summary

### Persistence / deployment workflow
- app is deployed on Vercel
- app is connected to Supabase
- remote schema was pushed
- remote seed ran
- remote CRUD was manually verified

## 5. What has been runtime-tested vs what is just planned

### Runtime-tested / real
These were actually tested, not imagined:

- local app build passes
- local dev server returned HTTP 200
- production deploy completed successfully
- production URL returned HTTP 200
- production page visibly renders real data
- Supabase schema push succeeded
- Supabase seed script succeeded
- Supabase CRUD verification script succeeded:
  - inserted prospect
  - inserted call
  - inserted proposal
  - updated stage
  - re-read final stage successfully

Concrete proof object from runtime verification:
- verification prospect inserted:
  - `Verification Roofing Co.`
- final stage confirmed:
  - `follow_up_sent`

### Real enough but lightly tested
- Cal.com-aware booking handoff helper exists
- booking URLs are live in app
- booking handoff state persists
- but deep API-driven event orchestration or webhook sync is not finished

### Planned / not truly live yet
- actual outbound email sending
- actual SMS sending
- actual payment handoff execution
- auth / user login
- RLS/user-scoped access model
- deep Cal.com API orchestration
- automated booking status sync
- full browser-driven end-to-end QA sweep of every server action

## 6. Biggest current gaps

### A. It is still a shared internal board, not a true user-auth app
- Josh and Paul are modeled
- there is no login separation
- no permissions
- no scoped personal workspace

This was a conscious V1 decision.

### B. Follow-up drafts do not actually send
- drafts are generated and can be approved
- email execution is deferred
- SMS execution is deferred

So the communication engine is **stateful**, not yet **operationally outbound**.

### C. Payment handoff is paused
- proposal/payment shell exists in UI
- real payment integration is intentionally not active

So the panel exists, but it is not a live close flow.

### D. Booking is real enough, but not deeply orchestrated
- booking handoff works
- Cal.com links open
- API key exists and helper exists
- no full event-type orchestration / sync-back / webhook lifecycle yet

### E. Data model is real, but workflow quality still needs a serious UX pass
The app is usable, but still feels like an engineer-built cockpit:
- lots of panels
- lots of surfaced state
- not yet optimized for speed-clicking under call pressure

### F. Git/history is now fixed, but repo hygiene still wants one calm cleanup pass
- history had to be rewritten to remove giant generated artifacts
- repo is now pushable and usable
- still worth a focused cleanup/polish pass

## 7. What direction this product should go next
Current truth: the product is most valuable as a **rep execution cockpit**, not a generalized CRM.

### Direction 1: tighten the rep loop
Focus on:
- cleaner layout density
- fewer panels competing for attention
- sharper next-action behavior
- faster disposition logging
- clearer separation of:
  - call now
  - follow up
  - waiting on booking
  - booked
  - stale

### Direction 2: make booking state more operational
Since payment/email are paused, booking is the most important conversion surface now.
Focus on:
- better booking status transitions
- clearer `booking sent / booked / completed`
- cleaner rep-specific routing
- distinct Paul booking path when available

### Direction 3: improve prioritization
The system already stores and surfaces enough. Next it should decide better:
- what needs action today
- what is stale
- what is highest leverage
- what can be ignored

### Direction 4: do a real bug/UX sweep before adding more surface area
The app is now real enough that the best next improvement may be:
- walk the entire live flow
- tighten awkward interactions
- remove noisy or low-value surface area
- polish the existing operating loop

That would produce more value than adding more half-live modules.

## What exists vs soft vs missing

### What exists
- local repo
- GitHub repo
- deployed app
- Supabase backend
- queue/detail/logging/reporting/action-center UI
- booking handoff
- live production site
- committed codebase
- real remote persistence

### What is soft
- Cal.com orchestration depth
- follow-up approval semantics
- stage discipline UX
- rep-operability polish
- proposal/payment panel usefulness while payment is paused

### What is missing
- actual outbound sends
- auth
- payment integration
- full booking sync lifecycle
- serious rep-speed UX polish

### What is real enough to build on
Very real:
- deployed frontend
- persisted backend
- live CRUD foundation
- rep workflow shell
- booking handoff
- prioritization/reporting scaffold

That is enough to build the next phase on without restarting.

## Spec/response files already written
Primary source/spec files used:
- `/Users/janet/clawd/agents/chris-camillo/call-centered-sales-os-build-spec.md`
- `/Users/janet/clawd/agents/chris-camillo/dinesh-sales-os-execution-prompt.md`
- `/Users/janet/clawd/agents/chris-camillo/dinesh-focus-management-prompt.md`
- `/Users/janet/clawd/agents/chris-camillo/dinesh-credentials-handoff-template.md`

Operationalization/planning file written in repo:
- `/Users/janet/clawd/sales-os-v1/docs/operationalization-plan.md`

## Bottom line
This is a real live V1 cockpit with real backend and real deployment, but not yet a fully operational sales automation system.
