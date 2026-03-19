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
      { path: "/", exact: true },
      { path: "/about", exact: true },
      { path: "/contact", exact: true },
      { path: "/pricing", exact: true },
      { path: "/privacy", exact: true },
      { path: "/terms", exact: true },
      { path: "/how-it-works", exact: true },
      { path: "/login", exact: false },
      { path: "/signup", exact: false },
      { path: "/tech", exact: false },
      { path: "/auth", exact: false },
      { path: "/t/", exact: false },
      { path: "/j/", exact: false },
      { path: "/track/", exact: false },
      { path: "/api/public", exact: false },
      { path: "/api/sms/webhook", exact: false },
      { path: "/api/auth", exact: false },
    ]
    const isPublicRoute = publicRoutes.some((route) =>
      route.exact 
        ? request.nextUrl.pathname === route.path
        : request.nextUrl.pathname.startsWith(route.path)
    )

    // Allow API routes (they handle their own auth)
    if (request.nextUrl.pathname.startsWith("/api")) {
      return supabaseResponse
    }

    // Enforce authentication - redirect to login if not authenticated
    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    // If there's an error with Supabase, allow the request to proceed
    // This prevents the app from breaking if Supabase is temporarily unavailable
    console.error("[Middleware] Supabase error:", error)
    return supabaseResponse
  }
}
