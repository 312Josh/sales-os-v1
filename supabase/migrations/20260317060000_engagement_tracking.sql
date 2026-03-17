-- Engagement tracking columns on prospects
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS proof_viewed_at timestamptz;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS proof_view_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS email_opened_at timestamptz;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS email_clicked_at timestamptz;

-- Engagement events table for detailed tracking
CREATE TABLE IF NOT EXISTS public.engagement_events (
  id text PRIMARY KEY,
  prospect_id text REFERENCES public.prospects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prospect tracking tokens for proof page links
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS tracking_token text;

-- Generate tracking tokens for existing prospects
UPDATE public.prospects SET tracking_token = substr(md5(id || now()::text), 1, 12) WHERE tracking_token IS NULL;
