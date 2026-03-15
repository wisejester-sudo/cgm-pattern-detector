-- Migration 006: Update handle_new_user Trigger
-- Enhance the trigger to capture owner info and set setup_completed flag

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

  -- Create company settings with owner info and setup flag
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
