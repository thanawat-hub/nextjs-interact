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
```
feat(auth): add Google OAuth with account linking
fix(chat): prevent LLM call when is_flagged=true
test(guest): add quota enforcement unit tests
refactor(rag): optimize chunk retrieval query
docs(steering): update database.md with new fields
```

## When to Re-plan
- New requirement from user → STOP → re-plan with sonnet
- Bug found that indicates design flaw → STOP → review architecture
- Performance issue → STOP → profile before optimizing
- Dependency conflict → STOP → evaluate alternatives
