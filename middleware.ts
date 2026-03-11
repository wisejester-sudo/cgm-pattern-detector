import { createMiddlewareClient } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Skip if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  try {
    const { supabase, response } = createMiddlewareClient(req)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Define protected routes
    const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard")
    const isPublicAuthRoute =
      req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup"

    // If accessing dashboard without session, redirect to login
    if (isDashboardRoute && !session) {
      return Response.redirect(new URL("/login", req.url))
    }

    // If accessing login/signup with session, redirect to dashboard
    if (isPublicAuthRoute && session) {
      return Response.redirect(new URL("/dashboard", req.url))
    }

    return response
  } catch (error) {
    // If there's an error with Supabase, allow request to continue
    console.error("[v0] Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
