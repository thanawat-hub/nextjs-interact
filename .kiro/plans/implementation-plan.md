# Implementation Plan — Avatar Knowledge Chat

## Overview
Build an AI-powered avatar chat web app with Next.js, Supabase, and NextAuth.
Deploying on Vercel with RBAC (Admin/Member/Guest).

---

## Phase 1: Project Setup & Infrastructure
**Estimated time: 1-2 hours**

### Step 1.1: Initialize Next.js Project
- [ ] `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir`
- [ ] Install dependencies:
  ```bash
  npm install next-auth @auth/supabase-adapter @supabase/supabase-js
  npm install ai @ai-sdk/openai
  npm install drizzle-orm postgres
  npm install -D drizzle-kit
  npm install lucide-react next-themes
  npx shadcn@latest init
  ```

### Step 1.2: Setup Supabase
- [ ] Create Supabase project (supabase.com)
- [ ] Enable pgvector extension (Dashboard → Database → Extensions)
- [ ] Copy connection strings (pooled port 6543 + direct port 5432)
- [ ] Run full migration SQL from `.kiro/steering/database.md`
- [ ] Verify tables created (7 tables + trigger)
- [ ] Enable Realtime on messages, usage_logs, guest_sessions

### Step 1.3: Environment Variables
- [ ] Create `.env.local` with all required variables (see deployment.md)
- [ ] Create `.env.example` (same keys, empty values) for GitHub

### Step 1.4: Git Setup
- [ ] `git init` + `.gitignore` (include `.env.local`, node_modules)
- [ ] Initial commit
- [ ] Push to GitHub (public or private with instructor access)

---

## Phase 2: Authentication & RBAC
**Estimated time: 2-3 hours**

### Step 2.1: NextAuth Configuration
- [ ] Create `src/lib/auth.ts` — NextAuth config with Supabase Adapter
- [ ] Setup Google OAuth provider
- [ ] Setup GitHub OAuth provider
- [ ] Setup Credentials provider (email/password) — optional
- [ ] Create `app/api/auth/[...nextauth]/route.ts`

### Step 2.2: PostgreSQL Trigger (auto user_profiles)
- [ ] Verify trigger `on_auth_user_created` works
- [ ] Test: signup via OAuth → check user_profiles row exists with role='member'
- [ ] Implement fallback in `src/lib/get-user-profile.ts` (belt & suspenders)

### Step 2.3: Middleware — Route Protection
- [ ] Create `src/middleware.ts`
- [ ] Protect `/admin/*` → admin only
- [ ] Protect `/chat` → allow all (guest uses session_id)
- [ ] Redirect unauthenticated to login for member-only features

### Step 2.4: RBAC in API Routes
- [ ] Create `src/lib/auth-guard.ts` — helper to check role in API routes
- [ ] Admin routes: reject if role !== 'admin'
- [ ] Member routes: reject if not authenticated
- [ ] Guest routes: check session_id + quota in guest_sessions

---

## Phase 3: Guest Session Management
**Estimated time: 1-2 hours**

### Step 3.1: Guest Session Logic
- [ ] Create `src/lib/guest-session.ts`
- [ ] On first visit (no auth): generate UUID → store in cookie + create guest_sessions row
- [ ] Track questions_used per session
- [ ] When questions_used >= max_questions → return "signup required" response

### Step 3.2: Guest → Member Merge
- [ ] On successful signup: run merge logic
- [ ] Transfer conversations (UPDATE user_id WHERE session_id)
- [ ] Transfer usage_logs
- [ ] Mark guest_sessions.converted_to_user_id

---

## Phase 4: Knowledge Base & RAG
**Estimated time: 2-3 hours**

### Step 4.1: Create knowledge.md
- [ ] Write comprehensive knowledge about Thanawat (from portfolio)
- [ ] Categories: personal, education, work_experience, skills, projects
- [ ] Place in `src/knowledge/knowledge.md`

### Step 4.2: Knowledge Ingestion Pipeline
- [ ] Create `src/lib/knowledge-ingestion.ts`
- [ ] Parse markdown → split into chunks (500-800 tokens each)
- [ ] Generate embeddings via OpenAI `text-embedding-3-small`
- [ ] Insert into knowledge_documents + knowledge_chunks
- [ ] Create admin API route: `POST /api/knowledge/ingest`

### Step 4.3: RAG Retrieval
- [ ] Create `src/lib/rag.ts`
- [ ] Function: embed user query → call `match_knowledge_chunks` RPC
- [ ] Return top 3-5 relevant chunks as context
- [ ] Update hit_count on retrieved chunks

---

## Phase 5: AI Chat (Streaming)
**Estimated time: 2-3 hours**

### Step 5.1: Chat API Route
- [ ] Create `app/api/chat/route.ts`
- [ ] Accept: messages array + conversationId
- [ ] Check auth/role/quota before processing
- [ ] Retrieve relevant knowledge chunks (RAG)
- [ ] Call OpenAI via Vercel AI SDK with streaming
- [ ] Save user message + assistant response to DB
- [ ] Log to usage_logs (tokens, cost)
- [ ] Increment guest_sessions.questions_used if guest

### Step 5.2: System Prompt
- [ ] Create system prompt that instructs AI to be Thanawat's avatar
- [ ] Include personality, tone, boundaries (don't make up info)
- [ ] Inject relevant knowledge chunks as context

### Step 5.3: Chat UI Component
- [ ] Create `src/components/ChatWindow.tsx`
- [ ] Use `useChat` hook from Vercel AI SDK
- [ ] Message bubbles (user = right, assistant = left)
- [ ] Streaming text animation
- [ ] Auto-scroll to bottom
- [ ] Input box with send button + Enter key

---

## Phase 6: Admin Dashboard (Supabase Realtime)
**Estimated time: 2-3 hours**

### Step 6.1: Dashboard Page
- [ ] Create `app/admin/page.tsx`
- [ ] Stats cards: active guests, questions today, conversion rate
- [ ] Protect with middleware (admin only)

### Step 6.2: Supabase Realtime Integration
- [ ] Subscribe to `messages` table INSERT → live feed
- [ ] Subscribe to `guest_sessions` INSERT/UPDATE → active guest count
- [ ] Subscribe to `usage_logs` INSERT → today's question counter
- [ ] Show green "LIVE" indicator on dashboard

### Step 6.3: Knowledge Management Page
- [ ] Create `app/admin/knowledge/page.tsx`
- [ ] List all knowledge_documents with chunk count, hit_count sum
- [ ] Upload new .md file → trigger ingestion
- [ ] Delete/deactivate documents
- [ ] Re-ingest (new version)

---

## Phase 7: UI Polish & Bonus Features
**Estimated time: 2-3 hours**

### Step 7.1: Dark/Light Mode
- [ ] Install `next-themes`
- [ ] Add ThemeProvider to layout
- [ ] Toggle button in header
- [ ] All components respect theme

### Step 7.2: Loading States
- [ ] Skeleton screens for dashboard stats
- [ ] Skeleton for chat history loading
- [ ] Streaming dots while AI is thinking
- [ ] Error boundary with friendly message

### Step 7.3: Avatar Display
- [ ] Landing page: avatar image with glow animation
- [ ] Chat header: small avatar icon
- [ ] Future: upgrade to video/3D model

### Step 7.4: Supabase Storage (Bonus)
- [ ] Create `avatars` storage bucket
- [ ] Admin can upload avatar image
- [ ] Serve via Supabase Storage CDN URL

---

## Phase 8: Testing & Deployment
**Estimated time: 1-2 hours**

### Step 8.1: Local Testing
- [ ] Test full flow: Guest → ask 2 questions → blocked → signup → continue
- [ ] Test Admin: login → see live dashboard → manage knowledge
- [ ] Test Member: login → unlimited chat → view history
- [ ] Test edge cases: rate limits, empty knowledge, long messages

### Step 8.2: Deploy to Vercel
- [ ] Connect GitHub repo to Vercel
- [ ] Set all environment variables in Vercel Dashboard
- [ ] Deploy → verify production URL works
- [ ] Test OAuth callbacks on production URL
- [ ] Update NEXTAUTH_URL to production URL

### Step 8.3: Final Checklist
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] No runtime errors in Vercel logs
- [ ] RBAC working correctly on all routes
- [ ] Realtime dashboard updates without refresh
- [ ] Knowledge RAG returns relevant answers
- [ ] Guest quota enforced
- [ ] Mobile responsive

---

## Phase 9: Documentation & Viva Prep
**Estimated time: 1 hour**

### Step 9.1: README.md
- [ ] Project description
- [ ] Tech stack
- [ ] Setup instructions (for instructor to run locally)
- [ ] ER Diagram link (dbdiagram.io)
- [ ] Screenshots

### Step 9.2: Viva Preparation
- [ ] Explain Data Flywheel concept
- [ ] Explain why guest_sessions is separate from users
- [ ] Explain connection pooling (port 6543 vs 5432)
- [ ] Explain Supabase Realtime vs AI Streaming difference
- [ ] Explain SECURITY DEFINER in trigger
- [ ] Explain RLS policies
- [ ] Be ready to explain any code line in the project

---

## Total Estimated Time: 14-22 hours
