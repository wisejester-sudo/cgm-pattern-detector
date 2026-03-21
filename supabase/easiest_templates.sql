-- EASIEST METHOD - Two Simple Steps

-- STEP 1: Run this to get your user ID (copy the result)
SELECT id FROM public.users LIMIT 1;

-- STEP 2: Replace YOUR_USER_ID below with the actual ID you got from Step 1
-- Then run the INSERT statement

-- First, add the column
ALTER TABLE public.sms_templates ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Update RLS policy
DROP POLICY IF EXISTS "Users can read own templates" ON public.sms_templates;
CREATE POLICY "Users can read templates" ON public.sms_templates FOR SELECT USING (auth.uid() = admin_id OR is_global = true);

-- Insert templates (replace YOUR_USER_ID with real ID)
INSERT INTO public.sms_templates (admin_id, name, template_body, is_global, created_at, updated_at) VALUES
('YOUR_USER_ID', 'Appointment Confirmation', 'Hi {customer_name}, your {job_type} is confirmed for {scheduled_time}. Call {company_phone} to reschedule.', true, NOW(), NOW()),
('YOUR_USER_ID', '24-Hour Reminder', 'Reminder: Your HVAC appointment is tomorrow at {scheduled_time}. Reply YES to confirm or call {company_phone}.', true, NOW(), NOW()),
('YOUR_USER_ID', 'Technician En Route', 'Hi {customer_name}, {tech_name} is on the way! ETA: {eta}. Call {company_phone} for updates.', true, NOW(), NOW()),
('YOUR_USER_ID', 'Job Complete', 'Great news, {customer_name}! {tech_name} has completed your {job_type}. Please review the work before we leave.', true, NOW(), NOW()),
('YOUR_USER_ID', 'Thank You', 'Thank you {customer_name} for choosing {company_name}! We hope you are satisfied with the service. Call {company_phone} anytime.', true, NOW(), NOW()),
('YOUR_USER_ID', 'Emergency Response', 'EMERGENCY RECEIVED! A technician will contact you within 15 minutes. If life-threatening, call 911. Emergency: {company_phone}', true, NOW(), NOW()),
('YOUR_USER_ID', 'Maintenance Due', 'Hi {customer_name}, your HVAC system is due for seasonal maintenance. Regular tune-ups prevent breakdowns. Call {company_phone}', true, NOW(), NOW()),
('YOUR_USER_ID', 'Invoice Sent', 'Hi {customer_name}, your invoice for {job_type} is ready. Payment due within 15 days. Questions? Call {company_phone}', true, NOW(), NOW()),
('YOUR_USER_ID', 'Payment Confirmation', 'Thank you {customer_name}! Payment received. Receipt emailed to you. Thank you for your business!', true, NOW(), NOW()),
('YOUR_USER_ID', 'Review Request', 'Hi {customer_name}, we hope you had a great experience! Would you take 30 seconds to leave a review? Thank you!', true, NOW(), NOW());
