# TypeScript Type Consistency Audit - Dispatchly

**Date:** 2026-03-19
**Auditor:** AI Subagent
**Scope:** `/lib/types.ts`, `/lib/database.types.ts`, `/lib/store.ts`, `/app/api/**/*.ts`, `/app/**/*.tsx`, `/components/**/*.tsx`, `/hooks/**/*.ts`

---

## Executive Summary

| Category | Count | Severity |
|----------|-------|----------|
| Critical Type Mismatches | 8 | 🔴 Critical |
| `any` Types | 18 | 🔴 Critical |
| Missing Error Types | 83 | 🟡 Medium |
| Missing Return Types | 25+ | 🟡 Medium |
| Type Assertions (`as`) | 12 | 🟡 Medium |
| Inconsistent Status Values | 4 | 🔴 Critical |
| Implicit `any` Parameters | 6 | 🟡 Medium |
| Optional vs Required Mismatches | 7 | 🟡 Medium |

---

## 🔴 Critical Issues

### 1. Status Type Inconsistency Between Types and Database

**Files:** `lib/types.ts` (Line 1), `lib/database.types.ts` (Line 72, 85, 98)

**Issue:** The `JobStatus` type and database status values are incompatible:

```typescript
// lib/types.ts - Line 1
export type JobStatus = 'available' | 'scheduled' | 'en_route' | 'working' | 'on_hold' | 'complete'

// lib/database.types.ts - Line 72
status: 'scheduled' | 'enroute' | 'working' | 'complete'
```

**Problems:**
- `'available'` status exists in types but NOT in database
- `'en_route'` in types vs `'enroute'` in database (underscore vs no underscore)
- `'on_hold'` status exists in types but NOT in database

**Impact:** Runtime errors when trying to insert jobs with status `'available'` or `'on_hold'`

**Suggested Fix:**
```typescript
// Align database types with application types
// Option 1: Update database schema to include all statuses
// Option 2: Create separate types for database vs application layer
export type DatabaseJobStatus = 'scheduled' | 'enroute' | 'working' | 'complete'
export type ApplicationJobStatus = DatabaseJobStatus | 'available' | 'en_route' | 'on_hold'
```

---

### 2. Dangerous `any` Types in API Routes

**File:** `app/api/sms/incoming/route.ts` (Lines 348, 404, 405, 476)

```typescript
// Line 348
function buildConfirmationMessage(status: string, job: any): string {

// Lines 404-405
async function notifyCustomerOfStatusChange(
  supabase: any,
  job: any,

// Line 476
async function logIncomingMessage(
  supabase: any,
```

**Suggested Fix:**
```typescript
interface JobInfo {
  id: string
  customer_name: string
  customer_phone: string
}

// Use typed Supabase client
function buildConfirmationMessage(status: string, job: JobInfo): string
```

---

**File:** `app/api/auth/validate-token/route.ts` (Line 76)

```typescript
// Line 76
const updates: any = { last_active_at: new Date().toISOString() }
```

**Suggested Fix:**
```typescript
interface TechnicianUpdates {
  last_active_at: string
  accessed_at?: string
}

const updates: TechnicianUpdates = { last_active_at: new Date().toISOString() }
```

---

**File:** `app/api/technicians/invite/route.ts` (Lines 48, 180)

```typescript
// Line 48
let technician: any

// Line 180
} catch (error: any) {
```

**Suggested Fix:**
```typescript
import type { Database } from '@/lib/database.types'
let technician: Database['public']['Tables']['technicians']['Row'] | null = null

// For error handling:
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error'
```

---

**File:** `app/settings/billing/page.tsx` (Lines 59, 76, 98)

```typescript
catch (err: any) {
```

**Suggested Fix:**
```typescript
catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'An error occurred'
  setError(message)
}
```

---

**File:** `app/api/webhooks/stripe/route.ts` (Lines 65, 123, 159, 187, 214)

```typescript
// Line 65
const sub = subscription as any

// Line 123
const inv = invoice as any

// Line 187
const subscription: any = event.data.object as Stripe.Subscription

// Line 214
} catch (error: any) {
```

**Suggested Fix:** Use proper Stripe type extensions:
```typescript
interface StripeSubscriptionWithPeriod extends Stripe.Subscription {
  current_period_start: number
  current_period_end: number
}

const sub = subscription as StripeSubscriptionWithPeriod
```

---

**File:** `components/job-timeline.tsx` (Line 86)

```typescript
const processedUpdates: JobUpdate[] = (updatesData || []).map((update: any) => {
```

**Suggested Fix:**
```typescript
// Define the database return type
interface UpdateFromDB {
  id: string
  created_at: string
  status: string
  notes: string | null
  technicians: { name: string } | null
}

const processedUpdates = (updatesData || []).map((update: UpdateFromDB): JobUpdate => {
```

---

### 3. Type Assertions Without Validation

**File:** `app/api/sms/incoming/route.ts` (Lines 257, 295)

```typescript
// Line 257
status: newStatus as any,

// Line 295
status: activeJob.status as any,
```

These are being inserted into the `updates` table which expects specific status values.

**Suggested Fix:** Validate status before assertion or use proper type narrowing.

---

**File:** `app/(dashboard)/jobs/[id]/page.tsx` (Line 408)

```typescript
onValueChange={(v) => handleStatusChange(v as JobStatus)}
```

**Suggested Fix:**
```typescript
onValueChange={(v) => {
  if (isValidJobStatus(v)) {
    handleStatusChange(v)
  }
}}
```

---

### 4. Missing `available` Status in Database Schema

**Files:** `lib/database.types.ts`, `lib/types.ts`

The application uses `'available'` as a job status (for unassigned jobs), but the database types don't include it. This causes issues when:
- Creating new jobs with `status: "available"` in `/app/api/jobs/route.ts`
- Querying jobs by status in filters

**Suggested Fix:** Add `'available'` to the database enum or handle it as a computed property based on `technician_id IS NULL`.

---

## 🟡 Medium Issues

### 5. Missing Error Types in Catch Blocks (83 instances)

**Files:** All API routes and many components

**Pattern Found:**
```typescript
try {
  // ...
} catch (error) {
  console.error(error)
}
```

**Suggested Fix:** Use `unknown` type with type guards:
```typescript
try {
  // ...
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  console.error(errorMessage)
}
```

**Files with this issue:**
- `app/api/settings/route.ts` (Lines 30, 167)
- `app/api/sms/webhook/route.ts` (Line 153)
- `app/api/sms/incoming/route.ts` (Lines 326, 397, 469, 501)
- `app/api/auth/validate-token/route.ts` (Line 96)
- `app/api/auth/magic-link/route.ts` (Line 97)
- `app/api/auth/user-role/route.ts` (Line 69)
- `app/api/auth/signup/route.ts` (Line 120)
- `app/api/auth/logout/route.ts` (Line 32)
- `app/api/auth/login/route.ts` (Line 103)
- `app/api/technicians/route.ts` (Lines 58, 178)
- `app/api/technicians/[techId]/route.ts` (Lines 46, 119)
- And 70+ more instances...

---

### 6. Missing Return Type Annotations

**File:** `lib/store.ts` (Multiple helper functions)

```typescript
// Lines 464-485
export const getTechnicianById = (technicians: Technician[], id: string | null) => {
  if (!id) return null
  return technicians.find((t) => t.id === id) || null
}

export const getTechniciansByIds = (technicians: Technician[], ids: string[] | null) => {
  // ...
}
```

**Suggested Fix:**
```typescript
export const getTechnicianById = (technicians: Technician[], id: string | null): Technician | null => {
  if (!id) return null
  return technicians.find((t) => t.id === id) || null
}

export const getTechniciansByIds = (technicians: Technician[], ids: string[] | null): Technician[] => {
  // ...
}
```

---

### 7. Interface Mismatch: Job Photos

**File:** `lib/types.ts` (Lines 54-60)

```typescript
export interface JobPhoto {
  id: string
  job_id: string
  photo_url: string
  caption: string | null
  uploaded_at: string
}
```

**vs Database (`lib/database.types.ts` Lines 133-159):**

```typescript
photos: {
  Row: {
    id: string
    created_at: string
    update_id: string  // NOT job_id!
    url: string        // NOT photo_url!
    thumbnail_url: string | null
    size_bytes: number | null
  }
}
```

**Issues:**
- `job_id` in types vs `update_id` in database
- `photo_url` in types vs `url` in database
- `uploaded_at` in types vs `created_at` in database

**Impact:** Data mapping errors when fetching/saving photos

**Suggested Fix:** Align types with database schema:
```typescript
export interface JobPhoto {
  id: string
  update_id: string  // Changed from job_id
  url: string        // Changed from photo_url
  thumbnail_url: string | null
  caption: string | null
  created_at: string // Changed from uploaded_at
  size_bytes: number | null
}
```

---

### 8. Optional vs Required Field Mismatches

**File:** `lib/types.ts` - `Technician` interface (Lines 34-45)

```typescript
export interface Technician extends User {
  role: 'technician'
  pin: string
  assigned_jobs: string[]
  magic_link_token?: string | null
  token_expires_at?: string | null
  invited_at?: string | null
  invited_by?: string | null
  accessed_at?: string | null
  last_active_at?: string | null
}
```

**vs Database Schema:**
Some of these fields don't exist in the database schema (`assigned_jobs` as array), while others have different nullability.

---

### 9. SMSLog Interface vs Database

**File:** `lib/types.ts` (Lines 62-71)

```typescript
export interface SmsLog {
  id: string
  job_id: string
  recipient_phone: string
  message_body: string
  sent_at: string
  status: 'sent' | 'failed' | 'pending'
  message_sid?: string | null
}
```

**vs Database (`lib/database.types.ts` Lines 161-191):**

```typescript
sms_logs: {
  Row: {
    id: string
    created_at: string           // NOT sent_at!
    job_id: string | null        // Nullable!
    technician_id: string | null // Missing in types!
    direction: 'inbound' | 'outbound' // Missing in types!
    body: string                 // NOT message_body!
    from_number: string          // Missing in types!
    to_number: string            // NOT recipient_phone!
    twilio_sid: string | null    // NOT message_sid!
    // ... more fields
  }
}
```

**Suggested Fix:** Align the interface with the database schema or create separate types for different use cases.

---

### 10. Weak UUID Generation

**File:** `lib/store.ts` (Line 12)

```typescript
const generateId = () => Math.random().toString(36).substring(2, 15)
```

**Issue:** `Math.random()` is not cryptographically secure and can produce collisions.

**Suggested Fix:** Use `crypto.randomUUID()` or a proper UUID library (already fixed in `store-improved.ts`).

---

### 11. Type Mismatch in Job Interface

**File:** `lib/types.ts` (Lines 47-62)

```typescript
export interface Job {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  job_type: string
  status: JobStatus
  scheduled_time: string
  notes: string | null
  assigned_tech_ids: string[] | null  // Array for multiple techs
  on_hold_reason: string | null
  created_at: string
  updated_at: string
}
```

**vs Database (`lib/database.types.ts` Lines 70-98):**

```typescript
jobs: {
  Row: {
    id: string
    company_id: string           // Missing in types!
    technician_id: string | null // Single tech, NOT array!
    customer_name: string
    customer_phone: string
    address: string              // NOT customer_address!
    job_type: string
    status: 'scheduled' | 'enroute' | 'working' | 'complete'
    notes: string | null
    // Missing: assigned_tech_ids, on_hold_reason, customer_address
  }
}
```

**Issues:**
- Database uses `technician_id` (single) vs types use `assigned_tech_ids` (array)
- Database uses `address` vs types use `customer_address`
- Database has `company_id` which is missing in types
- Database missing `on_hold_reason` field

---

### 12. Implicit `any` in Callback Parameters

**File:** `app/(dashboard)/jobs/page.tsx` (Multiple locations)

```typescript
const statusOrder: Record<JobStatus, number> = {
  available: 1,
  scheduled: 2,
  en_route: 3,
  working: 4,
  on_hold: 5,
  complete: 6,
}
```

The status values are being used as string literals without proper type checking.

---

## 🔧 Recommended Fixes

### Immediate Actions (Critical)

1. **Fix Status Type Alignment**
   ```typescript
   // Create a mapping between app and database statuses
   const statusToDatabase: Record<JobStatus, DatabaseJobStatus | null> = {
     'available': null,  // Use technician_id IS NULL instead
     'scheduled': 'scheduled',
     'en_route': 'enroute',
     'working': 'working',
     'on_hold': 'working',  // Map to working or add to DB
     'complete': 'complete'
   }
   ```

2. **Replace all `any` types with proper interfaces**
   - Use `unknown` for error handling
   - Define interfaces for API payloads
   - Use Database types from `database.types.ts`

3. **Add strict error typing**
   ```typescript
   function isErrorWithMessage(error: unknown): error is { message: string } {
     return (
       typeof error === 'object' &&
       error !== null &&
       'message' in error &&
       typeof (error as Record<string, unknown>).message === 'string'
     )
   }
   ```

### Short-term Actions (Medium Priority)

1. **Enable stricter TypeScript rules** in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "noImplicitAny": true,
       "strictNullChecks": true,
       "noImplicitReturns": true,
       "noUncheckedIndexedAccess": true
     }
   }
   ```

2. **Add ESLint rules**:
   - `@typescript-eslint/no-explicit-any`
   - `@typescript-eslint/explicit-function-return-type`
   - `@typescript-eslint/no-unsafe-assignment`

3. **Use Zod for runtime validation** of API inputs/outputs

### Long-term Actions

1. **Generate types from database schema** using Supabase CLI
2. **Add API response type contracts**
3. **Implement type-safe error boundaries**

---

## Files Requiring Immediate Attention

| File | Issues | Priority |
|------|--------|----------|
| `lib/types.ts` | Status type mismatch with DB | Critical |
| `lib/database.types.ts` | Missing 'available', 'on_hold' statuses | Critical |
| `app/api/sms/incoming/route.ts` | Multiple `any` types | Critical |
| `app/api/webhooks/stripe/route.ts` | Dangerous `as any` casts | Critical |
| `app/api/technicians/invite/route.ts` | `let technician: any` | Critical |
| `components/job-timeline.tsx` | `update: any` parameter | High |
| `app/settings/billing/page.tsx` | `err: any` in catch | High |
| `lib/store.ts` | Missing return types, weak ID generation | High |
| All API routes | `catch (error)` without type | Medium |

---

## Appendix: Type Compatibility Matrix

| Type/Field | `lib/types.ts` | `lib/database.types.ts` | Compatible? |
|------------|----------------|-------------------------|-------------|
| JobStatus | 'available' | ❌ Missing | ❌ No |
| JobStatus | 'en_route' | 'enroute' | ❌ No |
| JobStatus | 'on_hold' | ❌ Missing | ❌ No |
| Job.assigned_tech_ids | `string[] \| null` | `technician_id: string` | ❌ No |
| Job.customer_address | `string` | `address: string` | ⚠️ Rename |
| JobPhoto.job_id | `string` | `update_id: string` | ❌ No |
| JobPhoto.photo_url | `string` | `url: string` | ⚠️ Rename |
| SmsLog.recipient_phone | `string` | `to_number: string` | ⚠️ Rename |
| SmsLog.message_body | `string` | `body: string` | ⚠️ Rename |
| SmsLog.sent_at | `string` | `created_at: string` | ⚠️ Rename |

---

*End of Audit Report*
