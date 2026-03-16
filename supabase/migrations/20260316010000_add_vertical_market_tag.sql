-- Add vertical and market_tag columns to prospects table
-- Enables clean filtering by business vertical and geographic market

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS vertical text not null default '';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS market_tag text not null default '';

-- Backfill existing records based on id prefix and market field
UPDATE public.prospects SET vertical = 'field_service', market_tag = 'chicago'
WHERE (id LIKE 'donna-%' AND market = 'Field Service');

UPDATE public.prospects SET vertical = 'restaurant', market_tag = 'chicago'
WHERE (id LIKE 'donna-%' AND market = 'Hospitality');

UPDATE public.prospects SET vertical = 'professional_services', market_tag = 'boston'
WHERE (id LIKE 'donna-%' AND market = 'Professional Services');

UPDATE public.prospects SET vertical = 'professional_services', market_tag = 'boston'
WHERE (id LIKE 'boston-%');

UPDATE public.prospects SET vertical = 'field_service', market_tag = 'chicago'
WHERE (id IN ('p1', 'p2', 'p3') AND vertical = '');

UPDATE public.prospects SET vertical = 'field_service', market_tag = 'test'
WHERE (id LIKE 'verify-%' AND vertical = '');
