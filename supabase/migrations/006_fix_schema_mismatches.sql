-- Migration: Fix Schema Mismatches
-- Aligns database schema with application expectations

-- ============================================
-- JOBS TABLE FIXES
-- ============================================

-- 1. Add missing status values to jobs table
-- First, drop existing check constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Add new check constraint with all status values
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
  CHECK (status IN ('available', 'scheduled', 'en_route', 'working', 'on_hold', 'complete'));

-- 2. Rename 'address' to 'customer_address' if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'address'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'customer_address'
  ) THEN
    ALTER TABLE public.jobs RENAME COLUMN address TO customer_address;
  END IF;
END $$;

-- 3. Add customer_address if it doesn't exist
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS customer_address text;

-- 4. Migrate data from old 'address' column if needed
UPDATE public.jobs SET customer_address = address WHERE customer_address IS NULL AND address IS NOT NULL;

-- 5. Change technician_id to assigned_tech_ids array
-- First, add the new column
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS assigned_tech_ids uuid[];

-- Migrate existing single technician_id to array format
UPDATE public.jobs 
SET assigned_tech_ids = ARRAY[technician_id]::uuid[]
WHERE technician_id IS NOT NULL AND assigned_tech_ids IS NULL;

-- Add on_hold_reason column
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS on_hold_reason text;

-- Add admin_id column (for ownership)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES auth.users(id);

-- Migrate company_id to admin_id where possible
UPDATE public.jobs 
SET admin_id = (
  SELECT user_id FROM public.companies WHERE companies.id = jobs.company_id
)
WHERE admin_id IS NULL AND company_id IS NOT NULL;

-- ============================================
-- PHOTOS TABLE FIXES
-- ============================================

-- 1. Add job_id column if it doesn't exist
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE;

-- 2. Add photo_url column if it doesn't exist
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS photo_url text;

-- 3. Migrate data from existing columns
UPDATE public.photos SET job_id = update_id WHERE job_id IS NULL;
UPDATE public.photos SET photo_url = url WHERE photo_url IS NULL;

-- ============================================
-- UPDATES TABLE FIXES
-- ============================================

-- Fix status check constraint to match jobs
ALTER TABLE public.updates DROP CONSTRAINT IF EXISTS updates_status_check;
ALTER TABLE public.updates ADD CONSTRAINT updates_status_check 
  CHECK (status IN ('available', 'scheduled', 'en_route', 'working', 'on_hold', 'complete'));

-- ============================================
-- TECHNICIANS TABLE FIXES
-- ============================================

-- Add admin_id column for ownership
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES auth.users(id);

-- Add missing columns for magic link functionality
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS magic_link_expires_at timestamp with time zone;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS invited_at timestamp with time zone;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id);
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS accessed_at timestamp with time zone;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS role text DEFAULT 'technician';
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS pin text;

-- Add assigned_jobs array
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS assigned_jobs uuid[] DEFAULT '{}'::uuid[];

-- Add environment tracking
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS environment text;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS base_url text;

-- Migrate company_id to admin_id
UPDATE public.technicians 
SET admin_id = (
  SELECT user_id FROM public.companies WHERE companies.id = technicians.company_id
)
WHERE admin_id IS NULL AND company_id IS NOT NULL;

-- ============================================
-- COMPANIES TABLE FIXES
-- ============================================

-- Add missing columns for company settings
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS trade_type text DEFAULT 'generic';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS custom_job_types text[] DEFAULT '{}'::text[];
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS default_sms_template_id uuid;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#3b82f6';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS business_hours text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS service_area text;

-- Rename user_id to admin_id for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'admin_id'
  ) THEN
    ALTER TABLE public.companies RENAME COLUMN user_id TO admin_id;
  END IF;
END $$;

-- ============================================
-- CREATE MISSING TABLES
-- ============================================

-- Company Settings table (if using separate table)
CREATE TABLE IF NOT EXISTS public.company_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  company_phone text,
  trade_type text DEFAULT 'generic',
  custom_job_types text[] DEFAULT '{}'::text[],
  default_sms_template_id uuid,
  logo_url text,
  primary_color text DEFAULT '#3b82f6',
  tagline text,
  business_hours text,
  service_area text
);

-- SMS Templates table
CREATE TABLE IF NOT EXISTS public.sms_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  template_body text NOT NULL
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamp with time zone DEFAULT timezone('utc'::text, now()),
  current_period_end timestamp with time zone DEFAULT timezone('utc'::text, now() + interval '30 days'),
  sms_used_this_month integer DEFAULT 0,
  sms_limit integer DEFAULT 100
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  description text,
  stripe_invoice_id text
);

-- Public Job Tokens table
CREATE TABLE IF NOT EXISTS public.public_job_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  token text UNIQUE NOT NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  expires_at timestamp with time zone NOT NULL
);

-- Magic Tokens table (if not exists)
CREATE TABLE IF NOT EXISTS public.magic_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  token text UNIQUE NOT NULL,
  technician_id uuid REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  expires_at timestamp with time zone NOT NULL
);

-- Add missing columns to sms_logs
ALTER TABLE public.sms_logs ADD COLUMN IF NOT EXISTS technician_id uuid REFERENCES public.technicians(id) ON DELETE SET NULL;
ALTER TABLE public.sms_logs ADD COLUMN IF NOT EXISTS parsed_keyword text;
ALTER TABLE public.sms_logs ADD COLUMN IF NOT EXISTS parsed_result text;
ALTER TABLE public.sms_logs ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'general';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_admin_id ON public.jobs(admin_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_tech_ids ON public.jobs USING GIN (assigned_tech_ids);
CREATE INDEX IF NOT EXISTS idx_photos_job_id ON public.photos(job_id);
CREATE INDEX IF NOT EXISTS idx_technicians_admin_id ON public.technicians(admin_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_admin_id ON public.company_settings(admin_id);
CREATE INDEX IF NOT EXISTS idx_sms_templates_admin_id ON public.sms_templates(admin_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_admin_id ON public.subscriptions(admin_id);

-- Enable RLS on new tables
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_job_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can view own company settings" ON public.company_settings
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Users can insert own company settings" ON public.company_settings
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Users can update own company settings" ON public.company_settings
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Users can view own SMS templates" ON public.sms_templates
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Users can insert own SMS templates" ON public.sms_templates
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Users can update own SMS templates" ON public.sms_templates
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Users can delete own SMS templates" ON public.sms_templates
  FOR DELETE USING (admin_id = auth.uid());

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (admin_id = auth.uid());

-- Update existing RLS policies to use admin_id
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
DROP POLICY IF EXISTS "Users can insert own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update own company" ON public.companies;

CREATE POLICY "Users can view own company" ON public.companies
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Users can insert own company" ON public.companies
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Users can update own company" ON public.companies
  FOR UPDATE USING (admin_id = auth.uid());

-- Update jobs policies to use admin_id
DROP POLICY IF EXISTS "Users can view company jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can insert company jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update company jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete company jobs" ON public.jobs;

CREATE POLICY "Users can view own jobs" ON public.jobs
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Users can insert own jobs" ON public.jobs
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Users can update own jobs" ON public.jobs
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Users can delete own jobs" ON public.jobs
  FOR DELETE USING (admin_id = auth.uid());

-- Update technicians policies
DROP POLICY IF EXISTS "Users can view company technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can insert company technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can update company technicians" ON public.technicians;
DROP POLICY IF EXISTS "Users can delete company technicians" ON public.technicians;

CREATE POLICY "Users can view own technicians" ON public.technicians
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Users can insert own technicians" ON public.technicians
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Users can update own technicians" ON public.technicians
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Users can delete own technicians" ON public.technicians
  FOR DELETE USING (admin_id = auth.uid());

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON public.company_settings;
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sms_templates_updated_at ON public.sms_templates;
CREATE TRIGGER update_sms_templates_updated_at
  BEFORE UPDATE ON public.sms_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Log completion
SELECT 'Schema migration 006 completed successfully' as status;
