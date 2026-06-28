# UI/UX Steering — Avatar Knowledge Chat

## Design System
- **CSS Framework:** Tailwind CSS v4
- **Component Library:** shadcn/ui (Radix primitives)
- **Icons:** Lucide React
- **Fonts:** Inter (sans), JetBrains Mono (code)
- **Theme:** Dark/Light mode via `next-themes` (bonus points)

## Color Palette
```
Primary: #6366f1 (Indigo-500)
Surface Dark: #0f172a (Slate-900)
Surface Light: #ffffff
Text Dark: #f8fafc (Slate-50)
Text Light: #1e293b (Slate-800)
Accent: #8b5cf6 (Violet-500) — for avatar glow effect
Success: #10b981 (Emerald-500)
Error: #ef4444 (Red-500)
```

## Page Layouts

### Landing Page (`/`)
- Hero section with animated avatar (image initially, video/3D later)
- "Chat with my avatar" CTA button
- Brief intro cards (skills, experience highlights)
- Footer with link back to portfolio

### Chat Page (`/chat`)
- Full-screen chat interface (similar to ChatGPT)
- Left sidebar: conversation history (members only)
- Main area: message bubbles with streaming text
- Bottom: input box with send button
- Avatar image/animation in header
- Guest banner: "You have X/2 questions remaining. Sign up for unlimited access"

### Admin Dashboard (`/admin`)
- Top: Stats cards (active guests, questions today, conversion rate)
- Middle: Live questions feed (Supabase Realtime — messages appear instantly)
- Bottom: Charts (questions over time, popular knowledge areas)
- Sidebar: Navigation (Dashboard, Knowledge, Analytics)

### Knowledge Management (`/admin/knowledge`)
- Table of knowledge documents
- Upload/edit/delete knowledge files
- Preview chunks and embeddings status
- Hit count visualization per chunk

## Loading States (Bonus Points)
- Skeleton screens for all data-loading pages
- Streaming indicator (pulsing dots) during AI response
- Optimistic updates for feedback submission

## Responsive Design
- Mobile-first approach
- Chat interface: full-width on mobile, centered on desktop
- Admin dashboard: stack cards on mobile, grid on desktop

## Animations
- Chat messages: fade-in from bottom
- Avatar: subtle breathing/glow animation (CSS)
- Stats cards on admin: count-up animation on mount
- Page transitions: fade (minimal, don't overdo)

## Accessibility
- All interactive elements have aria-labels
- Keyboard navigation support
- Color contrast meets WCAG 2.1 AA
- Focus indicators visible
