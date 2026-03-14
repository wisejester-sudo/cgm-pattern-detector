import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_CONFIG } from "./config"

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Try environment variables first, fall back to config constants
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.url
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey

  console.log("[v0] Supabase client init:", {
    url_set: !!supabaseUrl,
    key_set: !!supabaseAnonKey,
    url_preview: supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "MISSING",
    env_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    env_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Missing Supabase configuration: URL=${supabaseUrl ? 'set' : 'MISSING'}, Key=${supabaseAnonKey ? 'set' : 'MISSING'}`
    )
  }

  if (!cachedClient) {
    cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return cachedClient
}

export async function createClientAsync() {
  // In the browser, we can just use the sync version
  return createClient()
}
