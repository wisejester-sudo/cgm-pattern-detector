import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from '../rate-limit'

describe('rate-limit', () => {
  beforeEach(() => {
    // Reset the module state between tests
    jest.resetModules()
  })

  describe('checkRateLimit', () => {
    it('allows requests within limit', () => {
      const result = checkRateLimit('test-id', { maxRequests: 5, windowMs: 60000 })
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('blocks requests after limit exceeded', () => {
      const identifier = 'test-block'
      const options = { maxRequests: 2, windowMs: 60000 }
      
      // Make 2 requests (at limit)
      checkRateLimit(identifier, options)
      checkRateLimit(identifier, options)
      
      // Third request should be blocked
      const result = checkRateLimit(identifier, options)
      
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('resets after window expires', () => {
      const identifier = 'test-reset'
      const options = { maxRequests: 2, windowMs: 100 } // 100ms window for testing
      
      // Exhaust limit
      checkRateLimit(identifier, options)
      checkRateLimit(identifier, options)
      
      // Should be blocked
      const blocked = checkRateLimit(identifier, options)
      expect(blocked.allowed).toBe(false)
      
      // Wait for window to expire
      return new Promise(resolve => {
        setTimeout(() => {
          // Should be allowed again
          const result = checkRateLimit(identifier, options)
          expect(result.allowed).toBe(true)
          expect(result.remaining).toBe(1)
          resolve(undefined)
        }, 150)
      })
    })

    it('tracks different identifiers separately', () => {
      const options = { maxRequests: 2, windowMs: 60000 }
      
      // Exhaust limit for user1
      checkRateLimit('user1', options)
      checkRateLimit('user1', options)
      
      // user1 should be blocked
      const user1Result = checkRateLimit('user1', options)
      expect(user1Result.allowed).toBe(false)
      
      // user2 should be allowed
      const user2Result = checkRateLimit('user2', options)
      expect(user2Result.allowed).toBe(true)
    })
  })

  describe('getClientIdentifier', () => {
    it('extracts IP from X-Forwarded-For header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'X-Forwarded-For': '192.168.1.1, 10.0.0.1',
        },
      })
      
      const identifier = getClientIdentifier(request)
      expect(identifier).toBe('192.168.1.1')
    })

    it('extracts IP from X-Real-Ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'X-Real-Ip': '192.168.1.2',
        },
      })
      
      const identifier = getClientIdentifier(request)
      expect(identifier).toBe('192.168.1.2')
    })

    it('falls back to user agent hash when no IP headers', () => {
      const request = new Request('http://localhost', {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'text/html',
        },
      })
      
      const identifier = getClientIdentifier(request)
      expect(identifier).toBeTruthy()
      expect(typeof identifier).toBe('string')
    })
  })

  describe('rateLimitConfigs', () => {
    it('has correct auth config', () => {
      expect(rateLimitConfigs.auth.maxRequests).toBe(5)
      expect(rateLimitConfigs.auth.windowMs).toBe(60000)
    })

    it('has correct api config', () => {
      expect(rateLimitConfigs.api.maxRequests).toBe(100)
      expect(rateLimitConfigs.api.windowMs).toBe(60000)
    })

    it('has correct sms config', () => {
      expect(rateLimitConfigs.sms.maxRequests).toBe(20)
      expect(rateLimitConfigs.sms.windowMs).toBe(60000)
    })

    it('has correct upload config', () => {
      expect(rateLimitConfigs.upload.maxRequests).toBe(10)
      expect(rateLimitConfigs.upload.windowMs).toBe(60000)
    })
  })
})
