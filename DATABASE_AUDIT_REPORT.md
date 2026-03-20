# Database & Store Audit Report

**Date:** 2026-03-19  
**Project:** Dispatchly  
**Focus:** Data Integrity & Optimization

---

## 🚨 CRITICAL ISSUES

### 1. Cryptographically Insecure ID Generation (HIGH RISK)
**Location:** `/lib/store.ts:5`

```typescript
const generateId = () => Math.random().toString(36).substring(2, 15)
```

**Problem:** Uses `Math.random()` for ID generation which is:
- Not cryptographically secure
- Could produce collisions in high-traffic scenarios
- Predictable sequence

**Impact:** Data loss, ID collisions, security vulnerability

**Fix:** Use `crypto.randomUUID()` or proper UUID generation

---

### 2. Missing RLS Policies on `users` Table (HIGH RISK)
**Location:** Database schema

The `users` table created in migrations lacks Row Level Security policies, unlike other tables (companies, technicians, jobs).

**Problem:** Any authenticated user could potentially read/write any user's profile data.

**Required Policies:**
```sql
alter table public.users enable row level security;

create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);
```

---

### 3. Local Storage Persistence Without Cleanup (HIGH RISK)
**Location:** `/lib/store.ts` (zustand persist)

**Problem:** 
- `resetStore()` only clears memory state, not localStorage
- Sensitive data (technicians, jobs, admin info) persisted unencrypted
- No handling of storage quota exceeded errors

**Impact:**
- Data leakage between sessions/users on shared devices
- Potential storage quota crashes
- Stale data after logout

---

### 4. Hardcoded Credentials in Client Code (MEDIUM RISK)
**Location:** `/lib/supabase/client-browser.ts:4-6`

Supabase URL and anon key are hardcoded, which could be a security concern if this is production code.

---

## ⚠️ DATA CONSISTENCY ISSUES

### 5. Silent Failures in Async Operations
**Locations:** 
- `deleteJob()` - continues with local deletion even if API fails
- `deleteTechnician()` - same issue

```typescript
deleteJob: async (id) => {
  try {
    const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      console.error('Failed to delete job from API')
      // Continues with local deletion anyway!
    }
  } catch (error) {
    console.error('Error deleting job')
    // Still deletes from local state!
  }
  // Local state removal happens regardless of API success
}
```

**Problem:** UI shows deletion succeeded, but data may still exist in database.

### 6. No Cache Invalidation Strategy
**Problem:** 
- No timestamps on when data was last fetched
- No stale data detection
- `initializeUserFromSupabase` only runs once per session

### 7. Duplicate Data Sources
**Problem:** The store can have data from:
- Default/demo data (fallback)
- Supabase sync (loadJobsFromSupabase)
- User actions (addJob)

With no mechanism to reconcile conflicts.

---

## 🔄 STATE MANAGEMENT ISSUES

### 8. Mixed Sync/Async Actions Without Loading States
**Problem:** Async actions (deleteJob, loadJobsFromSupabase) don't set loading states:
```typescript
// No way to show loading spinner during delete
await deleteJob(id)
```

### 9. No Optimistic Update Rollback
**Problem:** While optimistic updates are applied, there's no rollback mechanism if the server fails.

### 10. Direct State Mutations Possible
**Problem:** Store selectors return direct references that could be mutated:
```typescript
const { jobs } = useStore()
jobs.push(newJob) // Mutates store directly!
```

---

## 🗄️ SUPABASE INTEGRATION ISSUES

### 11. No Real-Time Subscriptions
**Problem:** No Supabase real-time subscriptions for live data updates. Changes made by other users/devices require page refresh.

### 12. Connection Handling Issues
**Problem:** Multiple client instances could be created. While there's caching, edge cases exist:
- `client.ts` and `client-browser.ts` have separate caches
- No connection pooling
- No retry logic for failed connections

### 13. Missing Database Indexes
**Problem:** No indexes defined on frequently queried columns:
- `jobs.admin_id` (used in almost all job queries)
- `technicians.admin_id` (same issue)
- `jobs.status` (filtered in dashboard)

---

## 📋 FORM STATE MANAGEMENT

### 14. No Form Validation Library
**Problem:** Forms appear to use manual state management without:
- react-hook-form integration
- Schema validation (zod/yup)
- Dirty/pristine tracking
- Unsaved changes warnings

### 15. No Error Boundaries for Data Fetching
**Problem:** While `/app/error.tsx` exists, there's no specific error handling for:
- Network failures during data sync
- Partial data load failures
- Real-time subscription errors

---

## 📊 RECOMMENDATIONS BY PRIORITY

### Immediate (This PR)
1. ✅ Fix ID generation with crypto
2. ✅ Add localStorage cleanup on logout
3. ✅ Add loading states for async operations
4. ✅ Add error boundaries for data operations
5. ✅ Create selectors for derived state

### Short Term (Next Sprint)
6. Add RLS policies to users table
7. Implement optimistic update rollback
8. Add cache invalidation timestamps
9. Add database indexes
10. Remove hardcoded credentials

### Long Term (Backlog)
11. Implement Supabase real-time subscriptions
12. Add form state management with react-hook-form
13. Add reconciliation logic for server/client state
14. Implement connection retry logic
15. Add storage quota error handling

---

## 🔧 FILES REQUIRING CHANGES

| File | Issues | Priority |
|------|--------|----------|
| `/lib/store.ts` | ID gen, loading states, localStorage cleanup, selectors | Critical |
| `/lib/supabase/client-browser.ts` | Hardcoded credentials | High |
| `/app/api/**/*.ts` | No transaction safety, missing validation | Medium |
| Database schema | Missing RLS on users, missing indexes | High |
| Form components | No react-hook-form integration | Medium |

---

## ✅ ACCEPTANCE CRITERIA

- [ ] All IDs use cryptographically secure generation
- [ ] Local storage is cleared on logout
- [ ] Loading states available for all async operations
- [ ] Optimistic updates have proper rollback
- [ ] Selectors prevent unnecessary re-renders
- [ ] Error boundaries catch data operation failures
- [ ] RLS policies protect all tables
- [ ] Database has proper indexes for performance
