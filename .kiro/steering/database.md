# Database Steering — Supabase PostgreSQL (v3 Final)

## Prerequisites
1. Enable `pgvector` extension in Supabase Dashboard → Database → Extensions
2. Enable Realtime on tables: messages, usage_logs, guest_sessions
3. Use connection pooling URL (port 6543) for all app connections
4. Enable `uuid-ossp` extension (usually enabled by default)

## Account Linking (NextAuth)
- User A logs in with Google → creates `users` + `accounts` (provider=google)
- Same User A logs in with GitHub (same email) → adds `accounts` row (provider=github)
- Both link to SAME `users.id` via `accounts.user_id`
- NextAuth handles this automatically via Supabase Adapter

## Content Safety
- `is_flagged`: Set TRUE when input is toxic/malicious (prompt injection, jailbreak, hate speech)
- `is_out_of_scope`: Set TRUE when RAG returns 0 relevant chunks
- Logic: Safety check BEFORE LLM call → saves cost + prevents abuse
- ML: flagged messages → train safety classifier; out_of_scope → active learning pipeline

## Media Generation Support
- `message_type`: text (normal chat) | image_generation (DALL-E) | video_avatar (lip-sync)
- `media_url`: Generated image URL or lip-sync video URL (Supabase Storage)
- `audio_url`: TTS audio URL (ElevenLabs)
- `generation_model`: Track which model produced what → cost breakdown per model
- `audio_duration_ms`: Audio length for lip-sync timing + TTS billing

## Full Migration SQL

```sql
-- ============================================
-- STEP 0: Enable Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 0.5: NextAuth System Tables
-- (accounts, sessions, verification_tokens)
-- Required for OAuth Account Linking
-- ============================================

CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE public.verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================
-- STEP 1: user_profiles (extends NextAuth users)
-- ============================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  display_name VARCHAR(100),
  avatar_url TEXT,
  avatar_style_prompt TEXT,
  bio TEXT,
  total_questions_asked INT DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: guest_sessions (anonymous guest tracking)
-- ============================================
CREATE TABLE public.guest_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  questions_used INT DEFAULT 0,
  max_questions INT DEFAULT 2,
  converted_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- ============================================
-- STEP 3: conversations
-- ============================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  title VARCHAR(255) DEFAULT 'New Chat',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 4: messages (with safety + media fields)
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message_type VARCHAR(30) DEFAULT 'text' CHECK (message_type IN ('text', 'image_generation', 'video_avatar')),
  content TEXT NOT NULL,
  media_url TEXT,
  audio_url TEXT,
  generation_model VARCHAR(50),
  audio_duration_ms INT,
  tokens_used INT DEFAULT 0,
  knowledge_chunks_used JSONB DEFAULT '[]',
  response_time_ms INT,
  feedback_score INT CHECK (feedback_score BETWEEN 1 AND 5),
  is_flagged BOOLEAN DEFAULT FALSE,
  is_out_of_scope BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 5: knowledge_documents
-- ============================================
CREATE TABLE public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  source_file VARCHAR(500),
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN (
    'personal', 'education', 'work_experience', 'skills', 'projects', 'general'
  )),
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 6: knowledge_chunks (with pgvector)
-- ============================================
CREATE TABLE public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  chunk_index INT NOT NULL,
  metadata JSONB DEFAULT '{}',
  tokens INT DEFAULT 0,
  hit_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 7: usage_logs
-- ============================================
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'question', 'login', 'logout', 'signup', 'feedback',
    'knowledge_update', 'image_gen', 'tts', 'video_gen'
  )),
  ip_address INET,
  user_agent TEXT,
  tokens_consumed INT DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 8: Indexes
-- ============================================
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_provider ON accounts(provider, provider_account_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_guest_sessions_session ON guest_sessions(session_id);
CREATE INDEX idx_guest_sessions_expires ON guest_sessions(expires_at);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_messages_flagged ON messages(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX idx_messages_out_of_scope ON messages(is_out_of_scope) WHERE is_out_of_scope = TRUE;
CREATE INDEX idx_messages_type ON messages(message_type);
CREATE INDEX idx_chunks_document ON knowledge_chunks(document_id);
CREATE INDEX idx_chunks_embedding ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_session ON usage_logs(session_id);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at);
CREATE INDEX idx_usage_logs_action ON usage_logs(action);

-- ============================================
-- STEP 9: Trigger — Auto-create user_profiles on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, role, display_name, total_questions_asked, last_active_at, created_at
  ) VALUES (
    NEW.id,
    'member',
    COALESCE(NEW.name, split_part(NEW.email, '@', 1)),
    0,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 10: Row Level Security (RLS)
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can read own profile
CREATE POLICY "users_read_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin full access
CREATE POLICY "admin_full_profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Users see own conversations
CREATE POLICY "users_own_conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

-- Users see messages in own conversations
CREATE POLICY "users_own_messages" ON messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND user_id = auth.uid())
  );

-- Admin can see all
CREATE POLICY "admin_all_conversations" ON conversations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_all_messages" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- STEP 11: Enable Supabase Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE usage_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE guest_sessions;

-- ============================================
-- STEP 12: Helper function — Similarity search
-- ============================================
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  document_id UUID,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    kc.document_id,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  WHERE kc.embedding IS NOT NULL
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Relationships Summary
| From | To | Type | FK |
|------|----|------|-----|
| users | accounts | 1:Many | accounts.user_id |
| users | sessions | 1:Many | sessions.user_id |
| users | user_profiles | 1:1 | user_profiles.user_id |
| users | conversations | 1:Many | conversations.user_id |
| users | usage_logs | 1:Many | usage_logs.user_id |
| users | knowledge_documents | 1:Many | knowledge_documents.uploaded_by |
| guest_sessions | conversations | 1:Many | conversations.session_id (logical) |
| guest_sessions | usage_logs | 1:Many | usage_logs.session_id (logical) |
| guest_sessions | users | 0..1:1 | guest_sessions.converted_to_user_id |
| conversations | messages | 1:Many | messages.conversation_id |
| knowledge_documents | knowledge_chunks | 1:Many | knowledge_chunks.document_id |
| messages ↔ knowledge_chunks | M:M (logical) | messages.knowledge_chunks_used (JSONB) |

## Table Count
| Type | Tables | Count in Grading? |
|------|--------|-------------------|
| NextAuth System | users, accounts, sessions, verification_tokens | ❌ Not counted |
| Custom (graded) | user_profiles, guest_sessions, conversations, messages, knowledge_documents, knowledge_chunks, usage_logs | ✅ **7 tables** (exceeds 5 minimum) |

## Guest → Member Merge Logic
```typescript
async function mergeGuestToUser(sessionId: string, newUserId: string) {
  // 1. Transfer conversations
  await supabase.from('conversations').update({ user_id: newUserId }).eq('session_id', sessionId);
  // 2. Transfer usage_logs
  await supabase.from('usage_logs').update({ user_id: newUserId }).eq('session_id', sessionId);
  // 3. Mark guest as converted
  await supabase.from('guest_sessions').update({
    converted_to_user_id: newUserId,
    converted_at: new Date().toISOString()
  }).eq('session_id', sessionId);
}
```
