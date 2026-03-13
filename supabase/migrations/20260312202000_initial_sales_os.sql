-- Initial Sales OS schema scaffold
-- Not yet applied. Requires runtime Supabase project access and auth decision.

create table if not exists public.prospects (
  id text primary key,
  business_name text not null,
  market text not null,
  niche text not null,
  city text not null default '',
  suburb text not null default '',
  website text not null default '',
  phone text not null default '',
  contact_form_url text not null default '',
  decision_maker text not null default '',
  linkedin_url text not null default '',
  weak_site_signal text not null default '',
  weak_intake_signal text not null default '',
  no_chat_signal boolean not null default false,
  no_booking_signal boolean not null default false,
  owner_operated_signal text not null default '',
  audit_summary text not null default '',
  outreach_hook text not null default '',
  site_score integer not null default 3,
  intake_score integer not null default 3,
  owner_fit_score integer not null default 3,
  fit_score integer not null default 3,
  priority_score integer not null default 3,
  priority_reason text not null default '',
  pipeline_stage text not null default 'sourced',
  assigned_rep text not null default 'Josh',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.call_logs (
  id text primary key,
  prospect_id text not null references public.prospects(id) on delete cascade,
  outcome text not null,
  notes text not null default '',
  called_at timestamptz not null default now(),
  next_step text not null default ''
);

create table if not exists public.follow_up_drafts (
  id text primary key,
  prospect_id text not null references public.prospects(id) on delete cascade,
  trigger text not null,
  channel text not null,
  subject text,
  message text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id text primary key,
  prospect_id text not null references public.prospects(id) on delete cascade,
  rep text not null,
  booking_url text not null,
  google_meet_url text not null default '',
  status text not null default 'not_started',
  proposed_time timestamptz,
  booked_time timestamptz
);

create table if not exists public.proposals (
  id text primary key,
  prospect_id text not null references public.prospects(id) on delete cascade,
  offer_summary text not null default '',
  payment_link text not null default '',
  status text not null default 'not_started'
);

create table if not exists public.inquiry_tests (
  id text primary key,
  prospect_id text not null references public.prospects(id) on delete cascade,
  inquiry_submitted_at timestamptz,
  first_response_at timestamptz,
  response_channel text,
  response_time_minutes integer,
  grade text,
  test_status text not null default 'not_started'
);

alter table public.prospects enable row level security;
alter table public.call_logs enable row level security;
alter table public.follow_up_drafts enable row level security;
alter table public.meetings enable row level security;
alter table public.proposals enable row level security;
alter table public.inquiry_tests enable row level security;

-- Policies intentionally deferred until auth/user model is confirmed for Josh and Paul.
