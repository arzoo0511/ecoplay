export type ItemCategory = 'trees_plants' | 'renewable_energy' | 'eco_buildings' | 'decorations' | 'community';
export type ItemRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface ShopItem {
  id: string;
  emoji: string;
  label: string;
  description: string;
  cost: number;
  category: ItemCategory;
  rarity: ItemRarity;
  impactScores: {
    air?: number;
    water?: number;
    bio?: number;
    pointsMultiplier?: number;
  };
  unlockRequirements?: {
    airQuality?: number;
    waterQuality?: number;
    biodiversity?: number;
  };
}

export const shopItems: ShopItem[] = [
  // Trees & Plants
  {
    id: 'tree', emoji: "🌳", label: "Oak Tree", description: "A sturdy oak that cleans the air and provides habitat.",
    cost: 50, category: 'trees_plants', rarity: 'Common',
    impactScores: { air: 5, bio: 3 }
  },
  {
    id: 'apple_tree', emoji: "🍎", label: "Apple Tree", description: "Provides fresh fruits and attracts wildlife.",
    cost: 75, category: 'trees_plants', rarity: 'Common',
    impactScores: { air: 4, bio: 4 }
  },
  {
    id: 'pine_tree', emoji: "🌲", label: "Pine Tree", description: "Evergreen tree perfect for colder climates.",
    cost: 80, category: 'trees_plants', rarity: 'Common',
    impactScores: { air: 6, bio: 2 }
  },
  {
    id: 'bamboo', emoji: "🎍", label: "Bamboo Grove", description: "Fast-growing plant that absorbs huge amounts of CO2.",
    cost: 120, category: 'trees_plants', rarity: 'Rare',
    impactScores: { air: 10, bio: 2 }
  },
  {
    id: 'ancient_tree', emoji: "🌳✨", label: "Ancient Tree", description: "A mystical old tree emitting pure oxygen.",
    cost: 500, category: 'trees_plants', rarity: 'Legendary',
    impactScores: { air: 25, bio: 15 },
    unlockRequirements: { airQuality: 80 }
  },
  {
    id: 'yggdrasil', emoji: "🌱🌌", label: "Yggdrasil Seed", description: "A mythical seed that restores balance to nature.",
    cost: 1500, category: 'trees_plants', rarity: 'Legendary',
    impactScores: { air: 50, bio: 50, water: 20 },
    unlockRequirements: { airQuality: 95, biodiversity: 95 }
  },
  
  // Renewable Energy
  {
    id: 'solar', emoji: "⚡", label: "Solar Panel", description: "Generates clean energy from the sun.",
    cost: 100, category: 'renewable_energy', rarity: 'Common',
    impactScores: { air: 8 }
  },
  {
    id: 'wind_turbine', emoji: "🌬️", label: "Wind Turbine", description: "Harnesses wind power for the village.",
    cost: 250, category: 'renewable_energy', rarity: 'Rare',
    impactScores: { air: 15 },
    unlockRequirements: { airQuality: 40 }
  },
  {
    id: 'hydro_plant', emoji: "🌊", label: "Hydro Plant", description: "Water-based energy generation.",
    cost: 400, category: 'renewable_energy', rarity: 'Epic',
    impactScores: { air: 20, water: -2 }, // slight impact on water biodiversity
    unlockRequirements: { waterQuality: 70 }
  },
  {
    id: 'fusion_reactor', emoji: "⚛️", label: "Clean Fusion", description: "The pinnacle of clean energy.",
    cost: 1000, category: 'renewable_energy', rarity: 'Legendary',
    impactScores: { air: 40 },
    unlockRequirements: { airQuality: 90, waterQuality: 90 }
  },
  {
    id: 'geothermal', emoji: "🌋", label: "Geothermal Plant", description: "Taps into the earth's natural heat.",
    cost: 700, category: 'renewable_energy', rarity: 'Epic',
    impactScores: { air: 30, pointsMultiplier: 1.1 },
    unlockRequirements: { airQuality: 75 }
  },
  {
    id: 'ocean_cleanup', emoji: "🚤", label: "Ocean Cleanup Array", description: "Massive autonomous system that removes plastics from water.",
    cost: 1200, category: 'renewable_energy', rarity: 'Legendary',
    impactScores: { water: 50, bio: 20 },
    unlockRequirements: { waterQuality: 85 }
  },

  // Eco-Friendly Buildings
  {
    id: 'cottage', emoji: "🏡", label: "Eco Cottage", description: "A small sustainable home.",
    cost: 150, category: 'eco_buildings', rarity: 'Common',
    impactScores: { pointsMultiplier: 1.05 }
  },
  {
    id: 'greenhouse', emoji: "🪴", label: "Greenhouse", description: "Grow exotic plants all year round.",
    cost: 300, category: 'eco_buildings', rarity: 'Rare',
    impactScores: { bio: 10, pointsMultiplier: 1.1 },
    unlockRequirements: { biodiversity: 50 }
  },
  {
    id: 'treehouse', emoji: "🛖", label: "Treehouse Retreat", description: "Living in harmony with nature.",
    cost: 450, category: 'eco_buildings', rarity: 'Epic',
    impactScores: { air: 5, bio: 8, pointsMultiplier: 1.15 },
    unlockRequirements: { biodiversity: 70 }
  },
  {
    id: 'arcology', emoji: "🏙️", label: "Arcology", description: "Self-sustaining massive eco-structure.",
    cost: 1200, category: 'eco_buildings', rarity: 'Legendary',
    impactScores: { air: 15, water: 15, bio: 15, pointsMultiplier: 1.3 },
    unlockRequirements: { airQuality: 85, waterQuality: 85, biodiversity: 85 }
  },
  {
    id: 'vertical_farm', emoji: "🏢🌾", label: "Vertical Farm", description: "High-yield, zero-pesticide urban farming tower.",
    cost: 850, category: 'eco_buildings', rarity: 'Epic',
    impactScores: { air: 10, water: 10, bio: 25, pointsMultiplier: 1.2 },
    unlockRequirements: { biodiversity: 80 }
  },

  // Decorations & Landmarks
  {
    id: 'flower_garden', emoji: "🌼", label: "Flower Garden", description: "Attracts bees and butterflies.",
    cost: 40, category: 'decorations', rarity: 'Common',
    impactScores: { bio: 5 }
  },
  {
    id: 'fountain', emoji: "⛲", label: "Water Fountain", description: "Purifies local water sources.",
    cost: 120, category: 'decorations', rarity: 'Rare',
    impactScores: { water: 10 }
  },
  {
    id: 'statue', emoji: "🗽", label: "Earth Monument", description: "Inspires the community.",
    cost: 350, category: 'decorations', rarity: 'Epic',
    impactScores: { pointsMultiplier: 1.1 }
  },
  {
    id: 'magic_crystal', emoji: "🔮", label: "Nature Crystal", description: "Radiates pure natural energy.",
    cost: 800, category: 'decorations', rarity: 'Legendary',
    impactScores: { air: 10, water: 10, bio: 10 },
    unlockRequirements: { biodiversity: 80 }
  },
  {
    id: 'bioluminescent_path', emoji: "✨🍄", label: "Bioluminescent Path", description: "Glowing fungi and plants light up the night naturally.",
    cost: 650, category: 'decorations', rarity: 'Epic',
    impactScores: { bio: 15, pointsMultiplier: 1.15 },
    unlockRequirements: { biodiversity: 75 }
  },

  // Community Infrastructure
  {
    id: 'water_filter', emoji: "💧", label: "Water Filter", description: "Cleans the village water supply.",
    cost: 75, category: 'community', rarity: 'Common',
    impactScores: { water: 10 }
  },
  {
    id: 'bird_feeder', emoji: "🐦", label: "Bird Feeder", description: "Brings beautiful birds to the village.",
    cost: 60, category: 'community', rarity: 'Common',
    impactScores: { bio: 6 }
  },
  {
    id: 'recycling_center', emoji: "♻️", label: "Recycling Center", description: "Reduces pollution effectively.",
    cost: 200, category: 'community', rarity: 'Rare',
    impactScores: { air: 5, water: 5, pointsMultiplier: 1.05 }
  },
  {
    id: 'compost_station', emoji: "🍂", label: "Compost Station", description: "Turns waste into rich soil.",
    cost: 180, category: 'community', rarity: 'Rare',
    impactScores: { bio: 8, pointsMultiplier: 1.05 }
  },
  {
    id: 'wildlife_reserve', emoji: "🦌", label: "Wildlife Reserve", description: "A safe haven for all animals.",
    cost: 600, category: 'community', rarity: 'Epic',
    impactScores: { bio: 20 },
    unlockRequirements: { biodiversity: 60 }
  },
  {
    id: 'research_institute', emoji: "🔬🌿", label: "Eco Institute", description: "Advanced research facility for sustainable technologies.",
    cost: 1800, category: 'community', rarity: 'Legendary',
    impactScores: { air: 20, water: 20, bio: 20, pointsMultiplier: 1.5 },
    unlockRequirements: { airQuality: 90, waterQuality: 90, biodiversity: 90 }
  }
];
