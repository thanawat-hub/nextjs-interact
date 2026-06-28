#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Supabase Setup Helper${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists. Creating backup...${NC}"
    cp .env.local .env.local.backup
    echo -e "${GREEN}✓ Backup created: .env.local.backup${NC}"
fi

echo ""
echo -e "${YELLOW}Please enter your Supabase credentials:${NC}"
echo ""

# Prompt for Supabase URL
read -p "NEXT_PUBLIC_SUPABASE_URL (https://xxxxx.supabase.co): " SUPABASE_URL

# Prompt for Anon Key
read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY (eyJhbGci...): " ANON_KEY

# Prompt for Service Role Key
read -p "SUPABASE_SERVICE_ROLE_KEY (eyJhbGci...): " SERVICE_ROLE_KEY

# Prompt for Database URL
read -p "DATABASE_URL (postgresql://...@...pooler.supabase.com:6543/postgres): " DATABASE_URL

# Prompt for Direct URL
read -p "DIRECT_URL (postgresql://...@...pooler.supabase.com:5432/postgres): " DIRECT_URL

echo ""
echo -e "${YELLOW}Generating .env.local...${NC}"

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Write to .env.local
cat > .env.local << EOF
# ============================================
# Avatar Knowledge Chat — Environment Variables
# Generated: $(date)
# ============================================

# --- NextAuth.js ---
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# --- Database (Drizzle ORM) ---
DATABASE_URL=$DATABASE_URL
DIRECT_URL=$DIRECT_URL

# --- OAuth Providers (TODO: Get credentials) ---
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# --- AI / LLM (TODO: Get OpenAI API key) ---
OPENAI_API_KEY=

# --- Optional: TTS (ElevenLabs) ---
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=

# --- Optional: Video Avatar (Hedra/D-ID) ---
HEDRA_API_KEY=
EOF

echo -e "${GREEN}✓ .env.local created successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Get OAuth credentials from Google and GitHub"
echo "2. Get OpenAI API key from platform.openai.com"
echo "3. Run the database migration: npm run db:push"
echo ""
echo -e "${GREEN}================================${NC}"
