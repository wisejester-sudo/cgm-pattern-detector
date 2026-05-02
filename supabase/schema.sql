-- ============================================================================
-- DISPATCHLY v3.0 - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This schema implements all tables required for Dispatchly v3.0
-- Includes: Users, Company Settings, Jobs, Technicians, SMS Logs, Deletion Logs
-- Features: Row Level Security, Indexes, Triggers, Constraints
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company settings with full Twilio config
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Company Info
  company_name TEXT NOT NULL,
  company_phone TEXT,
  company_email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  
  -- Twilio Configuration
  twilio_number TEXT,
  twilio_sid TEXT,
  twilio_subaccount_sid TEXT,
  twilio_subaccount_status TEXT DEFAULT 'inactive',
  number_status TEXT DEFAULT 'inactive',
  number_provisioned_at TIMESTAMP WITH TIME ZONE,
  
  -- Account Status
  account_status TEXT DEFAULT 'active',
  deletion_requested_at TIMESTAMP WITH TIME ZONE,
  deletion_scheduled_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_account_status CHECK (account_status IN ('active', 'pending_deletion')),
  CONSTRAINT valid_number_status CHECK (number_status IN ('inactive', 'active', 'failed', 'provisioning'))
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  customer_address_lat DECIMAL(10,8),
  customer_address_lon DECIMAL(11,8),
  
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  on_hold_reason TEXT,
  
  assigned_tech_ids UUID[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'en_route', 'working', 'on_hold', 'complete'))
);

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  pin TEXT,
  is_active BOOLEAN DEFAULT true,
  
  magic_link_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  invited_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS logs with full threading
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  
  recipient_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  direction TEXT DEFAULT 'outbound',
  
  sender_name TEXT,
  sender_type TEXT,
  
  status TEXT DEFAULT 'sent',
  message_sid TEXT,
  used_subaccount BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES sms_logs(id),
  
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_direction CHECK (direction IN ('inbound', 'outbound'))
);

-- Deletion logs for audit
CREATE TABLE IF NOT EXISTS deletion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  email TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  twilio_closed BOOLEAN DEFAULT false,
  reactivated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job notes table for additional notes
CREATE TABLE IF NOT EXISTS job_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table for job photos
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Company settings indexes
CREATE INDEX IF NOT EXISTS idx_company_admin ON company_settings(admin_id);
CREATE INDEX IF NOT EXISTS idx_company_status ON company_settings(account_status);
CREATE INDEX IF NOT EXISTS idx_company_twilio ON company_settings(twilio_number);

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_admin ON jobs(admin_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_time ON jobs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_phone ON jobs(customer_phone);

-- Technicians indexes
CREATE INDEX IF NOT EXISTS idx_technicians_admin ON technicians(admin_id);
CREATE INDEX IF NOT EXISTS idx_technicians_email ON technicians(email);
CREATE INDEX IF NOT EXISTS idx_technicians_phone ON technicians(phone);
CREATE INDEX IF NOT EXISTS idx_technicians_magic_token ON technicians(magic_link_token);

-- SMS logs indexes
CREATE INDEX IF NOT EXISTS idx_sms_job ON sms_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_sms_admin ON sms_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_sms_technician ON sms_logs(technician_id);
CREATE INDEX IF NOT EXISTS idx_sms_time ON sms_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_sms_phone ON sms_logs(recipient_phone);

-- Deletion logs indexes
CREATE INDEX IF NOT EXISTS idx_deletion_admin ON deletion_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_deletion_status ON deletion_logs(status);
CREATE INDEX IF NOT EXISTS idx_deletion_scheduled ON deletion_logs(scheduled_for);

-- Job notes indexes
CREATE INDEX IF NOT EXISTS idx_job_notes_job ON job_notes(job_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
CREATE POLICY users_isolation ON users
  FOR ALL USING (id = auth.uid());

-- Company settings RLS policies
CREATE POLICY company_isolation ON company_settings
  FOR ALL USING (admin_id = auth.uid());

-- Jobs RLS policies
CREATE POLICY jobs_isolation ON jobs
  FOR ALL USING (admin_id = auth.uid());

-- Technicians RLS policies
CREATE POLICY technicians_isolation ON technicians
  FOR ALL USING (admin_id = auth.uid());

-- SMS logs RLS policies
CREATE POLICY sms_isolation ON sms_logs
  FOR ALL USING (admin_id = auth.uid());

-- Deletion logs RLS policies
CREATE POLICY deletion_isolation ON deletion_logs
  FOR ALL USING (admin_id = auth.uid());

-- Job notes RLS policies
CREATE POLICY job_notes_isolation ON job_notes
  FOR ALL USING (admin_id = auth.uid());

-- Photos RLS policies
CREATE POLICY photos_isolation ON photos
  FOR ALL USING (
    job_id IN (SELECT id FROM jobs WHERE admin_id = auth.uid())
    OR technician_id IN (SELECT id FROM technicians WHERE admin_id = auth.uid())
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR HELPER OPERATIONS
-- ============================================================================

-- Function to get user's company settings
CREATE OR REPLACE FUNCTION get_company_settings(p_admin_id UUID)
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  company_phone TEXT,
  twilio_number TEXT,
  account_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT cs.id, cs.company_name, cs.company_phone, cs.twilio_number, cs.account_status
  FROM company_settings cs
  WHERE cs.admin_id = p_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old data (30-day retention)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete old completed jobs (older than 30 days)
  DELETE FROM jobs 
  WHERE status = 'complete' 
  AND updated_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete old deletion logs
  DELETE FROM deletion_logs 
  WHERE status = 'completed' 
  AND completed_at < NOW() - INTERVAL '30 days';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for active jobs with technician info
CREATE OR REPLACE VIEW active_jobs AS
SELECT 
  j.*,
  cs.company_name,
  array_agg(t.name) FILTER (WHERE t.id = ANY(j.assigned_tech_ids)) as technician_names
FROM jobs j
JOIN company_settings cs ON j.admin_id = cs.admin_id
LEFT JOIN technicians t ON t.admin_id = j.admin_id
WHERE j.status != 'complete'
GROUP BY j.id, cs.company_name;

-- View for SMS threads
CREATE OR REPLACE VIEW sms_threads AS
SELECT 
  sl.*,
  j.customer_name,
  j.customer_phone as job_customer_phone,
  t.name as technician_name
FROM sms_logs sl
LEFT JOIN jobs j ON sl.job_id = j.id
LEFT JOIN technicians t ON sl.technician_id = t.id;

-- ============================================================================
-- SEED DATA (Optional - for development)
-- ============================================================================

-- Insert default SMS templates (if needed)
-- These would be inserted via seed script, not here

COMMENT ON TABLE users IS 'Extended user profiles for Dispatchly';
COMMENT ON TABLE company_settings IS 'Company configuration including Twilio settings';
COMMENT ON TABLE jobs IS 'Service jobs with customer and assignment info';
COMMENT ON TABLE technicians IS 'Technicians assigned to jobs';
COMMENT ON TABLE sms_logs IS 'SMS message history with threading support';
COMMENT ON TABLE deletion_logs IS 'Audit log for account deletions';

-- Grant access to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
