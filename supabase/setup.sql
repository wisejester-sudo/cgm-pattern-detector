-- Dispatchly Database Setup
-- Copy ALL of this into Supabase SQL Editor and click Run

-- ============================================
-- STEP 1: Create Tables
-- ============================================

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

-- ============================================
-- STEP 2: Enable Row Level Security
-- ============================================

alter table public.companies enable row level security;
alter table public.technicians enable row level security;
alter table public.jobs enable row level security;
alter table public.updates enable row level security;
alter table public.photos enable row level security;
alter table public.sms_logs enable row level security;

-- ============================================
-- STEP 3: Create RLS Policies
-- ============================================

-- Companies: Users can only see their own company
create policy "Users can view own company" on public.companies
  for select using (auth.uid() = user_id);

create policy "Users can insert own company" on public.companies
  for insert with check (auth.uid() = user_id);

create policy "Users can update own company" on public.companies
  for update using (auth.uid() = user_id);

-- Technicians
create policy "Users can view company technicians" on public.technicians
  for select using (company_id in (select id from public.companies where user_id = auth.uid()));

create policy "Users can insert company technicians" on public.technicians
  for insert with check (company_id in (select id from public.companies where user_id = auth.uid()));

create policy "Users can update company technicians" on public.technicians
  for update using (company_id in (select id from public.companies where user_id = auth.uid()));

create policy "Users can delete company technicians" on public.technicians
  for delete using (company_id in (select id from public.companies where user_id = auth.uid()));

-- Jobs
create policy "Users can view company jobs" on public.jobs
  for select using (company_id in (select id from public.companies where user_id = auth.uid()));

create policy "Users can insert company jobs" on public.jobs
  for insert with check (company_id in (select id from public.companies where user_id = auth.uid()));

create policy "Users can update company jobs" on public.jobs
  for update using (company_id in (select id from public.companies where user_id = auth.uid()));

create policy "Users can delete company jobs" on public.jobs
  for delete using (company_id in (select id from public.companies where user_id = auth.uid()));

-- Updates
create policy "Users can view job updates" on public.updates
  for select using (job_id in (select id from public.jobs where company_id in (select id from public.companies where user_id = auth.uid())));

create policy "Users can insert job updates" on public.updates
  for insert with check (job_id in (select id from public.jobs where company_id in (select id from public.companies where user_id = auth.uid())));

-- Photos
create policy "Users can view photos" on public.photos
  for select using (update_id in (select id from public.updates where job_id in (select id from public.jobs where company_id in (select id from public.companies where user_id = auth.uid()))));

create policy "Users can insert photos" on public.photos
  for insert with check (update_id in (select id from public.updates where job_id in (select id from public.jobs where company_id in (select id from public.companies where user_id = auth.uid()))));

-- SMS Logs
create policy "Users can view sms logs" on public.sms_logs
  for select using (job_id in (select id from public.jobs where company_id in (select id from public.companies where user_id = auth.uid())));

create policy "Users can insert sms logs" on public.sms_logs
  for insert with check (job_id in (select id from public.jobs where company_id in (select id from public.companies where user_id = auth.uid())));

-- ============================================
-- STEP 4: Helper Function
-- ============================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_jobs_updated
  before update on public.jobs
  for each row
  execute procedure public.handle_updated_at();

-- ============================================
-- DONE! All tables created with security.
-- ============================================
