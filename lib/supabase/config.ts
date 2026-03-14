/**
 * Supabase Configuration
 * This file contains the Supabase project credentials loaded from environment.
 * In v0 preview, these are read from .env.local as a fallback.
 */

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ltyrituojmxhkwetsnyk.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eXJpdHVvam14aGt3ZXRzbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzE2NzYsImV4cCI6MjA4ODg0NzY3Nn0.A9fRHHbuT4w373JeEYFIpwZjCIVa6zb1G6r2M3XiHhs',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eXJpdHVvam14aGt3ZXRzbnlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI3MTY3NiwiZXhwIjoyMDg4ODQ3Njc2fQ.rLxPgVITRKLc3cb0FuNnSd-IraAU_bnj7XexxRVEiuY',
}
