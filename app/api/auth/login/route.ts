import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from "@/lib/rate-limit"

// POST /api/auth/login - Login with email and password
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per minute per IP
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit(`login:${identifier}`, rateLimitConfigs.auth)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again later.",
          retryAfter: rateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': rateLimit.retryAfter?.toString() || '60',
          }
        }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      // Demo mode - accept any credentials
      return NextResponse.json({ success: true, demo: true })
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
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

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message || "Invalid credentials" },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Login failed" },
        { status: 401 }
      )
    }

    // Return user info with metadata
    return NextResponse.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name,
        company_name: data.user.user_metadata?.company_name,
        company_phone: data.user.user_metadata?.company_phone,
      }
    })
  } catch (error) {
    console.error("[API] Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
