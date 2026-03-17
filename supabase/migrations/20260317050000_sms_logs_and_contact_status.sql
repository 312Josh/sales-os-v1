-- SMS logs table for inbound/outbound message tracking
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id text PRIMARY KEY,
  prospect_id text REFERENCES public.prospects(id) ON DELETE CASCADE,
  direction text NOT NULL DEFAULT 'inbound',
  from_number text NOT NULL,
  to_number text NOT NULL,
  body text NOT NULL DEFAULT '',
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Contact status on prospects for tracking engagement state
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS contact_status text NOT NULL DEFAULT 'new';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;

-- Activity log for SMS events
CREATE TABLE IF NOT EXISTS public.activity_log (
  id text PRIMARY KEY,
  prospect_id text REFERENCES public.prospects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
