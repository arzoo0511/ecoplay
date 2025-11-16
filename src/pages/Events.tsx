import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Heart,
  Share2,
  Filter,
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
}

const Events = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const eventTypes = [
    { id: 'all', name: 'All Events', emoji: '🌟' },
    { id: 'cleanup', name: 'Cleanup', emoji: '🧹' },
    { id: 'workshop', name: 'Workshop', emoji: '🛠️' },
    { id: 'awareness', name: 'Awareness', emoji: '📢' },
    { id: 'education', name: 'Education', emoji: '📚' }
  ];

  const events: Event[] = [
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
  ];

  const filteredEvents = events.filter(event => 
    selectedFilter === 'all' || event.type === selectedFilter
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cleanup': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'workshop': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'awareness': return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
      case 'education': return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
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

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Events', value: '24', color: 'text-green-400' },
          { label: 'This Week', value: '8', color: 'text-blue-400' },
          { label: 'Participants', value: '1.2K', color: 'text-purple-400' },
          { label: 'Your Events', value: '3', color: 'text-orange-400' }
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20"
          >
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-sm text-blue-100">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Create Event
          </motion.button>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {eventTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedFilter(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedFilter === type.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-blue-100 hover:bg-white/20'
              }`}
            >
              <span>{type.emoji}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 group"
          >
            <div className="relative h-48">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Event Type Badge */}
              <div className="absolute top-4 left-4">
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getTypeColor(event.type)}`}>
                  {eventTypes.find(t => t.id === event.type)?.name}
                </div>
              </div>
              
              {/* Joined Badge */}
              {event.isJoined && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ✓ Joined
                </div>
              )}

              {/* Event Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center text-white/80 text-sm mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(event.date)}</span>
                  <Clock className="h-4 w-4 ml-4 mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-white/80 text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                  {event.title}
                </h3>
                <div className="flex space-x-2">
                  <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <Heart className="h-4 w-4 text-white" />
                  </button>
                  <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <Share2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <p className="text-blue-100 mb-4 line-clamp-2">{event.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-blue-200">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{event.participants}/{event.maxParticipants} participants</span>
                </div>
                <div className="text-sm text-blue-200">
                  By {event.organizer}
                </div>
              </div>

              {/* Participation Progress */}
              <div className="mb-4">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                  />
                </div>
                <div className="text-xs text-blue-200 mt-1">
                  {Math.round((event.participants / event.maxParticipants) * 100)}% capacity
                </div>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all ${
                    event.isJoined
                      ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                      : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                  }`}
                >
                  {event.isJoined ? 'Joined' : 'Join Event'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 text-white font-bold py-3 px-4 rounded-xl hover:bg-white/20 transition-all"
                >
                  Learn More
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Initiative */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-300/30 text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-4">🌍 Global Earth Day Initiative</h2>
        <p className="text-lg text-white/90 mb-6 max-w-3xl mx-auto">
          Join millions of people worldwide in the largest environmental movement. 
          Participate in local events and make a global impact!
        </p>
        <div className="flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Learn More
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 text-white font-bold py-3 px-8 rounded-xl hover:bg-white/20 transition-all border border-white/20"
          >
            Find Events Near Me
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Events;