# EcoPlay - Gamified Environmental Platform

EcoPlay is an interactive, gamified environmental platform built with React 18+, Vite 5+, Tailwind CSS 3+, and Framer Motion. It features creative mini-games, an advanced Eco Village system, dynamic dashboards, educational content, events, and community engagement, all integrated with a SQL backend for gamification, leaderboards, and persistent user progress.

## 🌟 Features

### Core Functionality
- **Multi-page Navigation**: Dashboard, Ocean Cleanup Game, Eco Village, Learn, Events, Community
- **Ocean Cleanup Game**: Interactive trash collection with scoring, combos, and leaderboards
- **Advanced Eco Village**: Dynamic environment that transforms based on user actions
- **Educational Content**: Curated videos, tutorials, and interactive learning materials
- **Community Platform**: Users can post questions, share solutions, and engage with eco-topics
- **Events System**: Real-time feed of environmental initiatives and activities
- **Gamification**: Points, levels, badges, daily challenges, and leaderboards
- **AI Chatbot**: Environmental assistant with comprehensive eco-knowledge database

### Technical Features
- **Authentication**: Secure login/signup with Supabase Auth
- **Database Integration**: PostgreSQL with Supabase for persistent data
- **Real-time Updates**: Live leaderboards and community interactions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for interactive transitions
- **Performance Optimized**: Lazy loading and efficient state management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database and auth)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ecoplay.git
cd ecoplay
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Set up the database**
- Create a new Supabase project
- Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
- Enable Row Level Security (RLS) policies

5. **Start the development server**
```bash
npm run dev
```

## 🎮 Game Features

### Ocean Cleanup Game
- **Interactive Gameplay**: Click to collect different types of ocean trash
- **Scoring System**: Different trash types award different points
- **Combo System**: Chain collections for bonus multipliers
- **Level Progression**: Increasing difficulty with more trash and obstacles
- **Achievements**: Perfect cleanup bonuses and streak rewards

### Eco Village System
- **Dynamic Environment**: Starts as polluted wasteland, transforms with user actions
- **Multiple Zones**: Forests, gardens, wetlands, solar farms, wildlife habitats
- **Interactive Upgrades**: Spend points on trees, solar panels, water filters
- **Environmental Feedback**: Air quality, water clarity, biodiversity metrics
- **Visual Effects**: Particle systems, day/night cycles, seasonal changes

### Gamification Elements
- **Points System**: Earn points through games and challenges
- **Levels & Badges**: Progress tracking and achievement rewards
- **Daily Challenges**: Integrated mini-games and tasks
- **Leaderboards**: Compete with other players globally
- **Environmental Health**: Track your eco-footprint and improvements

## 🗄️ Database Schema

### Core Tables
- **users**: User profiles, points, levels, badges
- **eco_villages**: User environment states and upgrades
- **game_scores**: Game performance and leaderboard data
- **challenges**: Daily challenges and progress tracking
- **community_posts**: User-generated content and discussions
- **events**: Environmental events and activities

### Key Features
- **Row Level Security**: Secure data access with Supabase RLS
- **Real-time Subscriptions**: Live updates for scores and community
- **Optimized Indexes**: Fast queries for leaderboards and feeds
- **Audit Trails**: Timestamp tracking for all user actions

## 🤖 AI Chatbot

The integrated EcoBot provides:
- **Environmental Knowledge**: Comprehensive database of eco-topics
- **Interactive Assistance**: Real-time Q&A about sustainability
- **Educational Content**: Climate change, recycling, renewable energy info
- **Contextual Responses**: Smart keyword matching for relevant answers

## 🎨 Design System

### Color Palette
- **Primary**: Ocean blues and nature greens
- **Secondary**: Earth tones and sky colors
- **Accent**: Bright greens for actions and success states
- **Gradients**: Dynamic backgrounds with environmental themes

### Animations
- **Page Transitions**: Smooth Framer Motion animations
- **Interactive Feedback**: Hover states and micro-interactions
- **Environmental Effects**: Floating particles, growing trees, water ripples
- **Game Animations**: Trash collection, point pickups, combo effects

## 📱 Responsive Design

- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large tap targets and gesture support
- **Progressive Enhancement**: Works on all modern browsers
- **Performance**: Optimized images and lazy loading

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── context/            # React Context for state management
├── lib/                # Utilities and database functions
├── types/              # TypeScript type definitions
└── assets/             # Static assets and images
```

### Key Technologies
- **React 18+**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite 5+**: Fast build tool and dev server
- **Tailwind CSS 3+**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Supabase**: Backend-as-a-Service with PostgreSQL

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your GitHub repository
2. Set environment variables in deployment settings
3. Deploy automatically on push to main branch

### Database Setup
1. Create Supabase project
2. Run schema.sql in SQL editor
3. Configure RLS policies
4. Update environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌍 Environmental Impact

EcoPlay is designed to educate and inspire environmental action. By gamifying sustainability concepts, we aim to:
- Increase environmental awareness
- Encourage sustainable behaviors
- Build a community of eco-conscious individuals
- Make environmental education engaging and accessible

## 📞 Support

For support, email support@ecoplay.com or join our community discussions.

## 🙏 Acknowledgments

- Environmental data from various scientific sources
- Images from Pexels and Unsplash
- Icons from Lucide React
- Inspiration from environmental organizations worldwide

---

**Made with 💚 for our planet Earth 🌍**