import { createMiddlewareClient } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Skip middleware for public routes
  const publicRoutes = ["/login", "/signup", "/tech", "/j", "/api"]
  if (publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  try {
    const { supabase, response } = createMiddlewareClient(request)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith("/") && !session) {
      // Allow access but don't redirect - let pages handle auth
      return response
    }

    return response
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
