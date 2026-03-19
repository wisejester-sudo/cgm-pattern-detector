# GitHub Actions Setup for Vercel CRON_SECRET

This workflow automatically sets the `CRON_SECRET` environment variable in Vercel.

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. VERCEL_TOKEN
**How to get it:**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Scope: Full Account
5. Copy the token

**Add to GitHub:**
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `VERCEL_TOKEN`
4. Value: (paste the token from Vercel)

### 2. VERCEL_ORG_ID
**How to get it:**
1. Go to your Vercel dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project (v0-dispatchly)
3. Go to Settings → General
4. Copy "Organization ID" or "Personal Account ID"

**Add to GitHub:**
1. Create secret named `VERCEL_ORG_ID`
2. Value: (paste the ID)

### 3. VERCEL_PROJECT_ID
**How to get it:**
1. In the same Vercel project settings
2. Copy "Project ID"

**Add to GitHub:**
1. Create secret named `VERCEL_PROJECT_ID`
2. Value: (paste the ID)

## Alternative: Use .vercel/project.json

If you've deployed locally with `vercel`, you can find these values in:
```bash
cat .vercel/project.json
```

## Running the Workflow

### Option 1: Auto-run on push
The workflow runs automatically when you push changes to `vercel.json` on the main branch.

### Option 2: Manual trigger
1. Go to GitHub repo → Actions → "Set Vercel CRON_SECRET"
2. Click "Run workflow"
3. Optional: Enter a custom CRON_SECRET value (or leave empty to auto-generate)
4. Click "Run workflow"

## What the workflow does

1. Generates a random 32-byte hex string (or uses your provided value)
2. Sets it as `CRON_SECRET` in Vercel production environment
3. Triggers a redeployment to apply the new env var
4. The cron job at `/api/cron/photo-cleanup` is now secured

## Verification

After the workflow runs:
1. Go to Vercel dashboard → your project → Settings → Environment Variables
2. You should see `CRON_SECRET` listed
3. The daily cron job will run at 2 AM UTC automatically

## Troubleshooting

**Error: "Error: Vercel Token is required"**
→ You forgot to add the `VERCEL_TOKEN` secret to GitHub

**Error: "Project not found"**
→ Check that `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are correct

**Error: "Permission denied"**
→ Make sure your Vercel token has the right permissions (Full Account scope)
