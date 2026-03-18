/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiting for API routes.
 * In production, consider using Redis or similar for distributed rate limiting.
 */

type RateLimitStore = Map<string, { count: number; resetTime: number }>

const store: RateLimitStore = new Map()

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
 * Uses X-Forwarded-For header for proxied requests
 */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback: generate a simple identifier from user agent + accept headers
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const accept = request.headers.get('accept') || 'unknown'
  
  // This is not ideal but better than nothing for non-proxy environments
  return Buffer.from(`${userAgent}-${accept}`).toString('base64').slice(0, 32)
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
