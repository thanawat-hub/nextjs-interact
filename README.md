# 🤖 Avatar Knowledge Chat — "Ask Tor"

> An AI-powered avatar chat web app where visitors can interact with a digital version of Thanawat (Tor).
> Ask about skills, experience, projects — and get real-time answers powered by RAG.

## 🎯 Features

- **AI Avatar Chat** — Ask questions and get AI-powered answers from my knowledge base
- **RAG (Retrieval-Augmented Generation)** — Answers grounded in actual data, not hallucinations
- **3 Tiers**: Guest (2 questions) → Member (unlimited) → Admin (manage everything)
- **Real-time Admin Dashboard** — See live chat activity via Supabase Realtime
- **Multi-modal Response** — Text, image generation, TTS audio, lip-sync video avatar
- **Dark/Light Mode** — Full theme support
- **Data Flywheel** — Schema designed for future ML/DL pipelines

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Auth | NextAuth.js (Auth.js v5) — Google + GitHub OAuth |
| Database | Supabase (PostgreSQL + pgvector) |
| AI | OpenAI GPT-4o-mini + text-embedding-3-small |
| Streaming | Vercel AI SDK (SSE) |
| Realtime | Supabase Realtime (WebSocket) |
| Storage | Supabase Storage |
| CSS | Tailwind CSS + shadcn/ui |
| Deploy | Vercel |

## 📊 Database Schema

- **7 custom tables** (exceeds 5 minimum requirement)
- **4 NextAuth system tables** (accounts, sessions, etc.)
- Relations: 1:1, 1:Many, M:M (logical via JSONB)
- Vector embeddings for semantic search (pgvector)

See full ER diagram: [`.kiro/steering/er.mermaid`](.kiro/steering/er.mermaid)

## 🔐 RBAC (Role-Based Access Control)

| Role | Access |
|------|--------|
| **Admin** | Full access, manage knowledge, live dashboard, promote users |
| **Member** | Unlimited chat, view history, rate answers |
| **Guest** | 2 questions per session (no login required) |

## 🚀 Getting Started

### Project Status

#### Phase 1 ✅ **COMPLETED** - Project Setup & Infrastructure
- [x] Next.js 15 initialized with App Router, TypeScript, Tailwind CSS v4
- [x] All dependencies installed (next-auth, supabase, drizzle-orm, AI SDK, shadcn/ui)
- [x] Testing infrastructure setup (Vitest + Testing Library)
- [x] Quality gates configured (Husky pre-commit & pre-push hooks)
- [x] Environment configuration files created
- [x] Drizzle ORM configured for database migrations
- [x] Project structure established

#### Phase 2-9 (In Progress)
- [ ] NextAuth + OAuth configuration
- [ ] Database schema implementation
- [ ] Guest session management
- [ ] Knowledge base & RAG pipeline
- [ ] AI chat with streaming
- [ ] Admin dashboard with Realtime
- [ ] UI polish + dark mode
- [ ] Testing & deployment

### Prerequisites
- Node.js 20+
- Supabase account (with pgvector enabled)
- OpenAI API key
- Google/GitHub OAuth credentials

### Setup
```bash
# 1. Clone & install
git clone <repo-url>
cd realtime-interact
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in all required values in .env.local

# 3. Run database migration
# Copy SQL from .kiro/steering/database.md → Supabase SQL Editor → Run

# 4. Start dev server
npm run dev
```

### Deploy to Vercel
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel Dashboard
3. Deploy → verify production URL

## 📁 Project Structure
```
realtime-interact/
├── .husky/                   # Git hooks (pre-commit, pre-push)
├── .kiro/
│   ├── plans/                # Implementation plan (9 phases)
│   ├── skills/               # AI-DLC workflow skills
│   └── steering/             # Architecture & database documentation
├── knowledge/                # Knowledge base for RAG
│   └── knowledge.md          # Main knowledge content
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   ├── (auth)/           # Auth pages (login/register)
│   │   ├── chat/             # Chat interface
│   │   ├── admin/            # Admin dashboard
│   │   └── api/              # API routes
│   ├── components/           # React components
│   │   └── ui/               # shadcn/ui components
│   ├── db/                   # Drizzle ORM schema
│   ├── lib/                  # Utilities (auth, supabase, RAG)
│   └── test/                 # Test setup & utilities
├── .env.local                # Local environment variables
├── .env.example              # Environment template
├── drizzle.config.ts         # Drizzle ORM config
├── vitest.config.ts          # Vitest config
└── package.json              # Dependencies & scripts
```

## 🧪 Quality Gates

This project implements strict quality gates via git hooks:

**Pre-commit** (runs on every commit):
1. TypeScript type check
2. ESLint
3. Unit tests

**Pre-push** (runs before pushing):
1. Full test suite with coverage
2. Production build check

Configure in `.husky/pre-commit` and `.husky/pre-push`.

## 📝 Available Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run start         # Start production server

# Testing
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run with coverage report

# Code Quality
npm run lint          # Run ESLint
```

## 📁 Project Structure (Old)
```
app/
├── page.tsx              → Landing page (avatar hero)
├── (auth)/login/         → Login page
├── chat/                 → Main chat interface
├── admin/                → Live dashboard (admin only)
└── api/                  → Backend routes (chat, knowledge, auth)
```

