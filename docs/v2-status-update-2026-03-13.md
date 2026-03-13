# Sales OS v2 — Status Update

## Current live state
- Production: `https://sales-os-v1.vercel.app`
- GitHub: `https://github.com/312Josh/sales-os-v1`
- Local repo: `/Users/janet/clawd/sales-os-v1`

## What V2 has added so far

### 1. Prospect enrichment layer
Added richer structured context to prospects:
- employee band
- service area
- online booking presence
- response risk
- owner evidence
- local proof summary
- ideal pitch angle
- call opener
- enrichment summary

Live UI:
- `Enrichment context` panel in selected prospect view

### 2. Audit / outreach hook layer
Added generated commercial framing:
- why this matters
- commercial risk
- suggested talk track

Live UI:
- `Audit + outreach hooks` panel in selected prospect view

### 3. Follow-up execution support
Added more operational follow-up progression:
- draft
- approved
- ready_to_send
- sent

Live UI:
- follow-up drafts now support approval and send-state progression
- `Mark sent` flow now exists as an operational step

### 4. Booking-state automation / sync quality
Added booking automation support:
- booking sync status logic
- booking aging logic
- booking ops summary line

Live UI:
- `Booking sync watch` panel in the right-side insight lane

### 5. Prioritization intelligence
Added V2 ranking layer using:
- fit score
- intake score
- site score
- response risk
- missing online booking
- follow-up state
- booking sync status

Live UI:
- command rail now shows stronger action ordering and V2 priority labels
- follow-up queue tie-breaking now uses V2 priority scoring

## Product truth
V2 is now a real internal sales-engine layer on top of V1.
It is not a client-facing product, not a generic CRM, and not a bloated automation suite.

It currently improves:
- pre-call context
- call framing
- post-call follow-up support
- booking visibility
- daily prioritization

## What is real vs soft

### Real
- all V2 additions above are implemented in code
- all V2 additions are deployed to production
- app continues to build and deploy successfully

### Still soft
- enrichment is still seeded/rule-based, not dynamically fetched
- hook generation is rule-based, not deeply adaptive
- follow-up execution is operationally modeled, not provider-live
- booking sync is interpreted intelligence, not full external webhook sync
- prioritization weights are heuristic and should be tuned from use

## Best next direction
If continuing V2, the best next move is likely:
- tuning the V2 layers from real rep usage
- cleaning weak heuristics
- improving signal quality before adding more surface area

## Positioning line
Sales OS v2 is the internal sales engine layer that gives Josh and Paul better targeting, sharper call context, stronger follow-up leverage, clearer booking progression, and smarter daily prioritization on top of the V1 rep cockpit.
