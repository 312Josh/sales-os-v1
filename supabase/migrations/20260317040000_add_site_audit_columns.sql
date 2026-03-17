-- Add site audit columns to prospects table
-- Enables batch PageSpeed + HTML audits with results stored per prospect

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS site_audit_status text not null default 'not_started';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS site_audit_at timestamptz;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS pagespeed_score integer;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS lcp_ms real;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS cls_score real;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS broken_links_count integer not null default 0;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS missing_meta_count integer not null default 0;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS missing_alt_count integer not null default 0;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS site_health_grade text;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS site_audit_summary text;
