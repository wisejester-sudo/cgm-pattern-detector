-- First, check if table exists and drop if needed
DROP TABLE IF EXISTS public.users;

-- Create table fresh
CREATE TABLE public.users (
  id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'admin',
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Add comment
COMMENT ON TABLE public.users IS 'User profiles table';
