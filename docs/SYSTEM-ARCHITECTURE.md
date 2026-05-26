# System Architecture — EcoPlay

This document explains how EcoPlay is structured and how its core systems interact. For setup instructions, see [`docs/setup.md`](./SETUP.md).

---

## 1. High-Level Overview

EcoPlay is a **client-side React SPA**. There is no custom backend server. All auth, database, and real-time functionality is handled by **Supabase** directly from the browser, secured by Row Level Security (RLS) policies.

```mermaid
graph TD
    User["👤 User (Browser)"]
    Vite["Vite Dev / Build"]
    React["React 18 SPA"]
    Context["React Context\n(AuthContext, GameContext)"]
    Supabase["Supabase"]
    Auth["Supabase Auth"]
    DB["PostgreSQL Database"]
    Realtime["Realtime Subscriptions"]
    Deploy["Vercel / Netlify\n(Static Hosting)"]

    User --> Vite
    Vite --> React
    React --> Context
    Context --> Supabase
    Supabase --> Auth
    Supabase --> DB
    Supabase --> Realtime
    Deploy --> User
```

---

## 2. Frontend Structure

The `src/` directory is organized by responsibility:

| Folder | Purpose |
|--------|---------|
| `components/` | Reusable UI — Navbar, Layout, AnimatedBackground, EcoChatbot |
| `context/` | Global state — AuthContext, GameContext |
| `lib/` | Supabase client initialization |
| `pages/` | Route-level views — one file per page |
| `services/` | Data persistence helpers |

---

## 3. Page Routing Flow

React Router v7 handles client-side navigation. All routes are defined in `App.tsx`.

```mermaid
flowchart TD
    App["App.tsx"]
    Login["Login / Auth\n(unauthenticated)"]
    Dashboard["Dashboard"]
    Ocean["OceanCleanupGame"]
    Village["EcoVillage"]
    Learn["Learn"]
    Events["Events"]
    Community["Community"]
    Bingo["Bingo"]

    App -->|"not authenticated"| Login
    App -->|"authenticated"| Dashboard
    Dashboard --> Ocean
    Dashboard --> Village
    Dashboard --> Learn
    Dashboard --> Events
    Dashboard --> Community
    Dashboard --> Bingo
```

---

## 4. Component Structure

```mermaid
graph TD
    App --> Layout
    Layout --> Navbar
    Layout --> Page["Active Page Component"]
    Layout --> EcoChatbot
    Layout --> AnimatedBackground
    Page --> SupabaseClient["lib/supabase.ts"]
    Page --> Context["AuthContext / GameContext"]
```

`Layout` wraps every authenticated page and renders the persistent Navbar and EcoChatbot alongside page content.

---

## 5. Global State Management

Two React Contexts manage shared state across the app:

| Context | Manages |
|---------|---------|
| `AuthContext` | Current user session, login/logout, auth state loading |
| `GameContext` | Points, levels, badges, daily challenge state |

```mermaid
flowchart LR
    AuthContext["AuthContext\n(user, session, signOut)"]
    GameContext["GameContext\n(points, level, badges)"]
    Pages["All Pages & Components"]
    Supabase["Supabase"]

    AuthContext -->|provides session| Pages
    GameContext -->|provides game state| Pages
    Pages -->|reads/writes| Supabase
    Supabase -->|updates state| AuthContext
    Supabase -->|updates state| GameContext
```

---

## 6. Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Auth.tsx
    participant AuthContext
    participant SupabaseAuth as Supabase Auth

    User->>Auth.tsx: Enter email & password
    Auth.tsx->>SupabaseAuth: signInWithPassword()
    SupabaseAuth-->>AuthContext: onAuthStateChange fires
    AuthContext-->>App.tsx: session updated
    App.tsx-->>User: Redirect to Dashboard

    Note over SupabaseAuth: Supabase handles password\nhashing and JWT issuance.\nNo custom auth logic needed.
```

- Auth state is initialized in `AuthContext` via `supabase.auth.onAuthStateChange`.
- Protected routes check session from `AuthContext` before rendering.
- `Auth.tsx` and `Login.tsx` handle the sign-up and sign-in UI respectively.

---

## 7. Supabase Integration

`lib/supabase.ts` initializes a single Supabase client using environment variables:

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

This client is imported wherever DB or auth access is needed. All queries are automatically scoped to the authenticated user via RLS.

---

## 8. Database Interaction

```mermaid
flowchart LR
    Component["Page / Component"]
    Client["supabase client\n(lib/supabase.ts)"]
    RLS["Row Level Security"]
    DB["PostgreSQL Tables\n(users, game_scores,\neco_villages, challenges,\ncommunity_posts, events)"]

    Component -->|"query / mutation"| Client
    Client --> RLS
    RLS -->|"scoped to auth.uid()"| DB
    DB -->|"data response"| Component
```

All tables have RLS enabled — users can only read and write their own data unless explicitly granted broader access (e.g. leaderboards).

---

## 9. Real-Time Updates

Supabase Realtime is used for live leaderboards and community post feeds.

```mermaid
sequenceDiagram
    participant ComponentA as User A (Browser)
    participant SupabaseRT as Supabase Realtime
    participant ComponentB as User B (Browser)

    ComponentA->>SupabaseRT: INSERT game_score
    SupabaseRT-->>ComponentB: broadcast change event
    ComponentB->>ComponentB: update leaderboard state
```

Subscriptions are set up with `supabase.channel()` inside `useEffect` hooks and cleaned up on component unmount.

---

## 10. Game Flow

### Ocean Cleanup Game

```mermaid
flowchart TD
    Start["Game Start"] --> Spawn["Spawn trash items\n(randomized type & position)"]
    Spawn --> Click["User clicks trash"]
    Click --> Score["Calculate points\n(trash type × combo multiplier)"]
    Score --> Combo{"Combo active?"}
    Combo -->|Yes| Boost["Apply multiplier bonus"]
    Combo -->|No| Base["Base points only"]
    Boost --> Update["Update score state"]
    Base --> Update
    Update --> Level{"Level threshold\nreached?"}
    Level -->|Yes| LevelUp["Increase difficulty\nmore trash, faster spawn"]
    Level -->|No| Spawn
    LevelUp --> Spawn
    Update --> Save["Persist score\nto game_scores table"]
```

### Eco Village

```mermaid
flowchart TD
    Load["Load village state\nfrom eco_villages table"]
    Load --> Display["Render environment\nbased on upgrade state"]
    Display --> Action["User selects upgrade\n(tree, solar panel, filter)"]
    Action --> Check{"Enough points?"}
    Check -->|No| Deny["Show insufficient points"]
    Check -->|Yes| Deduct["Deduct points\nfrom users table"]
    Deduct --> Apply["Apply upgrade\nto eco_villages table"]
    Apply --> Metrics["Recalculate metrics\n(air quality, biodiversity,\nwater clarity)"]
    Metrics --> Display
```

---

## 11. AI Chatbot Flow

The current EcoBot uses local keyword matching. No external API is called.

```mermaid
flowchart TD
    Input["User types message"]
    Input --> Parse["Scan for keywords\n(climate, recycling,\nenergy, ocean...)"]
    Parse --> Match{"Keyword matched?"}
    Match -->|Yes| Response["Return matched\neco-knowledge response"]
    Match -->|No| Fallback["Return default\nfallback message"]
    Response --> Display["Display in chat UI"]
    Fallback --> Display

    style Parse fill:#f0f0f0
    note["🔜 Planned: Replace with\nLLM API call (OpenAI/Gemini)"]
```

See the [AI Roadmap in README](../README.md#ai-chatbot--roadmap) for planned LLM integration.

---

## 12. Data Persistence Flow

`services/persistence.ts` handles saving game state:

```mermaid
flowchart LR
    GameEvent["Game event\n(score, upgrade, challenge)"]
    Persist["persistence.ts"]
    Supabase["Supabase DB"]
    Context["GameContext"]

    GameEvent --> Persist
    Persist -->|"upsert / insert"| Supabase
    Supabase -->|"updated record"| Persist
    Persist -->|"update local state"| Context
```

---

## 13. Error Handling

`ErrorBoundary.tsx` wraps the React tree and catches unhandled render errors, preventing a full blank-screen crash.

```mermaid
flowchart TD
    Render["Component renders"]
    Render --> Error{"Runtime error\nthrown?"}
    Error -->|No| Display["Normal UI"]
    Error -->|Yes| Boundary["ErrorBoundary catches"]
    Boundary --> Fallback["Show error fallback UI\nwith reload option"]
```

Supabase query errors are handled at the call site — components check for `error` in the response and render appropriate UI states (empty state, retry button).

---

## 14. Build and Deployment Flow

```mermaid
flowchart LR
    Dev["Local Dev\nnpm run dev"]
    Build["npm run build\n→ dist/"]
    Deploy["Push to main branch"]
    Host["Vercel / Netlify\nServes dist/ as static site"]
    Env["Env vars set\nin hosting dashboard"]

    Dev -->|"code ready"| Build
    Build --> Deploy
    Deploy --> Host
    Env --> Host
```

- Vite compiles TypeScript and bundles all assets into `dist/`.
- The `dist/` folder is a fully static site — no server runtime required.
- Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) must be set in the hosting platform's dashboard before deploying.