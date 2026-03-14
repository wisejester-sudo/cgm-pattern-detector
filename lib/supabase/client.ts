import { createBrowserClient } from "@supabase/ssr"

let cachedClient: ReturnType<typeof createBrowserClient> | null = null
let cachedConfig: { url: string; key: string } | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Supabase config check:", {
    url_set: !!supabaseUrl,
    key_set: !!supabaseAnonKey,
    url_preview: supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "NOT SET",
  })

  if (supabaseUrl && supabaseAnonKey) {
    // If we have the config from environment, use it and cache it
    cachedConfig = { url: supabaseUrl, key: supabaseAnonKey }
    if (!cachedClient) {
      cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    }
    return cachedClient
  }

  // If we have cached config from an earlier fetch, use it
  if (cachedConfig && cachedClient) {
    return cachedClient
  }

  // If no environment variables and no cache, throw error with helpful message
  throw new Error(
    `Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. ` +
    `You need to add these to your project's environment variables. ` +
    `Get values from https://app.supabase.com → Project Settings → API`
  )
}

// Async version that can fetch config from server if needed
export async function createClientAsync() {
  // First try the sync version (uses environment variables)
  try {
    return createClient()
  } catch (error) {
    // If sync version fails, try to fetch config from API endpoint
    console.log("[v0] Attempting to fetch Supabase config from API...")
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const config = await response.json()
        if (config.supabaseUrl && config.supabaseAnonKey) {
          cachedConfig = {
            url: config.supabaseUrl,
            key: config.supabaseAnonKey,
          }
          cachedClient = createBrowserClient(config.supabaseUrl, config.supabaseAnonKey)
          return cachedClient
        }
      }
    } catch (fetchError) {
      console.error("[v0] Failed to fetch config from API:", fetchError)
    }
    // If all attempts fail, throw the original error
    throw error
  }
}
