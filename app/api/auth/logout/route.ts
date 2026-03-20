import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ success: true })
    }

    // Dynamic import to avoid errors when env vars aren't set
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Sign out from Supabase
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("[API] Error signing out:", error)
        // Still return success - client-side logout should proceed
      }
    }

    // SECURITY: Clear any session cookies (Next.js handles this, but we ensure success)
    const response = NextResponse.json({ success: true })
    
    // Set cache control headers to prevent caching of logout
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error("[API] Unexpected error during logout:", error)
    // SECURITY: Return success even on error - user should be logged out client-side
    // This prevents information leakage about the error
    return NextResponse.json({ success: true })
  }
}
