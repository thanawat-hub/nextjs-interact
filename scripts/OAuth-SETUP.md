# OAuth Setup Guide

## Google OAuth Setup

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com

### 2. Create a New Project (if needed)
- Click the project dropdown at the top
- Click "New Project"
- Name it: "Ask Tor Avatar" (or your choice)
- Click "Create"

### 3. Enable Google+ API
- In the left sidebar, go to **APIs & Services** → **Library**
- Search for "Google+ API"
- Click on it and click **Enable**

### 4. Configure OAuth Consent Screen
- Go to **APIs & Services** → **OAuth consent screen**
- Choose **External** (for testing)
- Click **Create**

Fill in required fields:
- **App name**: Ask Tor
- **User support email**: Your email
- **Developer contact email**: Your email
- Click **Save and Continue**

On Scopes page:
- Click **Add or Remove Scopes**
- Add: `userinfo.email`, `userinfo.profile`
- Click **Update** → **Save and Continue**

On Test users page:
- Add your email as a test user
- Click **Save and Continue**

### 5. Create OAuth Credentials
- Go to **APIs & Services** → **Credentials**
- Click **Create Credentials** → **OAuth client ID**
- Choose **Web application**

Configure:
- **Name**: Ask Tor Web Client
- **Authorized JavaScript origins**: 
  - `http://localhost:3000`
- **Authorized redirect URIs**:
  - `http://localhost:3000/api/auth/callback/google`
  - (Later add production URL: `https://your-app.vercel.app/api/auth/callback/google`)
- Click **Create**

### 6. Save Credentials
Copy the **Client ID** and **Client Secret** to your `.env.local`:
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

## GitHub OAuth Setup

### 1. Go to GitHub Settings
Visit: https://github.com/settings/developers

### 2. Register New OAuth App
- Click **New OAuth App**

Fill in:
- **Application name**: Ask Tor
- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
- Click **Register application**

### 3. Generate Client Secret
- After creation, click **Generate a new client secret**
- Copy the secret immediately (you won't see it again!)

### 4. Save Credentials
Copy the **Client ID** and **Client Secret** to your `.env.local`:
```env
GITHUB_CLIENT_ID=your-client-id-here
GITHUB_CLIENT_SECRET=your-client-secret-here
```

---

## Production Setup (Later)

When deploying to Vercel, update your OAuth apps:

### Google:
Add to **Authorized redirect URIs**:
- `https://your-app.vercel.app/api/auth/callback/google`

### GitHub:
Update **Authorization callback URL** to:
- `https://your-app.vercel.app/api/auth/callback/github`

Or create separate OAuth apps for production.

---

## OpenAI API Key

### 1. Go to OpenAI Platform
Visit: https://platform.openai.com

### 2. Create API Key
- Click your profile → **View API keys**
- Click **Create new secret key**
- Name it: "Ask Tor Development"
- Copy the key immediately

### 3. Save to .env.local
```env
OPENAI_API_KEY=sk-your-key-here
```

---

## Verify Setup

After adding all credentials to `.env.local`:

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Check auth status:
   ```bash
   curl http://localhost:3000/api/auth/status
   ```

3. Try signing in:
   - Go to `http://localhost:3000/login`
   - Click "Continue with Google" or "Continue with GitHub"
   - Complete OAuth flow
   - You should be redirected to `/chat`

4. Check database:
   - Go to Supabase Dashboard → **Table Editor**
   - Check `users` table - your account should be there
   - Check `user_profiles` table - profile should be auto-created with role='member'

---

## Troubleshooting

### "redirect_uri_mismatch" error
- Check your OAuth callback URL matches exactly
- Include protocol (http:// or https://)
- No trailing slash

### "Access blocked" error (Google)
- Add your email to test users in OAuth consent screen
- App is in "Testing" mode, only test users can sign in

### "User not created in database"
- Check Supabase logs in Dashboard → **Logs**
- Verify trigger is working: `SELECT * FROM pg_triggers WHERE tgname = 'on_auth_user_created';`
- Check RLS policies aren't blocking insert

### Session errors
- Clear cookies and try again
- Check NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your current URL
