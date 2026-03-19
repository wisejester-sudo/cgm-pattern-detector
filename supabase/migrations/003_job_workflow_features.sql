-- Migration: Job Workflow Features (Part 2)
-- Date: 2026-03-19
-- Description: Add available/on_hold statuses, on_hold_reason field, and multiple techs support

-- ============================================
-- Feature 1 & 2: New Job Statuses
-- ============================================

-- Update the status check constraint to include new statuses
-- First, drop the existing constraint
ALTER TABLE public.jobs 
DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Add new constraint with all statuses: available, scheduled, en_route, working, on_hold, complete
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('available', 'scheduled', 'enroute', 'working', 'on_hold', 'complete'));

-- ============================================
-- Feature 2: On Hold Reason Field
-- ============================================

-- Add on_hold_reason column
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS on_hold_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.jobs.on_hold_reason IS 'Reason why job is on hold (e.g., waiting for parts, customer rescheduled, awaiting approval)';

-- ============================================
-- Feature 3: Multiple Techs Per Job
-- ============================================

-- Note: This migration assumes the existing column is named 'technician_id'
-- If your column is named differently, adjust accordingly

-- First, create the new array column
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS assigned_tech_ids UUID[];

-- Migrate existing data: convert single technician_id to array
-- This assumes the old column exists and is named 'technician_id' or 'assigned_tech_id'
-- Uncomment and adjust the following based on your actual column name:

-- UPDATE public.jobs 
-- SET assigned_tech_ids = ARRAY[technician_id]::UUID[]
-- WHERE technician_id IS NOT NULL;

-- Or if the column was assigned_tech_id:
-- UPDATE public.jobs 
-- SET assigned_tech_ids = ARRAY[assigned_tech_id]::UUID[]
-- WHERE assigned_tech_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.jobs.assigned_tech_ids IS 'Array of technician IDs assigned to this job';

-- ============================================
-- Update RLS Policies (if using Supabase RLS)
-- ============================================

-- Drop existing policies if they reference the old column
-- DROP POLICY IF EXISTS "Technicians can view own jobs" ON public.jobs;

-- Create new policy for technicians to view jobs they're assigned to
-- This uses the array containment operator @>
CREATE POLICY IF NOT EXISTS "Technicians can view assigned jobs" ON public.jobs
  FOR SELECT USING (
    assigned_tech_ids @> ARRAY[auth.uid()]
  );

-- ============================================
-- Create Helper Function for Job Assignment
-- ============================================

-- Function to add a technician to a job
CREATE OR REPLACE FUNCTION public.add_technician_to_job(
  job_id UUID,
  tech_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.jobs
  SET 
    assigned_tech_ids = CASE 
      WHEN assigned_tech_ids IS NULL THEN ARRAY[tech_id]
      WHEN NOT assigned_tech_ids @> ARRAY[tech_id] THEN array_append(assigned_tech_ids, tech_id)
      ELSE assigned_tech_ids
    END,
    status = CASE 
      WHEN status = 'available' THEN 'scheduled'
      ELSE status
    END,
    updated_at = timezone('utc'::text, now())
  WHERE id = job_id;
END;
$$;

-- Function to remove a technician from a job
CREATE OR REPLACE FUNCTION public.remove_technician_from_job(
  job_id UUID,
  tech_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.jobs
  SET 
    assigned_tech_ids = array_remove(assigned_tech_ids, tech_id),
    updated_at = timezone('utc'::text, now())
  WHERE id = job_id;
END;
$$;

-- ============================================
-- Index for Performance
-- ============================================

-- Create GIN index for efficient array queries
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_tech_ids 
ON public.jobs USING GIN (assigned_tech_ids);

-- Index for on_hold_reason (if frequently filtered)
CREATE INDEX IF NOT EXISTS idx_jobs_on_hold_reason 
ON public.jobs (on_hold_reason) 
WHERE status = 'on_hold';

-- Index for status (for filtering available jobs)
CREATE INDEX IF NOT EXISTS idx_jobs_status 
ON public.jobs (status);

-- ============================================
-- Verification
-- ============================================

-- Verify the migration
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND table_schema = 'public'
ORDER BY ordinal_position;
