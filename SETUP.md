# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 20+
- Supabase account
- Google/GitHub account (for OAuth)
- OpenAI API key

---

## 📦 Phase 3: Database & Auth Setup

### Step 1: Create Supabase Project (5 min)

1. Go to [https://supabase.com](https://supabase.com)
2. Click **New Project**
3. Fill in:
   - Name: `realtime-interact`
   - Database Password: (generate strong password - **save it!**)
   - Region: Choose closest to you
4. Click **Create** (wait ~2 min)

### Step 2: Enable pgvector Extension (1 min)

1. In Supabase Dashboard, go to **Database** → **Extensions**
2. Search for `vector`
3. Click **Enable** on the `vector` extension

### Step 3: Get Supabase Credentials (2 min)

1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:

```
Project URL → NEXT_PUBLIC_SUPABASE_URL
anon/public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
service_role key → SUPABASE_SERVICE_ROLE_KEY ⚠️ Keep secret!
```

3. Go to **Project Settings** → **Database**
4. Scroll to **Connection string** → Select **URI**
5. Copy both:
   - Port 6543 (Transaction/Pooling) → `DATABASE_URL`
   - Port 5432 (Session/Direct) → `DIRECT_URL`

Replace `[YOUR-PASSWORD]` with your database password in both URLs.

### Step 4: Run Setup Script (1 min)

```bash
cd /Users/thanawat.b/Desktop/2026/workspaces/side_project/realtime-interact
./scripts/setup-env.sh
```

Paste your Supabase credentials when prompted.

### Step 5: Run Database Migration (1 min)

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy **entire contents** of `scripts/migrate-database.sql`
4. Paste and click **Run**
5. Verify: Should see "Migration Complete! 🎉"

### Step 6: Enable Realtime (1 min)

1. Go to **Database** → **Replication**
2. Turn on replication for:
   - `messages`
   - `usage_logs`
   - `guest_sessions`

### Step 7: Get OAuth Credentials (10 min)

Follow detailed guide: `scripts/OAuth-SETUP.md`

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project
3. Enable Google+ API
4. Configure OAuth consent screen
5. Create credentials (Web application)
6. Add callback: `http://localhost:3000/api/auth/callback/google`

**GitHub OAuth:**
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. New OAuth App
3. Callback: `http://localhost:3000/api/auth/callback/github`

Add to `.env.local`:
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### Step 8: Get OpenAI API Key (2 min)

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create API key
3. Add to `.env.local`:
```env
OPENAI_API_KEY=sk-...
```

### Step 9: Restart & Verify (1 min)

```bash
npm run dev
```

Check status:
```bash
curl http://localhost:3000/api/auth/status
```

Should show:
```json
{
  "configured": true,
  "providers": { "google": true, "github": true },
  "database": { "supabase": true }
}
```

### Step 10: Test Sign In

1. Go to `http://localhost:3000/login`
2. Click "Continue with Google" or "Continue with GitHub"
3. Complete OAuth flow
4. Check Supabase Dashboard → **Table Editor** → `users` table
5. Your account should be there!
6. Check `user_profiles` table → profile auto-created with `role='member'`

---

## ✅ Setup Complete!

You now have:
- ✅ Supabase database with 11 tables
- ✅ pgvector extension enabled
- ✅ OAuth authentication working
- ✅ User profiles auto-created on signup
- ✅ Guest session system ready
- ✅ Realtime enabled for admin dashboard

---

## 🎯 Next Steps

**Phase 4: Knowledge Base & RAG**
- Expand `knowledge/knowledge.md` with your content
- Implement knowledge ingestion pipeline
- Test RAG retrieval

**Phase 5: AI Chat**
- Implement chat API with streaming
- Integrate RAG with OpenAI
- Build chat UI

See `PROGRESS.md` for full roadmap.

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch" error
→ Check OAuth callback URL matches exactly
→ Include `http://localhost:3000`

### "Access blocked" Google error
→ Add your email to test users in OAuth consent screen

### Database connection fails
→ Check DATABASE_URL uses port 6543 (pooling)
→ Verify password is correct (no special characters need encoding)

### Trigger not working
→ Run this in SQL Editor:
```sql
SELECT * FROM pg_triggers WHERE tgname = 'on_auth_user_created';
```
→ Should return 1 row

### More help
→ See `scripts/OAuth-SETUP.md` for OAuth details
→ See `scripts/README.md` for database details
→ Check Supabase logs: **Dashboard** → **Logs**

---

## 📝 Files Created

```
scripts/
├── README.md                 # Script documentation
├── OAuth-SETUP.md           # Detailed OAuth setup guide
├── migrate-database.sql     # Complete database migration
└── setup-env.sh             # Interactive env setup
```

**Total Setup Time:** ~25 minutes

Ready to build! 🚀
