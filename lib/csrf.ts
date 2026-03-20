// CSRF Protection Utilities
// Uses Web Crypto API for Edge Runtime compatibility

const CSRF_TOKEN_LENGTH = 32
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate a new CSRF token using Web Crypto API
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash a CSRF token for storage using Web Crypto API
 */
export async function hashCSRFToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate a CSRF token against its hash
 */
export async function validateCSRFToken(token: string, hashedToken: string): Promise<boolean> {
  const computedHash = await hashCSRFToken(token)
  return computedHash === hashedToken
}

/**
 * Get CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  return request.headers.get(CSRF_HEADER_NAME)
}

/**
 * Check if request requires CSRF protection
 * Safe methods: GET, HEAD, OPTIONS (read-only)
 * Unsafe methods: POST, PUT, PATCH, DELETE (state-changing)
 */
export function requiresCSRFProtection(method: string): boolean {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  return !safeMethods.includes(method.toUpperCase())
}

/**
 * Create CSRF token cookie options (httpOnly - for server validation)
 */
export function getCSRFCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  }
}

/**
 * Create CSRF token cookie options for client-readable cookie
 */
export function getCSRFClientCookieOptions() {
  return {
    httpOnly: false, // Client needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  }
}
