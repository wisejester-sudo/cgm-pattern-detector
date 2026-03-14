-- Migration 003: Schema Enhancements
-- Add columns to existing tables

ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false;
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS magic_link_token TEXT UNIQUE;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);
