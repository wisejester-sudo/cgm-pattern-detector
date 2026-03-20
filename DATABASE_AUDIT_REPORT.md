# Dispatchly Database Audit Report
**Date:** 2026-03-19
**Scope:** All Supabase migrations, schemas, RLS policies, and TypeScript types

---

## EXECUTIVE SUMMARY

**CRITICAL ISSUES: 8**
**HIGH SEVERITY: 6**
**MEDIUM SEVERITY: 5**
**LOW SEVERITY: 3**

This audit reveals significant schema inconsistencies, broken RLS policies, and security vulnerabilities that could allow unauthorized data access. The database has conflicting migration files and multiple schema definitions that don't align with the TypeScript types.

---

## CRITICAL ISSUES

### 1. DUPLICATE MIGRATION FILENAMES - CONFLICTS
**File:** `supabase/migrations/003_job_workflow_features.sql` and `supabase/migrations/003_add_sms_keyword_tracking.sql`
**Severity:** CRITICAL
**Issue:** Two migrations share the same sequence number (003). Supabase applies migrations in alphabetical order, and these will conflict or run unpredictably.

**Suggested Fix:**
```sql
-- Rename files to have unique sequence numbers:
-- 003_job_workflow_features.sql (keep)
-- 004_add_sms_keyword_tracking.sql (rename from 003)
```

---

### 2. RLS POLICY REFERENCES WRONG COLUMN TYPE
**File:** `supabase/migrations/003_job_workflow_features.sql` (lines 71-75)
**Severity:** CRITICAL
**Issue:** The policy uses `auth.uid()` which returns an Auth User UUID, but `assigned_tech_ids` contains Technician UUIDs (from the technicians table). These are different IDs, so technicians will NEVER be able to see their assigned jobs.

```sql
-- BROKEN POLICY:
CREATE POLICY IF NOT EXISTS "Technicians can view assigned jobs" ON public.jobs
  FOR SELECT USING (
    assigned_tech_ids @> ARRAY[auth.uid()]  -- WRONG: auth.uid() != technician.id
  );
```

**Suggested Fix:**
```sql
-- Create a function to get technician ID from auth user
CREATE OR REPLACE FUNCTION get_technician_id_for_auth_user()
RETURNS UUID AS $$
  SELECT id FROM public.technicians 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Fix the policy
DROP POLICY IF EXISTS "Technicians can view assigned jobs" ON public.jobs;
CREATE POLICY "Technicians can view assigned jobs" ON public.jobs
  FOR SELECT USING (
    assigned_tech_ids @> ARRAY[get_technician_id_for_auth_user()]
    OR EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = jobs.company_id AND user_id = auth.uid()
    )
  );
```

---

### 3. BROKEN RLS POLICY IN 005_critical_fixes.sql
**File:** `supabase/migrations/005_critical_fixes.sql` (lines 55-65)
**Severity:** CRITICAL
**Issue:** The "Technicians can view assigned jobs" policy has a circular/invalid query that will always fail:

```sql
-- BROKEN:
assigned_tech_ids @> ARRAY[
    (SELECT id FROM public.technicians WHERE id = ANY(assigned_tech_ids) LIMIT 1)
]
```

This subquery is self-referencing in a way that doesn't validate the current user.

**Suggested Fix:**
```sql
DROP POLICY IF EXISTS "Technicians can view assigned jobs" ON public.jobs;
CREATE POLICY "Technicians can view assigned jobs" ON public.jobs
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.technicians t
        WHERE t.id = ANY(jobs.assigned_tech_ids)
        AND t.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.companies c
        WHERE c.id = jobs.company_id AND c.user_id = auth.uid()
    )
);
```

---

### 4. SUBSCRIPTIONS TABLE REFERENCES NON-EXISTENT COLUMNS
**File:** `supabase/migrations/002_add_billing_system.sql` (lines 1-50)
**Severity:** CRITICAL
**Issue:** The subscriptions table references `public.companies(id)` but the RLS policies use `admin_id` which doesn't exist in the subscriptions table:

```sql
-- Table definition uses company_id:
company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE

-- But policies reference admin_id:
WITH CHECK (admin_id = auth.uid())  -- admin_id doesn't exist!
```

**Suggested Fix:**
```sql
-- Fix the INSERT/UPDATE policies in 005_critical_fixes.sql:
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscription" ON public.subscriptions;

CREATE POLICY "Users can insert own subscription" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own subscription" 
ON public.subscriptions 
FOR UPDATE 
USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own subscription" 
ON public.subscriptions 
FOR DELETE 
USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));
```

---

### 5. TECHNICIANS TABLE MISSING user_id COLUMN IN SOME SCHEMAS
**File:** `supabase/schema.sql` and `supabase/setup.sql`
**Severity:** CRITICAL
**Issue:** The technicians table in schema.sql doesn't have `user_id` column, but RLS policies in other migrations assume it exists. This breaks the link between auth users and technicians.

**Schema.sql definition:**
```sql
create table if not exists public.technicians (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  phone text not null,
  magic_link_token text unique
  -- MISSING: user_id uuid references auth.users(id)
);
```

**Suggested Fix:**
```sql
-- Add to schema.sql and run as migration:
ALTER TABLE public.technicians 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON public.technicians(user_id);
```

---

### 6. DATABASE.TYPES.TS OUT OF SYNC WITH ACTUAL SCHEMA
**File:** `lib/database.types.ts`
**Severity:** CRITICAL
**Issue:** The TypeScript types don't match the actual database schema. Key mismatches:

| Type Definition | Actual Database |
|----------------|-----------------|
| `jobs.technician_id` (single UUID) | `jobs.assigned_tech_ids` (UUID[]) |
| `jobs.status` has 4 values | Migration 003 adds 2 more ('available', 'on_hold') |
| Missing `sms_logs.technician_id` | Added in migration 003 |
| Missing `sms_logs.parsed_*` columns | Added in migration 003 |
| Missing `jobs.on_hold_reason` | Added in migration 003 |
| Missing `jobs.assigned_tech_ids` | Added in migration 003 |
| Missing entire `profiles` table | Exists in scripts/001_create_tables.sql |
| Missing `company_settings` table | Exists in scripts/002_create_tables_simple.sql |
| Missing `sms_templates` table | Exists in scripts/001_create_tables.sql |
| Missing `subscriptions` table | Added in migration 002 |
| Missing `plans` table | Added in migration 002 |
| Missing `payments` table | Added in migration 002 |

**Suggested Fix:**
Regenerate types using Supabase CLI:
```bash
supabase gen types typescript --linked > lib/database.types.ts
```

---

### 7. FOREIGN KEY REFERENCE TO NON-EXISTENT TABLE
**File:** `scripts/001_create_tables.sql` (line 99)
**Severity:** CRITICAL
**Issue:** The `jobs` table references `public.technicians(id)` but if `schema.sql` or `setup.sql` was run instead, the technicians table has a different structure (no `user_id` column).

**Suggested Fix:**
Standardize on ONE schema definition and ensure all foreign key references are valid.

---

### 8. SMS_LOGS TABLE - OPEN INSERT POLICY SECURITY VULNERABILITY
**File:** `supabase/migrations/003_add_sms_keyword_tracking.sql` (lines 20-21)
**Severity:** CRITICAL
**Issue:** The policy allows ANY insert without authentication:

```sql
create policy if not exists "Service role can insert SMS logs" on public.sms_logs
  for insert with check (true);  -- NO AUTHENTICATION CHECK!
```

While this is meant for webhooks, there's no validation that the request is actually from Twilio or an authorized service.

**Suggested Fix:**
```sql
-- Remove the open policy
DROP POLICY IF EXISTS "Service role can insert SMS logs" ON public.sms_logs;

-- Use service role key in your API routes instead of relying on anon key with open policy
-- Or add a validation function:
CREATE OR REPLACE FUNCTION is_service_request()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check for service role or specific headers
  RETURN current_setting('request.headers', true)::json->>'x-service-key' = current_setting('app.settings.service_key', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Service role can insert SMS logs" ON public.sms_logs
  FOR INSERT WITH CHECK (is_service_request());
```

---

## HIGH SEVERITY ISSUES

### 9. MISSING RLS ON profiles TABLE
**File:** `scripts/001_create_tables.sql` (lines 27-42)
**Severity:** HIGH
**Issue:** The profiles table has RLS policies defined but other code references a `users` table instead. Need to ensure consistent table naming.

**Note:** There are TWO different user/profile table approaches:
- `scripts/001_create_tables.sql` → uses `profiles` table
- `supabase/migrations/create_users_table.sql` → uses `users` table

**Suggested Fix:**
Standardize on ONE approach. Recommended: Use `profiles` table (Supabase convention).

```sql
-- Remove the conflicting users table migration
drop table if exists public.users cascade;

-- Ensure profiles has RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Keep these policies from 001_create_tables.sql
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

---

### 10. JOBS TABLE STATUS CHECK CONSTRAINT INCONSISTENT
**File:** Multiple files
**Severity:** HIGH
**Issue:** The status check constraint varies across files:

| File | Status Values |
|------|---------------|
| `schema.sql` / `setup.sql` | `('scheduled', 'enroute', 'working', 'complete')` |
| `scripts/001_create_tables.sql` | `('scheduled', 'en_route', 'working', 'complete')` |
| `scripts/002_create_tables_simple.sql` | No check constraint |
| `lib/types.ts` | `('available', 'scheduled', 'en_route', 'working', 'on_hold', 'complete')` |
| `lib/database.types.ts` | `('scheduled', 'enroute', 'working', 'complete')` |
| `migrations/003_job_workflow_features.sql` | `('available', 'scheduled', 'enroute', 'working', 'on_hold', 'complete')` |

**Suggested Fix:**
```sql
-- Standardize on 6 statuses:
ALTER TABLE public.jobs 
DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('available', 'scheduled', 'enroute', 'working', 'on_hold', 'complete'));

-- Update all TypeScript types to match
```

---

### 11. MISSING INDEXES ON FOREIGN KEYS
**File:** Various
**Severity:** HIGH
**Issue:** Missing indexes on foreign key columns causes slow queries:

- `updates.job_id` - no index in schema.sql
- `photos.update_id` - no index in schema.sql  
- `technicians.company_id` - no index in schema.sql
- `jobs.company_id` - no index in schema.sql

**Suggested Fix:**
```sql
-- Add missing indexes (some are in 004_rls_policies_and_indexes.sql but not in schema.sql)
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_technicians_company_id ON public.technicians(company_id);
CREATE INDEX IF NOT EXISTS idx_updates_job_id ON public.updates(job_id);
CREATE INDEX IF NOT EXISTS idx_photos_update_id ON public.photos(update_id);
```

---

### 12. COMPANY_SETTINGS TABLE MISSING IN SCHEMA.SQL
**File:** `supabase/schema.sql`
**Severity:** HIGH
**Issue:** The `company_settings` table exists in scripts but not in the main schema.sql, leading to missing table errors if schema.sql is used as the source of truth.

**Suggested Fix:**
Add to schema.sql:
```sql
create table if not exists public.company_settings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  admin_id uuid references auth.users(id) on delete cascade not null unique,
  company_name text not null default 'My Company',
  company_phone text,
  owner_name text,
  owner_phone text,
  address text,
  logo_url text,
  primary_color text default '#2563eb',
  tagline text,
  business_hours text,
  service_area text,
  setup_completed boolean default false
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.company_settings
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Users can update own settings" ON public.company_settings
  FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Users can insert own settings" ON public.company_settings
  FOR INSERT WITH CHECK (admin_id = auth.uid());
```

---

### 13. SMS_TEMPLATES TABLE MISSING IN SCHEMA.SQL
**File:** `supabase/schema.sql`
**Severity:** HIGH
**Issue:** The `sms_templates` table exists in scripts but not in schema.sql.

**Suggested Fix:**
Add to schema.sql:
```sql
create table if not exists public.sms_templates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  admin_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  template_body text not null
);

ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their templates" ON public.sms_templates
  FOR ALL USING (admin_id = auth.uid());
```

---

### 14. TECHNICIANS TABLE MISSING CRITICAL COLUMNS
**File:** `supabase/schema.sql` vs `scripts/001_create_tables.sql`
**Severity:** HIGH
**Issue:** The technicians table in schema.sql is missing columns that exist in other migrations:

Missing in schema.sql:
- `user_id` (links technician to auth user)
- `is_active`
- `magic_link_token` (only exists in schema.sql, not in 001_create_tables.sql)
- `pin`
- `environment` (added in 001_add_environment_validation.sql)
- `base_url` (added in 001_add_environment_validation.sql)
- `magic_link_expires_at` (added in 001_add_environment_validation.sql)
- `invited_at` (added in scripts)
- `last_login_at` (added in scripts)
- `invited_by` (added in scripts)
- `accessed_at` (added in add_access_tracking.sql)
- `last_active_at` (added in add_access_tracking.sql)

**Suggested Fix:**
Create a comprehensive migration to sync all columns:
```sql
-- Single migration to fix technicians table
ALTER TABLE public.technicians
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS pin TEXT,
ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'production',
ADD COLUMN IF NOT EXISTS base_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS magic_link_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS accessed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON public.technicians(user_id);
CREATE INDEX IF NOT EXISTS idx_technicians_magic_link ON public.technicians(magic_link_token);
```

---

## MEDIUM SEVERITY ISSUES

### 15. MIGRATION ORDER DEPENDENCY ISSUES
**File:** `supabase/migrations/`
**Severity:** MEDIUM
**Issue:** Migrations reference tables/columns that may not exist if run in different order:
- 002_add_billing_system.sql references `companies(id)` but doesn't ensure companies table exists first
- 005_critical_fixes.sql references `admin_id` on subscriptions which doesn't exist

**Suggested Fix:**
Ensure all migrations are idempotent and check for table existence before referencing.

---

### 16. MISSING ON DELETE CASCADE FOR SOME RELATIONSHIPS
**File:** Various
**Severity:** MEDIUM
**Issue:** Inconsistent CASCADE behavior:
- `jobs.technician_id` → `ON DELETE SET NULL` (correct)
- `jobs.company_id` → `ON DELETE CASCADE` (correct)
- `updates.job_id` → `ON DELETE CASCADE` (correct)
- `photos.update_id` → `ON DELETE CASCADE` (correct)
- `sms_logs.job_id` → `ON DELETE SET NULL` (should this be CASCADE?)

**Suggested Fix:**
Review each relationship and document the intended behavior. For sms_logs, consider:
```sql
-- If you want to preserve SMS history even after job deletion, keep SET NULL
-- If SMS logs should be deleted with jobs, change to CASCADE
```

---

### 17. RLS POLICIES ALLOW TECHNICIANS TO VIEW ALL JOBS IN COMPANY
**File:** `scripts/001_create_tables.sql` (lines 75-85)
**Severity:** MEDIUM
**Issue:** The technician job policy allows viewing ANY job where the technician is assigned, but technicians should only see their OWN assigned jobs:

```sql
-- Current policy allows seeing all jobs where technician is assigned
CREATE POLICY "Technicians can view assigned jobs" ON public.jobs
  FOR SELECT USING (
    assigned_tech_id IN (
      SELECT id FROM public.technicians WHERE user_id = auth.uid()
    )
  );
```

This is actually correct behavior (techs see their assigned jobs), but verify this is intentional.

---

### 18. NO INDEX ON MAGIC_LINK_TOKEN IN SOME SCHEMAS
**File:** `supabase/schema.sql`, `supabase/setup.sql`
**Severity:** MEDIUM
**Issue:** The `magic_link_token` column is marked UNIQUE but has no explicit index in schema.sql, relying on the implicit unique index.

**Suggested Fix:**
Ensure index exists (it will be created automatically for UNIQUE constraints, but be explicit):
```sql
-- This is already UNIQUE which creates an index automatically
-- But verify with: 
CREATE UNIQUE INDEX IF NOT EXISTS idx_technicians_magic_link ON public.technicians(magic_link_token);
```

---

### 19. JOBS TABLE MISSING updated_at TRIGGER IN SOME FILES
**File:** `scripts/002_create_tables_simple.sql`
**Severity:** MEDIUM
**Issue:** The simplified schema doesn't include the updated_at trigger for jobs.

**Suggested Fix:**
Add to 002_create_tables_simple.sql:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 20. COMPANY_SETTINGS RLS POLICY ALLOWS DELETE
**File:** `scripts/002_create_tables_simple.sql`
**Severity:** MEDIUM
**Issue:** Company settings has a DELETE policy but it references auth.uid() = admin_id which may not work correctly with foreign key constraints.

Actually, there's NO delete policy defined - users cannot delete their settings. This is probably intentional but verify.

**Current Status:** No DELETE policy on company_settings (probably by design).

---

## LOW SEVERITY ISSUES

### 21. INCONSISTENT NAMING CONVENTIONS
**File:** Various
**Severity:** LOW
**Issue:** Mixed naming conventions:
- `created_at` vs `invited_at` vs `accessed_at` (consistent)
- But: `user_id` vs `admin_id` vs `company_id` (confusing - are these the same?)

In some places `admin_id` = the auth user's ID, in others it's `user_id`.

**Suggested Fix:**
Standardize naming:
- `user_id` = auth.users.id (always)
- `admin_id` = same as user_id but specifically for admin users
- `created_by` = auth.users.id of creator

---

### 22. MAGIC TOKENS TABLE EXISTS IN SOME SCHEMAS BUT NOT OTHERS
**File:** `scripts/001_create_tables.sql` (lines 134-142)
**Severity:** LOW
**Issue:** The `magic_tokens` table exists in 001_create_tables.sql but not in schema.sql. It seems this was replaced by adding magic_link_token directly to the technicians table.

**Suggested Fix:**
Remove the magic_tokens table if it's not being used, or add it to schema.sql:
```sql
-- If not used, drop it:
DROP TABLE IF EXISTS public.magic_tokens;

-- Or if used, ensure it's in all schema files
```

---

### 23. PUBLIC_JOB_TOKENS TABLE MISSING RLS
**File:** `scripts/001_create_tables.sql` (lines 144-151)
**Severity:** LOW
**Issue:** The comment says "No RLS needed - accessed via service role" but there's no verification that service role is actually being used.

**Suggested Fix:**
Add a policy to ensure only service role can access:
```sql
-- Actually, for public tokens that need to be accessed by anyone with the token,
-- you might want a function to validate tokens:
CREATE OR REPLACE FUNCTION is_valid_job_token(token_to_check TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.public_job_tokens
    WHERE token = token_to_check
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## RECOMMENDED ACTIONS (PRIORITY ORDER)

### Immediate (Before Production)
1. ✅ Fix migration filename conflict (rename 003_add_sms_keyword_tracking.sql → 004_add_sms_keyword_tracking.sql)
2. ✅ Fix broken RLS policies in 003_job_workflow_features.sql and 005_critical_fixes.sql
3. ✅ Fix subscriptions table RLS policies (admin_id → company_id)
4. ✅ Add missing user_id column to technicians table in schema.sql
5. ✅ Regenerate database.types.ts from actual database
6. ✅ Standardize status enum across all files

### Short Term (Within 1 week)
7. ✅ Create company_settings and sms_templates tables in schema.sql
8. ✅ Add all missing columns to technicians table
9. ✅ Add missing foreign key indexes
10. ✅ Standardize on profiles table, remove users table migration

### Long Term (Within 1 month)
11. ✅ Consolidate all migrations into a single coherent schema file
12. ✅ Document the intended RLS behavior for each role
13. ✅ Add proper service role validation for webhook endpoints
14. ✅ Create comprehensive test suite for RLS policies

---

## APPENDIX: TABLE SCHEMA INVENTORY

### Current Tables (from migrations)
| Table | In schema.sql | In migrations | Has RLS | Has Types |
|-------|--------------|---------------|---------|-----------|
| companies | ✅ | ✅ | ✅ | ✅ |
| technicians | ⚠️ (partial) | ✅ | ✅ | ❌ |
| jobs | ✅ | ✅ | ✅ | ⚠️ (outdated) |
| updates | ✅ | ✅ | ✅ | ✅ |
| photos | ✅ | ✅ | ✅ | ✅ |
| sms_logs | ✅ | ✅ | ✅ | ⚠️ (outdated) |
| profiles | ❌ | ✅ (001_create_tables) | ✅ | ❌ |
| users | ❌ | ✅ (deprecated) | ✅ | ❌ |
| company_settings | ❌ | ✅ | ✅ | ❌ |
| sms_templates | ❌ | ✅ | ✅ | ❌ |
| subscriptions | ❌ | ✅ (002) | ✅ | ❌ |
| plans | ❌ | ✅ (002) | ❌ | ❌ |
| payments | ❌ | ✅ (002) | ✅ | ❌ |
| magic_tokens | ❌ | ✅ (001) | ❌ | ❌ |
| public_job_tokens | ❌ | ✅ | ❌ | ❌ |

### Legend
- ✅ = Complete/Consistent
- ⚠️ = Partial/Inconsistent
- ❌ = Missing

---

## CONCLUSION

The Dispatchly database has significant schema drift and security vulnerabilities that need immediate attention before production deployment. The most critical issues are:

1. **Broken RLS policies** that will prevent technicians from accessing jobs
2. **Migration conflicts** that could cause failed deployments
3. **Type mismatches** between code and database that will cause runtime errors
4. **Missing security constraints** that could allow unauthorized data access

A comprehensive database cleanup and standardization effort is strongly recommended.
