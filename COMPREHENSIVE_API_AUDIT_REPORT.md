# Dispatchly API Audit Report

**Audit Date:** 2026-03-19  
**Auditor:** Claude (AI Code Review)  
**Scope:** All `/app/api/**/route.ts` files, webhooks, cron jobs

---

## Executive Summary

This audit covers **33 API route files** across authentication, jobs, technicians, billing, SMS, webhooks, uploads, and public endpoints. The codebase shows good security practices overall but has several **CRITICAL** and **HIGH** severity issues that need immediate attention.

### Issue Summary
| Severity | Count |
|----------|-------|
| CRITICAL | 4 |
| HIGH | 8 |
| MEDIUM | 12 |
| LOW | 6 |
| **Total** | **30** |

---

## CRITICAL Issues (Require Immediate Fix)

### 1. Missing Authorization Check in `/api/jobs/[id]/status`
**File:** `app/api/jobs/[id]/status/route.ts`  
**Line:** 36-90  
**Severity:** CRITICAL

**Bug:** The PATCH endpoint does NOT verify that the job belongs to the authenticated admin before updating. It only checks authentication, not ownership.

```typescript
// Current code - NO ownership check:
const { data: currentJob, error: fetchError } = await supabase
  .from("jobs")
  .select("status, assigned_tech_ids")
  .eq("id", id)  // <-- Only checks by ID, not admin_id!
  .single()
```

**Fix:** Add ownership verification:
```typescript
const { data: currentJob, error: fetchError } = await supabase
  .from("jobs")
  .select("status, assigned_tech_ids")
  .eq("id", id)
  .eq("admin_id", user.id)  // <-- ADD THIS
  .single()
```

---

### 2. Missing Authorization Check in `/api/jobs/[id]/updates` GET
**File:** `app/api/jobs/[id]/updates/route.ts`  
**Line:** 138-168  
**Severity:** CRITICAL

**Bug:** The GET endpoint does NOT verify job ownership before returning updates. Any authenticated user can view updates for any job by ID.

**Fix:** Add ownership check before fetching updates:
```typescript
// Add before fetching updates:
const { data: jobCheck } = await supabase
  .from("jobs")
  .select("id")
  .eq("id", id)
  .eq("admin_id", user.id)
  .single()

if (!jobCheck) {
  return NextResponse.json({ error: "Job not found" }, { status: 404 })
}
```

---

### 3. Mass Assignment Vulnerability in `/api/jobs/[id]/accept`
**File:** `app/api/jobs/[id]/accept/route.ts`  
**Line:** 60-110  
**Severity:** CRITICAL

**Bug:** The endpoint accepts `technician_id` from request body without verifying the technician belongs to the same company as the job. It only checks if the technician belongs to the authenticated admin, but not if the job belongs to that admin.

**Fix:** Verify job ownership before accepting:
```typescript
// Add after fetching job:
if (job.admin_id !== user.id) {
  return NextResponse.json({ error: "Job not found" }, { status: 404 })
}
```

---

### 4. SQL Injection Risk in `/api/sms/incoming`
**File:** `app/api/sms/incoming/route.ts`  
**Line:** 100-105  
**Severity:** CRITICAL

**Bug:** Phone number is concatenated directly into a query filter without sanitization:
```typescript
.or(`customer_phone.ilike.%${normalizedPhone}%`)  // <-- SQL injection risk
```

**Fix:** Use parameterized queries:
```typescript
// Use .ilike() with proper escaping or use .or() with filter objects
const { data: recentJob } = await supabase
  .from("jobs")
  .select("id, customer_name, assigned_tech_ids")
  .ilike("customer_phone", `%${normalizedPhone}%`)  // Safe method
```

---

## HIGH Severity Issues

### 5. Inconsistent Response Format in `/api/jobs`
**File:** `app/api/jobs/route.ts`  
**Line:** 96, 147  
**Severity:** HIGH

**Bug:** GET returns different formats for demo mode vs normal:
- Demo mode: `return NextResponse.json([])` (array)
- Normal: Returns `{ jobs: [], pagination: {...} }` (object)

This causes frontend parsing errors.

**Fix:** Return consistent format:
```typescript
// In demo mode:
return NextResponse.json({ jobs: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0, hasMore: false }})
```

---

### 6. Missing Error Response in Demo Mode
**File:** `app/api/technicians/route.ts`  
**Line:** 17  
**Severity:** HIGH

**Bug:** GET returns empty array `[]` in demo mode instead of proper error response.

**Fix:** Return proper error:
```typescript
if (!supabase) {
  return NextResponse.json({ error: "Database not configured" }, { status: 503 })
}
```

---

### 7. Race Condition in `/api/technicians` POST
**File:** `app/api/technicians/route.ts`  
**Line:** 98-110  
**Severity:** HIGH

**Bug:** The technician limit check is not atomic. Between count and insert, another request could create a technician, exceeding the limit.

**Fix:** Use database constraints or transactions:
```typescript
// Add unique constraint on (admin_id, id) with partial index
// Or use transaction:
const { data: technician, error } = await supabase.rpc('create_technician_if_under_limit', {
  p_admin_id: user.id,
  p_name: name,
  p_email: email,
  p_phone: phone,
  p_pin: pin
})
```

---

### 8. No Input Length Validation on Notes
**File:** Multiple files  
**Severity:** HIGH

**Bug:** Notes fields accept unlimited length, could cause DoS via large payloads.

**Fix:** Add validation:
```typescript
if (notes && notes.length > 5000) {
  return NextResponse.json({ error: "Notes too long (max 5000 chars)" }, { status: 400 })
}
```

---

### 9. Missing CSRF Protection on State-Changing Endpoints
**File:** All POST/PATCH/DELETE endpoints  
**Severity:** HIGH

**Bug:** No CSRF tokens used. While modern browsers have SameSite cookies, additional CSRF protection is recommended.

**Fix:** Implement CSRF tokens or use double-submit cookie pattern.

---

### 10. Weak Token Generation in `/api/jobs/[id]/updates`
**File:** `app/api/jobs/[id]/updates/route.ts`  
**Line:** 107  
**Severity:** HIGH

**Bug:** Uses `randomBytes(16).toString("hex")` which is 32 chars, but token check in public endpoint expects 32 hex chars (line 27). Inconsistent with comment.

**Fix:** Use consistent token length:
```typescript
const token = randomBytes(32).toString("hex")  // 64 chars for better security
```

---

### 11. No Request Body Size Limit
**File:** Multiple POST endpoints  
**Severity:** HIGH

**Bug:** No request body size limits could lead to memory exhaustion attacks.

**Fix:** Add body size limits in Next.js config or validate:
```typescript
const contentLength = request.headers.get('content-length')
if (contentLength && parseInt(contentLength) > 1024 * 1024) {  // 1MB limit
  return NextResponse.json({ error: "Request too large" }, { status: 413 })
}
```

---

### 12. Stripe Webhook Missing Idempotency Check
**File:** `app/api/webhooks/stripe/route.ts`  
**Severity:** HIGH

**Bug:** No idempotency key check for Stripe webhooks. Duplicate events could cause double-processing.

**Fix:** Store processed event IDs:
```typescript
const eventId = event.id
const { data: existing } = await supabase
  .from("stripe_webhook_events")
  .select("id")
  .eq("event_id", eventId)
  .single()

if (existing) {
  return NextResponse.json({ received: true, duplicate: true })
}

await supabase.from("stripe_webhook_events").insert({ event_id: eventId })
```

---

## MEDIUM Severity Issues

### 13. Inconsistent Error Message Format
**File:** Multiple files  
**Severity:** MEDIUM

**Bug:** Error messages use different formats - some strings, some objects with `error` key, some with `details`.

**Examples:**
- `{ error: "Unauthorized" }`
- `{ error: "Failed to fetch", details: error.message }`
- `{ error: error.message || "Failed" }`

**Fix:** Standardize error format:
```typescript
interface ApiError {
  error: string
  code?: string
  details?: string
}
```

---

### 14. Missing Index Hint Comments
**File:** All database queries  
**Severity:** MEDIUM

**Bug:** No query optimization hints or comments about required database indexes.

**Required indexes:**
```sql
-- jobs table
CREATE INDEX idx_jobs_admin_status ON jobs(admin_id, status);
CREATE INDEX idx_jobs_scheduled ON jobs(scheduled_time);
CREATE INDEX idx_jobs_assigned_techs ON jobs USING GIN(assigned_tech_ids);

-- technicians table
CREATE INDEX idx_technicians_admin ON technicians(admin_id, is_active);

-- sms_logs table
CREATE INDEX idx_sms_logs_job ON sms_logs(job_id, created_at);
```

---

### 15. No Pagination in `/api/jobs/available`
**File:** `app/api/jobs/available/route.ts`  
**Line:** 35-44  
**Severity:** MEDIUM

**Bug:** No pagination support. Could return thousands of jobs.

**Fix:** Add pagination:
```typescript
const { searchParams } = new URL(request.url)
const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
const offset = (page - 1) * limit

.range(offset, offset + limit - 1)
```

---

### 16. Missing HTTP Cache Headers
**File:** GET endpoints without cache control  
**Severity:** MEDIUM

**Bug:** No cache headers on GET requests that could benefit from caching.

**Fix:** Add appropriate cache headers:
```typescript
// For public job endpoint (short cache):
response.headers.set('Cache-Control', 'public, max-age=60')

// For private data (no cache):
response.headers.set('Cache-Control', 'private, no-cache, no-store')
```

---

### 17. Unclear 503 vs 401 Priority in `/api/config`
**File:** `app/api/config/route.ts`  
**Line:** 6-16  
**Severity:** MEDIUM

**Bug:** Returns configuration even if not authenticated. Exposes partial information.

**Fix:** Return 503 if not configured, don't expose internal state:
```typescript
export async function GET() {
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  if (!configured) {
    return NextResponse.json({ configured: false }, { status: 503 })
  }
  
  return NextResponse.json({ configured: true })
}
```

---

### 18. `/api/technicians/[techId]/jobs` Missing Pagination
**File:** `app/api/technicians/[techId]/jobs/route.ts`  
**Line:** 37-42  
**Severity:** MEDIUM

**Bug:** No pagination on job listing. Technicians with many jobs could cause performance issues.

---

### 19. Photo Cleanup Uses Wrong Table Name
**File:** `app/api/cron/photo-cleanup/route.ts`  
**Line:** 77  
**Severity:** MEDIUM

**Bug:** Queries table "photos" but actual table is "job_photos" based on other files.

**Fix:**
```typescript
.from("job_photos")  // Not "photos"
```

---

### 20. Missing Rate Limit on `/api/config`
**File:** `app/api/config/route.ts`  
**Severity:** MEDIUM

**Bug:** No rate limiting. Could be used for enumeration attacks.

---

### 21. Inconsistent Phone Validation
**File:** Multiple  
**Severity:** MEDIUM

**Bug:** Different regex patterns used for phone validation:
- `/^\+?[\d\s\-\(\)]{10,20}$/` in settings
- Manual normalization elsewhere

**Fix:** Create shared validation utility:
```typescript
// lib/validation.ts
export function validatePhone(phone: string): boolean {
  return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\D/g, ''))
}
```

---

### 22. No Schema Validation on Request Body
**File:** All POST/PATCH endpoints  
**Severity:** MEDIUM

**Bug:** No Zod or Joi validation. Manual validation is error-prone.

**Fix:** Use Zod:
```typescript
import { z } from 'zod'

const CreateJobSchema = z.object({
  customer_name: z.string().min(1).max(100),
  customer_phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,20}$/),
  // ...
})
```

---

### 23. Magic Link Token Not Hashed in DB
**File:** `app/api/technicians/invite/route.ts`  
**Severity:** MEDIUM

**Bug:** Stores raw token in database. Should store hash only.

**Fix:**
```typescript
import { createHash } from 'crypto'
const tokenHash = createHash('sha256').update(token).digest('hex')
// Store tokenHash, not token
```

---

### 24. No Audit Logging
**File:** All state-changing endpoints  
**Severity:** MEDIUM

**Bug:** No audit trail for important actions (job updates, deletions, etc.).

**Fix:** Create audit log table and helper:
```typescript
await logAudit({
  action: 'job_updated',
  user_id: user.id,
  resource_type: 'job',
  resource_id: jobId,
  changes: { status: { from: oldStatus, to: newStatus }}
})
```

---

## LOW Severity Issues

### 25. Missing Type Safety on `any` Usage
**File:** `app/api/webhooks/stripe/route.ts`  
**Line:** Multiple  
**Severity:** LOW

**Bug:** Uses `as any` type assertions which bypass TypeScript safety.

**Fix:** Define proper types or use Stripe's official types.

---

### 26. Console Logs in Production
**File:** Multiple files with `console.log`  
**Severity:** LOW

**Bug:** Debug logs like `[API] Step 1: Creating Supabase client...` should not be in production.

**Fix:** Use proper logging:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[API] Debug:', message)
}
```

---

### 27. Unused Imports
**File:** Various  
**Severity:** LOW

**Bug:** Some files have unused imports that clutter the code.

**Example:** `app/api/jobs/[id]/accept/route.ts` imports `sendSMS` but doesn't use it (uses inline fetch instead).

---

### 28. Commented Code
**File:** Various  
**Severity:** LOW

**Bug:** Dead code in comments:
```typescript
// This would integrate with your SMS service
// For now, we'll just return success
```

---

### 29. Inconsistent String Quotes
**File:** All files  
**Severity:** LOW

**Bug:** Mix of single and double quotes throughout codebase.

**Fix:** Standardize on one style (recommend double for JSX attributes, single for JS).

---

### 30. Missing JSDoc Comments
**File:** All files  
**Severity:** LOW

**Bug:** Most functions lack documentation comments describing parameters and return types.

---

## Security Recommendations

### Database Security
1. **Enable Row Level Security (RLS)** on all tables
2. **Use service role key** only in server-side code
3. **Add foreign key constraints** with ON DELETE behaviors
4. **Enable audit logging** at database level

### API Security
1. **Implement API versioning** (e.g., `/api/v1/jobs`)
2. **Add request signing** for webhooks
3. **Use HMAC** for sensitive token generation
4. **Implement circuit breakers** for external services (Twilio, Stripe)

### Infrastructure
1. **Use environment-specific secrets** (dev/staging/prod)
2. **Enable DDoS protection** (Cloudflare/AWS Shield)
3. **Set up log aggregation** (Datadog, LogRocket)
4. **Configure security headers** (HSTS, CSP, X-Frame-Options)

---

## Testing Recommendations

### Unit Tests
- Test each endpoint with valid/invalid inputs
- Mock Supabase responses
- Verify rate limiting behavior

### Integration Tests
- Test full user workflows
- Verify database state changes
- Test error scenarios

### Security Tests
- SQL injection attempts
- IDOR (Insecure Direct Object Reference) tests
- CSRF attempts
- Rate limit bypass attempts

---

## Files Reviewed

| File | Lines | Issues |
|------|-------|--------|
| `app/api/auth/login/route.ts` | 97 | 0 |
| `app/api/auth/logout/route.ts` | 44 | 0 |
| `app/api/auth/magic-link/route.ts` | 110 | 1 (MEDIUM) |
| `app/api/auth/signup/route.ts` | 113 | 0 |
| `app/api/auth/user-profile/route.ts` | 194 | 2 (LOW) |
| `app/api/auth/user-role/route.ts` | 59 | 0 |
| `app/api/auth/validate-token/route.ts` | 86 | 0 |
| `app/api/billing/create-checkout/route.ts` | 98 | 1 (LOW) |
| `app/api/billing/portal/route.ts` | 63 | 0 |
| `app/api/billing/subscription/route.ts` | 131 | 0 |
| `app/api/config/route.ts` | 16 | 2 (MEDIUM) |
| `app/api/cron/photo-cleanup/route.ts` | 125 | 2 (MEDIUM) |
| `app/api/jobs/[id]/accept/route.ts` | 140 | 2 (1 CRITICAL) |
| `app/api/jobs/[id]/route.ts` | 178 | 0 |
| `app/api/jobs/[id]/status/route.ts` | 166 | 1 (CRITICAL) |
| `app/api/jobs/[id]/updates/route.ts` | 168 | 2 (1 CRITICAL) |
| `app/api/jobs/available/route.ts` | 55 | 1 (MEDIUM) |
| `app/api/jobs/route.ts` | 152 | 2 (1 HIGH) |
| `app/api/public/job/[token]/route.ts` | 113 | 0 |
| `app/api/settings/route.ts` | 127 | 1 (MEDIUM) |
| `app/api/setup/company/route.ts` | 47 | 0 |
| `app/api/setup/owner/route.ts` | 59 | 0 |
| `app/api/sms/incoming/route.ts` | 440 | 2 (1 CRITICAL) |
| `app/api/sms/webhook/route.ts` | 143 | 1 (MEDIUM) |
| `app/api/technicians/[techId]/jobs/route.ts` | 54 | 1 (MEDIUM) |
| `app/api/technicians/[techId]/route.ts` | 103 | 0 |
| `app/api/technicians/accept-invite/route.ts` | 75 | 0 |
| `app/api/technicians/invite/route.ts` | 195 | 1 (MEDIUM) |
| `app/api/technicians/route.ts` | 141 | 2 (1 HIGH) |
| `app/api/templates/route.ts` | 85 | 1 (MEDIUM) |
| `app/api/upload/logo/route.ts` | 76 | 0 |
| `app/api/upload/route.ts` | 147 | 1 (LOW) |
| `app/api/webhooks/stripe/route.ts` | 190 | 1 (HIGH) |

---

## Priority Fix Order

### Week 1 (Critical Security)
1. Fix authorization checks in `/api/jobs/[id]/status` (CRITICAL)
2. Fix authorization checks in `/api/jobs/[id]/updates` GET (CRITICAL)
3. Fix authorization in `/api/jobs/[id]/accept` (CRITICAL)
4. Fix SQL injection in `/api/sms/incoming` (CRITICAL)

### Week 2 (High Priority)
5. Add Stripe webhook idempotency (HIGH)
6. Fix inconsistent response formats (HIGH)
7. Add request body size limits (HIGH)
8. Fix race condition in technician creation (HIGH)

### Week 3 (Medium Priority)
9. Add pagination to all listing endpoints
10. Add request validation schemas (Zod)
11. Implement audit logging
12. Fix table name inconsistency in photo cleanup

### Week 4 (Low Priority)
13. Standardize error formats
14. Clean up console logs
15. Add JSDoc comments
16. Fix code style inconsistencies

---

## Conclusion

The Dispatchly API has a solid foundation with good use of Supabase RLS, rate limiting, and proper HTTP status codes. However, **4 CRITICAL authorization issues** must be fixed immediately to prevent data leakage between users. The HIGH severity issues around webhook handling and input validation should be addressed in the next sprint.

**Overall Security Score: 6.5/10** (Would be 8.5/10 after fixing CRITICAL issues)

**Recommended Action:** Deploy authorization fixes before next production release.
