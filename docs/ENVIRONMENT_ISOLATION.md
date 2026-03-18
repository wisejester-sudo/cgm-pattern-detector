# Environment Isolation Guide

## Overview

Dispatchly supports multiple environments (Production, Staging, Development) with **strict isolation** to prevent data leakage and ensure technicians access the correct instance.

## The Problem

Without environment isolation:
- Magic links generated on staging could work on production
- Technicians could accidentally access wrong environment
- Data inconsistencies between staging and production

## The Solution

### 1. Database-Level Isolation (Recommended)

**Separate Supabase projects for each environment:**

| Environment | Database | URL |
|-------------|----------|-----|
| Production | prod-db | getdispatchly.co |
| Staging | staging-db | staging.getdispatchly.co |
| Development | local/dev | localhost:3000 |

**Benefits:**
- Complete data isolation
- Different datasets per environment
- No risk of cross-contamination

**Setup:**
1. Create separate Supabase projects in dashboard
2. Set different `SUPABASE_URL` for each environment
3. Never share database between environments

### 2. Environment Validation (Implemented)

Each magic link includes environment metadata:

```typescript
// Token includes
{
  magic_link_token: "abc123...",
  environment: "production",      // VERCEL_ENV
  base_url: "getdispatchly.co", // NEXT_PUBLIC_APP_URL
  expires_at: "2024-03-25T..."
}
```

**Validation Flow:**
1. Admin generates link on Production → stores with `environment: "production"`
2. Technician clicks link on Staging
3. API checks: `technician.environment === process.env.VERCEL_ENV`
4. **Rejects** if environments don't match

**Error Message:**
> "This link was generated for getdispatchly.co. Please use the correct environment URL."

## Environment Variables

### Required for Environment Isolation

```bash
# Vercel automatically sets this
VERCEL_ENV=production | preview | development

# Your app's base URL
NEXT_PUBLIC_APP_URL=https://getdispatchly.co
```

### Vercel Deployment Setup

**Production:**
```bash
vercel --prod
# VERCEL_ENV=production
# NEXT_PUBLIC_APP_URL=https://getdispatchly.co
```

**Preview (Staging):**
```bash
vercel
# VERCEL_ENV=preview
# NEXT_PUBLIC_APP_URL=https://staging.getdispatchly.co
```

**Development:**
```bash
npm run dev
# VERCEL_ENV=development (or undefined)
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Migration Guide

### Step 1: Run Database Migration

```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/001_add_environment_validation.sql
```

This adds:
- `environment` column
- `base_url` column
- `magic_link_expires_at` column
- Index for fast lookups

### Step 2: Update Existing Records

```sql
-- Set default environment for existing technicians
UPDATE technicians 
SET environment = 'production', 
    base_url = 'https://getdispatchly.co'
WHERE environment IS NULL;
```

### Step 3: Deploy Code Changes

1. Commit and push changes
2. Deploy to production
3. Test magic links in each environment

## Testing Environment Isolation

### Test 1: Cross-Environment Rejection

1. Generate magic link on Staging
2. Try to use it on Production
3. **Expected:** Error message about wrong environment

### Test 2: Same-Environment Success

1. Generate magic link on Production
2. Use it on Production
3. **Expected:** Works normally

### Test 3: Legacy Token Compatibility

1. Use old magic link (before migration)
2. **Expected:** Works if no environment set (backward compatible)

## Troubleshooting

### Issue: "This link was generated for another environment"

**Cause:** Magic link was generated in different environment

**Solution:**
- Regenerate link in correct environment
- Or use database-per-environment setup

### Issue: Environment undefined in development

**Cause:** `VERCEL_ENV` not set locally

**Solution:** Add to `.env.local`:
```bash
VERCEL_ENV=development
```

### Issue: Tokens work across environments unexpectedly

**Cause:** Same database shared between environments

**Solution:** Use separate Supabase projects (recommended)

## Best Practices

1. **Use separate databases** for Production and Staging
2. **Never share magic links** between environments
3. **Always test** in staging before production
4. **Monitor logs** for environment mismatch errors
5. **Clear staging data** regularly to avoid confusion

## Security Benefits

- ✅ Prevents accidental data leakage
- ✅ Protects against confused deputy attacks
- ✅ Clear environment boundaries
- ✅ Audit trail of token generation environment

## Migration Status

- [x] Database schema updated
- [x] Token generation includes environment
- [x] Token validation checks environment
- [x] Documentation complete
- [ ] Separate staging database (recommended)
- [ ] Testing completed

## Questions?

Contact: [Your support email]
