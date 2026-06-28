# Deployment Steering — Vercel + Supabase

## Environment Variables (Vercel Dashboard)

```env
# NextAuth
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.vercel.app
AUTH_TRUST_HOST=true

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Database (Connection Pooling — MUST use port 6543)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Direct connection (migrations only — port 5432)
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# OpenAI
OPENAI_API_KEY=sk-...

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

## Connection Pooling (CRITICAL)

### Problem
Vercel is serverless — each request can spawn a new DB connection.
Under load → "Too many connections" error kills the app.

### Solution
```typescript
// lib/supabase.ts — Use Supabase JS Client (handles pooling internally)
import { createClient } from '@supabase/supabase-js';

// For server-side (API routes, Server Components)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// For client-side (React components)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

```typescript
// drizzle.config.ts — Use pooling URL for runtime, direct for migrations
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,  // port 6543 (pooled)
  },
});
```

## Vercel Deploy Checklist

1. [ ] GitHub repo connected to Vercel
2. [ ] All env vars set in Vercel Dashboard (Settings → Environment Variables)
3. [ ] Framework Preset: Next.js (auto-detected)
4. [ ] Build Command: `next build` (default)
5. [ ] Output Directory: `.next` (default)
6. [ ] Node.js version: 20.x
7. [ ] Supabase pgvector extension enabled
8. [ ] Database migration ran successfully
9. [ ] OAuth callback URLs configured:
   - Google: `https://your-app.vercel.app/api/auth/callback/google`
   - GitHub: `https://your-app.vercel.app/api/auth/callback/github`
10. [ ] Test production URL — no runtime errors
11. [ ] Test RBAC: admin/member/guest all work correctly

## Supabase Setup Checklist

1. [ ] Create new Supabase project
2. [ ] Enable pgvector extension (Dashboard → Database → Extensions)
3. [ ] Run full migration SQL (from database.md)
4. [ ] Enable Realtime on tables (messages, usage_logs, guest_sessions)
5. [ ] Configure RLS policies
6. [ ] Create Storage bucket for avatars (`avatars` bucket, public)
7. [ ] Note down: URL, anon key, service role key, connection strings
8. [ ] Test `match_knowledge_chunks` function works

## Common Vercel Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `NEXTAUTH_URL mismatch` | URL not set or wrong | Set exact production URL |
| `Too many connections` | Using direct DB URL | Switch to pooling URL (port 6543) |
| `vector type not found` | pgvector not enabled | Enable in Supabase Extensions |
| `JWT expired` | Clock skew | Add `AUTH_TRUST_HOST=true` |
| `OAuth callback error` | Wrong redirect URI | Update in Google/GitHub console |
| `Edge runtime unsupported` | Using Node.js libs in middleware | Use `export const runtime = 'nodejs'` |
