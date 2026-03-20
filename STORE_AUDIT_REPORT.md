# COMPREHENSIVE STORE AUDIT REPORT - Dispatchly
**File:** `/lib/store.ts`  
**Date:** March 19, 2026  
**Auditor:** AI Code Review  

---

## EXECUTIVE SUMMARY

| Category | Count |
|----------|-------|
| **CRITICAL** | 8 |
| **HIGH** | 12 |
| **MEDIUM** | 6 |
| **LOW** | 5 |
| **TOTAL BUGS** | **31** |

---

## CRITICAL BUGS (8)

### BUG-001: Race Condition in `initializeUserFromSupabase`
**Function:** `initializeUserFromSupabase`  
**Line:** ~720-780  
**Severity:** CRITICAL

**Description:** The initialization check `if (get().isInitialized)` prevents re-initialization but creates a race condition. If initialization fails (network error), `isInitialized` remains `false`, but partial state (admin, settings) may already be set. The next call will skip because it checks `isInitialized` only at the start, but the state is partially dirty.

**Code:**
```typescript
initializeUserFromSupabase: async () => {
  // Skip if already initialized (use refreshUserProfile for updates)
  if (get().isInitialized) {
    console.log('[Store] Already initialized, skipping...')
    return  // BUG: Doesn't check if previous init failed partially
  }
```

**Impact:** User may see stale or partial data after a failed initialization.

**Suggested Fix:**
```typescript
initializeUserFromSupabase: async () => {
  // Check initialization with timestamp to allow retry after failure
  if (get().isInitialized && get().currentAdmin) {
    console.log('[Store] Already initialized, skipping...')
    return
  }
  
  // If partial initialization exists (admin but not fully loaded), reset first
  if (get().currentAdmin && !get().isInitialized) {
    console.log('[Store] Partial initialization detected, resetting...')
    get().resetStore()
  }
```

---

### BUG-002: Missing API Call in `addPhoto`
**Function:** `addPhoto`  
**Line:** ~534-546  
**Severity:** CRITICAL

**Description:** `addPhoto` only updates local state without persisting to the database. Photos will be lost on page refresh or when accessed from another device.

**Code:**
```typescript
addPhoto: (photoData) => {
  const newPhoto: JobPhoto = {
    ...photoData,
    id: generateId(),
    uploaded_at: new Date().toISOString(),
  }
  set((state) => ({ photos: [...state.photos, newPhoto] }))  // BUG: No API call
},
```

**Impact:** Photo data loss - photos exist only in memory.

**Suggested Fix:**
```typescript
addPhoto: async (photoData) => {
  const response = await fetch('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photoData),
  })
  
  if (!response.ok) {
    throw new Error('Failed to save photo')
  }
  
  const savedPhoto = await response.json()
  set((state) => ({ photos: [...state.photos, savedPhoto] }))
},
```

---

### BUG-003: Missing API Call in `deletePhoto`
**Function:** `deletePhoto`  
**Line:** ~548-553  
**Severity:** CRITICAL

**Description:** `deletePhoto` only updates local state without deleting from the database or storage bucket. The photo remains in storage forever.

**Suggested Fix:** Add API call to delete photo from database and storage before updating state.

---

### BUG-004: Missing API Call in `addSmsLog`
**Function:** `addSmsLog`  
**Line:** ~555-566  
**Severity:** CRITICAL

**Description:** `addSmsLog` only updates local state without persisting to the database. SMS logs will be lost on refresh.

**Suggested Fix:** Add API call to persist SMS log to database.

---

### BUG-005: Missing API Call in Template Actions
**Functions:** `addTemplate`, `updateTemplate`, `deleteTemplate`  
**Lines:** ~568-595  
**Severity:** CRITICAL

**Description:** All template CRUD operations only update local state. Templates are not persisted to the database, causing data loss on refresh.

**Impact:** Template modifications lost after page refresh.

**Suggested Fix:** Add API calls for all template operations.

---

### BUG-006: Missing API Call in `updateSettings`
**Function:** `updateSettings`  
**Line:** ~597-604  
**Severity:** CRITICAL

**Description:** Settings updates only modify local state without persisting to `/api/settings`. Settings revert on page refresh.

**Suggested Fix:**
```typescript
updateSettings: async (updates) => {
  const response = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update settings')
  }
  
  const savedSettings = await response.json()
  set({ settings: savedSettings })
},
```

---

### BUG-007: No Rollback in `loginTechnician`
**Function:** `loginTechnician`  
**Line:** ~498-515  
**Severity:** CRITICAL

**Description:** When a technician logs in, `last_login` is updated in local state but this change is never persisted to the database via API call. The next data load will overwrite with stale data.

**Code:**
```typescript
loginTechnician: (pin) => {
  const tech = get().technicians.find((t) => t.pin === pin && t.is_active)
  if (tech) {
    const updatedTech = { ...tech, last_login: new Date().toISOString() }  // BUG: Never saved to DB
    set((state) => ({ 
      currentTechId: tech.id,
      technicians: state.technicians.map((t) => 
        t.id === tech.id ? updatedTech : t
      )
    }))
    return updatedTech
  }
  return null
},
```

**Suggested Fix:** Add API call to update `last_login` timestamp.

---

### BUG-008: Weak ID Generation
**Function:** `generateId`  
**Line:** ~12-13  
**Severity:** CRITICAL

**Description:** Uses `Math.random()` for ID generation which is not cryptographically secure. Can produce collisions and predictable IDs.

**Code:**
```typescript
const generateId = () => Math.random().toString(36).substring(2, 15)
```

**Impact:** ID collisions possible, security vulnerability for IDs used in URLs.

**Suggested Fix:**
```typescript
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback with better entropy
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`
}
```

---

## HIGH SEVERITY BUGS (12)

### BUG-009: Missing Error Handling in `loadTemplatesFromSupabase`
**Function:** `loadTemplatesFromSupabase`  
**Line:** ~710-730  
**Severity:** HIGH

**Description:** Error handler has empty catch block - silently swallows errors with only console.error.

**Code:**
```typescript
catch (error) {
  console.error('[Store] Error loading templates:', error)  // BUG: Silent failure
}
```

**Impact:** Application appears to work but templates fail to load. User sees stale or default templates without knowing there's an error.

**Suggested Fix:** Set error state and potentially fallback to defaults with user notification.

---

### BUG-010: Missing Error Handling in `loadTechniciansFromSupabase`
**Function:** `loadTechniciansFromSupabase`  
**Line:** ~690-710  
**Severity:** HIGH

**Description:** Error caught but only logged - no error state set, loading state remains active.

**Code:**
```typescript
catch (error) {
  console.error('[Store] Error loading technicians:', error)
  set((state) => ({
    loading: { ...state.loading, technicians: false },  // BUG: No error state set
  }))
}
```

**Suggested Fix:** Set error state in catch block.

---

### BUG-011: Silent Initialization Failure
**Function:** `initializeUserFromSupabase`  
**Line:** ~770-775  
**Severity:** HIGH

**Description:** If profile fetch fails, function silently returns without setting error state or notifying user.

**Code:**
```typescript
try {
  // ... fetch profile
} catch (error) {
  console.error('[Store] Initialization failed:', error)
  // Don't mark as initialized on failure  // BUG: No error state, no user notification
}
```

**Suggested Fix:** Set error state and provide user-facing error message.

---

### BUG-012: No Loading State Management in Async Actions
**Functions:** `addJob`, `updateJob`, `deleteJob`, etc.  
**Severity:** HIGH

**Description:** Async CRUD operations don't set loading states. UI has no way to show loading indicators or prevent double-submissions.

**Impact:** Users can trigger multiple concurrent requests, no visual feedback during operations.

**Suggested Fix:** Add `isCreatingJob`, `isUpdatingJob`, `isDeletingJob` loading states.

---

### BUG-013: Race Condition in `updateJob`
**Function:** `updateJob`  
**Line:** ~400-430  
**Severity:** HIGH

**Description:** Optimistic update happens immediately, but if multiple rapid updates occur, the rollback mechanism uses the state captured at the start of the function, not accounting for concurrent updates.

**Suggested Fix:** Use functional updates for rollback or implement request queue.

---

### BUG-014: Incomplete Error Object in `updateJob`
**Function:** `updateJob` catch block  
**Line:** ~425-430  
**Severity:** HIGH

**Description:** Error is thrown after rollback but error state not set. Caller must handle error but no global error state exists for UI feedback.

**Suggested Fix:** Set error state before throwing.

---

### BUG-015: `updateAdmin` Doesn't Sync with Database
**Function:** `updateAdmin`  
**Line:** ~340-348  
**Severity:** HIGH

**Description:** Updates admin only in local state, not persisted to `/api/auth/user-profile`.

**Suggested Fix:** Add API call to persist admin changes.

---

### BUG-016: Missing Cleanup on Logout
**Function:** `logoutAdmin`  
**Line:** ~335-338  
**Severity:** HIGH

**Description:** Only sets auth state to null without calling `resetStore()`. Sensitive data remains in memory and localStorage.

**Code:**
```typescript
logoutAdmin: () => {
  set({ currentAdmin: null, isAdminAuthenticated: false })  // BUG: Data remains in store
},
```

**Suggested Fix:**
```typescript
logoutAdmin: () => {
  get().resetStore()
},
```

---

### BUG-017: `updateSubscription` Not Persisted
**Function:** `updateSubscription`  
**Line:** ~606-612  
**Severity:** HIGH

**Description:** Subscription updates only local state, not synced with billing API.

**Suggested Fix:** Add API call to `/api/billing/subscription`.

---

### BUG-018: `updateNotificationPreferences` Not Persisted
**Function:** `updateNotificationPreferences`  
**Line:** ~614-620  
**Severity:** HIGH

**Description:** Notification preference changes not persisted to API.

**Suggested Fix:** Add API call to persist preferences.

---

### BUG-019: `loginAdmin` Creates Fake Admin Data
**Function:** `loginAdmin`  
**Line:** ~320-335  
**Severity:** HIGH

**Description:** Instead of using actual user data from Supabase, creates synthetic admin object with `generateId()` and derived values. The ID won't match the actual Supabase user ID.

**Code:**
```typescript
loginAdmin: (email, password) => {
  const admin: Admin = {
    id: generateId(),  // BUG: Wrong ID - should be Supabase user ID
    name: email.split('@')[0],  // BUG: Should be from profile
    email: email,
    // ...
  }
}
```

**Suggested Fix:** Accept admin data as parameter from Supabase auth callback.

---

### BUG-020: Photo Data Not Loaded from Supabase
**Function:** `loadPhotosFromSupabase`  
**Severity:** HIGH

**Description:** No function exists to load photos from Supabase on initialization. Photos array remains empty.

**Suggested Fix:** Add `loadPhotosFromSupabase` function and call in initialization.

---

## MEDIUM SEVERITY BUGS (6)

### BUG-021: Inconsistent Error Response Format
**Functions:** Multiple async actions  
**Severity:** MEDIUM

**Description:** `addJob` throws errors, `deleteJob` throws errors, but there's no consistent error handling pattern. Some functions throw, others don't.

**Suggested Fix:** Standardize all async actions to return `{ success, data?, error? }` pattern.

---

### BUG-022: No Cache for `loadJobsFromSupabase`
**Function:** `loadJobsFromSupabase`  
**Severity:** MEDIUM

**Description:** No caching mechanism - every call fetches fresh data even if recently loaded. Causes unnecessary API calls.

**Note:** `store-improved.ts` adds caching - this file doesn't.

**Suggested Fix:** Add timestamp-based caching like in improved version.

---

### BUG-023: Missing `updated_at` in `updateTechnician`
**Function:** `updateTechnician`  
**Line:** ~470-475  
**Severity:** MEDIUM

**Description:** Unlike `updateJob`, this function doesn't set `updated_at` timestamp.

**Code:**
```typescript
updateTechnician: async (id, updates) => {
  // Optimistic update
  set((state) => ({
    technicians: state.technicians.map((tech) =>
      tech.id === id ? { ...tech, ...updates } : tech  // BUG: No updated_at
    ),
  }))
```

**Suggested Fix:** Add `updated_at: new Date().toISOString()` to update.

---

### BUG-024: `addJob` Returns Wrong Type
**Function:** `addJob`  
**Line:** ~380-398  
**Severity:** MEDIUM

**Description:** Function signature promises `Promise<Job>` but if API returns different structure or if response parsing fails, type safety is broken.

**Code:**
```typescript
const savedJob = await response.json()
set((state) => ({ jobs: [...state.jobs, savedJob] }))
return savedJob  // BUG: No validation that this is actually a Job
```

**Suggested Fix:** Add runtime validation or type assertion with error handling.

---

### BUG-025: Missing `loadSmsLogsFromSupabase`
**Severity:** MEDIUM

**Description:** No function to load SMS logs from database. SMS history not available.

**Suggested Fix:** Add SMS log loading function.

---

### BUG-026: Missing `loadInvoicesFromSupabase`
**Severity:** MEDIUM

**Description:** Invoices array is never populated from API.

**Suggested Fix:** Add invoice loading function and call during initialization.

---

## LOW SEVERITY BUGS (5)

### BUG-027: TypeScript `any` in Error Handling
**Multiple locations**  
**Severity:** LOW

**Description:** Several catch blocks use `any` type implicitly for errors.

**Suggested Fix:** Use `error instanceof Error` pattern consistently.

---

### BUG-028: Missing `useMemo` for Selectors
**Functions:** Helper functions at bottom  
**Severity:** LOW

**Description:** Selector functions like `getTechnicianJobs` create new arrays every call, causing unnecessary re-renders.

**Suggested Fix:** Use `useMemo` in components or create memoized selectors.

---

### BUG-029: No Debouncing for Rapid Updates
**Functions:** `updateJob`, `updateJobStatus`  
**Severity:** LOW

**Description:** Rapid successive updates will trigger multiple API calls.

**Suggested Fix:** Add debouncing or request deduplication.

---

### BUG-030: Missing Index Validation in `renderTemplate`
**Function:** `renderTemplate`  
**Line:** ~840-855  
**Severity:** LOW

**Description:** No validation that job object has required properties before replacement.

**Suggested Fix:** Add null checks for job properties.

---

### BUG-031: Persist Middleware Configuration Issues
**Configuration**  
**Line:** ~815-820  
**Severity:** LOW

**Description:** Persist middleware saves all state including transient data like `isInitialized`, `loading` states that shouldn't persist.

**Code:**
```typescript
{
  name: 'dispatchly-storage',  // BUG: No partialize to exclude transient state
}
```

**Suggested Fix:** Add `partialize` option to exclude loading states, cache, etc.

---

## ADDITIONAL CONCERNS

### API Route Assumptions
The store assumes these API routes exist:
- `/api/jobs` (POST, GET, PATCH, DELETE)
- `/api/jobs/[id]/status` (PATCH)
- `/api/technicians` (POST, GET, PATCH, DELETE)
- `/api/templates` (GET)
- `/api/settings` (GET, PATCH)
- `/api/auth/user-profile` (GET)
- `/api/photos` (MISSING - needed for BUG-002)
- `/api/sms/logs` (MISSING - needed for BUG-004)

Some routes exist but not all CRUD operations are implemented.

### Comparison with `store-improved.ts`
The improved version fixes many of these issues:
- ✅ Secure ID generation
- ✅ Loading states
- ✅ Error state management
- ✅ Cache management
- ✅ Proper `partialize` configuration
- ✅ `resetStore` clears localStorage

**Recommendation:** Migrate to `store-improved.ts` or apply fixes to main store.

---

## RECOMMENDATIONS

### Immediate Actions (Critical)
1. Fix all CRUD operations to include API calls (BUG-002 through BUG-007)
2. Replace `generateId` with secure alternative (BUG-008)
3. Fix initialization race condition (BUG-001)
4. Add proper logout cleanup (BUG-016)

### Short-term (High Priority)
5. Add loading states to all async operations
6. Implement consistent error handling
7. Fix `loginAdmin` to use real user data
8. Add missing data loaders (photos, SMS logs, invoices)

### Long-term (Medium/Low)
9. Add request debouncing
10. Implement proper caching
11. Add runtime type validation
12. Optimize selectors with memoization

---

## TESTING RECOMMENDATIONS

1. **Network Failure Tests:** Test all async actions with network failures
2. **Race Condition Tests:** Rapid sequential updates on same entity
3. **Persistence Tests:** Verify data survives page refresh
4. **Multi-device Tests:** Check data sync across devices
5. **Logout Tests:** Verify sensitive data cleared on logout

---

**END OF AUDIT REPORT**
