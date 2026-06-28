# Product Steering — Avatar Knowledge Chat

## Product Vision
A personal AI avatar that allows visitors to interact with a digital version of Thanawat (Tor).
Starting with a static image avatar, evolving to video/3D in the future.
Visitors can ask about skills, experience, projects, and get real-time answers powered by RAG.

## Target Users
1. **Recruiters** — want to quickly learn about Thanawat's background
2. **Peers / Developers** — curious about projects and tech stack
3. **Instructors** — evaluating the final project submission
4. **Thanawat (Admin)** — monitoring interactions, improving knowledge base

## Core User Stories

### Guest (no login)
- As a guest, I can ask up to 2 questions about Thanawat without signing up
- As a guest, I see a clear message when my quota is reached with a signup CTA
- As a guest, my conversation is preserved if I decide to sign up

### Member (signed up)
- As a member, I can chat unlimited with the avatar
- As a member, I can view my conversation history
- As a member, I can rate answers (1-5 stars) to help improve quality
- As a member, I can switch between dark/light mode

### Admin (Thanawat)
- As admin, I can see a live dashboard of who's chatting right now
- As admin, I can manage knowledge documents (upload/edit/delete)
- As admin, I can see which knowledge areas are most popular
- As admin, I can see conversion metrics (guest → member)
- As admin, I can promote users to admin role

## Success Metrics
- Guest → Member conversion rate > 20%
- Average feedback score > 3.5/5
- Knowledge coverage: < 10% questions with no chunk match
- Admin dashboard shows real-time data (< 1s latency)

## Non-Goals (Out of Scope for v1)
- Video/3D avatar (future — start with image)
- Voice input/output
- Multi-language support
- Payment/subscription tiers
- Mobile native app

## Naming & Branding
- App name: "Ask Tor" or "Chat with Tor"
- Tone: friendly, technical, honest (never fabricate info)
- Avatar personality: enthusiastic about AI/tech, helpful, concise

## Data Flywheel (Key Selling Point for Viva)
This project is designed as a **Data Flywheel**:
1. Users ask questions → data collected (messages, feedback, usage)
2. Data analyzed → find knowledge gaps, popular topics
3. Knowledge improved → better answers
4. Better answers → more users → more data → loop

ML/DL extensions:
- feedback_score → RLHF fine-tuning reward signal
- knowledge_chunks_used → reranker training pairs
- hit_count → content recommendation
- usage_logs → anomaly detection, traffic forecasting
- guest_sessions → conversion prediction model
