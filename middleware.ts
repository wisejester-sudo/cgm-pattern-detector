import { createMiddlewareClient } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const { supabase, response } = createMiddlewareClient(req)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define protected routes
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard")
  const isPublicAuthRoute =
    req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup"
  const isPublicRoute =
    req.nextUrl.pathname.startsWith("/tech") ||
    req.nextUrl.pathname.startsWith("/track") ||
    req.nextUrl.pathname === "/"

  // If accessing dashboard without session, redirect to login
  if (isDashboardRoute && !session) {
    return Response.redirect(new URL("/login", req.url))
  }

  // If accessing login/signup with session, redirect to dashboard
  if (isPublicAuthRoute && session) {
    return Response.redirect(new URL("/dashboard", req.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
