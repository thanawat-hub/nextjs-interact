# Workflow Steering — Task Execution Rules

## 🚨 MANDATORY: Every task MUST follow this cycle

```
┌─────────────────────────────────────────────────────────┐
│              PLAN → CODE → TEST → REVIEW                 │
│                                                          │
│  1. PLAN (claude-sonnet-4.5)                            │
│     └─ Break down task, identify edge cases             │
│     └─ Grill requirements — challenge ambiguity         │
│     └─ Produce implementation plan before coding        │
│                                                          │
│  2. CODE (opus4.8)                                      │
│     └─ Implement based on approved plan                 │
│     └─ Follow architecture.md + database.md steering    │
│     └─ Commit with meaningful messages                  │
│                                                          │
│  3. TEST (claude-haiku-4.5)                             │
│     └─ Write unit tests for new code                    │
│     └─ Run regression tests on affected modules         │
│     └─ Verify no breaking changes                       │
│                                                          │
│  4. REVIEW (claude-sonnet-4.5)                          │
│     └─ Grill the implementation against requirements    │
│     └─ Challenge decisions, check for blind spots       │
│     └─ Approve or request changes                       │
└─────────────────────────────────────────────────────────┘
```

## Model Assignment

| Phase | Model | Role | Rationale |
|-------|-------|------|-----------|
| **Plan** | `claude-sonnet-4.5` | Architect / Grill Master | Breaks down requirements, challenges assumptions, produces detailed plan |
| **Code** | `opus4.8` | Senior Engineer | Writes production code, implements features, handles complex logic |
| **Test** | `claude-haiku-4.5` | QA Engineer | Writes unit tests, regression tests — fast and cost-efficient |
| **Review** | `claude-sonnet-4.5` | Tech Lead / Reviewer | Grills implementation, checks alignment with plan, finds blind spots |

## Rules

### Before ANY coding starts:
1. **Create a plan** — describe what will be built, what files will be created/modified
2. **Identify dependencies** — what existing code/tables/APIs does this touch?
3. **Define acceptance criteria** — how do we know it's done correctly?
4. **Challenge the plan** — are there edge cases? race conditions? security holes?

### During coding:
1. Follow the approved plan — don't deviate without re-planning
2. Reference steering files (architecture.md, database.md) for design decisions
3. Write self-documenting code with TypeScript types
4. Handle errors gracefully — no unhandled promise rejections

### After coding (BEFORE marking task as done):
1. **Unit tests** — test individual functions/components in isolation
2. **Integration tests** — test API routes with mock data
3. **Regression tests** — ensure existing features still work
4. **Manual verification** — run dev server and test the actual flow

### On new requirements or changes:
1. **Grill the change** — why? what does it affect? what breaks?
2. **Update plan** — modify implementation-plan.md if needed
3. **Update steering** — if architecture/DB changes, update relevant .md files
4. **Re-test** — run full regression on affected areas

## Test Strategy

### Unit Tests (claude-haiku-4.5)
- Framework: **Vitest** (fast, TypeScript-native)
- Location: `__tests__/` or `*.test.ts` co-located with source
- Coverage targets:
  - Utility functions: 90%+
  - API route handlers: 80%+
  - React components: 70%+ (key interactions)

### Regression Tests (claude-haiku-4.5)
- Run AFTER every feature change
- Focus areas:
  - Auth flow (login/logout/role check)
  - Guest quota enforcement
  - RAG retrieval accuracy
  - RBAC (admin routes blocked for member/guest)
  - API error handling

### What to test per module:
| Module | Critical Tests |
|--------|---------------|
| Auth (NextAuth) | OAuth flow, session creation, role assignment, trigger fires |
| Guest Sessions | Quota counting, session expiry, merge on signup |
| Chat API | Safety check (flagged), RAG retrieval, streaming, token counting |
| Knowledge | Ingestion pipeline, chunk creation, embedding generation, search |
| Admin Dashboard | Realtime subscription, stats accuracy, admin-only access |
| RBAC | Middleware blocks non-admin, API rejects unauthorized |

## Naming Conventions for Commits

### Format
```
<type>(<scope>): <short description>

[optional body — what & why, not how]

[optional footer — BREAKING CHANGE, closes #issue]
```

### Types (Conventional Commits)
| Type | ใช้เมื่อ | ตัวอย่าง |
|------|---------|---------|
| `feat` | เพิ่ม feature ใหม่ที่ user เห็น | `feat(chat): add streaming AI response with Vercel AI SDK` |
| `fix` | แก้ bug | `fix(guest): reset quota counter on session expiry` |
| `refactor` | ปรับโค้ดโดยไม่เปลี่ยน behavior | `refactor(rag): switch from raw SQL to match_knowledge_chunks RPC` |
| `test` | เพิ่ม/แก้ test | `test(rbac): add middleware role-check unit tests` |
| `docs` | เปลี่ยนเฉพาะ documentation | `docs(steering): update database.md with media fields` |
| `style` | formatting, semicolons, whitespace (ไม่กระทบ logic) | `style(ui): fix tailwind class ordering` |
| `perf` | ปรับปรุง performance | `perf(rag): add ivfflat index for embedding search` |
| `build` | เปลี่ยน build system, dependencies | `build(deps): upgrade next.js to 15.x` |
| `ci` | เปลี่ยน CI/CD config | `ci(vercel): add preview deployment for PRs` |
| `chore` | อื่นๆ ที่ไม่กระทบ src/test | `chore: update .env.example with new keys` |
| `revert` | revert commit ก่อนหน้า | `revert: feat(chat) — remove experimental video avatar` |

### Scopes (เฉพาะ project นี้)
| Scope | ครอบคลุมอะไร |
|-------|-------------|
| `auth` | NextAuth, OAuth, accounts table, sessions, login/logout |
| `rbac` | Middleware, role checking, route protection, policies |
| `guest` | guest_sessions, quota, rate limiting, guest→member merge |
| `chat` | Chat API, streaming, message saving, conversation management |
| `rag` | Knowledge ingestion, chunking, embedding, vector search, retrieval |
| `safety` | Content moderation, is_flagged, is_out_of_scope, prompt injection prevention |
| `media` | TTS (ElevenLabs), image gen (DALL-E), video avatar (Hedra/D-ID) |
| `admin` | Admin dashboard, realtime subscriptions, knowledge management UI |
| `db` | Migration, schema changes, triggers, RLS policies, indexes |
| `ui` | Components, layouts, theme, dark mode, animations |
| `api` | API routes not covered by other scopes |
| `deps` | Package updates, new dependencies |
| `deploy` | Vercel config, env vars, build settings |
| `steering` | .kiro/steering files, plans, workflow docs |

### Rules
1. **Subject line ≤ 72 characters** — ถ้ายาวเกิน ให้ย่อ description, ใส่ detail ใน body
2. **ใช้ imperative mood** — "add" ไม่ใช่ "added", "fix" ไม่ใช่ "fixed"
3. **ภาษาอังกฤษ** — commit message เป็น English เท่านั้น (ไทยไว้ใน PR description)
4. **1 commit = 1 logical change** — อย่ารวมหลาย features ใน commit เดียว
5. **BREAKING CHANGE** — ถ้ามี breaking change ใส่ footer:
   ```
   feat(db)!: rename user_profiles.role enum values
   
   BREAKING CHANGE: role values changed from "user" to "member"
   ```

### ตัวอย่าง Commit Messages สำหรับ Project นี้
```
feat(auth): implement NextAuth with Google + GitHub OAuth
feat(auth): add account linking (multiple providers per user)
feat(db): create initial migration with 7 custom tables + triggers
feat(guest): implement session-based quota tracking (max 2 questions)
feat(chat): add AI streaming response with Vercel AI SDK
feat(rag): implement knowledge ingestion pipeline (chunk + embed)
feat(safety): add OpenAI moderation check before LLM call
feat(admin): add realtime dashboard with Supabase subscriptions
feat(media): integrate ElevenLabs TTS for voice responses
feat(ui): add dark/light mode with next-themes

fix(guest): prevent quota bypass via cookie manipulation
fix(rbac): block /admin routes for non-admin in middleware
fix(rag): handle empty embedding result gracefully

test(auth): add OAuth flow + trigger unit tests
test(guest): verify quota enforcement and merge logic
test(chat): test safety pipeline (flagged + out_of_scope)

refactor(rag): extract similarity search into Supabase RPC function
perf(db): add partial index on messages.is_flagged
docs(steering): add workflow.md with model assignment
chore: add .env.example with all required variables
```

## When to Re-plan
- New requirement from user → STOP → re-plan with sonnet
- Bug found that indicates design flaw → STOP → review architecture
- Performance issue → STOP → profile before optimizing
- Dependency conflict → STOP → evaluate alternatives
