-- Add access tracking columns to technicians table
ALTER TABLE technicians 
ADD COLUMN IF NOT EXISTS accessed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;
