-- Dispatchly Database Schema
-- Run this in Supabase SQL Editor

-- Enable Row Level Security
alter table if exists public.companies enable row level security;
alter table if exists public.technicians enable row level security;
alter table if exists public.jobs enable row level security;
alter table if exists public.updates enable row level security;
alter table if exists public.photos enable row level security;
alter table if exists public.sms_logs enable row level security;

-- Companies table (one per business owner)
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Technicians table
create table if not exists public.technicians (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  phone text not null,
  magic_link_token text unique
);

-- Jobs table
create table if not exists public.jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  technician_id uuid references public.technicians(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  address text not null,
  job_type text not null,
  status text not null check (status in ('scheduled', 'enroute', 'working', 'complete')) default 'scheduled',
  notes text
);

-- Updates table (status updates with SMS tracking)
create table if not exists public.updates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  status text not null check (status in ('scheduled', 'enroute', 'working', 'complete')),
  notes text,
  sms_sent_at timestamp with time zone,
  sms_delivered boolean default false
);

-- Photos table
create table if not exists public.photos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  update_id uuid references public.updates(id) on delete cascade not null,
  url text not null,
  thumbnail_url text,
  size_bytes integer
);

-- SMS Logs table
create table if not exists public.sms_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  job_id uuid references public.jobs(id) on delete set null,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text not null,
  from_number text not null,
  to_number text not null,
  twilio_sid text
);

-- Row Level Security Policies

-- Companies: Users can only see their own company
create policy "Users can view own company" on public.companies
  for select using (auth.uid() = user_id);

create policy "Users can insert own company" on public.companies
  for insert with check (auth.uid() = user_id);

create policy "Users can update own company" on public.companies
  for update using (auth.uid() = user_id);

-- Technicians: Users can see technicians in their company
create policy "Users can view company technicians" on public.technicians
  for select using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "Users can insert company technicians" on public.technicians
  for insert with check (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "Users can update company technicians" on public.technicians
  for update using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "Users can delete company technicians" on public.technicians
  for delete using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

-- Jobs: Users can see jobs in their company
create policy "Users can view company jobs" on public.jobs
  for select using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "Users can insert company jobs" on public.jobs
  for insert with check (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "Users can update company jobs" on public.jobs
  for update using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "Users can delete company jobs" on public.jobs
  for delete using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

-- Updates: Users can see updates for jobs in their company
create policy "Users can view job updates" on public.updates
  for select using (
    job_id in (select id from public.jobs where company_id in (
      select id from public.companies where user_id = auth.uid()
    ))
  );

create policy "Users can insert job updates" on public.updates
  for insert with check (
    job_id in (select id from public.jobs where company_id in (
      select id from public.companies where user_id = auth.uid()
    ))
  );

-- Photos: Users can see photos for updates in their company
create policy "Users can view photos" on public.photos
  for select using (
    update_id in (select id from public.updates where job_id in (
      select id from public.jobs where company_id in (
        select id from public.companies where user_id = auth.uid()
      )
    ))
  );

create policy "Users can insert photos" on public.photos
  for insert with check (
    update_id in (select id from public.updates where job_id in (
      select id from public.jobs where company_id in (
        select id from public.companies where user_id = auth.uid()
      )
    ))
  );

-- SMS Logs: Users can see logs for jobs in their company
create policy "Users can view sms logs" on public.sms_logs
  for select using (
    job_id in (select id from public.jobs where company_id in (
      select id from public.companies where user_id = auth.uid()
    ))
  );

create policy "Users can insert sms logs" on public.sms_logs
  for insert with check (
    job_id in (select id from public.jobs where company_id in (
      select id from public.companies where user_id = auth.uid()
    ))
  );

-- Function to update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically update updated_at
create trigger on_jobs_updated
  before update on public.jobs
  for each row
  execute procedure public.handle_updated_at();
