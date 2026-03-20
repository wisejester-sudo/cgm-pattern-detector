import { updateSession } from "@/lib/supabase/middleware"
import { type NextRequest, NextResponse } from "next/server"
import { generateCSRFToken, hashCSRFToken, getCSRFTokenFromRequest, requiresCSRFProtection, getCSRFCookieOptions, getCSRFClientCookieOptions } from "@/lib/csrf"

export async function middleware(request: NextRequest) {
  // First, update the session
  const response = await updateSession(request)

  // Only apply CSRF protection to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const csrfCookie = request.cookies.get('csrf-token')?.value

    // CSRF validation TEMPORARILY DISABLED
    // Still set CSRF cookies for when we re-enable protection
    // TODO: Fix and re-enable CSRF validation
    if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
      // For safe methods, set a new CSRF token if not present
      if (!csrfCookie) {
        const newToken = generateCSRFToken()
        const hashedToken = hashCSRFToken(newToken)
        
        // Set the hashed token in httpOnly cookie (for server validation)
        response.cookies.set('csrf-token', hashedToken, getCSRFCookieOptions())
        
        // Set the raw token in client-readable cookie (for JavaScript to access)
        response.cookies.set('csrf-token-client', newToken, getCSRFClientCookieOptions())
        
        // Also set the raw token in a header so client can read it immediately
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
