-- Simplified schema for Supabase compatibility
-- Create tables for Dispatchly job management app

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_time TIMESTAMPTZ NOT NULL,
  notes TEXT,
  assigned_tech_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Technicians table
CREATE TABLE IF NOT EXISTS public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  pin TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Job updates table
CREATE TABLE IF NOT EXISTS public.job_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  created_by_tech_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SMS templates table
CREATE TABLE IF NOT EXISTS public.sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Company settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  company_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Public job tokens for shareable links
CREATE TABLE IF NOT EXISTS public.public_job_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs
CREATE POLICY "Users can view their own jobs" ON public.jobs FOR SELECT USING (auth.uid() = admin_id);
CREATE POLICY "Users can insert their own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = admin_id);
CREATE POLICY "Users can update their own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = admin_id);
CREATE POLICY "Users can delete their own jobs" ON public.jobs FOR DELETE USING (auth.uid() = admin_id);

-- RLS Policies for technicians
CREATE POLICY "Users can view their own technicians" ON public.technicians FOR SELECT USING (auth.uid() = admin_id);
CREATE POLICY "Users can insert their own technicians" ON public.technicians FOR INSERT WITH CHECK (auth.uid() = admin_id);
CREATE POLICY "Users can update their own technicians" ON public.technicians FOR UPDATE USING (auth.uid() = admin_id);
CREATE POLICY "Users can delete their own technicians" ON public.technicians FOR DELETE USING (auth.uid() = admin_id);

-- RLS Policies for job_updates
CREATE POLICY "Users can view updates for their jobs" ON public.job_updates FOR SELECT USING (EXISTS(SELECT 1 FROM public.jobs WHERE jobs.id = job_updates.job_id AND jobs.admin_id = auth.uid()));
CREATE POLICY "Users can insert updates for their jobs" ON public.job_updates FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM public.jobs WHERE jobs.id = job_updates.job_id AND jobs.admin_id = auth.uid()));

-- RLS Policies for sms_templates
CREATE POLICY "Users can view their SMS templates" ON public.sms_templates FOR SELECT USING (auth.uid() = admin_id);
CREATE POLICY "Users can insert their SMS templates" ON public.sms_templates FOR INSERT WITH CHECK (auth.uid() = admin_id);
CREATE POLICY "Users can update their SMS templates" ON public.sms_templates FOR UPDATE USING (auth.uid() = admin_id);
CREATE POLICY "Users can delete their SMS templates" ON public.sms_templates FOR DELETE USING (auth.uid() = admin_id);

-- RLS Policies for company_settings
CREATE POLICY "Users can view their settings" ON public.company_settings FOR SELECT USING (auth.uid() = admin_id);
CREATE POLICY "Users can insert their settings" ON public.company_settings FOR INSERT WITH CHECK (auth.uid() = admin_id);
CREATE POLICY "Users can update their settings" ON public.company_settings FOR UPDATE USING (auth.uid() = admin_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS jobs_admin_id_idx ON public.jobs(admin_id);
CREATE INDEX IF NOT EXISTS jobs_assigned_tech_id_idx ON public.jobs(assigned_tech_id);
CREATE INDEX IF NOT EXISTS technicians_admin_id_idx ON public.technicians(admin_id);
CREATE INDEX IF NOT EXISTS job_updates_job_id_idx ON public.job_updates(job_id);
CREATE INDEX IF NOT EXISTS sms_templates_admin_id_idx ON public.sms_templates(admin_id);
CREATE INDEX IF NOT EXISTS public_job_tokens_token_idx ON public.public_job_tokens(token);
