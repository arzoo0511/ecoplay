export interface LearningContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'interactive';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  thumbnail: string;
  category: string;
  completed?: boolean;
  points?: number;
  url: string;
  tags?: string[];
}

export const learningContent: LearningContent[] = [
  {
    id: '1',
    title: 'Understanding Climate Change',
    description: 'Learn about the science behind climate change and its global impacts.',
    type: 'video',
    duration: '15 min',
    difficulty: 'Beginner',
    rating: 4.8,
    thumbnail: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
    category: 'climate',
    points: 50,
    url: 'https://www.youtube.com/watch?v=G4H1N_yXBiA'
  },
  {
    id: '2',
    title: 'Ocean Plastic Pollution Crisis',
    description: 'Explore the impact of plastic waste on marine ecosystems and what we can do.',
    type: 'video',
    duration: '20 min',
    difficulty: 'Intermediate',
    rating: 4.9,
    thumbnail: 'https://images.pexels.com/photos/2850287/pexels-photo-2850287.jpeg',
    category: 'ocean',
    points: 75,
    url: 'https://www.youtube.com/watch?v=ROW9F-c0kIQ'
  },
  {
    id: '3',
    title: 'Solar Energy Fundamentals',
    description: 'How solar panels work and their environmental benefits.',
    type: 'video',
    duration: '12 min',
    difficulty: 'Beginner',
    rating: 4.7,
    thumbnail: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg',
    category: 'renewable',
    points: 50,
    url: 'https://www.youtube.com/watch?v=xKxrkht7CpY'
  },
  {
    id: '4',
    title: 'Protecting Endangered Species',
    description: 'Conservation efforts and restoration programs around the world.',
    type: 'article',
    duration: '10 min',
    difficulty: 'Intermediate',
    rating: 4.6,
    thumbnail: 'https://images.pexels.com/photos/247937/pexels-photo-247937.jpeg',
    category: 'biodiversity',
    points: 60,
    url: 'https://www.nationalgeographic.com/animals/article/endangered-species'
  },
  {
    id: '5',
    title: 'Sustainable Living Practices',
    description: 'Calculate your footprint and build a personal action plan.',
    type: 'interactive',
    duration: '25 min',
    difficulty: 'Beginner',
    rating: 4.8,
    thumbnail: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg',
    category: 'sustainability',
    points: 80,
    url: 'https://www.footprintcalculator.org/'
  },
  {
    id: '6',
    title: 'Wind Power Technology',
    description: 'How wind turbines generate clean energy.',
    type: 'article',
    duration: '18 min',
    difficulty: 'Advanced',
    rating: 4.5,
    thumbnail: 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg',
    category: 'renewable',
    points: 100,
    url: 'https://www.energy.gov/eere/wind/how-do-wind-turbines-work'
  },
  {
    id: '7',
    title: 'Zero Waste at Home',
    description: 'Practical strategies to reduce household waste and adopt a zero-waste lifestyle.',
    type: 'article',
    duration: '12 min',
    difficulty: 'Beginner',
    rating: 4.7,
    thumbnail: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg',
    category: 'sustainability',
    points: 55,
    url: 'https://www.goingzerowaste.com/zero-waste-1/',
    tags: ['waste', 'lifestyle', 'home']
  },
  {
    id: '8',
    title: 'Electric Vehicles Explained',
    description: 'How EVs work, their environmental impact, and the future of clean transport.',
    type: 'video',
    duration: '16 min',
    difficulty: 'Beginner',
    rating: 4.6,
    thumbnail: 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg',
    category: 'renewable',
    points: 60,
    url: 'https://www.youtube.com/watch?v=MdoHFGYNP5E',
    tags: ['transport', 'EV', 'clean energy']
  },
  {
    id: '9',
    title: 'Deforestation and Its Consequences',
    description: 'Why forests matter for the climate and what deforestation means for our planet.',
    type: 'article',
    duration: '14 min',
    difficulty: 'Intermediate',
    rating: 4.8,
    thumbnail: 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg',
    category: 'biodiversity',
    points: 70,
    url: 'https://www.worldwildlife.org/threats/deforestation-and-forest-degradation',
    tags: ['forests', 'deforestation', 'climate']
  },
  {
    id: '10',
    title: 'Coral Reef Conservation',
    description: 'The threats facing coral reefs and global restoration efforts.',
    type: 'video',
    duration: '22 min',
    difficulty: 'Intermediate',
    rating: 4.9,
    thumbnail: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg',
    category: 'ocean',
    points: 80,
    url: 'https://www.youtube.com/watch?v=4C8JVRg3YCg',
    tags: ['coral', 'marine', 'conservation']
  },
  {
    id: '11',
    title: 'Carbon Footprint Calculator',
    description: 'Measure your personal carbon footprint and get a custom reduction plan.',
    type: 'interactive',
    duration: '20 min',
    difficulty: 'Beginner',
    rating: 4.7,
    thumbnail: 'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg',
    category: 'climate',
    points: 85,
    url: 'https://www.carbonfootprint.com/calculator.aspx',
    tags: ['carbon', 'calculator', 'personal action']
  },
  {
    id: '12',
    title: 'Fast Fashion and the Environment',
    description: 'The hidden environmental cost of clothing and how to shop sustainably.',
    type: 'article',
    duration: '11 min',
    difficulty: 'Beginner',
    rating: 4.5,
    thumbnail: 'https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg',
    category: 'sustainability',
    points: 55,
    url: 'https://www.sustainyourstyle.org/en/whats-wrong-with-the-fashion-industry',
    tags: ['fashion', 'consumption', 'lifestyle']
  },
  {
    id: '13',
    title: 'Community Composting Guide',
    description: 'Step-by-step guide to starting a composting program in your neighborhood.',
    type: 'interactive',
    duration: '18 min',
    difficulty: 'Intermediate',
    rating: 4.6,
    thumbnail: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg',
    category: 'sustainability',
    points: 75,
    url: 'https://www.epa.gov/sustainable-management-food/composting-home',
    tags: ['composting', 'community', 'waste']
  },
  {
    id: '14',
    title: 'Nuclear Energy: Risks and Rewards',
    description: 'A balanced look at nuclear power as a low-carbon energy source.',
    type: 'article',
    duration: '20 min',
    difficulty: 'Advanced',
    rating: 4.4,
    thumbnail: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg',
    category: 'renewable',
    points: 100,
    url: 'https://www.energy.gov/ne/articles/nuclear-power-most-reliable-energy-source-and-its-not-even-close',
    tags: ['nuclear', 'energy policy', 'advanced']
  },
  {
    id: '15',
    title: 'Indigenous Land Stewardship',
    description: 'How indigenous communities have sustainably managed ecosystems for centuries.',
    type: 'article',
    duration: '15 min',
    difficulty: 'Intermediate',
    rating: 4.9,
    thumbnail: 'https://images.pexels.com/photos/3894157/pexels-photo-3894157.jpeg',
    category: 'biodiversity',
    points: 70,
    url: 'https://www.un.org/development/desa/indigenouspeoples/mandated-areas1/environment.html',
    tags: ['indigenous', 'land', 'stewardship']
  }
];
