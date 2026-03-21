-- Seed SMS Templates for Dispatchly
-- Run this in Supabase SQL Editor to populate the sms_templates table

-- First, get the admin user ID (you'll need to replace this with your actual user ID)
-- Or use a generic approach that works for all users

-- Delete existing templates to avoid duplicates
DELETE FROM public.sms_templates WHERE name LIKE '%(Auto-Generated)%' OR created_at < NOW() - INTERVAL '1 minute';

-- Insert all templates
INSERT INTO public.sms_templates (admin_id, name, template_body, created_at, updated_at) VALUES
-- Appointments
((SELECT id FROM public.users LIMIT 1), 'Appointment Confirmation', 'Hi {customer_name}, your {job_type} is confirmed for {scheduled_time}. Our technician will arrive within the scheduled window. Reply CONFIRM to confirm or call {company_phone} to reschedule.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), '24-Hour Reminder', 'Reminder: Your HVAC appointment is tomorrow at {scheduled_time}. Please ensure clear access to your unit. Reply YES to confirm or call {company_phone} if you need to reschedule.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), '2-Hour Reminder', 'Hi {customer_name}, {tech_name} will arrive at your home within 2 hours for your {job_type} appointment. Please ensure someone 18+ is present. Questions? Call {company_phone}', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Reschedule Offer', 'No problem, {customer_name}! We can reschedule your {job_type} appointment. Reply with your preferred date/time or call {company_phone}.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Cancellation Confirmation', 'Your appointment for {scheduled_time} has been cancelled. To rebook, call {company_phone} or visit our website. Thank you for choosing {company_name}!', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Access Instructions Request', 'Hi {customer_name}, for your appointment on {scheduled_time}, please reply with: gate code, parking instructions, or any access details. This helps our technician arrive smoothly. Thanks!', NOW(), NOW()),

-- Technician Updates
((SELECT id FROM public.users LIMIT 1), 'Technician En Route', 'Hi {customer_name}, {tech_name} is on the way to your home! Estimated arrival: {eta}. Track their progress or call {company_phone} for updates.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Technician Arrived', 'Hi {customer_name}, {tech_name} has arrived and is beginning your {job_type}. They''ll update you on their progress. Thanks for choosing {company_name}!', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Work In Progress', 'Update from {tech_name}: Currently working on your {job_type}. Everything is going well. We''ll notify you when complete or if any issues arise. Questions? Call {company_phone}', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Delay Notification', 'Hi {customer_name}, {tech_name} is running about 30 minutes behind due to an unexpected issue at the previous job. New estimated arrival: {eta}. We apologize for the inconvenience!', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Job Complete', 'Great news, {customer_name}! {tech_name} has completed your {job_type}. Please review the work before we leave. Invoice will be sent shortly. Questions? Call {company_phone}', NOW(), NOW()),

-- Service & Repairs
((SELECT id FROM public.users LIMIT 1), 'Diagnosis Update', 'Hi {customer_name}, {tech_name} has diagnosed the issue. Repair estimate provided. Reply APPROVE to proceed or call {company_phone} to discuss alternatives.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Parts Required', 'Hi {customer_name}, your repair requires parts that aren''t in stock. Parts have been ordered and will arrive soon. We''ll schedule a return visit once parts arrive. Call {company_phone} with questions.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Additional Work Needed', 'Hi {customer_name}, {tech_name} found an additional issue during the repair. Extra cost and details provided. Reply YES to fix now or NO to address later. Call {company_phone} to discuss.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Warranty Info', 'Hi {customer_name}, your {job_type} is covered under warranty! No charge for today''s service. Warranty details provided on your invoice. Keep this message for your records.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Maintenance Recommendations', 'Hi {customer_name}, {tech_name} recommends preventive maintenance to avoid future issues. These can prevent breakdowns and save money. Call {company_phone} for a maintenance plan quote.', NOW(), NOW()),

-- Follow-ups
((SELECT id FROM public.users LIMIT 1), 'Thank You', 'Thank you {customer_name} for choosing {company_name} for your {job_type}! We hope you''re satisfied with {tech_name}''s work. Questions about your service? Call {company_phone} anytime.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Review Request', 'Hi {customer_name}, we hope you had a great experience! Would you take 30 seconds to leave a review? Your feedback helps us grow and helps other customers find us. Thank you!', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Satisfaction Check', 'Hi {customer_name}, it''s been 24 hours since your {job_type}. Is everything working properly? Reply YES if satisfied or call {company_phone} if you have any concerns. We''re here to help!', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), '1-Week Check-in', 'Hi {customer_name}, just checking in! It''s been a week since your {job_type}. Everything still running smoothly? If you notice any issues, call {company_phone} - we stand behind our work!', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Referral Request', 'Hi {customer_name}, know anyone who needs HVAC service? Refer a friend and you both get $25 off! Thanks for spreading the word about {company_name}! Call {company_phone} for details.', NOW(), NOW()),

-- Maintenance
((SELECT id FROM public.users LIMIT 1), 'Maintenance Due', 'Hi {customer_name}, your HVAC system is due for seasonal maintenance. Regular tune-ups prevent breakdowns and lower energy bills. Schedule now: call {company_phone}', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Maintenance Plan Offer', 'Hi {customer_name}, join our Maintenance Plan! 2 tune-ups/year, priority service, 15% off repairs, no overtime charges. Great value! Call {company_phone} to enroll.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Pre-Season Prep', 'Hi {customer_name}, extreme weather is coming! Don''t wait for a breakdown. Schedule your HVAC tune-up now and beat the rush. Call {company_phone} to book.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Maintenance Complete', 'Hi {customer_name}, your seasonal maintenance is complete! System status: all good. Next recommended service in 6 months. Questions? Call {company_phone}', NOW(), NOW()),

-- Emergency & After Hours
((SELECT id FROM public.users LIMIT 1), 'Emergency Response', 'EMERGENCY RECEIVED, {customer_name}! We''re prioritizing your call. A technician will contact you within 15 minutes. If this is life-threatening, call 911. Emergency line: {company_phone}', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Emergency ETA', '{customer_name}, {tech_name} is rushing to your location! Emergency ETA: {eta}. Technician will call upon arrival. Stay safe! Emergency updates: {company_phone}', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'After-Hours Request', 'Hi {customer_name}, we received your after-hours request. Our on-call technician will contact you within 30 minutes. For true emergencies: {company_phone}', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Temporary Fix Complete', 'Hi {customer_name}, {tech_name} completed a temporary repair. Your system is working but needs follow-up service. Call {company_phone} to schedule permanent fix.', NOW(), NOW()),

-- Quotes & Estimates
((SELECT id FROM public.users LIMIT 1), 'Quote Request Received', 'Hi {customer_name}, we received your quote request for HVAC service. Our estimator will contact you within 24 hours to schedule a free in-home consultation. Call {company_phone}', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Quote Ready', 'Hi {customer_name}, your quote is ready! Review details and pricing. This quote is valid for 30 days. Questions? Call {company_phone} to discuss options.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Quote Follow-up', 'Hi {customer_name}, following up on your quote. Any questions? We offer financing options! Call {company_phone} to discuss or schedule installation.', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Quote Expiring Soon', 'Hi {customer_name}, your quote expires in 7 days. Lock in this price by scheduling now. Call {company_phone}. Prices subject to change after expiration.', NOW(), NOW()),

-- Billing & Payments
((SELECT id FROM public.users LIMIT 1), 'Invoice Sent', 'Hi {customer_name}, your invoice for {job_type} is ready! Amount due provided. Payment due within 15 days. Questions? Call {company_phone}', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Payment Reminder', 'Hi {customer_name}, friendly reminder: Your invoice is due in 3 days. Pay easily online or call {company_phone}. Thank you!', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Overdue Notice', 'Hi {customer_name}, your invoice is now overdue. Please submit payment to avoid late fees. Need to discuss? Call {company_phone}. We''re happy to help!', NOW(), NOW()),

((SELECT id FROM public.users LIMIT 1), 'Payment Confirmation', 'Thank you {customer_name}! Payment received. Receipt emailed to you. Balance updated. Thank you for your business!', NOW(), NOW());

-- Verify insertion
SELECT COUNT(*) as total_templates FROM public.sms_templates;
