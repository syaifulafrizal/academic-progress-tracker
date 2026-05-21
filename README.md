# Research Progress Tracker

Production-oriented MVP for lecturer/student research progress tracking.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- Local preview mode through `localStorage`

## Local Development

```bash
npm install
npm run dev
```

Without Supabase env vars, the app runs in preview mode with local sample accounts.

## Live Database Setup

1. Create a Supabase project.
2. Run these files in Supabase SQL Editor in order:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_auth_profile_policies.sql
supabase/migrations/003_link_student_accounts.sql
```

3. Create `.env.local` from `.env.example`.
4. Set:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_AUTH_REDIRECT_URL=http://localhost:5173
VITE_ENABLE_PREVIEW_MODE=true
```

## Account Flow

1. Create a lecturer account from the app.
2. Lecturer registers a student profile with the student's email.
3. Student creates an account using the same email.
4. Lecturer opens the student profile and clicks **Link Student Account**.
5. Student logs in and sees their own dashboard.

## Supabase Auth Settings

For local testing, set Supabase Authentication URL settings:

```text
Site URL: http://localhost:5173
Redirect URL: http://localhost:5173/**
```

For public deployment, add the deployed app URL as both Site URL and Redirect URL.

For testing many signups quickly, either disable email confirmation temporarily or configure custom SMTP in Supabase. The default Supabase email provider has strict rate limits.

## Vercel Deployment

Deploy the `supabase-integration` branch and set these Vercel environment variables:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_AUTH_REDIRECT_URL=https://your-vercel-app.vercel.app
VITE_ENABLE_PREVIEW_MODE=false
```

After deployment, update Supabase Authentication URL settings with:

```text
Site URL: https://your-vercel-app.vercel.app
Redirect URL: https://your-vercel-app.vercel.app/**
```

## Verification

```bash
npm run lint
npm run build
```
