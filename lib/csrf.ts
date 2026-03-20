// CSRF Protection Utilities
import { createHash, randomBytes } from 'crypto'

const CSRF_TOKEN_LENGTH = 32
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Hash a CSRF token for storage (prevents token theft from DB)
 */
export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Validate a CSRF token against its hash
 */
export function validateCSRFToken(token: string, hashedToken: string): boolean {
  const computedHash = hashCSRFToken(token)
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
 * This allows JavaScript to read the token and send it in headers
 */
export function getCSRFClientCookieOptions() {
  return {
    httpOnly: false, // Client can read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  }
}
