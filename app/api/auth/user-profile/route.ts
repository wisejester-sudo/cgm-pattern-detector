import { NextResponse } from 'next/server'

// Default demo profile for when Supabase is not configured or user is not authenticated
const DEMO_PROFILE = {
  id: 'demo',
  email: 'admin@dispatchly.demo',
  full_name: 'Demo Admin',
  phone: null,
  role: 'admin' as const,
}

export async function GET() {
  // Check if Supabase is configured - do this before any imports that might fail
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(DEMO_PROFILE)
  }

  try {
    // Dynamic import to avoid errors when env vars aren't set
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(DEMO_PROFILE)
    }

    // Get company settings to find owner name
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('owner_name, owner_phone')
      .eq('admin_id', user.id)
      .single()

    const profile = {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || companySettings?.owner_name || null,
      phone: user.user_metadata?.phone || companySettings?.owner_phone || null,
      role: user.user_metadata?.role || 'admin' as const,
    }

    return NextResponse.json(profile)
  } catch {
    // Return demo profile on any error to prevent UI breakage
    return NextResponse.json(DEMO_PROFILE)
  }
}
