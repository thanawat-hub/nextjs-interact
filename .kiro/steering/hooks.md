# Git Hooks & Quality Gates Steering

## Pre-commit Hook (บังคับ test ก่อน commit)

### Setup: Husky + lint-staged

```bash
# Install
npm install -D husky lint-staged
npx husky init
```

### .husky/pre-commit
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running quality gates before commit..."

# 1. Type check
echo "→ TypeScript check..."
npx tsc --noEmit || { echo "❌ TypeScript errors found. Fix before commit."; exit 1; }

# 2. Lint
echo "→ Lint check..."
npx next lint || { echo "❌ Lint errors found. Fix before commit."; exit 1; }

# 3. Unit tests (affected files only — fast)
echo "→ Running unit tests..."
npx vitest run --reporter=verbose || { echo "❌ Tests failed. Fix before commit."; exit 1; }

echo "✅ All checks passed. Committing..."
```

### .husky/pre-push (stricter — before pushing to remote)
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔒 Running full test suite before push..."

# Full regression test
npx vitest run --coverage || { echo "❌ Tests failed. Fix before push."; exit 1; }

# Build check (catches runtime errors)
npx next build || { echo "❌ Build failed. Fix before push."; exit 1; }

echo "✅ All checks passed. Pushing..."
```

## Quality Gate Levels

```
┌─────────────────────────────────────────────────────┐
│ Level 1: Pre-commit (every commit)                  │
│ ├─ TypeScript type check (tsc --noEmit)             │
│ ├─ ESLint (next lint)                               │
│ └─ Unit tests (vitest run)                          │
├─────────────────────────────────────────────────────┤
│ Level 2: Pre-push (before pushing to remote)        │
│ ├─ Full test suite with coverage                    │
│ └─ Production build check (next build)              │
├─────────────────────────────────────────────────────┤
│ Level 3: Manual (before marking task as done)       │
│ ├─ UI manual testing (run dev server, click through)│
│ └─ Cross-browser check (Chrome + Safari minimum)    │
└─────────────────────────────────────────────────────┘
```

## Kiro Workflow Integration

Since Kiro cannot auto-switch models, encode the workflow in steering so it
follows the right sequence. The human (you) is responsible for:
1. Choosing the correct model before each phase
2. Confirming tests pass before allowing commit
3. Doing manual UI testing before marking done

### Suggested Kiro Prompts per Phase:

**Phase 1 — Plan (use claude-sonnet-4.5):**
```
Read .kiro/steering/ files. I want to implement [feature].
Break it down: what files to create/modify, edge cases, acceptance criteria.
Challenge my assumptions before we start coding.
```

**Phase 2 — Code (use opus4.8):**
```
Implement the plan from our previous discussion.
Follow architecture.md for file structure and database.md for queries.
Commit with conventional commit format from workflow.md.
```

**Phase 3 — Test (use claude-haiku-4.5):**
```
Write unit tests for the code we just implemented.
Use Vitest. Test happy path + edge cases + error handling.
Ensure all tests pass before we proceed.
```

**Phase 4 — Review (use claude-sonnet-4.5):**
```
Review the implementation against the original plan.
Check: security holes, RBAC bypass, unhandled errors, missing edge cases.
Grill it — what could go wrong in production?
```

## lint-staged config (package.json)
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## Vitest Config (vitest.config.ts)
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Summary: What happens when you type `git commit`

```
git commit -m "feat(chat): add streaming response"
        │
        ▼
┌─────────────────────────┐
│  .husky/pre-commit      │
│  1. tsc --noEmit    ────│──→ ❌ Fail? → Commit blocked
│  2. next lint       ────│──→ ❌ Fail? → Commit blocked
│  3. vitest run      ────│──→ ❌ Fail? → Commit blocked
└────────────┬────────────┘
             │ ✅ All pass
             ▼
     Commit created ✅

git push
        │
        ▼
┌─────────────────────────┐
│  .husky/pre-push        │
│  1. vitest --coverage ──│──→ ❌ Fail? → Push blocked
│  2. next build      ────│──→ ❌ Fail? → Push blocked
└────────────┬────────────┘
             │ ✅ All pass
             ▼
     Pushed to GitHub ✅
```

## IMPORTANT: Manual UI Testing Gate
Before marking any task as "done", you MUST:
1. Run `npm run dev`
2. Test the feature manually in browser
3. Test as each role (Admin, Member, Guest)
4. Verify no console errors
5. Only THEN proceed to commit

This step CANNOT be automated — it's your responsibility as the developer.
The pre-commit hooks only catch code-level issues, not UX problems.
