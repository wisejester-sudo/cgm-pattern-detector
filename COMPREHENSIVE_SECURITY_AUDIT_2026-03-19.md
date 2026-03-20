# COMPREHENSIVE SECURITY AUDIT REPORT - DISPATCHLY
**Date:** 2026-03-19  
**Auditor:** OpenClaw Security Sub-Agent  
**Scope:** Full codebase including API routes, authentication flows, RLS policies, frontend components, and infrastructure configuration  

---

## EXECUTIVE SUMMARY

| Severity | Count | Description |
|----------|-------|-------------|
| **CRITICAL** | 4 | Immediate risk requiring urgent fixes |
| **HIGH** | 8 | Significant security vulnerabilities |
| **MEDIUM** | 12 | Moderate risk issues |
| **LOW** | 6 | Minor security improvements needed |

**Overall Risk Assessment:** HIGH - Multiple critical and high severity vulnerabilities present

---

## CRITICAL SEVERITY VULNERABILITIES

### 1. PLAIN TEXT PIN STORAGE
**File:** `app/api/technicians/accept-invite/route.ts` (Line 52-56)  
**Severity:** CRITICAL

**Issue:** Technician PINs are stored in plain text in the database. This is a severe security violation.

**Current Code:**
```typescript
.update({
  pin: pin,  // ⚠️ PLAIN TEXT STORAGE
  invite_accepted_at: new Date().toISOString(),
  // ...
})
```

**Impact:** If database is compromised, attacker gains immediate access to all technician accounts.

**Suggested Fix:**
```typescript
import bcrypt from 'bcryptjs'

// Hash PIN before storing
const saltRounds = 10
const hashedPin = await bcrypt.hash(pin, saltRounds)

.update({
  pin: hashedPin,
  // ...
})

// When verifying:
const isValidPin = await bcrypt.compare(inputPin, storedHash)
```

---

### 2. PLAIN TEXT MAGIC LINK TOKENS
**File:** `app/api/technicians/invite/route.ts` (Line 75-82)  
**Severity:** CRITICAL

**Issue:** Magic link tokens stored in database in plain text, violating security best practices.

**Current Code:**
```typescript
.update({
  magic_link_token: token,  // ⚠️ PLAIN TEXT
  magic_link_expires_at: expiresAt.toISOString(),
  // ...
})
```

**Impact:** Database breach exposes all active magic links, allowing account takeover.

**Suggested Fix:**
```typescript
import { createHash } from 'crypto'

// Store hash, not token
const tokenHash = createHash('sha256').update(token).digest('hex')

.update({
  magic_link_token_hash: tokenHash,
  // ...
})

// When validating:
const inputHash = createHash('sha256').update(providedToken).digest('hex')
const isValid = inputHash === storedHash
```

---

### 3. MISSING CSRF PROTECTION
**Files:** All state-changing API routes  
**Severity:** CRITICAL

**Issue:** Application lacks Cross-Site Request Forgery (CSRF) protection. API routes accept requests without CSRF token validation.

**Evidence:**
- No CSRF token generation in authentication flows
- No double-submit cookie pattern
- API routes accept POST/PUT/DELETE without origin verification

**Impact:** Attackers can trick authenticated users into performing unintended actions (job deletion, technician updates, etc.)

**Suggested Fix:**
```typescript
// lib/csrf.ts
import { createHash, randomBytes } from 'crypto'

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

export function validateCSRFToken(token: string, header: string): boolean {
  return token === header
}

// Apply to middleware or route handlers:
const csrfToken = request.headers.get('x-csrf-token')
const sessionToken = await getSessionCSRFToken()
if (!validateCSRFToken(csrfToken, sessionToken)) {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
}
```

---

### 4. DEMO MODE AUTHENTICATION BYPASS
**File:** `app/api/auth/login/route.ts` (Line 30-33)  
**Severity:** CRITICAL

**Issue:** Demo mode accepts any credentials when Supabase env vars are missing, which could allow authentication bypass in production.

**Current Code:**
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  // Demo mode - accept any credentials
  return NextResponse.json({ success: true, demo: true })
}
```

**Impact:** If env vars are accidentally unset in production, entire authentication is bypassed.

**Suggested Fix:**
```typescript
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

if (!supabaseConfigured && !DEMO_MODE) {
  return NextResponse.json(
    { error: 'Service unavailable' },
    { status: 503 }
  )
}

if (DEMO_MODE) {
  console.warn('[AUTH] Running in DEMO MODE')
  return NextResponse.json({ success: true, demo: true })
}
```

---

## HIGH SEVERITY VULNERABILITIES

### 5. XSS VULNERABILITIES - UNSANITIZED USER INPUT
**Files:** Multiple components and API routes  
**Severity:** HIGH

**Issue:** User input (job notes, customer names, SMS messages, technician names) is rendered without sanitization.

**Evidence:**
- No DOMPurify or similar library usage found
- Template rendering in `lib/store.ts` directly interpolates user data
- SMS messages displayed without sanitization

**Impact:** Stored XSS attacks possible - malicious JavaScript injected via job notes, customer names, etc.

**Suggested Fix:**
```typescript
// Install: npm install dompurify
import DOMPurify from 'dompurify'

// Sanitize before rendering
const sanitizedNotes = DOMPurify.sanitize(job.notes)

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

### 6. IN-MEMORY RATE LIMITING NOT PRODUCTION-READY
**File:** `lib/rate-limit.ts` (Lines 1-30)  
**Severity:** HIGH

**Issue:** Rate limiting uses in-memory Map which won't work across multiple server instances (Vercel serverless).

**Current Code:**
```typescript
const store: RateLimitStore = new Map()  // ⚠️ In-memory only
```

**Impact:** Rate limits can be bypassed by distributing requests across instances; no persistent tracking.

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

### 7. SENSITIVE TOKENS IN LOCALSTORAGE (XSS RISK)
**File:** `app/t/[token]/page.tsx` (implied by magic link flow)  
**Severity:** HIGH

**Issue:** Magic tokens stored in localStorage, which is vulnerable to XSS attacks.

**Evidence:**
- Magic link tokens passed via URL and stored client-side
- No httpOnly cookie usage for technician authentication

**Impact:** XSS attack can steal tokens from localStorage, allowing account takeover.

**Suggested Fix:**
```typescript
// Use httpOnly cookies instead of localStorage
const response = NextResponse.json({ success: true })
response.cookies.set('tech_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7,
})
```

---

### 8. WEAK CONTENT SECURITY POLICY
**File:** `next.config.mjs` (Lines 30-40)  
**Severity:** HIGH

**Issue:** CSP allows 'unsafe-eval' and 'unsafe-inline' which reduces XSS protection.

**Current Code:**
```javascript
"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
"style-src 'self' 'unsafe-inline'",
```

**Impact:** XSS protection significantly weakened; inline scripts allowed.

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

### 9. NO ACCOUNT LOCKOUT MECHANISM
**File:** `app/api/auth/login/route.ts`  
**Severity:** HIGH

**Issue:** Failed login attempts don't lock accounts or implement exponential backoff.

**Current State:** Only IP-based rate limiting (5 attempts/minute)

**Impact:** Brute-force attacks possible against user passwords.

**Suggested Fix:**
```typescript
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes

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

### 10. STACK TRACES IN ERROR RESPONSES
**File:** `app/api/technicians/invite/route.ts` (Line 165)  
**Severity:** HIGH

**Issue:** Error responses include stack traces in development mode, which aids attackers.

**Current Code:**
```typescript
return NextResponse.json(
  { 
    error: 'Internal server error',
    details: error?.message,
    stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
  },
  { status: 500 }
)
```

**Impact:** Information disclosure aids attackers in understanding system architecture.

**Suggested Fix:**
```typescript
return NextResponse.json(
  { error: 'Internal server error' },
  { status: 500 }
)
// Log stack trace server-side only
console.error('[API] Error:', error)
```

---

### 11. MISSING INPUT LENGTH VALIDATION
**Files:** Multiple API routes  
**Severity:** HIGH

**Issue:** Most string fields don't have maximum length validation, potentially causing DoS.

**Evidence:**
- `app/api/jobs/route.ts`: No length validation on customer_name, notes
- `app/api/technicians/route.ts`: No length validation on name field
- `app/api/settings/route.ts`: No max length on company fields

**Impact:** DoS via oversized payloads; database errors from field overflow.

**Suggested Fix:**
```typescript
// Add to all endpoints accepting string input
if (customer_name && customer_name.length > 255) {
  return NextResponse.json(
    { error: 'customer_name too long (max 255 chars)' },
    { status: 400 }
  )
}
if (notes && notes.length > 5000) {
  return NextResponse.json(
    { error: 'notes too long (max 5000 chars)' },
    { status: 400 }
  )
}
```

---

### 12. CRON ENDPOINT AUTH BYPASS WHEN SECRET MISSING
**File:** `app/api/cron/photo-cleanup/route.ts` (Lines 21-26)  
**Severity:** HIGH

**Issue:** If `CRON_SECRET` is not set, authentication is skipped entirely.

**Current Code:**
```typescript
if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
  // Only checks if expectedSecret is set!
}
```

**Impact:** Cron endpoint becomes publicly accessible without proper configuration.

**Suggested Fix:**
```typescript
if (!expectedSecret) {
  return NextResponse.json(
    { error: 'CRON_SECRET not configured' },
    { status: 503 }
  )
}
if (authHeader !== `Bearer ${expectedSecret}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## MEDIUM SEVERITY VULNERABILITIES

### 13. CONFIG ENDPOINT EXPOSES CREDENTIALS
**File:** `app/api/config/route.ts` (Lines 6-10)  
**Severity:** MEDIUM

**Issue:** The `/api/config` endpoint returns `supabaseAnonKey` directly in response.

**Current Code:**
```typescript
const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,  // EXPOSED
  configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
}
```

**Suggested Fix:**
```typescript
const config = {
  configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
}
```

---

### 14. PUBLIC JOB TOKEN MISSING COMPANY FILTER
**File:** `app/api/public/job/[token]/route.ts` (Line 95-99)  
**Severity:** MEDIUM

**Issue:** Company settings query uses `.single()` without filtering by admin_id.

**Current Code:**
```typescript
const { data: settings } = await supabase
  .from("company_settings")
  .select("company_name, logo_url, primary_color, tagline")
  .single()  // No filter!
```

**Suggested Fix:**
```typescript
const { data: settings } = await supabase
  .from("company_settings")
  .select("company_name, logo_url, primary_color, tagline")
  .eq("admin_id", job.admin_id)
  .single()
```

---

### 15. MAGIC LINK VALIDATION INCONSISTENT ERROR FORMAT
**File:** `app/api/auth/validate-token/route.ts` (Lines 123-126)  
**Severity:** MEDIUM

**Issue:** Catch block returns `{ error: string }` but frontend expects `{ valid: boolean, error?: string }`.

**Suggested Fix:**
```typescript
} catch (error) {
  return NextResponse.json(
    { valid: false, error: "Internal server error" },
    { status: 500 }
  )
}
```

---

### 16. MISSING CORS CONFIGURATION
**Files:** All API routes  
**Severity:** MEDIUM

**Issue:** No explicit CORS configuration for API routes.

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

### 17. NO AUDIT LOGGING
**Files:** N/A (Missing feature)  
**Severity:** MEDIUM

**Issue:** Sensitive operations (login, logout, job creation, technician deletion) are not logged.

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
```

---

### 18. INCONSISTENT ERROR RESPONSE FORMATS
**Files:** Multiple API routes  
**Severity:** MEDIUM

**Issue:** Error responses use inconsistent formats across the API.

**Examples:**
- `{ error: string }` - Most common
- `{ valid: false, error: string }` - Validate token
- `{ success: false, error: string }` - Photo cleanup

**Suggested Fix:** Standardize on a consistent error format with error codes.

---

### 19. NO HTTPS ENFORCEMENT
**Files:** Multiple  
**Severity:** MEDIUM

**Issue:** No explicit check to ensure authentication happens over HTTPS in production.

**Suggested Fix:**
```typescript
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

### 20. SESSION FIXATION RISK
**Files:** Authentication routes  
**Severity:** MEDIUM

**Issue:** No session regeneration after successful login.

**Note:** Supabase Auth handles this internally, but verify implementation.

---

### 21. LOCALSTORAGE CACHING OF SETUP STATUS
**File:** `components/setup-guard.tsx` (implied)  
**Severity:** MEDIUM

**Issue:** Setup verification status cached in localStorage without server validation.

**Suggested Fix:** Always verify setup status with server on mount.

---

### 22. FILE UPLOAD MISSING CONTENT VALIDATION
**File:** `app/api/upload/logo/route.ts` (Lines 24-27)  
**Severity:** MEDIUM

**Issue:** Only checks MIME type but doesn't validate actual file content, allowing spoofed uploads.

**Suggested Fix:**
```typescript
import FileType from 'file-type'

const fileType = await FileType.fromBuffer(buffer)
if (!fileType || !['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)) {
  return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
}
```

---

### 23. RLS POLICY GAPS
**Files:** `supabase/schema.sql`, `supabase/migrations/004_rls_policies_and_indexes.sql`  
**Severity:** MEDIUM

**Issues Found:**
1. RLS enabled but some policies use subqueries which can be bypassed
2. No RLS on `public_job_tokens` table
3. `subscriptions` and `payments` tables need RLS policies

**Suggested Fix:** Add explicit RLS policies for all tables with ownership checks.

---

### 24. MISSING SUBSCRIPTION EXISTENCE CHECK
**File:** `app/api/billing/subscription/route.ts` (Lines 99-112)  
**Severity:** MEDIUM

**Issue:** Attempts to update subscription without verifying it exists first.

**Suggested Fix:**
```typescript
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('id')
  .eq('company_id', company.id)
  .single()

if (!subscription) {
  return NextResponse.json(
    { error: 'No active subscription found' },
    { status: 404 }
  )
}
```

---

## LOW SEVERITY VULNERABILITIES

### 25. INCONSISTENT CONSOLE LOG PREFIXES
**Files:** Multiple  
**Severity:** LOW

**Issue:** Different log prefixes make debugging harder.

**Suggested Fix:** Standardize on `[API:<category>]` format.

---

### 26. DEMO MODE RESPONSES INCONSISTENT
**Files:** Multiple  
**Severity:** LOW

**Issue:** Demo mode returns different response formats across endpoints.

**Suggested Fix:** Standardize demo mode responses.

---

### 27. MISSING SECURITY HEADERS ON API ROUTES
**Files:** All API routes  
**Severity:** LOW

**Issue:** API responses don't include security headers (already set in next.config.mjs but verify applied to API).

---

### 28. INCONSISTENT PAGINATION RESPONSE FORMATS
**Files:** `app/api/jobs/route.ts`, `app/api/technicians/route.ts`  
**Severity:** LOW

**Issue:** Different naming conventions (jobs vs technicians) make client handling inconsistent.

**Suggested Fix:** Create a standard pagination wrapper interface.

---

### 29. NO EXPLICIT SESSION TIMEOUT
**Files:** N/A  
**Severity:** LOW

**Issue:** No explicit session timeout configuration.

**Suggested Fix:**
```typescript
{
  auth: {
    maxAge: 60 * 60 * 24, // 24 hours
  }
}
```

---

### 30. TYPE SAFETY CONCERNS
**Files:** Multiple routes  
**Severity:** LOW

**Issue:** Several routes use `any` types which bypass TypeScript's type checking.

**Example:** `app/api/webhooks/stripe/route.ts` uses `as any` type assertions.

---

## RLS POLICY AUDIT

### Tables with RLS Enabled ✅
- `companies` ✅
- `technicians` ✅
- `jobs` ✅
- `updates` ✅
- `photos` ✅
- `sms_logs` ✅

### Tables Missing RLS ⚠️
- `public_job_tokens` - **CRITICAL**
- `subscriptions` - Need policies
- `payments` - Need policies
- `company_settings` - Verify policies exist

### Recommended RLS Policies:
```sql
-- public_job_tokens
CREATE POLICY "Job tokens accessible by job owner" ON public_job_tokens
  FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE admin_id = auth.uid())
  );

-- subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );
```

---

## POSITIVE SECURITY MEASURES ✅

The following security measures are properly implemented:

1. **✅ Authentication Middleware** - Proper session handling via Supabase
2. **✅ Route Protection** - Public routes defined, API routes protected
3. **✅ Authorization Checks** - Ownership verification in most routes
4. **✅ Rate Limiting** - Implemented (though in-memory only)
5. **✅ Security Headers** - X-Frame-Options, CSP, HSTS configured
6. **✅ Stripe Webhook Validation** - Proper signature verification
7. **✅ Twilio Webhook Validation** - Signature validation in production
8. **✅ Input Validation** - Email, phone, PIN format validation
9. **✅ Password Requirements** - Minimum length enforced by Supabase
10. **✅ Magic Link Expiration** - 7-day expiration with cleanup
11. **✅ Environment Context** - Environment tracking for magic links
12. **✅ SQL Injection Prevention** - Supabase client parameterization
13. **✅ Pagination** - Prevents DoS from large result sets

---

## IMMEDIATE ACTION ITEMS

### Must Fix (Before Production):
1. Hash all PINs with bcrypt (CRITICAL)
2. Hash magic link tokens before storage (CRITICAL)
3. Implement CSRF protection (CRITICAL)
4. Add explicit DEMO_MODE flag (CRITICAL)
5. Add XSS sanitization for all user input (HIGH)
6. Remove stack traces from API responses (HIGH)
7. Implement Redis-based rate limiting (HIGH)
8. Strengthen CSP headers (HIGH)

### Should Fix (Short-term):
9. Add account lockout mechanism
10. Add CORS configuration
11. Implement audit logging
12. Add input length validation
13. Fix RLS policy gaps
14. Add HTTPS enforcement

### Nice to Have (Long-term):
15. Standardize error response formats
16. Add API versioning
17. Implement request/response validation middleware (Zod)
18. Add comprehensive API testing suite

---

## FILES REQUIRING MODIFICATION

| File | Issue | Severity |
|------|-------|----------|
| `app/api/technicians/accept-invite/route.ts` | Hash PINs | CRITICAL |
| `app/api/technicians/invite/route.ts` | Hash magic tokens | CRITICAL |
| All API routes | Add CSRF protection | CRITICAL |
| `app/api/auth/login/route.ts` | Add demo mode flag | CRITICAL |
| `lib/store.ts` | Add XSS sanitization | HIGH |
| `lib/rate-limit.ts` | Implement Redis | HIGH |
| `next.config.mjs` | Strengthen CSP | HIGH |
| All API routes | Remove stack traces | HIGH |
| All API routes | Add input length validation | HIGH |
| `app/api/cron/photo-cleanup/route.ts` | Fix auth bypass | HIGH |
| `app/api/config/route.ts` | Remove credential exposure | MEDIUM |
| `app/api/public/job/[token]/route.ts` | Add company filter | MEDIUM |
| `supabase/schema.sql` | Add missing RLS | MEDIUM |

---

## CONCLUSION

Dispatchly has **implemented strong foundational security** with proper authentication, authorization, and basic protections. However, **several critical and high-severity vulnerabilities** require immediate attention before production deployment:

**Critical Issues:**
- Plain text credential storage (PINs and magic tokens)
- Missing CSRF protection
- Potential authentication bypass in demo mode

**High Priority Issues:**
- XSS vulnerabilities from unsanitized input
- Inadequate rate limiting for production
- Weak CSP configuration
- Information disclosure in error messages

**Risk Assessment:** HIGH - These issues are addressable but require immediate attention.

---

*Report generated: 2026-03-19*  
*Auditor: OpenClaw Security Audit Sub-Agent*
