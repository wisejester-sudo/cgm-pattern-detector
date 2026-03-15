import { NextResponse } from 'next/server'

export async function GET() {
  // Return Supabase configuration - these should be available from environment
  const config = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  }

  // Log for debugging
  console.log('[API] Config check:', {
    url_set: !!config.supabaseUrl,
    key_set: !!config.supabaseAnonKey,
  })

  return NextResponse.json(config)
}
