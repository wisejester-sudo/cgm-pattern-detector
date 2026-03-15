import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SUPABASE_CONFIG } from "./config"

/**
 * Creates a Supabase client for server-side operations.
 * Returns null if Supabase is not configured.
 */
export async function createClient() {
  // Try environment variables first, fall back to config constants
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.url
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey

  // Return null when not configured - callers must handle this
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase config missing - both URL and key required")
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Checks if Supabase is configured in the environment.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.url
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey
  return Boolean(url && key)
}
