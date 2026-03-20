import { NextResponse } from 'next/server'

export async function GET() {
  // Only return configuration status, not actual credentials
  // The anon key should never be exposed via API
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return NextResponse.json({
    configured,
  })
}
