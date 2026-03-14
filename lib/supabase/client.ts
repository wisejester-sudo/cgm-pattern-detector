import { createBrowserClient } from "@supabase/ssr"

// Hardcoded Supabase credentials - these work without environment variables
const SUPABASE_URL = 'https://ltyrituojmxhkwetsnyk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eXJpdHVvam14aGt3ZXRzbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzE2NzYsImV4cCI6MjA4ODg0NzY3Nn0.A9fRHHbuT4w373JeEYFIpwZjCIVa6zb1G6r2M3XiHhs'

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!cachedClient) {
    cachedClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return cachedClient
}

export async function createClientAsync() {
  return createClient()
}
