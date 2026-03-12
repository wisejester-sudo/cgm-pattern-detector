-- Dispatchly Database Schema
-- This script creates all the tables needed for the Dispatchly job management app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'technician')),
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  pin TEXT, -- For technicians
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles (for team management)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Technicians table (for technicians managed by admins)
CREATE TABLE IF NOT EXISTS public.technicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  pin TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their technicians" ON public.technicians
  FOR ALL USING (admin_id = auth.uid());

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'en_route', 'working', 'complete')),
  scheduled_time TIMESTAMPTZ NOT NULL,
  notes TEXT,
  assigned_tech_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their jobs" ON public.jobs
  FOR ALL USING (admin_id = auth.uid());

CREATE POLICY "Technicians can view assigned jobs" ON public.jobs
  FOR SELECT USING (
    assigned_tech_id IN (
      SELECT id FROM public.technicians WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Technicians can update assigned jobs" ON public.jobs
  FOR UPDATE USING (
    assigned_tech_id IN (
      SELECT id FROM public.technicians WHERE user_id = auth.uid()
    )
  );

-- Job photos table
CREATE TABLE IF NOT EXISTS public.job_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos for their jobs" ON public.job_photos
  FOR SELECT USING (
    job_id IN (SELECT id FROM public.jobs WHERE admin_id = auth.uid())
    OR job_id IN (
      SELECT j.id FROM public.jobs j
      JOIN public.technicians t ON j.assigned_tech_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their jobs" ON public.job_photos
  FOR INSERT WITH CHECK (
    job_id IN (SELECT id FROM public.jobs WHERE admin_id = auth.uid())
    OR job_id IN (
      SELECT j.id FROM public.jobs j
      JOIN public.technicians t ON j.assigned_tech_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos for their jobs" ON public.job_photos
  FOR DELETE USING (
    job_id IN (SELECT id FROM public.jobs WHERE admin_id = auth.uid())
  );

-- SMS logs table
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  recipient_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their SMS logs" ON public.sms_logs
  FOR ALL USING (admin_id = auth.uid());

-- SMS templates table
CREATE TABLE IF NOT EXISTS public.sms_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their templates" ON public.sms_templates
  FOR ALL USING (admin_id = auth.uid());

-- Company settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'My Company',
  company_phone TEXT,
  default_sms_template_id UUID REFERENCES public.sms_templates(id) ON DELETE SET NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  tagline TEXT,
  business_hours TEXT,
  service_area TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their settings" ON public.company_settings
  FOR ALL USING (admin_id = auth.uid());

-- Magic tokens for technician login links
CREATE TABLE IF NOT EXISTS public.magic_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE,
  technician_id UUID NOT NULL REFERENCES public.technicians(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS needed - accessed via service role in API routes

-- Public job tokens for shareable links
CREATE TABLE IF NOT EXISTS public.public_job_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS needed - accessed via service role in API routes

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_templates_updated_at
  BEFORE UPDATE ON public.sms_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'admin')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Also create default company settings
  INSERT INTO public.company_settings (admin_id, company_name)
  VALUES (NEW.id, 'My Company')
  ON CONFLICT (admin_id) DO NOTHING;
  
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
