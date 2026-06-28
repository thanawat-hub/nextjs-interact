# Architecture Steering — Avatar Knowledge Chat (v3 Final)

## Project Overview
AI-powered avatar chat web app extending Thanawat's portfolio (thanawat-hub.github.io).
Visitors ask questions via an AI avatar that:
1. **Text mode**: Retrieves answers from knowledge.md using RAG (default)
2. **Image mode**: Generates images via DALL-E 3 when relevant
3. **Video avatar mode**: Lip-sync video of avatar speaking the answer (TTS + video gen)

## Tech Stack (Mandatory — do not substitute)
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router, file-system based routing) |
| Auth | NextAuth.js (Auth.js v5) — Google + GitHub OAuth |
| Database | Supabase (PostgreSQL) with pgvector extension |
| ORM | Drizzle ORM (connection pooling via port 6543) |
| AI Chat | OpenAI API (gpt-4o-mini) via Vercel AI SDK (streaming) |
| Embeddings | OpenAI text-embedding-3-small (1536 dim) |
| TTS | ElevenLabs API (optional — for voice response) |
| Image Gen | DALL-E 3 via OpenAI API (optional — for image responses) |
| Video Avatar | Hedra or D-ID API (optional — lip-sync from audio + image) |
| Realtime | Supabase Realtime (WebSocket) for Admin Dashboard |
| Storage | Supabase Storage (avatar images, generated media) |
| CSS | Tailwind CSS v4 + shadcn/ui |
| Deploy | Vercel (Production) |

## File-system Based Routing (App Router)
```
app/
├── page.tsx                          → / (Landing + Avatar hero)
├── layout.tsx                        → Root Layout (ThemeProvider, Auth)
├── (auth)/
│   ├── login/page.tsx                → /login
│   └── register/page.tsx             → /register
├── chat/
│   └── page.tsx                      → /chat (Main chat interface)
├── admin/
│   ├── page.tsx                      → /admin (Live Dashboard)
│   ├── knowledge/page.tsx            → /admin/knowledge (Manage docs)
│   └── analytics/page.tsx            → /admin/analytics (Charts)
├── api/
│   ├── auth/[...nextauth]/route.ts   → NextAuth handler
│   ├── chat/route.ts                 → AI chat (streaming + RAG)
│   ├── knowledge/
│   │   ├── route.ts                  → CRUD knowledge docs
│   │   └── ingest/route.ts           → Chunk + embed knowledge
│   ├── guest/route.ts                → Guest session management
│   └── media/
│       ├── tts/route.ts              → Text-to-Speech generation
│       └── video/route.ts            → Lip-sync video generation
└── unauthorized/page.tsx             → /unauthorized
```

## Database Schema (7 Custom + 4 System = 11 total)
### System Tables (NextAuth — not counted)
1. `users` — NextAuth managed
2. `accounts` — OAuth Account Linking (Google + GitHub → same user)
3. `sessions` — Server-side sessions
4. `verification_tokens` — Email verification

### Custom Tables (graded — 7 tables, exceeds 5 minimum)
1. `user_profiles` — Role (admin|member), avatar, engagement metrics
2. `guest_sessions` — Anonymous tracking, rate limit, conversion
3. `conversations` — Chat sessions (user_id OR session_id)
4. `messages` — Messages with safety flags + media support
5. `knowledge_documents` — Source document metadata
6. `knowledge_chunks` — Chunked text with vector embeddings
7. `usage_logs` — All actions for analytics + billing

## RBAC (Role-Based Access Control)
| Role | Where defined | Access | Quota |
|------|--------------|--------|-------|
| Admin | `user_profiles.role = 'admin'` | Full access, manage knowledge, live dashboard | Unlimited |
| Member | `user_profiles.role = 'member'` | Chat, history, feedback, dark mode | Unlimited |
| Guest | `guest_sessions` (no user account) | Chat only (no login required) | 2 questions per session |

## Critical Implementation Notes

### 1. NextAuth + Supabase Adapter + Account Linking
- `@auth/supabase-adapter` → auto-creates users row
- `accounts` table stores OAuth tokens → 1 user can link Google + GitHub
- Trigger auto-creates `user_profiles` on new user INSERT
- Guest does NOT exist in users → tracked via `guest_sessions`

### 2. pgvector Extension
- MUST enable BEFORE running migration
- Embedding: 1536 dim (text-embedding-3-small)
- Index: IVFFlat with cosine similarity (lists=100)
- Search: `match_knowledge_chunks()` RPC function

### 3. Supabase Realtime (Bonus Points)
- AI streaming (Vercel AI SDK/SSE) ≠ Supabase Realtime (WebSocket)
- Realtime used for Admin Dashboard: live feed, guest count, usage stats
- Enable: `ALTER PUBLICATION supabase_realtime ADD TABLE messages, usage_logs, guest_sessions;`

### 4. Content Safety Pipeline
```
User message → Moderation check → is_flagged? 
  YES → save with is_flagged=TRUE, respond "ไม่สามารถตอบได้", DON'T call LLM
  NO → RAG retrieval → chunks found?
    YES → call LLM with context → stream response
    NO → save with is_out_of_scope=TRUE, respond "ไม่มีข้อมูลในส่วนนี้"
```

### 5. Media Generation Pipeline (Future/Optional)
```
User asks question → LLM generates text answer
  → (optional) TTS: text → ElevenLabs → audio_url + audio_duration_ms
  → (optional) Video: audio + avatar_image → Hedra/D-ID → media_url (mp4)
  → Save all URLs in messages row
```

### 6. Connection Pooling (CRITICAL for Vercel)
- Vercel = Serverless → each request = new DB connection
- MUST use Supabase pooling URL (port 6543, NOT 5432)
- Use Supabase JS Client for most queries (handles pooling internally)
- Direct connection (port 5432) only for migrations

### 7. Data Flywheel Design
Schema supports future ML/DL:
- `feedback_score` → Reward Model / RLHF
- `knowledge_chunks_used` → Reranker training data
- `hit_count` → Content recommendation
- `is_flagged` → Safety classifier training
- `is_out_of_scope` → Active learning pipeline
- `usage_logs` → Anomaly detection, traffic forecasting
- `guest_sessions` → Conversion prediction
- `generation_model` + `cost_usd` → Cost optimization model
