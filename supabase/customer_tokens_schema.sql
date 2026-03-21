-- Customer access tokens table for magic links
CREATE TABLE IF NOT EXISTS public.customer_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_customer_tokens_token ON public.customer_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_customer_tokens_job_id ON public.customer_access_tokens(job_id);

-- RLS policies
ALTER TABLE public.customer_access_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can manage tokens
CREATE POLICY "Admins can manage customer tokens"
  ON public.customer_access_tokens
  USING (auth.uid() IN (
    SELECT user_id FROM public.users WHERE role = 'admin'
  ));

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_customer_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.customer_access_tokens
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-cleanup on insert
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_tokens()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM cleanup_expired_customer_tokens();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_expired_tokens_trigger
  AFTER INSERT ON public.customer_access_tokens
  EXECUTE FUNCTION trigger_cleanup_expired_tokens();
