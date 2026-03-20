import { createBrowserClient } from "@supabase/ssr"

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Creates a Supabase browser client
 * SECURITY: Credentials MUST come from environment variables only
 * Never hardcode credentials - this prevents credential leakage to client bundles
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Supabase Client] Missing environment variables. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.")
    throw new Error("Supabase configuration missing. Check your environment variables.")
  }

  if (!cachedClient) {
    cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return cachedClient
}

export async function createClientAsync() {
  return createClient()
}
