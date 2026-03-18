-- Migration: Add environment validation for magic links
-- This prevents tokens from working across different environments (staging/prod)

-- Add environment columns to technicians table
ALTER TABLE public.technicians 
ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'production',
ADD COLUMN IF NOT EXISTS base_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS magic_link_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups by environment
CREATE INDEX IF NOT EXISTS idx_technicians_magic_link_env 
ON public.technicians(magic_link_token, environment);

-- Add comment explaining the columns
COMMENT ON COLUMN public.technicians.environment IS 'Environment where this token was generated (production, preview, development)';
COMMENT ON COLUMN public.technicians.base_url IS 'Base URL where this token is valid (e.g., getdispatchly.co)';
COMMENT ON COLUMN public.technicians.magic_link_expires_at IS 'Token expiration timestamp for security';

-- Update existing records to have default values
UPDATE public.technicians 
SET environment = 'production', 
    base_url = COALESCE(base_url, 'https://getdispatchly.co')
WHERE environment IS NULL;
