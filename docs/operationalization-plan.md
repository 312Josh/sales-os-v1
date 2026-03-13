# Sales OS v1 Operationalization Plan

## Current state
- Local Next.js app shell is running
- Checkpoints 1-3 are implemented with file-backed seed data
- No runtime credentials are currently available in environment for Supabase or Airtable

## Planning protocol
### 1. Request understood
We need to operationalize the Sales OS so it moves beyond file-backed local seed data into a usable runtime-backed system and real provider handoffs.

This first operationalization pass is additive, not destructive.

### 2. Current schema survey
Current runtime model is file-backed in:
- `data/seed.json`
- `lib/types.ts`
- `lib/data.ts`

Current major objects:
- prospects
- calls
- followUps
- meetings
- proposals
- inquiryTests
- bookingLinks

No existing `supabase/` directory or migrations are present in this repo yet.

### 3. Execution plan
Because no runtime credentials are available yet, the safest immediate plan is:
1. add a provider abstraction layer
2. preserve file-backed local mode as fallback
3. scaffold Supabase-ready database design and migrations directory
4. add env template documenting required keys
5. add runtime mode notes for the next provider-wiring pass

Planned SQL model (when credentials are available):
- `prospects`
- `call_logs`
- `follow_up_drafts`
- `meetings`
- `proposals`
- `inquiry_tests`

Planned RLS posture:
- internal authenticated access only
- additive policies once auth shape is chosen

Types/code impact:
- add storage abstraction module
- add env template
- add schema plan / migration scaffold
- keep current UI unchanged while data backend gets decoupled

### 4. Risks
- No Supabase credentials available now, so live DB push is blocked
- No Airtable credentials available now, so Airtable runtime wiring is also blocked
- Provider auth model is still undefined for Josh/Paul login

Mitigation:
- ship provider abstraction now
- keep app runnable locally
- document exact next credential needs

### 5. Sequential execution
1. create provider abstraction
2. add file provider implementation
3. add env template and docs
4. scaffold Supabase directory and initial migration plan without applying
5. verify app still builds

### 6. Summary target
After this pass, the app remains runnable but is structurally ready for real persistence once credentials are supplied.
