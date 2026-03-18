-- Migration: Add SMS keyword tracking support
-- Run this in Supabase SQL Editor

-- Add columns to sms_logs table for keyword tracking
alter table public.sms_logs 
  add column if not exists technician_id uuid references public.technicians(id) on delete set null,
  add column if not exists parsed_keyword text,
  add column if not exists parsed_result text,
  add column if not exists message_type text default 'general';

-- Update RLS policies for sms_logs to allow technicians to see their own messages
create policy if not exists "Technicians can view their SMS logs" on public.sms_logs
  for select using (
    technician_id in (
      select id from public.technicians where phone = auth.uid()::text
    )
  );

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sms_logs_technician_id ON public.sms_logs(technician_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_parsed_result ON public.sms_logs(parsed_result);

-- Add constraint for message_type
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'sms_logs_message_type_check'
  ) then
    alter table public.sms_logs 
      add constraint sms_logs_message_type_check 
      check (message_type in ('general', 'status_update', 'status_notification', 'note', 'approval'));
  end if;
exception
  when duplicate_object then null;
end $$;

-- Update existing RLS policy to allow service role to insert
create policy if not exists "Service role can insert SMS logs" on public.sms_logs
  for insert with check (true);

comment on column public.sms_logs.technician_id is 'Reference to the technician if message was from/to a technician';
comment on column public.sms_logs.parsed_keyword is 'The keyword that was parsed from an incoming SMS (E, W, C, etc.)';
comment on column public.sms_logs.parsed_result is 'The result of parsing: status_update, note, invalid_transition, no_active_job, etc.';
comment on column public.sms_logs.message_type is 'Type of message: general, status_update, status_notification, note, approval';
