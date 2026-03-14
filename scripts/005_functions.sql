-- Migration 005: Helper Functions

-- Function to generate a cryptographically secure magic link token
CREATE OR REPLACE FUNCTION generate_technician_magic_token(tech_id UUID, expiry_hours INT DEFAULT 168)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token TEXT;
BEGIN
  new_token := encode(gen_random_bytes(32), 'hex');

  UPDATE public.technicians
  SET
    magic_link_token = new_token,
    token_expires_at = NOW() + (expiry_hours || ' hours')::INTERVAL
  WHERE id = tech_id;

  RETURN new_token;
END;
$$;
