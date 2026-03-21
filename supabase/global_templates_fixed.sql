-- Global SMS Templates - Fixed Version
-- Run this in Supabase SQL Editor

-- Step 1: Add is_global column
ALTER TABLE public.sms_templates 
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Step 2: Update RLS policy to allow all users to read global templates
DROP POLICY IF EXISTS "Users can read own templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Users can read templates" ON public.sms_templates;

CREATE POLICY "Users can read templates" 
ON public.sms_templates 
FOR SELECT 
USING (auth.uid() = admin_id OR is_global = true);

-- Step 3: Get the first user ID and store it in a variable
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Get the first user's ID
  SELECT id INTO first_user_id FROM public.users ORDER BY created_at LIMIT 1;
  
  -- If no users, we can't proceed
  IF first_user_id IS NULL THEN
    RAISE NOTICE 'No users found in the database. Please create a user first.';
    RETURN;
  END IF;
  
  -- Insert global templates
  INSERT INTO public.sms_templates (admin_id, name, template_body, is_global, created_at, updated_at)
  VALUES
  (first_user_id, 'Appointment Confirmation', 'Hi {customer_name}, your {job_type} is confirmed for {scheduled_time}. Our technician will arrive within the scheduled window. Reply CONFIRM to confirm or call {company_phone} to reschedule.', true, NOW(), NOW()),
  
  (first_user_id, '24-Hour Reminder', 'Reminder: Your HVAC appointment is tomorrow at {scheduled_time}. Please ensure clear access to your unit. Reply YES to confirm or call {company_phone} if you need to reschedule.', true, NOW(), NOW()),
  
  (first_user_id, '2-Hour Reminder', 'Hi {customer_name}, {tech_name} will arrive at your home within 2 hours for your {job_type} appointment. Please ensure someone 18+ is present. Questions? Call {company_phone}', true, NOW(), NOW()),
  
  (first_user_id, 'Technician En Route', 'Hi {customer_name}, {tech_name} is on the way to your home! Estimated arrival: {eta}. Call {company_phone} for updates.', true, NOW(), NOW()),
  
  (first_user_id, 'Technician Arrived', 'Hi {customer_name}, {tech_name} has arrived and is beginning your {job_type}. They''ll update you on their progress. Thanks for choosing {company_name}!', true, NOW(), NOW()),
  
  (first_user_id, 'Work In Progress', 'Update from {tech_name}: Currently working on your {job_type}. Everything is going well. We''ll notify you when complete or if any issues arise. Questions? Call {company_phone}', true, NOW(), NOW()),
  
  (first_user_id, 'Job Complete', 'Great news, {customer_name}! {tech_name} has completed your {job_type}. Please review the work before we leave. Invoice will be sent shortly. Questions? Call {company_phone}', true, NOW(), NOW()),
  
  (first_user_id, 'Thank You', 'Thank you {customer_name} for choosing {company_name} for your {job_type}! We hope you''re satisfied with {tech_name}''s work. Questions about your service? Call {company_phone} anytime.', true, NOW(), NOW()),
  
  (first_user_id, 'Satisfaction Check', 'Hi {customer_name}, it''s been 24 hours since your {job_type}. Is everything working properly? Reply YES if satisfied or call {company_phone} if you have any concerns. We''re here to help!', true, NOW(), NOW()),
  
  (first_user_id, 'Review Request', 'Hi {customer_name}, we hope you had a great experience! Would you take 30 seconds to leave a review? Your feedback helps us grow. Thank you!', true, NOW(), NOW()),
  
  (first_user_id, 'Diagnosis Update', 'Hi {customer_name}, {tech_name} has diagnosed the issue. Repair estimate provided. Reply APPROVE to proceed or call {company_phone} to discuss alternatives.', true, NOW(), NOW()),
  
  (first_user_id, 'Emergency Response', 'EMERGENCY RECEIVED, {customer_name}! We''re prioritizing your call. A technician will contact you within 15 minutes. If this is life-threatening, call 911. Emergency line: {company_phone}', true, NOW(), NOW()),
  
  (first_user_id, 'Maintenance Due', 'Hi {customer_name}, your HVAC system is due for seasonal maintenance. Regular tune-ups prevent breakdowns and lower energy bills. Schedule now: call {company_phone}', true, NOW(), NOW()),
  
  (first_user_id, 'Invoice Sent', 'Hi {customer_name}, your invoice for {job_type} is ready! Amount due provided. Payment due within 15 days. Questions? Call {company_phone}', true, NOW(), NOW()),
  
  (first_user_id, 'Payment Confirmation', 'Thank you {customer_name}! Payment received. Receipt emailed to you. Balance updated. Thank you for your business!', true, NOW(), NOW())
  
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Inserted global templates for user ID: %', first_user_id;
END $$;

-- Verify insertion
SELECT COUNT(*) as total_global_templates 
FROM public.sms_templates 
WHERE is_global = true;
