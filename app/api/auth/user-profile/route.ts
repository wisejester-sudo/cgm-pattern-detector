import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Profile returned when not authenticated or Supabase not configured
const DEFAULT_PROFILE = {
  id: 'demo',
  email: '',
  full_name: null,
  phone: null,
  company_name: null,
  company_phone: null,
  role: 'admin' as const,
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(DEFAULT_PROFILE)
  }

  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
            // Ignore in Server Components
          }
        },
      },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(DEFAULT_PROFILE)
    }

    // Read company info directly from user metadata set during signup
    const meta = user.user_metadata || {}

    const profile = {
      id: user.id,
      email: user.email || '',
      full_name: meta.full_name || null,
      phone: meta.company_phone || null,
      company_name: meta.company_name || null,
      company_phone: meta.company_phone || null,
      role: (meta.role as 'admin' | 'technician') || 'admin',
    }

    return NextResponse.json(profile)
  } catch {
    return NextResponse.json(DEFAULT_PROFILE)
  }
}
