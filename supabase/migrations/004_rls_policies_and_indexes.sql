-- Migration: Add RLS Policies and Indexes
-- Purpose: Fix security gaps and improve query performance
-- Date: 2026-03-19

-- ============================================
-- STEP 1: Enable RLS on users table (CRITICAL SECURITY FIX)
-- ============================================

-- Enable RLS if not already enabled
alter table if exists public.users enable row level security;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create RLS policies for users table
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- ============================================
-- STEP 2: Add performance indexes
-- ============================================

-- Jobs table indexes
DROP INDEX IF EXISTS idx_jobs_admin_id;
DROP INDEX IF EXISTS idx_jobs_status;
DROP INDEX IF EXISTS idx_jobs_assigned_tech_ids;
DROP INDEX IF EXISTS idx_jobs_created_at;

create index idx_jobs_admin_id on public.jobs(admin_id);
create index idx_jobs_status on public.jobs(status);
create index idx_jobs_assigned_tech_ids on public.jobs using gin(assigned_tech_ids);
create index idx_jobs_created_at on public.jobs(created_at desc);

-- Technicians table indexes
DROP INDEX IF EXISTS idx_technicians_admin_id;
DROP INDEX IF EXISTS idx_technicians_is_active;
DROP INDEX IF EXISTS idx_technicians_pin;

create index idx_technicians_admin_id on public.technicians(admin_id);
create index idx_technicians_is_active on public.technicians(is_active) where is_active = true;
create index idx_technicians_pin on public.technicians(pin);

-- SMS logs indexes
DROP INDEX IF EXISTS idx_sms_logs_job_id;
DROP INDEX IF EXISTS idx_sms_logs_created_at;

create index idx_sms_logs_job_id on public.sms_logs(job_id);
create index idx_sms_logs_created_at on public.sms_logs(created_at desc);

-- Photos indexes
DROP INDEX IF EXISTS idx_photos_job_id;

create index idx_photos_job_id on public.photos(job_id);

-- Company settings indexes
DROP INDEX IF EXISTS idx_company_settings_admin_id;

create index idx_company_settings_admin_id on public.company_settings(admin_id);

-- ============================================
-- STEP 3: Add updated_at trigger to technicians table
-- ============================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to technicians table
DROP TRIGGER IF EXISTS on_technicians_updated ON public.technicians;
CREATE TRIGGER on_technicians_updated
  BEFORE UPDATE ON public.technicians
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- STEP 4: Add constraints for data integrity
-- ============================================

-- Ensure technician PINs are unique per admin
DROP INDEX IF EXISTS idx_unique_tech_pin_per_admin;
CREATE UNIQUE INDEX idx_unique_tech_pin_per_admin 
  ON public.technicians(admin_id, pin) 
  WHERE pin IS NOT NULL;

-- ============================================
-- STEP 5: Add comments for documentation
-- ============================================

COMMENT ON TABLE public.users IS 'User profiles with RLS enforced';
COMMENT ON POLICY "Users can view own profile" ON public.users IS 'Users can only view their own profile data';
COMMENT ON INDEX idx_jobs_assigned_tech_ids IS 'GIN index for array contains queries';
COMMENT ON INDEX idx_technicians_is_active IS 'Partial index for active technician lookups';

-- ============================================
-- VERIFICATION QUERIES (run to confirm)
-- ============================================

-- Check RLS is enabled on all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'jobs', 'technicians', 'sms_logs', 'photos', 'company_settings');

-- Check indexes exist
SELECT 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('jobs', 'technicians', 'sms_logs', 'photos', 'company_settings')
ORDER BY tablename, indexname;
