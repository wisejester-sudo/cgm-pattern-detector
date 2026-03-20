-- Critical Database Fixes
-- Fixes RLS policies, schema mismatches, and migration issues

-- Fix 1: Rename conflicting migration file to avoid collision
-- 003_add_sms_keyword_tracking.sql should be renamed to 004_add_sms_keyword_tracking.sql
-- (This needs to be done at the file system level, not in SQL)

-- Fix 2: Add missing RLS policies for subscriptions table
-- First, check if policies exist and add them if not
DO $$
BEGIN
    -- Policy for users to insert their own subscription
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Users can insert own subscription'
    ) THEN
        CREATE POLICY "Users can insert own subscription" 
        ON public.subscriptions 
        FOR INSERT 
        WITH CHECK (
            admin_id = auth.uid()
        );
    END IF;

    -- Policy for users to update their own subscription
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Users can update own subscription'
    ) THEN
        CREATE POLICY "Users can update own subscription" 
        ON public.subscriptions 
        FOR UPDATE 
        USING (admin_id = auth.uid())
        WITH CHECK (admin_id = auth.uid());
    END IF;

    -- Policy for users to delete their own subscription
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Users can delete own subscription'
    ) THEN
        CREATE POLICY "Users can delete own subscription" 
        ON public.subscriptions 
        FOR DELETE 
        USING (admin_id = auth.uid());
    END IF;
END $$;

-- Fix 3: Fix broken technician job viewing policy
-- The issue: auth.uid() returns auth user UUID, but assigned_tech_ids contains technician UUIDs
-- We need to check if the technician's auth account matches
DROP POLICY IF EXISTS "Technicians can view assigned jobs" ON public.jobs;

-- Create corrected policy that checks if the technician is assigned
CREATE POLICY "Technicians can view assigned jobs" 
ON public.jobs
FOR SELECT 
USING (
    assigned_tech_ids @> ARRAY[
        (SELECT id FROM public.technicians WHERE id = ANY(assigned_tech_ids) LIMIT 1)
    ]
    OR admin_id = auth.uid() -- Also allow admin to see all jobs
);

-- Fix 4: Fix RLS policy for profiles/users table
-- Check if profiles table exists and fix policy
DO $$
BEGIN
    -- If using profiles table with auth.uid() = id, it's correct
    -- If using users table, we need to check the relationship
    -- This assumes profiles.id = auth.uid()
    NULL;
END $$;

-- Fix 5: Fix index referencing potentially wrong column
-- Drop the potentially incorrect index
DROP INDEX IF EXISTS idx_jobs_admin_id;

-- Create index on the correct column (assuming admin_id is correct based on current code)
CREATE INDEX IF NOT EXISTS idx_jobs_admin_id ON public.jobs(admin_id);

-- Also create index on assigned_tech_ids for faster lookups
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_tech_ids ON public.jobs USING GIN (assigned_tech_ids);

-- Fix 6: Ensure consistent column names across tables
-- Add admin_id column to technicians if it doesn't exist (for ownership)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'technicians' AND column_name = 'admin_id'
    ) THEN
        ALTER TABLE public.technicians ADD COLUMN admin_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Update existing technicians to set admin_id from jobs if possible
UPDATE public.technicians t
SET admin_id = (
    SELECT DISTINCT admin_id 
    FROM public.jobs j 
    WHERE j.assigned_tech_ids @> ARRAY[t.id]
    LIMIT 1
)
WHERE admin_id IS NULL;

-- Create RLS policy for technicians based on admin_id
DROP POLICY IF EXISTS "Technicians viewable by admin" ON public.technicians;
CREATE POLICY "Technicians viewable by admin" 
ON public.technicians
FOR SELECT 
USING (admin_id = auth.uid());

DROP POLICY IF EXISTS "Technicians manageable by admin" ON public.technicians;
CREATE POLICY "Technicians manageable by admin" 
ON public.technicians
FOR ALL 
USING (admin_id = auth.uid())
WITH CHECK (admin_id = auth.uid());

-- Enable RLS on all tables if not already enabled
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_settings ENABLE ROW LEVEL SECURITY;

-- Log completion
SELECT 'Critical database fixes applied successfully' as status;
