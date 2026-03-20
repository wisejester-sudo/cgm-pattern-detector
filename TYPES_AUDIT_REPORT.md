# Comprehensive TypeScript Types Audit - Dispatchly

**Date:** 2026-03-19  
**Scope:** All TypeScript types, interfaces, and API type definitions  
**Severity Levels:** CRITICAL (runtime errors), HIGH (type safety issues), MEDIUM (maintainability), LOW (consistency)

---

## Summary
- **CRITICAL Issues:** 5
- **HIGH Issues:** 7
- **MEDIUM Issues:** 11
- **LOW Issues:** 7
- **Total Issues:** 30

---

## CRITICAL ISSUES

### 1. JobStatus Type Mismatch Between Frontend and Database
**File:** `/lib/types.ts` (line 1) and `/lib/database.types.ts` (line 42)  
**Severity:** CRITICAL  
**Description:**
- `types.ts` defines: `'available' | 'scheduled' | 'en_route' | 'working' | 'on_hold' | 'complete'`
- `database.types.ts` defines: `'scheduled' | 'enroute' | 'working' | 'complete'`
- **Missing:** 'available', 'on_hold' status in database types
- **Naming mismatch:** 'en_route' vs 'enroute' (underscore vs no underscore)

**Impact:** Runtime type errors when using 'available' or 'on_hold' statuses with Supabase queries

**Suggested Fix:**
```typescript
// In database.types.ts - Add missing statuses and fix naming
status: 'available' | 'scheduled' | 'en_route' | 'working' | 'on_hold' | 'complete'
```

---

### 2. Job Interface Field Mismatches
**File:** `/lib/types.ts` (lines 35-47) vs `/lib/database.types.ts` (lines 33-60)  
**Severity:** CRITICAL  
**Description:**
| types.ts | database.types.ts | Issue |
|----------|------------------|-------|
| `customer_address` | `address` | Field name mismatch |
| `assigned_tech_ids: string[]` | `technician_id: string` | Array vs single value |
| `on_hold_reason: string \| null` | *missing* | Missing in database types |
| `scheduled_time: string` | `scheduled_time` | ✓ Match |

**Impact:** Type errors when mapping between frontend Job type and database rows

**Suggested Fix:**
```typescript
// Align database.types.ts with types.ts
Row: {
  id: string
  created_at: string
  updated_at: string
  company_id: string
  assigned_tech_ids: string[] | null  // Changed from technician_id
  customer_name: string
  customer_phone: string
  customer_address: string  // Changed from address
  job_type: string
  status: JobStatus  // Use the full enum
  notes: string | null
  on_hold_reason: string | null  // Add missing field
}
```

---

### 3. SmsLog Interface Mismatches
**File:** `/lib/types.ts` (lines 57-64) vs `/lib/database.types.ts` (lines 123-166)  
**Severity:** CRITICAL  
**Description:**
| types.ts | database.types.ts | Issue |
|----------|------------------|-------|
| `recipient_phone` | `to_number` / `from_number` | Missing direction concept |
| `message_body` | `body` | Field name mismatch |
| `sent_at` | `created_at` | Field name mismatch |
| `status: 'sent' \| 'failed' \| 'pending'` | *missing* | Status tracking missing in DB |
| `message_sid` | `twilio_sid` | Field name mismatch |
| *missing* | `direction` | Direction not in types.ts |
| *missing* | `parsed_keyword` | Parsing metadata missing |
| *missing* | `parsed_result` | Parsing metadata missing |
| *missing* | `message_type` | Type categorization missing |

**Impact:** Data mapping failures between SMS logs and database

**Suggested Fix:**
```typescript
// Update types.ts SmsLog interface
export interface SmsLog {
  id: string
  job_id: string | null
  technician_id: string | null
  direction: 'inbound' | 'outbound'
  from_number: string
  to_number: string
  body: string
  twilio_sid: string | null
  status: 'sent' | 'failed' | 'pending' | 'delivered'  // Extended enum
  parsed_keyword: string | null
  parsed_result: string | null
  message_type: 'general' | 'status_update' | 'status_notification' | 'note' | 'approval'
  created_at: string
}
```

---

### 4. JobPhoto vs Database Photos Mismatch
**File:** `/lib/types.ts` (lines 49-55) vs `/lib/database.types.ts` (lines 95-121)  
**Severity:** CRITICAL  
**Description:**
| types.ts | database.types.ts | Issue |
|----------|------------------|-------|
| `job_id: string` | `update_id: string` | Completely different relationship |
| `photo_url: string` | `url: string` | Field name mismatch |
| `caption: string \| null` | *missing* | Caption not in database |
| `uploaded_at: string` | `created_at: string` | Field name mismatch |
| *missing* | `thumbnail_url` | Missing in types.ts |
| *missing* | `size_bytes` | Missing in types.ts |

**Impact:** Photos cannot be correctly typed when fetching from database

**Suggested Fix:**
```typescript
// Update types.ts JobPhoto interface
export interface JobPhoto {
  id: string
  job_id: string  // Add direct job reference
  update_id: string  // Keep update relationship
  url: string  // Changed from photo_url
  thumbnail_url: string | null
  caption: string | null
  size_bytes: number | null
  created_at: string  // Changed from uploaded_at
}
```

---

### 5. Database JobUpdates vs JobUpdate Interface Mismatch
**File:** `/lib/types.ts` (lines 103-112) vs `/lib/database.types.ts` (lines 65-93)  
**Severity:** CRITICAL  
**Description:**
- `types.ts` has `JobUpdate` with `photos: string[]` array
- `database.types.ts` has separate `photos` table linked by `update_id`
- `created_by_tech_id` missing in database schema
- `sms_sent_at` and `sms_delivered` in database but not in types

**Impact:** Cannot properly type job updates with photos

**Suggested Fix:**
```typescript
// Update types.ts - Add missing fields and align structure
export interface JobUpdate {
  id: string
  job_id: string
  status: JobStatus
  notes: string | null
  created_by_tech_id: string | null
  sms_sent_at: string | null  // Add from DB
  sms_delivered: boolean      // Add from DB
  created_at: string
  // Photos are in separate table, fetch separately
}

export interface JobUpdateWithPhotos extends JobUpdate {
  photos: JobPhoto[]
}
```

---

## HIGH SEVERITY ISSUES

### 6. API Response Types Not Defined
**File:** `/app/api/jobs/route.ts`, `/app/api/technicians/route.ts`  
**Severity:** HIGH  
**Description:**
Paginated API responses return `{ data: [], pagination: {...} }` but no TypeScript interfaces exist for these responses.

**Suggested Fix:**
```typescript
// Add to /lib/types.ts
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export type JobsResponse = PaginatedResponse<Job>
export type TechniciansResponse = PaginatedResponse<Technician>
```

---

### 7. Store Load Functions Don't Handle Pagination
**File:** `/lib/store.ts` (lines 600-650), `/lib/store-improved.ts` (lines 750-820)  
**Severity:** HIGH  
**Description:**
Store functions expect arrays but API returns paginated objects. Current code:
```typescript
const data = await response.json()
const jobs = data.jobs || data  // Hacky fallback
```

**Suggested Fix:**
```typescript
// Define proper response types and use them
const data: JobsResponse = await response.json()
const jobs = data.data || data.jobs || []
```

---

### 8. UserProfile Interface Duplication
**File:** `/app/(dashboard)/settings/components/ProfileSection.tsx` (line 12)  
**Severity:** HIGH  
**Description:**
Local `UserProfile` interface duplicates and conflicts with types in `/lib/types.ts`:
- Uses `full_name` vs `name`
- Missing fields from the main User type

**Suggested Fix:**
```typescript
// Import from types.ts instead of redefining
import type { User } from '@/lib/types'

// Use User type or create proper extension
interface UserProfile extends User {
  company_name: string | null
  company_phone: string | null
}
```

---

### 9. SubscriptionData Interface Mismatch
**File:** `/app/settings/billing/page.tsx` (line 19)  
**Severity:** HIGH  
**Description:**
Local `SubscriptionData` interface doesn't match the `Subscription` type in `/lib/types.ts` or API response format.

**Suggested Fix:**
```typescript
// Use the type from types.ts and extend if needed
import type { Subscription } from '@/lib/types'

interface SubscriptionData {
  company: CompanyData
  subscription: Subscription | null
  plan: Plan | null
}
```

---

### 10. Public Job Token Interfaces
**File:** `/app/j/[token]/page.tsx` (lines 21-57)  
**Severity:** HIGH  
**Description:**
Local interfaces (`JobData`, `PhotoData`, `UpdateData`, `CompanyData`, `PublicJobData`) duplicate types and don't align with `/lib/types.ts`:
- `JobData.technician_name` not in main Job type
- `PhotoData.thumbnail_url` not in JobPhoto
- `UpdateData.status` is string, not JobStatus

**Suggested Fix:**
```typescript
// Import and reuse from types.ts
import type { Job, JobPhoto, JobUpdate, CompanySettings } from '@/lib/types'

// Extend only where necessary
interface PublicJobData {
  job: Job & { technician_name?: string | null }
  updates: JobUpdate[]
  photos: JobPhoto[]
  company: CompanySettings
}
```

---

### 11. Photo Interface in photos/view/page.tsx
**File:** `/app/photos/view/page.tsx` (line 21)  
**Severity:** HIGH  
**Description:**
Local `Photo` interface doesn't match `JobPhoto` in types.ts:
```typescript
interface Photo {
  id: string
  url: string
  thumbnail_url?: string  // Optional marker wrong
  created_at: string
  update_id: string
}
```

**Suggested Fix:**
```typescript
import type { JobPhoto } from '@/lib/types'

// Use JobPhoto directly or extend it
type Photo = JobPhoto
```

---

### 12. CompanySettings ID Field
**File:** `/lib/types.ts` (line 77)  
**Severity:** MEDIUM-HIGH  
**Description:**
`CompanySettings.id` is required (`string`) but store files initialize it as empty string (`''`), indicating it might not always be set.

**Suggested Fix:**
```typescript
export interface CompanySettings {
  id?: string  // Make optional if not always present
  company_name: string
  // ...
}
```

---

## MEDIUM SEVERITY ISSUES

### 13. Any Types in Error Handling
**Files:**
- `/app/api/technicians/invite/route.ts` (line 180)
- `/app/api/webhooks/stripe/route.ts` (line 214)
- `/app/api/billing/portal/route.ts` (line 60)
- `/app/api/billing/subscription/route.ts` (lines 72, 117)
- `/app/api/billing/create-checkout/route.ts` (line 101)

**Severity:** MEDIUM  
**Description:**
Using `error: any` instead of proper error typing:
```typescript
} catch (error: any) {
  return NextResponse.json(
    { error: error.message || "Failed to..." },
    { status: 500 }
  )
}
```

**Suggested Fix:**
```typescript
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Failed to..."
  return NextResponse.json({ error: message }, { status: 500 })
}
```

---

### 14. SMS Template Type Inconsistency
**File:** `/lib/sms-templates.ts`  
**Severity:** MEDIUM  
**Description:**
`TemplateParams` interface doesn't match `SmsTemplate` from types.ts. They define different structures for the same concept.

**Suggested Fix:**
```typescript
// Extend or align with SmsTemplate
import type { SmsTemplate } from './types'

export interface TemplateParams {
  customer_name?: string
  tech_name?: string
  address?: string
  job_type?: string
  company_name?: string
  company_phone?: string
  eta?: string
  scheduled_time?: string
}

export function renderTemplate(
  template: SmsTemplate,
  params: TemplateParams
): string {
  return template.template_body
    .replace(/{customer_name}/g, params.customer_name || '')
    // ...
}
```

---

### 15. Stripe Webhook Type Assertions
**File:** `/app/api/webhooks/stripe/route.ts` (line 64)  
**Severity:** MEDIUM  
**Description:**
Using type assertion instead of proper typing:
```typescript
// Use type assertion to access Stripe subscription properties
const subscription = event.data.object as Stripe.Subscription
```

**Suggested Fix:**
```typescript
// Use proper type guards or define event types
if (event.type === 'customer.subscription.created') {
  const subscription = event.data.object  // Already typed correctly
}
```

---

### 16. Missing Return Types on API Routes
**Files:** All API routes  
**Severity:** MEDIUM  
**Description:**
API route handlers don't specify return types:
```typescript
export async function GET(request: NextRequest) {
  // No return type specified
}
```

**Suggested Fix:**
```typescript
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ...
}
```

---

### 17. Params Type Pattern
**Files:** `/app/api/**/[param]/route.ts`  
**Severity:** MEDIUM  
**Description:**
Using `Promise<{ id: string }>` pattern for params. While Next.js 15 requires this, it should be consistent and typed.

**Suggested Fix:**
```typescript
// Define reusable param types in types.ts
export type JobParams = Promise<{ id: string }>
export type TechParams = Promise<{ techId: string }>
export type TokenParams = Promise<{ token: string }>

// Use in routes
{ params }: { params: JobParams }
```

---

### 18. FormData Value Types
**Files:** SMS webhook routes  
**Severity:** MEDIUM  
**Description:**
FormData values are implicitly typed:
```typescript
formData.forEach((value, key) => {
  // value is any
})
```

**Suggested Fix:**
```typescript
formData.forEach((value: FormDataEntryValue, key: string) => {
  const stringValue = typeof value === 'string' ? value : value.name
})
```

---

### 19. Job Type Not Specific
**File:** `/lib/types.ts` (line 41)  
**Severity:** MEDIUM  
**Description:**
`job_type: string` should be a union of valid job types or use the custom job types from settings.

**Suggested Fix:**
```typescript
// Option 1: Define common types
export type CommonJobType = 
  | 'AC Repair'
  | 'Furnace Maintenance'
  | 'Leak Repair'
  | 'Electrical'
  | 'Service Call'
  | string  // Allow custom types

// Option 2: Make it generic with validation
export type JobType = string  // Validated at runtime against custom_job_types
```

---

### 20. Trade Type Comment vs Union Type
**File:** `/lib/types.ts` (line 82)  
**Severity:** MEDIUM  
**Description:**
Trade type has comment with union but is typed as string:
```typescript
trade_type: string  // 'hvac' | 'plumbing' | 'electrical' | 'landscaping' | 'generic'
```

**Suggested Fix:**
```typescript
export type TradeType = 'hvac' | 'plumbing' | 'electrical' | 'landscaping' | 'generic' | string

trade_type: TradeType
```

---

### 21. Error State Interface Missing Codes
**File:** `/lib/store-improved.ts` (lines 36-42)  
**Severity:** MEDIUM  
**Description:**
`ErrorState` interface exists but error codes are not enumerated:
```typescript
type ErrorState = {
  code: string | null  // Should be specific union
  message: string | null
}
```

**Suggested Fix:**
```typescript
export type ErrorCode = 
  | 'JOB_CREATE_ERROR'
  | 'JOB_DELETE_ERROR'
  | 'TECH_CREATE_ERROR'
  | 'TECH_DELETE_ERROR'
  | 'STATUS_UPDATE_ERROR'
  | 'JOBS_LOAD_ERROR'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR'
  | null

type ErrorState = {
  code: ErrorCode
  message: string | null
  // ...
}
```

---

### 22. Database Types Missing Relations
**File:** `/lib/database.types.ts`  
**Severity:** MEDIUM  
**Description:**
Foreign key relationships are not typed. For example, `technicians.company_id` should relate to `companies.id`.

**Suggested Fix:**
Consider using Supabase CLI to generate types from the actual database schema instead of maintaining manually.

---

### 23. Inconsistent Date Types
**Files:** Various  
**Severity:** MEDIUM  
**Description:**
Some places use `string` for dates (ISO format), others might expect `Date` objects. Not consistently enforced.

**Suggested Fix:**
```typescript
// Define a branded type for ISO date strings
export type ISODateString = string & { __brand: 'ISODateString' }

// Use throughout
export interface Job {
  created_at: ISODateString
  updated_at: ISODateString
  scheduled_time: ISODateString
}
```

---

## LOW SEVERITY ISSUES

### 24. Naming Inconsistency: `en_route` vs `enroute`
**File:** `/lib/database.types.ts` (line 42)  
**Severity:** LOW  
**Description:**
Inconsistent naming between types.ts (en_route) and database.types.ts (enroute).

**Suggested Fix:**
Standardize on `en_route` throughout.

---

### 25. Optional Field Marker Inconsistency
**File:** `/app/photos/view/page.tsx` (line 24)  
**Severity:** LOW  
**Description:**
Uses `thumbnail_url?: string` (optional property marker) instead of `thumbnail_url: string | null` (explicit nullable).

**Suggested Fix:**
Standardize on explicit nulls for API data: `thumbnail_url: string | null`

---

### 26. Unused Type Imports
**Files:** Various components  
**Severity:** LOW  
**Description:**
Some files import types but only use them partially or have unused imports.

**Example:** `/app/track/[id]/page.tsx` imports `JobStatus` but doesn't show its usage in the visible portion.

---

### 27. Type Assertions Without Validation
**Files:** Various API routes  
**Severity:** LOW  
**Description:**
Type assertions used without runtime validation:
```typescript
const body = await request.json() as CreateJobBody
```

**Suggested Fix:**
Use Zod or similar for runtime validation:
```typescript
const body = createJobSchema.parse(await request.json())
```

---

### 28. Inconsistent Interface Prefixing
**Files:** Various  
**Severity:** LOW  
**Description:**
Some interfaces are prefixed (IUser, IJob), most are not. No consistent convention.

**Suggested Fix:**
Standardize on no prefix for interfaces (current majority pattern).

---

### 29. React.FC Usage Inconsistency
**Files:** Components  
**Severity:** LOW  
**Description:**
Some components use `React.FC`, others use function declarations. Not consistent.

**Current:** Mixed usage  
**Suggested:** Use function declarations consistently (already majority pattern).

---

### 30. Magic Token Interface Unused
**File:** `/lib/types.ts` (lines 125-130)  
**Severity:** LOW  
**Description:**
`MagicToken` interface defined but not used in the token route or components.

**Verification:**
Check if `/app/t/[token]/page.tsx` should use this type.

---

## Recommended Actions (Priority Order)

### Immediate (Fix Before Next Release)
1. ✅ Fix JobStatus enum mismatch (CRITICAL #1)
2. ✅ Align Job interface fields between types.ts and database.types.ts (CRITICAL #2)
3. ✅ Fix SmsLog interface mismatch (CRITICAL #3)
4. ✅ Align JobPhoto with database photos table (CRITICAL #4)

### Short Term (This Week)
5. Create proper API response type definitions (HIGH #6)
6. Update store functions to handle paginated responses (HIGH #7)
7. Remove duplicate UserProfile interface (HIGH #8)
8. Fix SubscriptionData interface (HIGH #9)
9. Consolidate Public Job Token types (HIGH #10)
10. Replace `any` error types with `unknown` (MEDIUM #13)

### Medium Term (This Sprint)
11. Add proper return types to all API routes (MEDIUM #16)
12. Define reusable params types (MEDIUM #17)
13. Create TradeType and JobType unions (MEDIUM #19, #20)
14. Generate database types from Supabase schema (MEDIUM #22)
15. Add runtime validation with Zod (LOW #27)

---

## Type Safety Improvements

### Consider Adding
1. **Zod schemas** for runtime validation of API inputs/outputs
2. **Branded types** for ID strings (JobId, TechId, etc.)
3. **Stricter null checks** in tsconfig.json
4. **API client** with typed responses instead of direct fetch
5. **Generated database types** from Supabase instead of manual maintenance

### Example: API Client Pattern
```typescript
// lib/api/client.ts
export async function fetchJobs(
  params?: { status?: JobStatus; page?: number }
): Promise<JobsResponse> {
  const query = new URLSearchParams(params as Record<string, string>)
  const response = await fetch(`/api/jobs?${query}`)
  if (!response.ok) throw new ApiError(response)
  return response.json() as Promise<JobsResponse>
}
```

---

## Files Requiring Updates

| File | Issues Count | Priority |
|------|--------------|----------|
| `/lib/types.ts` | 8 | CRITICAL |
| `/lib/database.types.ts` | 7 | CRITICAL |
| `/app/api/jobs/[id]/route.ts` | 2 | HIGH |
| `/app/api/technicians/route.ts` | 2 | HIGH |
| `/lib/store.ts` | 3 | HIGH |
| `/lib/store-improved.ts` | 3 | HIGH |
| `/app/j/[token]/page.tsx` | 3 | HIGH |
| `/app/(dashboard)/settings/components/ProfileSection.tsx` | 1 | HIGH |
| `/app/settings/billing/page.tsx` | 1 | HIGH |
| `/app/photos/view/page.tsx` | 2 | MEDIUM |
| `/app/api/billing/*.ts` | 3 | MEDIUM |
| `/lib/sms-templates.ts` | 1 | MEDIUM |
| `/app/api/webhooks/stripe/route.ts` | 1 | MEDIUM |

---

## Notes

1. The `database.types.ts` file appears to be manually maintained and is significantly out of sync with `types.ts`. Consider generating it from Supabase.

2. Store files have optimistic update patterns that would benefit from proper typing of API responses.

3. The multi-technician support (`assigned_tech_ids` array) is in types.ts but not reflected in database.types.ts.

4. Error handling across API routes uses inconsistent patterns that could be standardized.

5. Many type issues stem from the evolution of the data model - fields were added/renamed but types weren't updated everywhere.

---

*Report generated by TypeScript Type Audit - 2026-03-19*
