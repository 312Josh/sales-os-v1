-- Schema debt cleanup: add dedicated columns for metadata currently stuffed in owner_operated_signal
-- Adds: priority_bucket, decision_maker_title, contact_form_present, chat_present, online_booking_present

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS priority_bucket text not null default '';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS decision_maker_title text not null default '';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS contact_form_present boolean not null default false;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS chat_present boolean not null default false;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS online_booking_present boolean not null default false;

-- Backfill contact_form_present from contact_form_url (if URL exists, form is present)
UPDATE public.prospects SET contact_form_present = true
WHERE contact_form_url IS NOT NULL AND contact_form_url != '';

-- Backfill chat_present from no_chat_signal (inverse: if no_chat_signal is false, chat is present)
UPDATE public.prospects SET chat_present = (NOT no_chat_signal);

-- Backfill online_booking_present from no_booking_signal (inverse)
UPDATE public.prospects SET online_booking_present = (NOT no_booking_signal);

-- Backfill priority_bucket from priority_score ranges
UPDATE public.prospects SET priority_bucket = 'hot' WHERE priority_score >= 70;
UPDATE public.prospects SET priority_bucket = 'warm' WHERE priority_score >= 40 AND priority_score < 70;
UPDATE public.prospects SET priority_bucket = 'cold' WHERE priority_score < 40 AND priority_bucket = '';

-- Backfill decision_maker_title from owner_operated_signal where it contains role info
-- Pattern: "vertical:X | market:Y" was stuffed here by Donna import — extract what we can
UPDATE public.prospects SET decision_maker_title = 'Owner' WHERE owner_operated_signal LIKE '%owner%' OR owner_operated_signal LIKE '%Owner%';
