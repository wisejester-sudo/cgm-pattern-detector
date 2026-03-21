-- Job notes table for audit trail
CREATE TABLE IF NOT EXISTS public.job_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT NOT NULL,
  created_by_type TEXT NOT NULL CHECK (created_by_type IN ('admin', 'technician', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_notes_job_id ON public.job_notes(job_id);
CREATE INDEX IF NOT EXISTS idx_job_notes_created_at ON public.job_notes(created_at DESC);

-- RLS policies
ALTER TABLE public.job_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes for their jobs"
  ON public.job_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_notes.job_id
      AND j.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes"
  ON public.job_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_notes.job_id
      AND j.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own notes"
  ON public.job_notes
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own notes"
  ON public.job_notes
  FOR DELETE
  USING (created_by = auth.uid());

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_job_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_notes_updated_at
  BEFORE UPDATE ON public.job_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_job_notes_updated_at();
