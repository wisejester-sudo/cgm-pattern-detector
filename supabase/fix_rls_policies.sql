-- Fix RLS Policies for Dispatchly
-- Run this in Supabase SQL Editor to allow authenticated users to read their own data

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.jobs;

DROP POLICY IF EXISTS "Users can read own technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can insert own technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can update own technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can delete own technicians" ON public.technicians;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

DROP POLICY IF EXISTS "Users can read own settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.company_settings;

DROP POLICY IF EXISTS "Users can read own templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON public.sms_templates;

DROP POLICY IF EXISTS "Users can read own job updates" ON public.job_updates;
DROP POLICY IF EXISTS "Users can insert own job updates" ON public.job_updates;

-- Create new policies for JOBS table
CREATE POLICY "Users can read own jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (auth.uid() = admin_id);

CREATE POLICY "Users can insert own jobs" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can update own jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (auth.uid() = admin_id);

CREATE POLICY "Users can delete own jobs" 
  ON public.jobs 
  FOR DELETE 
  USING (auth.uid() = admin_id);

-- Create new policies for TECHNICIANS table
CREATE POLICY "Users can read own technicians" 
  ON public.technicians 
  FOR SELECT 
  USING (auth.uid() = admin_id);

CREATE POLICY "Users can insert own technicians" 
  ON public.technicians 
  FOR INSERT 
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can update own technicians" 
  ON public.technicians 
  FOR UPDATE 
  USING (auth.uid() = admin_id);

CREATE POLICY "Users can delete own technicians" 
  ON public.technicians 
  FOR DELETE 
  USING (auth.uid() = admin_id);

-- Create new policies for USERS table
CREATE POLICY "Users can read own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create new policies for COMPANY_SETTINGS table
CREATE POLICY "Users can read own settings" 
  ON public.company_settings 
  FOR SELECT 
  USING (auth.uid() = admin_id);

CREATE POLICY "Users can insert own settings" 
  ON public.company_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can update own settings" 
  ON public.company_settings 
  FOR UPDATE 
  USING (auth.uid() = admin_id);

-- Create new policies for SMS_TEMPLATES table
CREATE POLICY "Users can read own templates" 
  ON public.sms_templates 
  FOR SELECT 
  USING (auth.uid() = admin_id);

CREATE POLICY "Users can insert own templates" 
  ON public.sms_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can update own templates" 
  ON public.sms_templates 
  FOR UPDATE 
  USING (auth.uid() = admin_id);

CREATE POLICY "Users can delete own templates" 
  ON public.sms_templates 
  FOR DELETE 
  USING (auth.uid() = admin_id);

-- Create new policies for JOB_UPDATES table
CREATE POLICY "Users can read own job updates" 
  ON public.job_updates 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = job_updates.job_id 
    AND jobs.admin_id = auth.uid()
  ));

CREATE POLICY "Users can insert own job updates" 
  ON public.job_updates 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = job_updates.job_id 
    AND jobs.admin_id = auth.uid()
  ));

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify policies were created
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;