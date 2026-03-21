-- Simple 2-Step Process to Add Global SMS Templates

-- STEP 1: Run this to get your user ID
-- Copy the ID that it returns
SELECT id FROM public.users LIMIT 1;

-- STEP 2: Run this with YOUR_USER_ID replaced with the actual ID from Step 1
-- (Replace 'YOUR-USER-ID-HERE' with the real UUID)

/*
INSERT INTO public.sms_templates (admin_id, name, template_body, is_global, created_at, updated_at) VALUES
('YOUR-USER-ID-HERE', 'Appointment Confirmation', 'Hi {customer_name}, your {job_type} is confirmed for {scheduled_time}. Call {company_phone} to reschedule.', true, NOW(), NOW()),
('YOUR-USER-ID-HERE', '24-Hour Reminder', 'Reminder: Your HVAC appointment is tomorrow at {scheduled_time}. Reply YES to confirm.', true, NOW(), NOW()),
('YOUR-USER-ID-HERE', 'Technician En Route', 'Hi {customer_name}, {tech_name} is on the way! ETA: {eta}.', true, NOW(), NOW()),
('YOUR-USER-ID-HERE', 'Job Complete', 'Great news, {customer_name}! {tech_name} has completed your {job_type}.', true, NOW(), NOW()),
('YOUR-USER-ID-HERE', 'Thank You', 'Thank you {customer_name} for choosing {company_name}!', true, NOW(), NOW()),
('YOUR-USER-ID-HERE', 'Emergency Response', 'EMERGENCY! A technician will contact you within 15 minutes. Emergency: {company_phone}', true, NOW(), NOW()),
('YOUR-USER-ID-HERE', 'Maintenance Due', 'Hi {customer_name}, your HVAC system is due for seasonal maintenance. Call {company_phone}.', true, NOW(), NOW()),
('YOUR-USER-ID-HERE', 'Invoice Sent', 'Hi {customer_name}, your invoice for {job_type} is ready. Questions? Call {company_phone}', true, NOW(), NOW())
ON CONFLICT DO NOTHING;
*/

-- ALTERNATIVE: Insert using SELECT (all in one query, no variables needed)
-- This automatically gets the first user and inserts templates
INSERT INTO public.sms_templates (admin_id, name, template_body, is_global, created_at, updated_at)
SELECT 
  u.id,
  t.name,
  t.body,
  true,
  NOW(),
  NOW()
FROM public.users u
CROSS JOIN (VALUES
  ('Appointment Confirmation', 'Hi {customer_name}, your {job_type} is confirmed for {scheduled_time}. Call {company_phone} to reschedule.'),
  ('24-Hour Reminder', 'Reminder: Your HVAC appointment is tomorrow at {scheduled_time}. Reply YES to confirm.'),
  ('Technician En Route', 'Hi {customer_name}, {tech_name} is on the way! ETA: {eta}.'),
  ('Job Complete', 'Great news, {customer_name}! {tech_name} has completed your {job_type}.'),
  ('Thank You', 'Thank you {customer_name} for choosing {company_name}!'),
  ('Emergency Response', 'EMERGENCY! A technician will contact you within 15 minutes. Emergency: {company_phone}'),
  ('Maintenance Due', 'Hi {customer_name}, your HVAC system is due for maintenance. Call {company_phone}.'),
  ('Invoice Sent', 'Hi {customer_name}, your invoice for {job_type} is ready. Questions? Call {company_phone}')
) AS t(name, body)
WHERE u.id = (SELECT id FROM public.users ORDER BY created_at LIMIT 1)
ON CONFLICT DO NOTHING;

-- Check if it worked
SELECT name, is_global FROM public.sms_templates WHERE is_global = true;
