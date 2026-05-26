import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Heart, MapPin, Share2, Users, Globe, Sparkles } from 'lucide-react';
import { glassCard, pageShell, pageSubtitle, pageTitle, primaryButton, secondaryButton } from '../lib/ui';
import { useAuth } from '../context/AuthContext';
import { EventCard } from '../components/EventCard';
import { EventCompletionModal } from '../components/EventCompletionModal';
import { useLocation } from 'react-router-dom';
import { dbFunctions, CommunityEvent, Milestone } from '../lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'cleanup' | 'workshop' | 'awareness' | 'education';
  participants: number;
  maxParticipants: number;
  organizer: string;
  image: string;
  isJoined: boolean;
  isFavorite?: boolean;
}

const Events = () => {
  const location = useLocation();
  const { user: authUser } = useAuth();

  // Tab state – default to 'local', but navigate from Dashboard can pass { tab: 'community' }
  const initialTab = (location.state as { tab?: string })?.tab === 'community' ? 'community' : 'local';
  const [activeTab, setActiveTab] = useState<'local' | 'community'>(initialTab);

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Beach Cleanup Drive',
      description: 'Join us for a community beach cleanup to protect marine life and keep our coastlines beautiful.',
      date: '2025-01-25',
      time: '09:00',
      location: 'Santa Monica Beach, CA',
      type: 'cleanup',
      participants: 45,
      maxParticipants: 100,
      organizer: 'Ocean Guardians',
      image: 'https://images.pexels.com/photos/2850287/pexels-photo-2850287.jpeg',
      isJoined: true
    },
    {
      id: '2',
      title: 'Solar Panel Installation Workshop',
      description: 'Learn how to install solar panels and reduce your carbon footprint with this hands-on workshop.',
      date: '2025-01-28',
      time: '14:00',
      location: 'Community Center, Portland, OR',
      type: 'workshop',
      participants: 28,
      maxParticipants: 50,
      organizer: 'Green Energy Initiative',
      image: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg',
      isJoined: false
    },
    {
      id: '3',
      title: 'Climate Action March',
      description: 'Peaceful march to raise awareness about climate change and demand environmental action.',
      date: '2025-02-01',
      time: '11:00',
      location: 'City Hall, New York, NY',
      type: 'awareness',
      participants: 156,
      maxParticipants: 500,
      organizer: 'Youth Climate Alliance',
      image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
      isJoined: false
    },
    {
      id: '4',
      title: 'Sustainable Gardening Seminar',
      description: 'Discover eco-friendly gardening techniques and learn to grow your own organic vegetables.',
      date: '2025-02-05',
      time: '10:30',
      location: 'Botanical Gardens, Seattle, WA',
      type: 'education',
      participants: 32,
      maxParticipants: 80,
      organizer: 'Urban Farming Network',
      image: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg',
      isJoined: true
    },
    {
      id: '5',
      title: 'River Conservation Project',
      description: 'Help restore river ecosystems by planting native vegetation and removing invasive species.',
      date: '2025-02-10',
      time: '08:00',
      location: 'Colorado River, Denver, CO',
      type: 'cleanup',
      participants: 67,
      maxParticipants: 120,
      organizer: 'River Restoration Society',
      image: 'https://images.pexels.com/photos/247851/pexels-photo-247851.jpeg',
      isJoined: false
    },
    {
      id: '6',
      title: 'Plastic-Free Living Workshop',
      description: 'Learn practical tips to reduce plastic consumption and discover sustainable alternatives.',
      date: '2025-02-15',
      time: '13:00',
      location: 'Eco Center, Austin, TX',
      type: 'workshop',
      participants: 19,
      maxParticipants: 40,
      organizer: 'Zero Waste Collective',
      image: 'https://images.pexels.com/photos/2850287/pexels-photo-2850287.jpeg',
      isJoined: false
    }
  ]);

  // Community Events State
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [userContributions, setUserContributions] = useState<Record<string, number>>({});
  const [completedEvent, setCompletedEvent] = useState<CommunityEvent | null>(null);
  const [communityFilter, setCommunityFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  const fetchCommunityEvents = useCallback(async () => {
    if (!authUser?.id) return;
    setCommunityLoading(true);
    try {
      const { events: fetchedEvents, participation } = await dbFunctions.getCommunityEvents(authUser.id);
      setCommunityEvents(fetchedEvents || []);

      if (participation) {
        setUserContributions(participation);
      }
    } catch (e) {
      console.error('Error fetching community events:', e);
    } finally {
      setCommunityLoading(false);
    }
  }, [authUser?.id]);

  // Fetch community events when tab switches to community
  useEffect(() => {
    if (activeTab === 'community' && authUser?.id) {
      fetchCommunityEvents();
    }
  }, [activeTab, authUser?.id, fetchCommunityEvents]);

  const handleContribute = (
    eventId: string,
    data: {
      contribution: number;
      communityProgress: number;
      xpAwarded: number;
      milestonesUnlocked: Milestone[];
      goalReached: boolean;
    }
  ) => {
    if (data.contribution) {
      setUserContributions(prev => ({ ...prev, [eventId]: data.contribution }));
    }
    if (data.goalReached) {
      const ev = communityEvents.find(e => e.id === eventId);
      if (ev) setCompletedEvent(ev);
    }
  };

  const filteredEvents = events.filter((event) => selectedFilter === 'all' || event.type === selectedFilter);

  const filteredCommunityEvents = communityEvents.filter(
    (e) => communityFilter === 'all' || e.status === communityFilter
  );

  const toggleJoin = (id: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id !== id) return event;
        if (!event.isJoined && event.participants >= event.maxParticipants) return event;
        const newParticipants = event.isJoined ? event.participants - 1 : event.participants + 1;
        return { ...event, isJoined: !event.isJoined, participants: newParticipants };
      })
    );
  };

  const toggleFavorite = (id: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === id ? { ...event, isFavorite: !event.isFavorite } : event))
    );
  };

  const shareEvent = (event: Event) => {
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Event link copied to clipboard!');
    });
  };

  const tabs = [
    { key: 'local' as const, label: 'Local Events', icon: Calendar, count: events.length },
    { key: 'community' as const, label: 'Global Community Events', icon: Globe, count: communityEvents.length }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={pageShell}
    >
      <div className="mb-8 text-center">
        <h1 className={`${pageTitle} mb-4`}>Environmental Events</h1>
        <p className={pageSubtitle}>
          Join local and global environmental initiatives. Make a difference in your community and connect with like-minded eco-warriors.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-2xl border border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 p-1.5 backdrop-blur-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.key === 'community' && communityEvents.length > 0 && (
                  <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400'
                  }`}>
                    {communityEvents.filter(e => e.status === 'active').length} live
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── LOCAL EVENTS TAB ─── */}
        {activeTab === 'local' && (
          <motion.div
            key="local"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filter Buttons */}
            <div className="mb-8">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {['all', 'cleanup', 'workshop', 'awareness', 'education'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedFilter(type)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-theme duration-300 ${
                      selectedFilter === type
                        ? 'border-blue-700 bg-blue-900 text-white dark:border-emerald-500 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-500'
                        : 'border-slate-200/80 bg-white/88 text-sky-950 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`${glassCard} overflow-hidden`}
                >
                  <div className="relative h-48">
                    <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                    {!event.isJoined && event.participants >= event.maxParticipants && (
                      <div className="absolute top-4 right-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white">
                        Full
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white">{event.title}</h3>
                      <div className="mb-2 flex items-center text-sm text-white/80">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-white/80">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="mb-4 text-sky-950/85 dark:text-slate-300">{event.description}</p>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center text-sm text-sky-950/80 dark:text-slate-400">
                        <Users className="mr-1 h-4 w-4" />
                        <span>{event.participants}/{event.maxParticipants} participants</span>
                      </div>
                      <div className="text-sm text-sky-950/80 dark:text-slate-400">By {event.organizer}</div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        whileHover={!event.isJoined && event.participants >= event.maxParticipants ? {} : { scale: 1.05 }}
                        whileTap={!event.isJoined && event.participants >= event.maxParticipants ? {} : { scale: 0.95 }}
                        onClick={() => toggleJoin(event.id)}
                        disabled={!event.isJoined && event.participants >= event.maxParticipants}
                        className={
                          event.isJoined
                            ? 'flex-1 rounded-xl bg-green-100 px-4 py-3 font-semibold text-green-900 transition-theme duration-300 dark:border dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'
                            : !event.isJoined && event.participants >= event.maxParticipants
                              ? 'flex-1 rounded-xl bg-white/5 px-4 py-3 font-semibold text-slate-400 cursor-not-allowed opacity-60 dark:text-slate-500'
                              : `flex-1 ${primaryButton}`
                        }
                      >
                        {event.isJoined ? 'Joined' : event.participants >= event.maxParticipants ? 'Event Full' : 'Join Event'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => shareEvent(event)}
                        className={secondaryButton}
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleFavorite(event.id)}
                        className={secondaryButton}
                      >
                        <Heart className={`h-4 w-4 ${event.isFavorite ? 'text-red-500' : 'text-sky-950 dark:text-slate-200'}`} />
                        {event.isFavorite ? 'Favorited' : 'Favorite'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── GLOBAL COMMUNITY EVENTS TAB ─── */}
        {activeTab === 'community' && (
          <motion.div
            key="community"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Community Event Filters */}
            <div className="mb-8">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {[
                  { key: 'all' as const, label: 'All Events' },
                  { key: 'active' as const, label: '🔴 Live Now' },
                  { key: 'upcoming' as const, label: '📅 Upcoming' },
                  { key: 'ended' as const, label: '✅ Completed' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setCommunityFilter(filter.key)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-theme duration-300 ${
                      communityFilter === filter.key
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'border-slate-200/80 bg-white/88 text-sky-950 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Events Content */}
            {communityLoading ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <div className="flex gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-300 dark:bg-slate-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-full bg-slate-300 dark:bg-slate-700 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-full bg-slate-300 dark:bg-slate-700 rounded-full" />
                    <div className="mt-4 flex justify-between">
                      <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
                      <div className="h-3 w-24 bg-slate-300 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCommunityEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${glassCard} p-12 text-center`}
              >
                <Sparkles className="mx-auto h-16 w-16 text-emerald-400/50 mb-4" />
                <h3 className="text-xl font-bold text-sky-950 dark:text-white mb-2">
                  {communityFilter === 'all'
                    ? 'No Community Events Yet'
                    : `No ${communityFilter} events`}
                </h3>
                <p className="text-sky-950/60 dark:text-slate-400 max-w-md mx-auto">
                  {communityFilter === 'all'
                    ? 'Community events are coming soon! Stay tuned for exciting global sustainability missions.'
                    : 'Try selecting a different filter to see more events.'}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredCommunityEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    userId={authUser?.id || ''}
                    userContribution={userContributions[event.id] || 0}
                    onContribute={(data) => handleContribute(event.id, data)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Completion Modal */}
      <EventCompletionModal
        event={completedEvent}
        userContribution={completedEvent ? (userContributions[completedEvent.id] || 0) : 0}
        onClose={() => setCompletedEvent(null)}
      />
    </motion.div>
  );
};

export default Events;
