CREATE TABLE IF NOT EXISTS public.sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id TEXT REFERENCES public.prospects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  current_step INTEGER DEFAULT 0,
  stopped_reason TEXT
);

CREATE TABLE IF NOT EXISTS public.sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES public.sequences(id) ON DELETE CASCADE,
  step_number INTEGER,
  channel TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending'
);
