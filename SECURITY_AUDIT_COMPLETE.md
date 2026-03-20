# Dispatchly Security Audit Report
**Date:** 2026-03-19  
**Scope:** Authentication flows, API security, session management, RLS policies, XSS/CSRF protection  
**Auditor:** Security Sub-Agent  

---

## Executive Summary

The Dispatchly application has **implemented strong foundational security** with proper authentication checks, authorization, rate limiting, and security headers. However, **several HIGH severity issues** require immediate attention, particularly around CSRF protection, XSS prevention, and credential storage.

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | ✅ No critical issues found |
| High | 6 | ⚠️ Requires immediate attention |
| Medium | 7 | ⚠️ Should be addressed soon |
| Low | 5 | ℹ️ Recommended improvements |

---

## HIGH SEVERITY ISSUES

### 1. CSRF Protection Missing
**File:** Multiple files - All API routes, forms  
**Line:** N/A - System-wide issue  
**Severity:** HIGH

**Issue:** The application lacks Cross-Site Request Forgery (CSRF) protection. API routes do not validate CSRF tokens, making them vulnerable to CSRF attacks where an attacker can trick authenticated users into performing unintended actions.

**Evidence:**
- No CSRF token generation in login/signup forms
- API routes accept requests without CSRF token validation
- No double-submit cookie pattern implemented

**Suggested Fix:**
```typescript
// Add CSRF protection middleware
// lib/csrf.ts
import { createHash, randomBytes } from 'crypto'

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

export function validateCSRFToken(token: string, header: string): boolean {
  return token === header
}

// Apply to all state-changing API routes
// In middleware.ts or at route level:
const csrfToken = request.headers.get('x-csrf-token')
const sessionToken = await getSessionCSRFToken()
if (!validateCSRFToken(csrfToken, sessionToken)) {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
}
```

---

### 2. XSS Vulnerabilities - User Input Rendering
**File:** Multiple components  
**Line:** Various  
**Severity:** HIGH

**Issue:** User input (job notes, customer names, SMS messages) is rendered without sanitization, creating potential XSS vulnerabilities if malicious JavaScript is injected.

**Evidence:**
- `lib/store.ts` line ~1007: `renderTemplate()` function directly interpolates user data
- SMS messages and job notes displayed without sanitization
- No DOMPurify or similar library usage found

**Suggested Fix:**
```typescript
// Install: npm install dompurify
import DOMPurify from 'dompurify'

// Sanitize before rendering
const sanitizedNotes = DOMPurify.sanitize(job.notes)

// Or use dangerouslySetInnerHTML with caution
<div dangerouslySetInnerHTML={{ __html: sanitizedNotes }} />

// For SMS templates, escape HTML entities
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
```

---

### 3. Technician PINs Stored in Plain Text
**File:** `app/api/technicians/accept-invite/route.ts`  
**Line:** 52-56  
**Severity:** HIGH

**Issue:** Technician PINs are stored in plain text in the database. If the database is compromised, attackers gain immediate access to all technician accounts.

**Evidence:**
```typescript
// Current code (line 52-56)
.update({
  pin: pin,  // ⚠️ Stored in plain text!
  // ...
})
```

**Suggested Fix:**
```typescript
import bcrypt from 'bcryptjs'

// Hash PIN before storing (treat PINs like passwords)
const saltRounds = 10
const hashedPin = await bcrypt.hash(pin, saltRounds)

// Store hashed version
.update({
  pin: hashedPin,
  // ...
})

// When verifying, use bcrypt.compare()
const isValidPin = await bcrypt.compare(inputPin, storedHash)
```

---

### 4. Magic Link Tokens Stored in Plain Text
**File:** `app/api/technicians/invite/route.ts`  
**Line:** 52-62  
**Severity:** HIGH

**Issue:** Magic link tokens are stored in the database in plain text format. While they are single-use and time-limited, plaintext storage violates security best practices.

**Evidence:**
```typescript
// Line 52-62 - token stored directly
.update({
  magic_link_token: token,  // ⚠️ Plain text storage
  magic_link_expires_at: expiresAt.toISOString(),
  // ...
})
```

**Suggested Fix:**
```typescript
import { createHash } from 'crypto'

// Store hash of token, not the token itself
const tokenHash = createHash('sha256').update(token).digest('hex')

.update({
  magic_link_token_hash: tokenHash,  // Store hash
  magic_link_expires_at: expiresAt.toISOString(),
  // ...
})

// When validating, hash the incoming token and compare
const inputHash = createHash('sha256').update(providedToken).digest('hex')
const isValid = inputHash === storedHash
```

---

### 5. Demo Mode Authentication Bypass
**File:** `app/api/auth/login/route.ts`  
**Line:** 30-33  
**Severity:** HIGH

**Issue:** When Supabase environment variables are not set, the application runs in "demo mode" which accepts any credentials. This could allow authentication bypass in production if env vars are accidentally unset.

**Evidence:**
```typescript
// Line 30-33
if (!supabaseUrl || !supabaseAnonKey) {
  // Demo mode - accept any credentials
  return NextResponse.json({ success: true, demo: true })
}
```

**Suggested Fix:**
```typescript
// Add explicit demo mode flag
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
const supabaseConfigured = supabaseUrl && supabaseAnonKey

if (!supabaseConfigured && !DEMO_MODE) {
  // Production without database = error
  return NextResponse.json(
    { error: 'Service unavailable' },
    { status: 503 }
  )
}

if (DEMO_MODE) {
  // Only allow demo mode when explicitly enabled
  console.warn('[AUTH] Running in DEMO MODE')
  return NextResponse.json({ success: true, demo: true })
}
```

---

### 6. Sensitive Tokens in localStorage (XSS Risk)
**File:** `app/t/[token]/page.tsx`  
**Line:** 48-49  
**Severity:** HIGH

**Issue:** Magic tokens are stored in localStorage, which is vulnerable to XSS attacks. If an attacker injects malicious scripts, they can steal these tokens.

**Evidence:**
```typescript
// Line 48-49
localStorage.setItem('tech_magic_token', token)
localStorage.setItem('tech_name', data.name || 'Technician')
```

**Suggested Fix:**
```typescript
// Use httpOnly cookies instead of localStorage
// Set cookie via API response header
const response = NextResponse.json({ success: true })
response.cookies.set('tech_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7, // 7 days
})

// Or use sessionStorage (cleared when tab closes) as a temporary fix
sessionStorage.setItem('tech_magic_token', token)
```

---

## MEDIUM SEVERITY ISSUES

### 7. No Account Lockout Mechanism
**File:** `app/api/auth/login/route.ts`  
**Line:** N/A  
**Severity:** MEDIUM

**Issue:** Failed login attempts do not lock accounts or implement exponential backoff, allowing brute-force attacks against user passwords.

**Current State:** Rate limiting exists (5 attempts/minute per IP) but no account-level lockout.

**Suggested Fix:**
```typescript
// Track failed attempts per account
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes

// In login route:
const failedAttempts = await getFailedAttempts(email)
if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
  const lockoutExpiry = await getLockoutExpiry(email)
  if (lockoutExpiry > Date.now()) {
    return NextResponse.json(
      { error: 'Account locked. Try again later.' },
      { status: 423 }
    )
  }
}
```

---

### 8. Missing CORS Configuration
**File:** All API routes  
**Line:** N/A  
**Severity:** MEDIUM

**Issue:** No explicit CORS configuration for API routes. While Next.js defaults are reasonable, explicit configuration is recommended.

**Suggested Fix:**
```typescript
// Add to next.config.mjs
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization, X-CSRF-Token',
        },
        {
          key: 'Access-Control-Allow-Credentials',
          value: 'true',
        },
      ],
    },
  ]
}
```

---

### 9. Session Fixation Risk
**File:** `app/api/auth/login/route.ts`  
**Line:** N/A  
**Severity:** MEDIUM

**Issue:** No session regeneration after successful login. If an attacker obtains a pre-login session ID, they can hijack the post-login session.

**Suggested Fix:**
```typescript
// After successful authentication, regenerate session
// Supabase Auth handles this internally, but verify:
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// Ensure session is newly created
if (data.session) {
  // Session is automatically regenerated by Supabase
  // Verify token version or rotation if available
}
```

---

### 10. No HTTPS Enforcement
**File:** Multiple  
**Line:** N/A  
**Severity:** MEDIUM

**Issue:** No explicit check to ensure authentication happens over HTTPS in production.

**Suggested Fix:**
```typescript
// In API routes
if (process.env.NODE_ENV === 'production') {
  const protocol = request.headers.get('x-forwarded-proto')
  if (protocol !== 'https') {
    return NextResponse.json(
      { error: 'HTTPS required' },
      { status: 400 }
    )
  }
}
```

---

### 11. Information Leakage in Error Messages
**File:** Multiple API routes  
**Line:** Various  
**Severity:** MEDIUM

**Issue:** Error messages in development mode include stack traces and internal details that could aid attackers.

**Evidence:**
```typescript
// app/api/technicians/invite/route.ts line ~162
{
  error: 'Internal server error',
  details: error?.message || 'Unknown error',
  stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined  // ⚠️ Stack in dev
}
```

**Suggested Fix:**
```typescript
// Never expose stack traces or internal details
const isDev = process.env.NODE_ENV === 'development'

return NextResponse.json(
  {
    error: 'Internal server error',
    ...(isDev && { details: error.message }), // Only basic message in dev
  },
  { status: 500 }
)
```

---

### 12. In-Memory Rate Limiting Not Production-Ready
**File:** `lib/rate-limit.ts`  
**Line:** 1-20  
**Severity:** MEDIUM

**Issue:** Rate limiting uses in-memory storage which won't work across multiple server instances (Vercel serverless functions).

**Current State:** Already documented with warning, but still a concern for production.

**Suggested Fix:**
```typescript
// Implement Redis-based rate limiting
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function checkRateLimit(identifier: string, options: RateLimitOptions) {
  const key = `rate_limit:${identifier}`
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, options.windowMs / 1000)
  }
  
  return {
    allowed: current <= options.maxRequests,
    remaining: Math.max(0, options.maxRequests - current),
  }
}
```

---

### 13. Weak Content Security Policy
**File:** `next.config.mjs`  
**Line:** 30-40  
**Severity:** MEDIUM

**Issue:** CSP allows 'unsafe-eval' and 'unsafe-inline' which reduces effectiveness against XSS.

**Evidence:**
```javascript
"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
"style-src 'self' 'unsafe-inline'",
```

**Suggested Fix:**
```javascript
// Generate nonce for inline scripts
const crypto = require('crypto')
const nonce = crypto.randomBytes(16).toString('base64')

{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'", // Keep for Tailwind
    "img-src 'self' blob: data: https:",
    "font-src 'self'",
    "connect-src 'self' *.supabase.co",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ].join('; '),
}
```

---

## LOW SEVERITY ISSUES

### 14. LocalStorage Caching of Setup Status
**File:** `components/setup-guard.tsx`  
**Line:** 14, 32  
**Severity:** LOW

**Issue:** Setup verification status is cached in localStorage and trusted without server-side validation.

**Suggested Fix:**
```typescript
// Don't trust localStorage for auth-related caching
// Always verify with server on mount
const checkSetupStatus = async () => {
  // Remove localStorage caching
  const response = await fetch('/api/auth/user-role')
  // ... handle response
}
```

---

### 15. Missing Session Timeout
**File:** N/A  
**Line:** N/A  
**Severity:** LOW

**Issue:** No explicit session timeout configuration. Sessions remain valid indefinitely.

**Suggested Fix:**
```typescript
// Configure Supabase Auth with max age
// supabase/config.ts or server.ts
{
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Set max session duration (e.g., 24 hours)
    maxAge: 60 * 60 * 24, // 24 hours
  }
}
```

---

### 16. No Audit Logging
**File:** N/A  
**Severity:** LOW

**Issue:** Sensitive operations (login, logout, job creation, technician deletion) are not logged for security auditing.

**Suggested Fix:**
```typescript
// lib/audit-log.ts
export async function logSecurityEvent(
  event: string,
  userId: string,
  details: Record<string, unknown>
) {
  await supabase.from('audit_logs').insert({
    event,
    user_id: userId,
    details,
    ip_address: request.headers.get('x-forwarded-for'),
    user_agent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
  })
}

// Usage in login route:
await logSecurityEvent('LOGIN_SUCCESS', user.id, { email })
```

---

### 17. Missing Strict-Transport-Security Preload
**File:** `next.config.mjs`  
**Line:** 28  
**Severity:** LOW

**Issue:** HSTS header doesn't include preload directive for browser preload lists.

**Suggested Fix:**
```javascript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload',
},
```

---

### 18. No IP-Based Restrictions
**File:** N/A  
**Severity:** LOW

**Issue:** No IP allowlisting or geographic restrictions for admin operations.

**Note:** This may be intentional for the target use case, but worth documenting.

---

## POSITIVE SECURITY MEASURES ✅

The following security measures are properly implemented:

1. **✅ Authentication Middleware** - Properly redirects unauthenticated users
2. **✅ Route Protection** - Public routes properly defined, API routes protected
3. **✅ Authorization Checks** - All API routes verify resource ownership
4. **✅ Rate Limiting** - Implemented with sensible defaults (5 auth/min, 100 API/min)
5. **✅ Security Headers** - X-Frame-Options, CSP, HSTS configured in next.config.mjs
6. **✅ Stripe Webhook Signature Validation** - Proper signature verification
7. **✅ Twilio Webhook Signature Validation** - Validates in production
8. **✅ RLS Policies** - Enabled on all tables with proper policies
9. **✅ Input Validation** - Field whitelisting in settings, job, technician routes
10. **✅ Password Requirements** - Minimum 8 characters enforced
11. **✅ PIN Validation** - 4-8 digit validation
12. **✅ Email/Phone Validation** - Regex validation for formats
13. **✅ Magic Link Expiration** - 7-24 hour expiration with cleanup
14. **✅ Environment Context** - Magic links include environment to prevent cross-env usage
15. **✅ Secrets Management** - No hardcoded secrets in client-side code
16. **✅ Service Role Key** - Only used in secure server-side contexts
17. **✅ SQL Injection Prevention** - Supabase client parameterization prevents injection
18. **✅ Cache Control** - Proper headers on logout
19. **✅ Pagination** - Prevents DoS from large result sets
20. **✅ Error Handling** - Generic error messages in production (mostly)

---

## RECOMMENDATIONS SUMMARY

### Immediate Actions (HIGH Priority)
1. Implement CSRF protection on all state-changing routes
2. Add XSS sanitization for all user-generated content
3. Hash technician PINs before storage (bcrypt)
4. Hash magic link tokens before storage
5. Add explicit DEMO_MODE flag to prevent accidental bypass
6. Move magic tokens from localStorage to httpOnly cookies

### Short-term Actions (MEDIUM Priority)
7. Implement account lockout after failed attempts
8. Add explicit CORS configuration
9. Verify session regeneration on login
10. Add HTTPS enforcement check
11. Implement Redis-based rate limiting
12. Strengthen CSP (remove unsafe-eval where possible)

### Long-term Actions (LOW Priority)
13. Remove localStorage caching of auth state
14. Configure explicit session timeouts
15. Implement audit logging for security events
16. Add HSTS preload directive
17. Document IP restriction policy

---

## FILES REQUIRING MODIFICATION

| File | Issue | Severity |
|------|-------|----------|
| All API routes | Add CSRF protection | HIGH |
| All components with user input | Add XSS sanitization | HIGH |
| `app/api/technicians/accept-invite/route.ts` | Hash PINs | HIGH |
| `app/api/technicians/invite/route.ts` | Hash magic tokens | HIGH |
| `app/api/auth/login/route.ts` | Add demo mode flag | HIGH |
| `app/t/[token]/page.tsx` | Use cookies not localStorage | HIGH |
| `app/api/auth/login/route.ts` | Add account lockout | MEDIUM |
| `next.config.mjs` | Add CORS headers | MEDIUM |
| `lib/rate-limit.ts` | Implement Redis backend | MEDIUM |
| Multiple API routes | Remove stack traces | MEDIUM |
| `components/setup-guard.tsx` | Remove localStorage caching | LOW |
| `lib/supabase/server.ts` | Add session timeout | LOW |
| Create new file | Add audit logging | LOW |

---

## CONCLUSION

Dispatchly has a **solid security foundation** with proper authentication, authorization, and basic protections in place. The HIGH severity issues primarily involve:
- Missing CSRF protection
- Plain text credential storage
- XSS vulnerabilities from unsanitized input
- Token storage in vulnerable localStorage

These should be addressed before production deployment. The MEDIUM and LOW severity issues represent defense-in-depth improvements that would further harden the application.

**Risk Assessment:** MEDIUM - Issues are addressable but require immediate attention.

---

*Report generated: 2026-03-19*  
*Auditor: OpenClaw Security Audit Sub-Agent*
