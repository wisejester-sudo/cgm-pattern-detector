-- Account System & Role Management Schema Updates
-- This migration enhances the schema for proper account management

-- Add owner profile fields to company_settings
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS address TEXT;

-- Enhance technicians table for invite system
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS magic_link_token TEXT UNIQUE;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_technicians_admin ON public.technicians(admin_id);
CREATE INDEX IF NOT EXISTS idx_technicians_magic_link ON public.technicians(magic_link_token);
CREATE INDEX IF NOT EXISTS idx_technicians_active ON public.technicians(admin_id, is_active);

-- Add indexes for jobs
CREATE INDEX IF NOT EXISTS idx_jobs_admin ON public.jobs(admin_id);
CREATE INDEX IF NOT EXISTS idx_jobs_tech ON public.jobs(assigned_tech_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(admin_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled ON public.jobs(admin_id, scheduled_time);

-- Update handle_new_user function to capture name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_full_name TEXT;
BEGIN
  -- Get the name from metadata
  owner_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(NEW.email, '@', 1)
  );

  -- Create profile
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    owner_full_name,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'admin')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  
  -- Create company settings with owner info
  INSERT INTO public.company_settings (
    admin_id, 
    company_name, 
    owner_name,
    company_phone
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Company'),
    owner_full_name,
    NEW.raw_user_meta_data ->> 'company_phone'
  )
  ON CONFLICT (admin_id) DO UPDATE SET
    owner_name = COALESCE(EXCLUDED.owner_name, public.company_settings.owner_name),
    company_name = COALESCE(EXCLUDED.company_name, public.company_settings.company_name);
  
  -- Create default SMS templates
  INSERT INTO public.sms_templates (admin_id, name, template_body)
  VALUES 
    (NEW.id, 'Job Scheduled', 'Hi {{customer_name}}, your {{job_type}} appointment is scheduled for {{scheduled_date}} at {{scheduled_time}}. - {{company_name}}'),
    (NEW.id, 'Tech En Route', 'Hi {{customer_name}}, {{tech_name}} is on the way for your {{job_type}} appointment. ETA: ~15-20 minutes. - {{company_name}}'),
    (NEW.id, 'Job Complete', 'Hi {{customer_name}}, your {{job_type}} has been completed. Thank you for choosing {{company_name}}!')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Function to refresh magic link token
CREATE OR REPLACE FUNCTION refresh_magic_link_token(tech_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token TEXT;
BEGIN
  -- Generate a secure random token
  new_token := encode(gen_random_bytes(24), 'base64');
  new_token := replace(replace(replace(new_token, '+', '-'), '/', '_'), '=', '');
  
  -- Update the technician with new token
  UPDATE public.technicians
  SET 
    magic_link_token = new_token,
    token_expires_at = NOW() + INTERVAL '7 days'
  WHERE id = tech_id;
  
  RETURN new_token;
END;
$$;
