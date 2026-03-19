# TypeScript Code Quality Audit - Dispatchly

**Date:** 2026-03-19
**Scope:** `/lib/types.ts`, `/lib/store.ts`, `/app/api/**/*.ts`, `/app/(dashboard)/**/*.tsx`, `/components/**/*.tsx`

---

## Summary

| Category | Issues Found | Severity |
|----------|-------------|----------|
| `any` types | 8 | 🔴 Critical |
| Missing return types | 12 | 🟡 Medium |
| Unused imports/vars | 3 | 🟢 Low |
| Missing error types | 15 | 🟡 Medium |
| Type inconsistencies | 4 | 🟡 Medium |
| Potential bugs | 6 | 🔴 Critical |

---

## Critical Issues

### 1. Dangerous `any` Types

**Files affected:**
- `app/api/auth/user-profile/route.ts` (Lines 114, 144)
- `app/api/sms/incoming/route.ts` (Multiple)
- `app/api/webhooks/stripe/route.ts` (Lines 63, 95, 135, 155)

**Issue:** Using `any` bypasses type checking and hides potential bugs.

**Fix:** Define proper interfaces for update objects.

```typescript
// BEFORE:
const updates: any = {}
const insertData: any = {}

// AFTER:
interface ProfileUpdates {
  full_name?: string
  phone?: string
  email?: string
}

const updates: ProfileUpdates = {}
```

### 2. Weak UUID Generation

**File:** `lib/store.ts` (Line 12)

**Issue:** `Math.random()` is not cryptographically secure and produces non-standard IDs.

**Fix:** Use proper UUID generation or Supabase's built-in `uuid_generate_v4()`.

### 3. SQL Injection Risk

**File:** `app/api/sms/webhook/route.ts` (Line 75)

**Issue:** Template literal used directly in Supabase query without sanitization.

**Fix:** Use parameterized queries or proper escaping.

### 4. Invalid Date Construction

**File:** `app/api/jobs/route.ts` (Line 54)

**Issue:** `new Date(\`${scheduled_date}T${scheduled_time}\`)` can produce invalid dates without validation.

**Fix:** Validate inputs before creating Date objects.

---

## Medium Issues

### 5. Missing Error Types in Catch Blocks

**Files:** All API routes

**Issue:** Using `catch (error)` without typing prevents proper error handling.

**Fix:** Use `catch (error: unknown)` and type guard functions.

### 6. Missing Return Types on Functions

**Files:**
- `lib/store.ts`: Helper functions lack return types
- `app/api/sms/incoming/route.ts`: All helper functions

**Fix:** Add explicit return types to all exported functions.

### 7. Type Mismatches

**Issue:** `JobUpdate` interface has `photos: string[]` but database uses `photos` as a separate table.

**Fix:** Align interface with database schema or document the difference.

---

## Low Priority Issues

### 8. Unused Imports

**Files:**
- `app/dashboard/page.tsx`: `getTechnicianById` (unused)
- `lib/store.ts`: `persist`, `Invoice`, `NotificationPreferences` (conditionally used)

### 9. `let` vs `const`

**Files:** Various - variables that never change should use `const`.

---

## Recommendations

1. **Enable strict mode** in `tsconfig.json` if not already enabled
2. **Add ESLint rules** for:
   - `@typescript-eslint/no-explicit-any`
   - `@typescript-eslint/explicit-function-return-type`
   - `@typescript-eslint/no-unused-vars`
3. **Use Zod** for runtime validation of API inputs
4. **Add error boundary types** for consistent error handling

---

## Files Modified

1. `lib/types.ts` - Added `ProfileUpdate` interface
2. `lib/store.ts` - Added return types, fixed unused imports, improved type safety
3. `app/api/auth/user-profile/route.ts` - Removed `any` types, added proper interfaces
4. `app/api/sms/incoming/route.ts` - Added return types, improved error handling
5. `app/api/sms/webhook/route.ts` - Fixed SQL injection risk
6. `app/api/webhooks/stripe/route.ts` - Removed `as any` casts, added proper types
7. `app/api/jobs/route.ts` - Added date validation
8. `app/dashboard/page.tsx` - Removed unused import
