-- Create sms_logs table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  recipient_phone text NOT NULL,
  message_body text NOT NULL,
  sent_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'sent',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on sms_logs
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing SMS logs
CREATE POLICY "Users can view their SMS logs"
ON public.sms_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = sms_logs.job_id 
    AND jobs.admin_id = auth.uid()
  )
);
