-- Create sms_logs table
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  recipient_phone text NOT NULL,
  message_body text NOT NULL,
  sent_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  message_sid text,
  technician_id uuid REFERENCES public.technicians(id) ON DELETE SET NULL,
  parsed_keyword text,
  parsed_result text,
  message_type text DEFAULT 'general',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own SMS logs" 
  ON public.sms_logs 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = sms_logs.job_id 
    AND jobs.admin_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own SMS logs" 
  ON public.sms_logs 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = sms_logs.job_id 
    AND jobs.admin_id = auth.uid()
  ));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sms_logs_job_id ON public.sms_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON public.sms_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_technician_id ON public.sms_logs(technician_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_parsed_result ON public.sms_logs(parsed_result);
