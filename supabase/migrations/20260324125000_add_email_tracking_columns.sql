ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS email_sent_at timestamptz;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS email_replied_at timestamptz;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS email_open_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS email_click_count integer NOT NULL DEFAULT 0;
