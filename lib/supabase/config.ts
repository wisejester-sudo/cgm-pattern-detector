/**
 * Supabase Configuration
 * 
 * ⚠️ SECURITY WARNING: Never add serviceRoleKey here!
 * Service role keys bypass all RLS policies and should only be used
 * in secure server-side environments via environment variables.
 * 
 * These are fallback values for development only.
 * Production should always use environment variables.
 */

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  // NOTE: serviceRoleKey is intentionally NOT included here
  // It should only be accessed via process.env.SUPABASE_SERVICE_ROLE_KEY
  // in secure server-side API routes only
}
