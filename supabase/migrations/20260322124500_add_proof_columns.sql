ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS proof_url TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS proof_screenshot_url TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS proof_video_url TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS proof_status TEXT DEFAULT 'none';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS proof_generated_at TIMESTAMPTZ;
