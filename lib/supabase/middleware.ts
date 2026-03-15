import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip Supabase session handling if env vars aren't configured
  // Allow demo mode to work without Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Public routes that don't require authentication
    const publicRoutes = [
      "/login", 
      "/signup", 
      "/auth", 
      "/t/", 
      "/j/", 
      "/track/",
      "/api/public", 
      "/api/sms/webhook",
      "/api/auth"
    ]
    const isPublicRoute = publicRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    )

    // Allow API routes (they handle their own auth)
    if (request.nextUrl.pathname.startsWith("/api")) {
      return supabaseResponse
    }

    // Allow all routes in demo mode (no user but public-ish access)
    // This lets the app work for demonstration without requiring signup
    if (!user && !isPublicRoute) {
      // For now, allow dashboard access in demo mode
      // In production, uncomment to enforce auth:
      // const url = request.nextUrl.clone()
      // url.pathname = "/login"
      // return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    // If there's an error with Supabase, allow the request to proceed
    // This prevents the app from breaking if Supabase is temporarily unavailable
    console.error("[Middleware] Supabase error:", error)
    return supabaseResponse
  }
}
