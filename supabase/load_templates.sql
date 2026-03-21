-- Load SMS Templates (Simpler Version)
-- Replace YOUR_USER_ID with your actual user ID from the users table

-- Get your user ID first:
-- SELECT id FROM public.users WHERE email = 'your-email@example.com';

-- Then run this with your actual user ID:
WITH admin_user AS (
  SELECT id FROM public.users LIMIT 1
)
INSERT INTO public.sms_templates (admin_id, name, template_body, created_at, updated_at)
SELECT 
  admin_user.id,
  template_data.name,
  template_data.body,
  NOW(),
  NOW()
FROM admin_user
CROSS JOIN (VALUES
  ('Appointment Confirmation', 'Hi {customer_name}, your {job_type} is confirmed for {scheduled_time}. Our technician will arrive within the scheduled window. Reply CONFIRM to confirm or call {company_phone} to reschedule.'),
  ('24-Hour Reminder', 'Reminder: Your HVAC appointment is tomorrow at {scheduled_time}. Please ensure clear access to your unit. Reply YES to confirm or call {company_phone} if you need to reschedule.'),
  ('2-Hour Reminder', 'Hi {customer_name}, {tech_name} will arrive at your home within 2 hours for your {job_type} appointment. Please ensure someone 18+ is present. Questions? Call {company_phone}'),
  ('Technician En Route', 'Hi {customer_name}, {tech_name} is on the way to your home! Estimated arrival: {eta}. Call {company_phone} for updates.'),
  ('Job Complete', 'Great news, {customer_name}! {tech_name} has completed your {job_type}. Please review the work before we leave. Call {company_phone} with questions.'),
  ('Thank You', 'Thank you {customer_name} for choosing {company_name} for your {job_type}! We hope you''re satisfied with {tech_name}''s work. Call {company_phone} anytime.'),
  ('Diagnosis Update', 'Hi {customer_name}, {tech_name} has diagnosed the issue. Reply APPROVE to proceed with repairs or call {company_phone} to discuss alternatives.'),
  ('Emergency Response', 'EMERGENCY RECEIVED, {customer_name}! We''re prioritizing your call. A technician will contact you within 15 minutes. If life-threatening, call 911. Emergency: {company_phone}'),
  ('Maintenance Due', 'Hi {customer_name}, your HVAC system is due for seasonal maintenance. Regular tune-ups prevent breakdowns and lower energy bills. Call {company_phone} to schedule.'),
  ('Invoice Sent', 'Hi {customer_name}, your invoice for {job_type} is ready! Payment due within 15 days. Questions? Call {company_phone}')
) AS template_data(name, body)
ON CONFLICT (admin_id, name) DO NOTHING;

SELECT 'Templates loaded successfully!' as result;
