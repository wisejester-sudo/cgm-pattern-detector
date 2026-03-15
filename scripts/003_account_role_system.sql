-- Migration 003: Account & Role System Enhancements
-- Adds owner profile fields, enhances technicians table, and magic link support

-- Add setup_completed to company_settings if it doesn't exist
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false;

-- Add owner profile fields to company_settings
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS address TEXT;

-- Enhance technicians table for invite/magic-link system
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS magic_link_token TEXT UNIQUE;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.technicians ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_technicians_admin ON public.technicians(admin_id);
CREATE INDEX IF NOT EXISTS idx_technicians_magic_link ON public.technicians(magic_link_token);
CREATE INDEX IF NOT EXISTS idx_jobs_admin ON public.jobs(admin_id);
CREATE INDEX IF NOT EXISTS idx_jobs_tech ON public.jobs(assigned_tech_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(admin_id, status);

-- Function to generate a cryptographically secure magic link token
CREATE OR REPLACE FUNCTION generate_technician_magic_token(tech_id UUID, expiry_hours INT DEFAULT 168)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token TEXT;
BEGIN
  new_token := encode(gen_random_bytes(32), 'hex');

  UPDATE public.technicians
  SET
    magic_link_token = new_token,
    token_expires_at = NOW() + (expiry_hours || ' hours')::INTERVAL
  WHERE id = tech_id;

  RETURN new_token;
END;
$$;

-- Update the handle_new_user trigger to capture full_name and create company settings with owner info
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_full_name TEXT;
BEGIN
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
  INSERT INTO public.company_settings (admin_id, company_name, owner_name, setup_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Company'),
    owner_full_name,
    false
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

-- Re-apply trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
