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
    .catch(err => console.error(err))