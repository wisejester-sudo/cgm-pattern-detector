-- Create companies table linked to Supabase auth users
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
-- Allow users to view their own company
CREATE POLICY "Users can view their own company" 
  ON companies FOR SELECT 
  USING (auth.uid() = owner_id);

-- Allow users to update their own company
CREATE POLICY "Users can update their own company" 
  ON companies FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Create index on owner_id for faster queries
CREATE INDEX idx_companies_owner_id ON companies(owner_id);
