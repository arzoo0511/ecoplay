# EcoPlay 🌍
star repo before contributing !! 
> A gamified environmental education platform that makes sustainability fun, measurable, and community-driven.

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---
## Live Demo: [ecoplay-gamma.vercel.app](https://ecoplay-gamma.vercel.app)

---
## Table of Contents

- [Overview](#overview)
- [Features](#Features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Supabase Setup](#supabase-setup)
- [AI Chatbot & Roadmap](#ai-chatbot--roadmap)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](/docs/CONTRIBUTING.md)
- [Contributor Introductions](CONTRIBUTOR_INTRODUCTION.md)
- [License](#license)

---

# EcoPlay — Gamified Environmental Platform

EcoPlay is an interactive environmental learning platform built with **React 18+**, **Vite 5+**, **Tailwind CSS 3+**, and **Framer Motion**. It combines creative mini-games, an evolving Eco Village, dynamic dashboards, educational content, community engagement, and environmental events, all supported by a **SQL backend** for gamification, leaderboards, and persistent user progress.

---

##  Features

### Core Functionality
- **Multi-page Navigation** — Dashboard, Ocean Cleanup Game, Eco Village, Learn, Events, and Community
- **Ocean Cleanup Game** — Interactive trash collection with scoring, combo mechanics, and leaderboards
- **Advanced Eco Village** — A dynamic environment that changes based on user actions
- **Educational Content** — Curated videos, tutorials, and interactive learning materials
- **Community Platform** — Users can ask questions, share solutions, and discuss eco-topics
- **Events System** — A real-time feed of environmental initiatives and activities
- **Gamification** — Points, levels, badges, daily challenges, and leaderboards
- **AI Chatbot** — An environmental assistant with a rich eco-knowledge database

### Technical Features
- **Authentication** — Secure login and signup with Supabase Auth
- **Database Integration** — PostgreSQL powered by Supabase for persistent data storage
- **Real-time Updates** — Live leaderboards and community interactions
- **Responsive Design** — Mobile-first experience built with Tailwind CSS
- **Smooth Animations** — Interactive transitions powered by Framer Motion
- **Performance Optimized** — Lazy loading and efficient state management

---

## 🎮 Game Features

### Ocean Cleanup Game
- **Interactive Gameplay** — Collect different types of ocean trash
- **Scoring System** — Each trash type awards different points
- **Combo System** — Chain collections to earn bonus multipliers
- **Level Progression** — Difficulty increases with more trash and obstacles
- **Achievements** — Rewards for perfect cleanups and streaks

### Eco Village System
- **Dynamic Environment** — Begins as a polluted wasteland and transforms through user actions
- **Multiple Zones** — Forests, gardens, wetlands, solar farms, and wildlife habitats
- **Interactive Upgrades** — Spend points on trees, solar panels, and water filters
- **Environmental Feedback** — Track air quality, water clarity, and biodiversity
- **Visual Effects** — Particle systems, day/night cycles, and seasonal changes

### Gamification Elements
- **Points System** — Earn points through games and challenges
- **Levels & Badges** — Track progress and unlock achievement rewards
- **Daily Challenges** — Integrated mini-games and eco tasks
- **Leaderboards** — Compete with players globally
- **Environmental Health** — Monitor your eco-footprint and improvements

---

## 🗄️ Database Schema

### Core Tables
- **users** — User profiles, points, levels, and badges
- **eco_villages** — User environment states and upgrades
- **game_scores** — Game performance and leaderboard data
- **challenges** — Daily challenges and progress tracking
- **community_posts** — User-generated content and discussions
- **events** — Environmental events and activities

### Key Features
- **Row Level Security** — Secure data access with Supabase RLS
- **Real-time Subscriptions** — Live updates for scores and community activity
- **Optimized Indexes** — Fast queries for leaderboards and feeds
- **Audit Trails** — Timestamp tracking for user actions

---

## 🤖 AI Chatbot

The integrated **EcoBot** provides:

- **Environmental Knowledge** — A comprehensive database of eco-topics
- **Interactive Assistance** — Real-time Q&A on sustainability
- **Educational Content** — Climate change, recycling, and renewable energy information
- **Contextual Responses** — Smart keyword matching for relevant answers

---

## 🎨 Design System

### Color Palette
- **Primary** — Ocean blues and nature greens
- **Secondary** — Earth tones and sky colors
- **Accent** — Bright greens for actions and success states
- **Gradients** — Dynamic backgrounds with environmental themes

### Animations
- **Page Transitions** — Smooth Framer Motion animations
- **Interactive Feedback** — Hover states and micro-interactions
- **Environmental Effects** — Floating particles, growing trees, and water ripples
- **Game Animations** — Trash collection, point pickups, and combo effects

---

## 📱 Responsive Design

- **Mobile-First** — Optimized for all screen sizes
- **Touch-Friendly** — Large tap targets and gesture support
- **Progressive Enhancement** — Works across modern browsers
- **Performance** — Optimized images and lazy loading
---

## Screenshots

| Dashboard | Community | Bingo |
|-----------|-----------|-------|
| <img src="docs/screenshots/dashboard.png" width="600"> | <img src="docs/screenshots/community.png" width="600"> | <img src="docs/screenshots/bingo.png" width="600"> |

| Learn | Eco Village | Ocean Game |
|-------|------------|------------|
| <img src="docs/screenshots/learn.png" width="600"> | <img src="docs/screenshots/eco_village.png" width="600"> | <img src="docs/screenshots/ocean_game.png" width="600"> |

| Login |
|-------|
| <img src="docs/screenshots/login.png" width="600"> |

---

## Architecture

```
Browser (React SPA)
       │
       ▼
  Supabase Client (supabase-js)
       │
       ├── Auth        → Supabase Auth (email/password)
       ├── Database    → PostgreSQL via Supabase (RLS enforced)
       └── Realtime    → Live subscriptions for scores & community
```

All business logic runs client-side. There is no custom backend server — Supabase handles authentication, database access, and real-time updates directly from the browser, secured by Row Level Security policies.

---

## Project Structure

```
ecoplay/
├── public/                           # Static assets used in the app
├── src/
│   ├── components/                   # Reusable UI components
│   │   ├── AnimatedBackground.tsx    # Background animation effects
│   │   ├── EcoChatbot.tsx            # AI chatbot component
│   │   ├── Layout.tsx                # Shared page layout wrapper
│   │   └── Navbar.tsx                # Navigation bar component
│   │
│   ├── context/                      # Global state management
│   │   ├── AuthContext.tsx           # User authentication state
│   │   └── GameContext.tsx           # Game progress and points state
│   │
│   ├── lib/
│   │   └── supabase.ts               # Supabase client configuration
│   │
│   ├── pages/                        # Main application pages/routes
│   │   ├── Auth.tsx                  # Authentication page
│   │   ├── Bingo.tsx                 # Eco bingo challenge page
│   │   ├── Community.tsx             # Community discussion page
│   │   ├── Dashboard.tsx             # Main user dashboard
│   │   ├── EcoVillage.tsx            # Eco Village simulation page
│   │   ├── Events.tsx                # Environmental events page
│   │   ├── Learn.tsx                 # Educational learning page
│   │   ├── Login.tsx                 # User login page
│   │   └── OceanCleanupGame.tsx      # Ocean cleanup mini-game
│   │
│   ├── services/
│   │   └── persistence.ts            # Local/app data persistence logic
│   │
│   ├── App.tsx                       # Main application component
│   ├── ErrorBoundary.tsx             # Handles React runtime errors
│   └── main.tsx                      # Application entry point
│
├── .env.example                      # Example environment variables
├── index.html                        # Root HTML template
├── package.json                      # Project dependencies and scripts
├── tailwind.config.js                # Tailwind CSS configuration
├── vite.config.ts                    # Vite build tool configuration
└── tsconfig.json                     # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- A free [Supabase](https://supabase.com/) account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/arzoo0511/ecoplay.git
cd ecoplay

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

### Environment Variables

Edit `.env` with your Supabase project credentials:

```env
# Required — get these from your Supabase project dashboard
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these values in Supabase under **Project Settings -> API**:

- `VITE_SUPABASE_URL`: copy the **Project URL** value.
- `VITE_SUPABASE_ANON_KEY`: copy the **anon public** API key.

> **Note:** Only `VITE_` prefixed variables are accessible in the browser. This project uses Supabase Auth, so no custom JWT secret or database connection string is needed on the client.

### Supabase Setup

1. Go to [supabase.com](https://supabase.com/) and create a new project.

2. In your project dashboard, navigate to **SQL Editor** and run the SQL files in the following order in your Supabase SQL Editor:

   1. `database/schema.sql`
   2. `database/gamification_schema.sql`

```sql
-- See database/schema.sql for the full schema.
-- See database/gamification_schema.sql for XP, streaks, badges, and bingo.
-- Run both files in order in your Supabase SQL Editor.
```

3. Enable **Row Level Security (RLS)** on each table in the Supabase dashboard under **Authentication → Policies**.

4. Copy your project URL and anon key from **Settings → API** into your `.env` file.

5. Start the development server:

```bash
npm run dev
```

---

## AI Chatbot & Roadmap

The current **EcoBot** uses keyword matching to answer environmental questions (climate change, recycling, renewable energy, etc.). It works offline and requires no external API.

### Planned AI/LLM Upgrades

| Improvement | Description | Status |
|---|---|---|
| LLM Integration | Replace keyword matching with a real LLM (OpenAI / Gemini / Ollama) | 🔜 Planned |
| Smart Challenge Recommender | ML-based personalized challenge suggestions | 🔜 Planned |
| Score Anomaly Detection | Flag suspicious leaderboard activity using statistical models | 🔜 Planned |
| User Engagement Prediction | Predict churn risk from session/score patterns | 🔜 Planned |

> Contributions in these areas are especially welcome. See [Contributing](#contributing).

---

## Deployment

### Build for Production

```bash
npm run build
# Output goes to dist/
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your Vercel project's **Environment Variables** settings.

In Vercel, open your project and go to **Settings -> Environment Variables**. Add both variables for **Production**, **Preview**, and **Development** environments, then redeploy the project so Vercel picks up the new values.

### Deploy to Netlify

1. Connect your GitHub repository in the Netlify dashboard.
2. Set build command: `npm run build`, publish directory: `dist`.
3. Add environment variables under **Site Settings → Environment**.
4. Push to `main` to trigger automatic deployments.

---

## Roadmap

- [ ] Add CI/CD via GitHub Actions (lint + build on PRs)
- [ ] Add Vitest unit tests for game scoring and combo logic
- [ ] Replace EcoBot keyword matching with LLM integration
- [ ] Add smart challenge recommendation engine
- [ ] Add mobile PWA support
- [ ] Add dark mode toggle

## 🏆 Top Contributors

<!-- TOP_CONTRIBUTORS_START -->

🥇 [arzoo0511](https://github.com/arzoo0511) - 72 contributions
🥈 [Swathi-Chippa](https://github.com/Swathi-Chippa) - 16 contributions
🥉 [vedant7007](https://github.com/vedant7007) - 15 contributions

_Last Updated: 7/10/2026_

<!-- TOP_CONTRIBUTORS_END -->

## Contributor Introductions

New and returning contributors can introduce themselves in [CONTRIBUTOR_INTRODUCTION.md](CONTRIBUTOR_INTRODUCTION.md). Use the template there to share your interests, skills, public links, and collaboration goals with the EcoPlay community.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

*Made with 💚 for our planet Earth 🌍*
