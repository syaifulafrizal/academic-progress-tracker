# Research Progress Tracker

Production-oriented MVP for lecturer/student academic progress tracking.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Supabase Auth/PostgreSQL/Storage-ready
- Local preview persistence fallback through `localStorage`

## Local Development

```bash
npm install
npm run dev
```

Open the printed local URL and choose a preview lecturer/student account.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor or through the Supabase CLI.
3. Create `.env.local` from `.env.example`.
4. Set:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

The current app remains usable without Supabase credentials using local preview persistence. The database schema and RLS policies are included for production wiring.

## Verification

```bash
npm run lint
npm run build
```
