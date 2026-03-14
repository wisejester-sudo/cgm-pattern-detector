import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/auth/signup - Register a new admin account
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Demo mode - accept any credentials and redirect to dashboard
      return NextResponse.json({ success: true, demo: true })
    }

    const body = await request.json()
    const { email, password, companyName, companyPhone, companyAddress, ownerName } = body

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

    const supabase = await createClient()

    // Sign up with email and password, include all metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`,
        data: {
          full_name: ownerName || email.split('@')[0],
          company_name: companyName,
          company_phone: companyPhone,
          company_address: companyAddress,
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

    // Note: company_settings and profiles are created automatically by database trigger
    // The handle_new_user trigger in the database creates these rows on auth.users insert

    return NextResponse.json({ 
      success: true, 
      user: data.user,
      requiresConfirmation: !data.session // If no session, email confirmation is required
    })
  } catch (error) {
    console.error("[API] Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
