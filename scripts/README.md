# Setup Scripts

## 1. Setup Environment Variables

Run the interactive setup script:

```bash
./scripts/setup-env.sh
```

This will:
- Prompt you for Supabase credentials
- Generate a secure NEXTAUTH_SECRET
- Create .env.local file with all required variables
- Backup existing .env.local if it exists

## 2. Database Migration

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `scripts/migrate-database.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for completion (should take ~5 seconds)
8. Verify tables were created by running:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
   ```

### Option B: Using Drizzle Kit (Alternative)

```bash
npm run db:push
```

⚠️ **Note:** Option A is recommended for first setup as it includes RLS policies and triggers.

## 3. Enable Realtime

1. Go to **Database** → **Replication** in Supabase Dashboard
2. Enable replication for these tables:
   - `messages`
   - `usage_logs`
   - `guest_sessions`

## 4. Verify Setup

Check auth status:
```bash
curl http://localhost:3000/api/auth/status
```

Should return:
```json
{
  "configured": true,
  "message": "Authentication is fully configured",
  "providers": {
    "google": false,
    "github": false
  },
  "database": {
    "supabase": true
  }
}
```

## Next Steps

After database setup:
1. Get OAuth credentials (see OAuth-SETUP.md)
2. Get OpenAI API key
3. Update .env.local with OAuth credentials
4. Restart dev server: `npm run dev`
