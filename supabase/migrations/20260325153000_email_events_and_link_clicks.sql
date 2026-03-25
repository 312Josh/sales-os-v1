CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id text,
  email_to text NOT NULL,
  event_type text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_slug text NOT NULL,
  destination_url text NOT NULL,
  user_agent text,
  ip_address text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_events_prospect ON public.email_events(prospect_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON public.email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_link_clicks_slug ON public.link_clicks(prospect_slug);

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS email_bounced_at timestamptz;
