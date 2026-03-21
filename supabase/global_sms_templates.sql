-- Make SMS Templates Global (Available to All Users)
-- This creates templates that every user can see and use

-- Step 1: Add is_global column if it doesn't exist
ALTER TABLE public.sms_templates 
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Step 2: Update RLS policies to allow all users to read global templates
-- Drop existing read policy
DROP POLICY IF EXISTS "Users can read own templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can read their own SMS logs" ON public.sms_templates;

-- Create new read policy: Users can read their own templates OR global templates
CREATE POLICY "Users can read templates" 
ON public.sms_templates 
FOR SELECT 
USING (
  auth.uid() = admin_id 
  OR is_global = true
);

-- Keep insert/update/delete restricted to owner
CREATE POLICY "Users can insert own templates" 
ON public.sms_templates 
FOR INSERT 
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Users can update own templates" 
ON public.sms_templates 
FOR UPDATE 
USING (auth.uid() = admin_id);

CREATE POLICY "Users can delete own templates" 
ON public.sms_templates 
FOR DELETE 
USING (auth.uid() = admin_id);

-- Step 3: Insert global templates (available to all users)
-- Use a system user ID or the first admin as the owner
DO $$
DECLARE
  system_user_id UUID;
BEGIN
  -- Get the first user as the system owner for global templates
  SELECT id INTO system_user_id FROM public.users ORDER BY created_at LIMIT 1;
  
  -- If no users exist yet, we'll use a placeholder (you can update this later)
  IF system_user_id IS NULL THEN
    system_user_id := '00000000-0000-0000-0000-000000000000'::UUID;
  END IF;

  -- Insert global templates
  INSERT INTO public.sms_templates (admin_id, name, template_body, is_global, created_at, updated_at)
  VALUES
  (system_user_id, 'Appointment Confirmation', 'Hi {customer_name}, your {job_type} is confirmed for {scheduled_time}. Our technician will arrive within the scheduled window. Reply CONFIRM to confirm or call {company_phone} to reschedule.', true, NOW(), NOW()),
  
  (system_user_id, '24-Hour Reminder', 'Reminder: Your HVAC appointment is tomorrow at {scheduled_time}. Please ensure clear access to your unit. Reply YES to confirm or call {company_phone} if you need to reschedule.', true, NOW(), NOW()),
  
  (system_user_id, '2-Hour Reminder', 'Hi {customer_name}, {tech_name} will arrive at your home within 2 hours for your {job_type} appointment. Please ensure someone 18+ is present. Questions? Call {company_phone}', true, NOW(), NOW()),
  
  (system_user_id, 'Technician En Route', 'Hi {customer_name}, {tech_name} is on the way to your home! Estimated arrival: {eta}. Track their progress or call {company_phone} for updates.', true, NOW(), NOW()),
  
  (system_user_id, 'Technician Arrived', 'Hi {customer_name}, {tech_name} has arrived and is beginning your {job_type}. They''ll update you on their progress. Thanks for choosing {company_name}!', true, NOW(), NOW()),
  
  (system_user_id, 'Work In Progress', 'Update from {tech_name}: Currently working on your {job_type}. Everything is going well. We''ll notify you when complete or if any issues arise. Questions? Call {company_phone}', true, NOW(), NOW()),
  
  (system_user_id, 'Job Complete', 'Great news, {customer_name}! {tech_name} has completed your {job_type}. Please review the work before we leave. Invoice will be sent shortly. Questions? Call {company_phone}', true, NOW(), NOW()),
  
  (system_user_id, 'Thank You', 'Thank you {customer_name} for choosing {company_name} for your {job_type}! We hope you''re satisfied with {tech_name}''s work. Questions about your service? Call {company_phone} anytime.', true, NOW(), NOW()),
  
  (system_user_id, 'Satisfaction Check', 'Hi {customer_name}, it''s been 24 hours since your {job_type}. Is everything working properly? Reply YES if satisfied or call {company_phone} if you have any concerns. We''re here to help!', true, NOW(), NOW()),
  
  (system_user_id, 'Review Request', 'Hi {customer_name}, we hope you had a great experience! Would you take 30 seconds to leave a review? Your feedback helps us grow. Thank you!', true, NOW(), NOW()),
  
  (system_user_id, 'Diagnosis Update', 'Hi {customer_name}, {tech_name} has diagnosed the issue. Repair estimate provided. Reply APPROVE to proceed or call {company_phone} to discuss alternatives.', true, NOW(), NOW()),
  
  (system_user_id, 'Emergency Response', 'EMERGENCY RECEIVED, {customer_name}! We''re prioritizing your call. A technician will contact you within 15 minutes. If this is life-threatening, call 911. Emergency line: {company_phone}', true, NOW(), NOW()),
  
  (system_user_id, 'Maintenance Due', 'Hi {customer_name}, your HVAC system is due for seasonal maintenance. Regular tune-ups prevent breakdowns and lower energy bills. Schedule now: call {company_phone}', true, NOW(), NOW()),
  
  (system_user_id, 'Invoice Sent', 'Hi {customer_name}, your invoice for {job_type} is ready! Amount due provided. Payment due within 15 days. Questions? Call {company_phone}', true, NOW(), NOW()),
  
  (system_user_id, 'Payment Confirmation', 'Thank you {customer_name}! Payment received. Receipt emailed to you. Balance updated. Thank you for your business!', true, NOW(), NOW())
  
  ON CONFLICT DO NOTHING;
  
END $$;

-- Verify global templates were created
SELECT 
  name, 
  is_global,
  LEFT(template_body, 50) || '...' as preview
FROM public.sms_templates 
WHERE is_global = true
ORDER BY name;
