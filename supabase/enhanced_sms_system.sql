-- Enhanced SMS System with Two-Way Conversations
-- Run this in Supabase SQL Editor

-- Step 1: Add new columns to sms_logs for conversation tracking
ALTER TABLE public.sms_logs 
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS sender_type TEXT CHECK (sender_type IN ('admin', 'technician', 'system', 'customer')),
ADD COLUMN IF NOT EXISTS sender_id UUID,
ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS twilio_status TEXT,
ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES public.sms_logs(id);

-- Step 2: Create index for faster conversation queries
CREATE INDEX IF NOT EXISTS idx_sms_logs_job_direction ON public.sms_logs(job_id, direction);
CREATE INDEX IF NOT EXISTS idx_sms_logs_conversation ON public.sms_logs(parent_message_id) WHERE parent_message_id IS NOT NULL;

-- Step 3: Update RLS policies for two-way messaging
-- Allow customers to send inbound messages (via Twilio webhook)
CREATE POLICY IF NOT EXISTS "Allow inbound SMS from Twilio" 
ON public.sms_logs 
FOR INSERT 
WITH CHECK (direction = 'inbound');

-- Step 4: Create function to format message with sender name
CREATE OR REPLACE FUNCTION format_sms_with_sender(
  message_body TEXT,
  sender_name TEXT,
  sender_type TEXT
) RETURNS TEXT AS $$
BEGIN
  RETURN sender_name || ': ' || message_body;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Verify the changes
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'sms_logs' 
ORDER BY ordinal_position;
