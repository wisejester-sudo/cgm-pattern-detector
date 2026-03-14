import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_CONFIG } from "./config"

// Force rebuild: v2
let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Try environment variables first, fall back to config constants with hardcoded credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.url
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Supabase config missing - cannot create client")
    throw new Error(`Supabase incomplete: URL=${!!supabaseUrl} KEY=${!!supabaseAnonKey}`)
  }

  if (!cachedClient) {
    cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return cachedClient
}

export async function createClientAsync() {
  return createClient()
}
