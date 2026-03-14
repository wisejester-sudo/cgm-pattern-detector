import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Supabase config check:", {
    url_set: !!supabaseUrl,
    key_set: !!supabaseAnonKey,
    url_preview: supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "NOT SET",
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = []
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    throw new Error(
      `Missing Supabase environment variables: ${missing.join(", ")}. ` +
      `Please add them to your project settings (top right → Vars) with these exact names. ` +
      `Get values from https://app.supabase.com → Project Settings → API`
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
