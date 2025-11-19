import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Heart,
  Share2,
  Plus
} from 'lucide-react';

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

  const filteredEvents = events.filter(event => 
    selectedFilter === 'all' || event.type === selectedFilter
  );

  const toggleJoin = (id: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id === id) {
          const newParticipants = event.isJoined ? event.participants - 1 : event.participants + 1;
          return { ...event, isJoined: !event.isJoined, participants: newParticipants };
        }
        return event;
      })
    );
  };

  const toggleFavorite = (id: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === id ? { ...event, isFavorite: !event.isFavorite } : event
      )
    );
  };

  const shareEvent = (event: Event) => {
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Event link copied to clipboard!');
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
          📅 Environmental Events
        </h1>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Join local and global environmental initiatives. Make a difference in your community and connect with like-minded eco-warriors.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['all', 'cleanup', 'workshop', 'awareness', 'education'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selectedFilter === type ? 'bg-blue-500 text-white' : 'bg-white/10 text-blue-100 hover:bg-white/20'}`}
            >
              <span>{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map(event => (
          <motion.div
            key={event.id}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 group"
          >
            <div className="relative h-48">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white">{event.title}</h3>
                <div className="flex items-center text-white/80 text-sm mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center text-white/80 text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-blue-100 mb-4">{event.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-blue-200">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{event.participants}/{event.maxParticipants} participants</span>
                </div>
                <div className="text-sm text-blue-200">By {event.organizer}</div>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleJoin(event.id)}
                  className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all ${event.isJoined ? 'bg-green-500/20 text-green-400' : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'}`}
                >
                  {event.isJoined ? 'Joined' : 'Join Event'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => shareEvent(event)}
                  className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl hover:bg-white/20 transition-all"
                >
                  <Share2 className="h-4 w-4 inline" /> Share
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFavorite(event.id)}
                  className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl hover:bg-white/20 transition-all"
                >
                  <Heart className={`h-4 w-4 inline ${event.isFavorite ? 'text-red-500' : 'text-white'}`} /> {event.isFavorite ? 'Favorited' : 'Favorite'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Events;