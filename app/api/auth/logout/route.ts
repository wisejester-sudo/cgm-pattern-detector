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
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch {
    // Return success even on error - user should be logged out client-side
    return NextResponse.json({ success: true })
  }
}
