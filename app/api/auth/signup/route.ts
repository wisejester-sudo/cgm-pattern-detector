import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// POST /api/auth/signup - Register a new admin account
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      // Demo mode - accept any credentials and redirect to dashboard
      return NextResponse.json({ success: true, demo: true })
    }

    const body = await request.json()
    const { email, password, companyName, companyPhone, ownerName } = body

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: "Email, password, and company name required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
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
              // Ignore
            }
          },
        },
      }
    )

    // Sign up with email and password, include all metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: ownerName || email.split('@')[0],
          company_name: companyName,
          company_phone: companyPhone,
          role: 'admin',
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message || "Signup failed" },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Signup failed" },
        { status: 400 }
      )
    }

    // Return user data and session status
    return NextResponse.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: ownerName || email.split('@')[0],
        company_name: companyName,
        company_phone: companyPhone,
      },
      hasSession: !!data.session,
      requiresConfirmation: !data.session
    })
  } catch (error) {
    console.error("[API] Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
