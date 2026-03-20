/**
 * Rate Limiting Utility
 * 
 * ⚠️ SECURITY WARNING: This uses in-memory storage which is NOT suitable for production.
 * In production environments with multiple server instances (Vercel, AWS, etc.),
 * use Redis or a distributed rate limiting service like Upstash or Cloudflare Rate Limiting.
 * 
 * This implementation is suitable for development and single-instance deployments only.
 */

type RateLimitStore = Map<string, { count: number; resetTime: number }>

// In-memory store - resets on server restart
// In production: Use Redis or similar distributed store
const store: RateLimitStore = new Map()

// Track if we've warned about production usage
let productionWarningShown = false

interface RateLimitOptions {
  maxRequests: number // Maximum requests allowed
  windowMs: number     // Time window in milliseconds
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP address, user ID, etc.)
 * @param options - Rate limit configuration
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  // Warn once about production usage
  if (!productionWarningShown && process.env.NODE_ENV === 'production') {
    console.warn('[Rate Limit] WARNING: Using in-memory rate limiting in production. Consider using Redis for distributed rate limiting.')
    productionWarningShown = true
  }

  const now = Date.now()
  const key = identifier

  const record = store.get(key)

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries(now)
  }

  // If no record exists or window has passed, create new record
  if (!record || now > record.resetTime) {
    const resetTime = now + options.windowMs
    store.set(key, {
      count: 1,
      resetTime,
    })
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime,
    }
  }

  // Check if limit exceeded
  if (record.count >= options.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter,
    }
  }

  // Increment count
  record.count++
  store.set(key, record)

  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key)
    }
  }
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header for proxied requests (Vercel, Cloudflare, etc.)
 * Falls back to other headers or generates a hash-based identifier
 * 
 * SECURITY NOTE: In production, always run behind a trusted proxy (Vercel, Cloudflare)
 * that sets the X-Forwarded-For header to prevent IP spoofing.
 */
export function getClientIdentifier(request: Request): string {
  // Trust X-Forwarded-For from Vercel's edge network
  // Vercel validates this header at the edge, so it's trustworthy
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Get the client IP (first in the chain, closest to the edge)
    const clientIp = forwardedFor.split(',')[0].trim()
    if (clientIp && clientIp !== '::1' && clientIp !== '127.0.0.1') {
      return clientIp
    }
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp && realIp !== '::1' && realIp !== '127.0.0.1') {
    return realIp
  }
  
  // SECURITY: Last resort - generate a fingerprint from multiple headers
  // This prevents trivial bypass of rate limiting by users without a real IP
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const accept = request.headers.get('accept') || 'unknown'
  const acceptLang = request.headers.get('accept-language') || 'unknown'
  
  // Create a more unique fingerprint
  const fingerprint = `${userAgent}-${accept}-${acceptLang}`
  
  // Use a simple hash to create a fixed-length identifier
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return `fp-${Math.abs(hash).toString(16).padStart(8, '0')}`
}

// Common rate limit configurations
export const rateLimitConfigs = {
  // Auth endpoints: 5 requests per minute
  auth: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  // API endpoints: 100 requests per minute
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
  // SMS sending: 20 requests per minute
  sms: {
    maxRequests: 20,
    windowMs: 60 * 1000,
  },
  // File uploads: 10 requests per minute
  upload: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
}
