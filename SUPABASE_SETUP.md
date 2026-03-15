# Supabase Setup Guide for Dispatchly

## What I've Done

I've connected the Dispatchly app to Supabase with the following setup:

### 1. Installed Dependencies
- `@supabase/supabase-js` - Supabase client library
- `@supabase/ssr` - Server-side rendering helpers for Next.js App Router

### 2. Created Configuration Files
- `lib/supabase/client.ts` - Browser client for client components
- `lib/supabase/server.ts` - Server client for Server Components
- `lib/supabase/middleware.ts` - Middleware for session management
- `middleware.ts` - Next.js middleware to refresh sessions
- `.env.local` - Environment variables template

### 3. Created Database Types
- `lib/database.types.ts` - TypeScript types for all tables
- `supabase/schema.sql` - Full SQL schema with RLS policies

### 4. Created Auth Pages
- `app/login/page.tsx` - Login/signup page
- `app/setup/page.tsx` - Company setup page (creates company profile)
- `app/auth/callback/route.ts` - OAuth callback handler

### 5. Updated Data Layer
- `hooks/use-jobs.ts` - Real-time job fetching with Supabase
- `app/(dashboard)/jobs/page.tsx` - Updated to use Supabase data
- `app/(dashboard)/layout.tsx` - Added auth checks
- `components/app-sidebar.tsx` - Added logout button

## What You Need To Do

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com and sign up/login
2. Click "New Project"
3. Choose a name (e.g., "dispatchly")
4. Select region (choose closest to your users)
5. Choose a strong database password (save this!)
6. Click "Create new project"

### Step 2: Get Your API Keys

Once your project is created:

1. Go to Project Settings → API
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Step 3: Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 4: Create Database Tables

1. In Supabase Dashboard, go to SQL Editor
2. Create a "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click "Run"

This creates:
- `companies` - Business profiles
- `technicians` - Field technicians
- `jobs` - Service jobs
- `updates` - Status updates with SMS tracking
- `photos` - Photo uploads
- `sms_logs` - SMS message history

All tables have Row Level Security (RLS) policies so users can only see their own data.

### Step 5: Enable Authentication

1. In Supabase Dashboard, go to Authentication → Settings
2. Under "Site URL", add: `http://localhost:3000`
3. Under "Redirect URLs", add: `http://localhost:3000/auth/callback`
4. Enable "Email" provider (should be on by default)

### Step 6: Run the App

```bash
cd ~/.openclaw/workspace/projects/dispatchly/v0-code/v0-dispatchly-main
npm run dev
```

Open http://localhost:3000 and you should be redirected to `/login`.

### Step 7: Test the Flow

1. **Sign up**: Create an account at `/login`
2. **Setup company**: Enter your company name and phone number
3. **Create a job**: Click "Create Job" and fill in customer details
4. **Update status**: Use the dropdown to change job status
5. **Logout**: Click "Sign Out" in the sidebar

## Database Schema

### Companies
```sql
id: uuid (primary key)
user_id: uuid (references auth.users)
name: text
phone: text
created_at: timestamp
```

### Technicians
```sql
id: uuid (primary key)
company_id: uuid (references companies)
name: text
phone: text
magic_link_token: text (for magic link auth)
created_at: timestamp
```

### Jobs
```sql
id: uuid (primary key)
company_id: uuid (references companies)
technician_id: uuid (references technicians, nullable)
customer_name: text
customer_phone: text
address: text
job_type: text
status: enum ('scheduled', 'enroute', 'working', 'complete')
notes: text
created_at: timestamp
updated_at: timestamp
```

### Updates
```sql
id: uuid (primary key)
job_id: uuid (references jobs)
status: enum ('scheduled', 'enroute', 'working', 'complete')
notes: text
sms_sent_at: timestamp
sms_delivered: boolean
created_at: timestamp
```

### Photos
```sql
id: uuid (primary key)
update_id: uuid (references updates)
url: text
thumbnail_url: text
size_bytes: integer
created_at: timestamp
```

### SMS Logs
```sql
id: uuid (primary key)
job_id: uuid (references jobs, nullable)
direction: enum ('inbound', 'outbound')
body: text
from_number: text
to_number: text
twilio_sid: text
created_at: timestamp
```

## Next Steps

The following features from the PRD are not yet implemented:

1. **Technician Mobile View** - Magic links for technicians
2. **Photo Upload** - Supabase Storage integration
3. **SMS Integration** - Twilio integration
4. **SMS Templates** - Template management in settings
5. **Customer Photo Viewer** - Public page for customers
6. **Two-Way SMS** - Reply handling

## Troubleshooting

### "Failed to fetch jobs" error
- Check that Supabase is running and accessible
- Verify your `.env.local` values are correct
- Check browser console for more details

### "Not authenticated" error
- You need to be logged in to access the dashboard
- The middleware should redirect to `/login` automatically

### RLS policy errors
- Make sure the SQL schema was run successfully
- Check that the user has a company record in the `companies` table

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - never expose it to the client
- RLS policies are active on all tables
- Users can only see data from their own company
- Magic links for technicians use unique tokens
