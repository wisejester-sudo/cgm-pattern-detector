import { updateSession } from "@/lib/supabase/middleware"
import { type NextRequest, NextResponse } from "next/server"
import { generateCSRFToken, hashCSRFToken, getCSRFTokenFromRequest, requiresCSRFProtection, getCSRFCookieOptions } from "@/lib/csrf"

export async function middleware(request: NextRequest) {
  // First, update the session
  const response = await updateSession(request)

  // Only apply CSRF protection to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const csrfCookie = request.cookies.get('csrf-token')?.value

    // For state-changing methods, validate CSRF token
    if (requiresCSRFProtection(request.method)) {
      const csrfHeader = getCSRFTokenFromRequest(request)

      if (!csrfCookie || !csrfHeader) {
        return NextResponse.json(
          { error: 'CSRF token missing' },
          { status: 403 }
        )
      }

      // Validate the token
      const hashedToken = hashCSRFToken(csrfHeader)
      if (hashedToken !== csrfCookie) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
    } else {
      // For safe methods (GET, HEAD, OPTIONS), set a new CSRF token if not present
      if (!csrfCookie) {
        const newToken = generateCSRFToken()
        const hashedToken = hashCSRFToken(newToken)
        
        // Set the hashed token in cookie
        response.cookies.set('csrf-token', hashedToken, getCSRFCookieOptions())
        
        // Also set the raw token in a header so client can read it
        response.headers.set('X-CSRF-Token', newToken)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
