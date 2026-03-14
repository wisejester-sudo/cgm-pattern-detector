import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_CONFIG } from "./config"

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Try environment variables first, fall back to config constants with hardcoded credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.url
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey

  console.log("[v0] Supabase browser client init:", {
    url_set: !!supabaseUrl,
    key_set: !!supabaseAnonKey,
    url_prefix: supabaseUrl?.substring(0, 30) || "MISSING",
    env_url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    env_key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    using_fallback: !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = !supabaseUrl ? "URL" : !supabaseAnonKey ? "KEY" : "BOTH"
    throw new Error(`Supabase config incomplete: missing ${missing}`)
  }

  if (!cachedClient) {
    console.log("[v0] Creating new Supabase browser client")
    cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return cachedClient
}

export async function createClientAsync() {
  // In the browser, use the sync version which has fallback logic
  return createClient()
}
