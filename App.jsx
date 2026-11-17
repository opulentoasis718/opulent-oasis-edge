import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Moon,
  Search,
  X,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Compass,
  Calendar,
  Users,
  Sparkles,
  Plus,
  ChevronDown,
  Check,
  Shield,
  Wifi,
  Coffee,
  Wind,
  Mountain,
  Waves,
  Menu,
  Eye,
  Clock,
  HeartHandshake,
  SlidersHorizontal
} from 'lucide-react';

const WHATSAPP_NUMBER = '919820000000';

const UNITS_OASIS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  }

  .font-display {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    letter-spacing: -0.035em;
  }

  .font-serif-accent {
    font-family: 'Instrument Serif', Georgia, serif;
    letter-spacing: -0.01em;
  }

  .font-body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    letter-spacing: -0.01em;
  }

  @keyframes marqueeScroll {
    0% { transform: translate3d(0%, 0, 0); }
    100% { transform: translate3d(-50%, 0, 0); }
  }

  .animate-marquee {
    display: flex;
    width: max-content;
    animation: marqueeScroll 28s linear infinite;
  }

  .animate-marquee:hover {
    animation-play-state: paused;
  }

  .unit-card-hover {
    transition: transform 0.55s var(--ease-out-expo), box-shadow 0.55s var(--ease-out-expo);
  }

  .unit-card-hover:hover {
    transform: translateY(-4px);
  }

  .img-zoom {
    transition: transform 0.85s var(--ease-out-expo);
  }

  .group:hover .img-zoom {
    transform: scale(1.05);
  }
`;

// Curated Luxury Sanctuaries with full units.gr-style tier breakdowns & proximity badges
const INITIAL_LISTINGS = [
  {
    id: 'gorai-villa-1',
    name: 'Oasis Gorai Coast',
    subtitle: 'Casa De Mar Beachfront Sanctuary',
    locationName: 'Gorai Coast',
    country: 'India',
    region: 'North Mumbai Coast, Maharashtra',
    address: 'Plot 14, Gorai Casuarina Drive, North Mumbai 400092',
    statusBadge: 'Move-in / Book Ready',
    accentColor: '#d6c5b3',
    cardBgDark: 'bg-[#151519]',
    category: 'Stay',
    subType: 'Private Villa',
    price: '₹32,000 / night',
    numericPrice: 32000,
    lat: 19.24,
    lng: 72.78,
    duration: 'Min 2 Nights',
    groupSize: 'Up to 10 Guests',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'An architectural Portuguese-inspired courtyard sanctuary tucked behind private casuarina groves where the Arabian Sea meets unspoiled coastal silence.',
    proximities: [
      { time: "02'", label: 'Walk to private Gorai beachfront' },
      { time: "15'", label: 'Ferry transfer from Marve / Borivali' },
      { time: "05'", label: 'To Global Vipassana Pagoda' },
      { time: "45'", label: 'Drive from Mumbai International Airport' },
      { time: "01'", label: 'To private palm orchard trail' },
      { time: "10'", label: 'To artisan coastal seafood tavernas' }
    ],
    tiers: [
      {
        id: 'kick',
        name: 'Kick Suite',
        tagline: 'Effortless coastal escape for couples & solo creatives.',
        price: '₹24,000 / night',
        size: '85 m² Suite',
        bed: 'King Canopy Bed',
        perks: ['Private Courtyard', 'High-Speed Starlink WiFi', 'Artisan Breakfast', 'Plunge Pool Access']
      },
      {
        id: 'boost',
        name: 'Boost Pavilion',
        tagline: 'Upper-deck sea views with private wrap-around veranda.',
        price: '₹32,000 / night',
        size: '140 m² Pavilion',
        bed: '2 King Suites',
        perks: ['Oceanfront Balcony', 'Private Butler', 'Outdoor Rain Shower', 'Sunset High-Tea']
      },
      {
        id: 'flex',
        name: 'Flex Villa',
        tagline: 'Full 3-bedroom wing with private lap pool & chef kitchen.',
        price: '₹44,000 / night',
        size: '260 m² Wing',
        bed: '3 King Suites',
        perks: ['Private Heated Pool', 'Dedicated Live-In Chef', 'Cinema Lounge', 'Bonfire Deck']
      },
      {
        id: 'vibe',
        name: 'Vibe Estate',
        tagline: 'Entire 5-bedroom coastal estate reserved exclusively for your group.',
        price: '₹62,000 / night',
        size: '450 m² Full Estate',
        bed: '5 Luxury Suites (Up to 12 Guests)',
        perks: ['100% Estate Buyout', 'Private Speedboat Transfer', 'All-Inclusive Gourmet Meals', '24/7 Concierge Security']
      }
    ],
    published: true
  },
  {
    id: 'alibaug-villa-1',
    name: 'Oasis Alibaug',
    subtitle: 'The Banyan Glasshouse & Jetty',
    locationName: 'Alibaug',
    country: 'India',
    region: 'Mandwa & Awas, Raigad Coast',
    address: 'Awas Sanctuary Road, Near Mandwa Jetty, Alibaug 402201',
    statusBadge: 'Signature Estate',
    accentColor: '#9eb393',
    cardBgDark: 'bg-[#131815]',
    category: 'Stay',
    subType: 'Private Estate',
    price: '₹48,000 / night',
    numericPrice: 48000,
    lat: 18.64,
    lng: 72.87,
    duration: '2–7 Nights',
    groupSize: 'Up to 12 Guests',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Twenty minutes by private speedboat from the Gateway of India, spanning three acres of heirloom mango orchards with a cantilevered lap pool and farm-to-table chef.',
    proximities: [
      { time: "20'", label: 'By private speedboat from Mumbai Gateway' },
      { time: "08'", label: 'Chauffeur drive from Mandwa Jetty' },
      { time: "04'", label: 'To Awas & Kihim secluded beaches' },
      { time: "01'", label: 'Inside 3-acre private mango orchard' },
      { time: "05'", label: 'To organic coastal dining & cafes' },
      { time: "12'", label: 'To Alibaug helipad' }
    ],
    tiers: [
      {
        id: 'kick',
        name: 'Kick Glass Loft',
        tagline: 'Floor-to-ceiling glass suite overlooking heirloom mango groves.',
        price: '₹36,000 / night',
        size: '110 m² Loft',
        bed: '1 Emperor Suite',
        perks: ['Private Orchard Deck', 'Outdoor Copper Tub', 'Starlink WiFi', 'Farm Breakfast']
      },
      {
        id: 'boost',
        name: 'Boost Pool Villa',
        tagline: '2-suite glasshouse pavilion with direct infinity pool access.',
        price: '₹48,000 / night',
        size: '210 m² Villa',
        bed: '2 Emperor Suites',
        perks: ['25m Lap Pool', 'Mandwa Jetty Chauffeur', 'Private Chef Service', 'Evening Sundowners']
      },
      {
        id: 'flex',
        name: 'Flex Orchard Wing',
        tagline: '4-bedroom architectural wing with private spa & padel court.',
        price: '₹68,000 / night',
        size: '380 m² Wing',
        bed: '4 Suites (8 Guests)',
        perks: ['Private Padel Court', 'Cedar Steam & Sauna', 'Private Barista & Chef', 'Speedboat Charter Included']
      },
      {
        id: 'vibe',
        name: 'Vibe Full Sanctuary',
        tagline: 'Complete 3-acre estate buyout for landmark celebrations & retreats.',
        price: '₹95,000 / night',
        size: '650 m² Estate (3 Acres)',
        bed: '6 Suites (Up to 14 Guests)',
        perks: ['Full 3-Acre Exclusivity', 'Roundtrip Speedboat Transfers', 'Bespoke Tasting Menus', 'Dedicated Concierge Team']
      }
    ],
    published: true
  },
  {
    id: 'zermatt-stay-1',
    name: 'Oasis Zermatt Alps',
    subtitle: 'Chalet Matterhorn Zenith',
    locationName: 'Zermatt Alps',
    country: 'Switzerland',
    region: 'Valais Canton, Swiss Alps',
    address: 'Omnia Ridge Trail 8, 3920 Zermatt, Switzerland',
    statusBadge: 'Alpine Winter / Summer',
    accentColor: '#d49a7b',
    cardBgDark: 'bg-[#191514]',
    category: 'Stay',
    subType: 'Alpine Chalet',
    price: '₹2,10,000 / night',
    numericPrice: 210000,
    lat: 46.02,
    lng: 7.74,
    duration: 'Min 4 Nights',
    groupSize: 'Up to 10 Guests',
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Suspended high above Zermatt village with a glass-walled cedar thermal spa, private funicular access, and unobstructed views of the Matterhorn east face.',
    proximities: [
      { time: "01'", label: 'Ski-in / Ski-out piste access' },
      { time: "03'", label: 'Private rock-tunnel funicular to village' },
      { time: "05'", label: 'To Zermatt Heliport for glacier flights' },
      { time: "02'", label: 'To Michelin-starred alpine dining' },
      { time: "08'", label: 'To Gornergrat mountain railway' },
      { time: "00'", label: 'Direct unobstructed Matterhorn view' }
    ],
    tiers: [
      {
        id: 'kick',
        name: 'Kick Alpine Loft',
        tagline: 'Warm larch-wood suite with wood-burning fireplace & Matterhorn terrace.',
        price: '₹1,45,000 / night',
        size: '95 m² Alpine Suite',
        bed: '1 King Alpine Bed',
        perks: ['Matterhorn Balcony', 'Ski Room & Boot Heaters', 'Thermal Spa Access', 'Daily Alpine Breakfast']
      },
      {
        id: 'boost',
        name: 'Boost Glacier Residence',
        tagline: 'Two-level chalet residence with outdoor heated hydro-pool.',
        price: '₹2,10,000 / night',
        size: '190 m² Residence',
        bed: '3 Suites (6 Guests)',
        perks: ['Outdoor Heated Jacuzzi', 'Private Ski Guide (1 Day)', 'Wine Cellar Selection', 'Chauffeur Electro-Taxi']
      },
      {
        id: 'flex',
        name: 'Flex Penthouse',
        tagline: 'Top-floor glass penthouse with private sauna & Michelin-trained chef.',
        price: '₹2,85,000 / night',
        size: '310 m² Penthouse',
        bed: '4 Suites (8 Guests)',
        perks: ['Private Finnish Sauna', 'In-Chalet Michelin Chef', 'Private Funicular Key', 'Heli-Ski Priority']
      },
      {
        id: 'vibe',
        name: 'Vibe Whole Chalet',
        tagline: 'Complete 5-floor alpine sanctuary with private spa, cinema & staff.',
        price: '₹3,90,000 / night',
        size: '540 m² Full Chalet',
        bed: '5 Suites (10 Guests)',
        perks: ['Full Chalet Exclusivity', 'Helicopter Airport Transfer', 'All-Inclusive Fine Dining', 'Dedicated Butler & Masseuse']
      }
    ],
    published: true
  },
  {
    id: 'paro-tour-1',
    name: 'Oasis Paro Valley',
    subtitle: 'Sacred Valleys of Bhutan Odyssey',
    locationName: 'Paro Valley',
    country: 'Bhutan',
    region: 'Paro, Thimphu & Punakha',
    address: 'Paro River Sanctuary & Tiger’s Nest Trailhead, Bhutan',
    statusBadge: 'Curated Expedition',
    accentColor: '#d6c5b3',
    cardBgDark: 'bg-[#16151a]',
    category: 'Tour',
    subType: 'Helicopter & Monastery Sojourn',
    price: '₹1,85,000 / guest',
    numericPrice: 185000,
    lat: 27.42,
    lng: 89.41,
    duration: '7 Days / 6 Nights',
    groupSize: 'Up to 6 Guests',
    image: 'https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Private helicopter transfers through pine-scented Himalayan valleys, intimate monastery blessings, and traditional riverfront hot-stone baths overlooking Punakha Dzong.',
    proximities: [
      { time: "12'", label: 'From Paro International Airport' },
      { time: "20'", label: 'To Taktsang (Tiger’s Nest) trailhead' },
      { time: "25'", label: 'Scenic helicopter flight to Punakha' },
      { time: "05'", label: 'To ancient Kyichu Lhakhang temple' },
      { time: "01'", label: 'Private riverfront hot-stone bathhouse' },
      { time: "00'", label: 'All Bhutan SDF & royal permits included' }
    ],
    tiers: [
      {
        id: 'kick',
        name: 'Kick Cultural Trail',
        tagline: '5-day private guided journey across Paro & Thimphu sanctuaries.',
        price: '₹1,35,000 / guest',
        size: '5 Days / 4 Nights',
        bed: 'Luxury Valley Lodges',
        perks: ['Private SUV & Historian Guide', 'All Bhutan Visas & SDF', 'Tiger’s Nest Guided Ascent', 'Hot-Stone River Bath']
      },
      {
        id: 'boost',
        name: 'Boost Punakha Sojourn',
        tagline: '7-day circuit adding Punakha Valley & private monastery blessings.',
        price: '₹1,85,000 / guest',
        size: '7 Days / 6 Nights',
        bed: 'Boutique Heritage Suites',
        perks: ['Private Monk Blessing', 'Archery & Culinary Masterclass', 'All-Inclusive Dining', 'Dedicated Photographer']
      },
      {
        id: 'flex',
        name: 'Flex Heli-Odyssey',
        tagline: 'Includes private Airbus H130 helicopter transfers between valleys.',
        price: '₹2,75,000 / guest',
        size: '7 Days + Heli-Charter',
        bed: 'Six Senses / Amankora Tier',
        perks: ['Inter-Valley Helicopter Flights', 'High-Altitude Champagne Picnic', 'Private Spa Rituals', 'VIP Airport Tarmac Meet']
      },
      {
        id: 'vibe',
        name: 'Vibe Royal Charter',
        tagline: 'Bespoke 10-day Himalayan expedition with private jet connectivity.',
        price: '₹3,95,000 / guest',
        size: '10 Days / 9 Nights',
        bed: 'Presidential Sanctuary Villas',
        perks: ['Full Private Helicopter Charter', 'Private Audience with Scholars', 'Custom Glamping in Phobjikha', '24/7 Expedition Doctor & Concierge']
      }
    ],
    published: true
  },
  {
    id: 'sahyadri-trek-1',
    name: 'Oasis Sahyadri Crest',
    subtitle: 'Kokankada Cliff & Star-Bed Expedition',
    locationName: 'Sahyadri Range',
    country: 'India',
    region: 'Western Ghats, Maharashtra',
    address: 'Harishchandragad Base Sanctuary, Ahmednagar / Thane Border',
    statusBadge: 'Guided Alpine Trek',
    accentColor: '#9eb393',
    cardBgDark: 'bg-[#121715]',
    category: 'Trek',
    subType: 'Mountain Trek',
    price: '₹14,500 / guest',
    numericPrice: 14500,
    lat: 19.38,
    lng: 73.77,
    duration: '3 Days / 2 Nights',
    groupSize: 'Max 8 Explorers',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Ascend ancient rock-cut steps through cloud forests to the dramatic 1,424m Kokankada vertical basalt amphitheater with private luxury geodesic dome camping.',
    proximities: [
      { time: "3.5h", label: 'Private 4x4 drive from Mumbai / Pune' },
      { time: "1424m", label: 'Kokankada cliff crest elevation' },
      { time: "15'", label: 'Walk from summit camp to Kedareshwar Cave' },
      { time: "01'", label: 'From heated geodesic star-bed domes' },
      { time: "100%", label: 'Porter & expedition chef supported' },
      { time: "24/7", label: 'Satellite telemetry & wilderness medic' }
    ],
    tiers: [
      {
        id: 'kick',
        name: 'Kick Summit Trek',
        tagline: 'Weekend guided ascent with luxury alpine dome accommodation.',
        price: '₹14,500 / guest',
        size: '3 Days / 2 Nights',
        bed: 'Geodesic Summit Dome',
        perks: ['Certified Mountaineer Guide', 'All Gourmet Camp Meals', 'Porter Gear Support', 'Cliffside Sunrise Coffee']
      },
      {
        id: 'boost',
        name: 'Boost Private Pod',
        tagline: 'Private heated star-bed dome + roundtrip Mumbai 4x4 transfer.',
        price: '₹22,000 / guest',
        size: '3 Days + Private 4x4',
        bed: 'Private Star-Bed Dome',
        perks: ['Door-to-Door Mumbai SUV', 'Heated Bedding & Hot Shower', 'Astrophotography Session', 'Private Campfire Chef']
      },
      {
        id: 'flex',
        name: 'Flex Ridge Traverse',
        tagline: 'Extended 4-day Western Ghats ridge expedition with base villa stay.',
        price: '₹34,000 / guest',
        size: '4 Days / 3 Nights',
        bed: '2N Dome + 1N Forest Villa',
        perks: ['Post-Trek Recovery Spa', 'Private Expedition Team', 'Drone Reel Documentation', 'Gourmet Wilderness Dining']
      },
      {
        id: 'vibe',
        name: 'Vibe Private Charter',
        tagline: 'Exclusive private group buyout of the entire summit camp.',
        price: '₹98,000 / group',
        size: 'Up to 8 Explorers',
        bed: '4 Private Luxury Domes',
        perks: ['100% Camp Exclusivity', 'Custom Pace & Route', 'Live Acoustic Sundowner', 'Dedicated Wilderness Medic']
      }
    ],
    published: true
  },
  {
    id: 'spiti-trek-1',
    name: 'Oasis Spiti Valley',
    subtitle: 'Trans-Himalayan Monastery & Glacier Traverse',
    locationName: 'Spiti Valley',
    country: 'India',
    region: 'Himachal Trans-Himalaya',
    address: 'Kaza & Key Monastery Sanctuary Circuit, Himachal Pradesh',
    statusBadge: 'High-Altitude',
    accentColor: '#d49a7b',
    cardBgDark: 'bg-[#181513]',
    category: 'Trek',
    subType: 'Himalayan Trek',
    price: '₹64,000 / guest',
    numericPrice: 64000,
    lat: 32.24,
    lng: 78.03,
    duration: '8 Days / 7 Nights',
    groupSize: 'Max 6 Explorers',
    image: 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1400&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1400&q=85'
    ],
    description:
      'Walk ancient silk-route trails connecting thousand-year-old cliffside gompas with heated geodesic dome camps under crystalline Himalayan skies.',
    proximities: [
      { time: "4166m", label: 'Key Monastery altitude sanctuary' },
      { time: "100%", label: 'Supplemental oxygen & medic vehicle' },
      { time: "15'", label: 'To Chicham suspension gorge' },
      { time: "05'", label: 'To Langza fossil valley meadows' },
      { time: "01'", label: 'Private solar-heated boutique lodges' },
      { time: "24/7", label: 'Dedicated expedition 4x4 support convoy' }
    ],
    tiers: [
      {
        id: 'kick',
        name: 'Kick Valley Explorer',
        tagline: 'Guided 8-day expedition with boutique mud-walled solar lodges.',
        price: '₹64,000 / guest',
        size: '8 Days / 7 Nights',
        bed: 'Boutique Himalayan Lodges',
        perks: ['4x4 Expedition Convoy', 'Acclimatization Protocol', 'Monastery Private Access', 'All Organic Meals']
      },
      {
        id: 'boost',
        name: 'Boost Glamping Crest',
        tagline: 'Upgraded heated geodesic domes at Chandratal & Langza.',
        price: '₹88,000 / guest',
        size: '8 Days Luxury Glamping',
        bed: 'Heated Geodesic Suites',
        perks: ['En-Suite Heated Domes', 'Private Stargazing Telescope', 'Personal Sherpa Guide', 'Himalayan Herbal Spa']
      }
    ],
    published: true
  }
];

const MARQUEE_ITEMS = [
  'All-Inclusive Sanctuaries',
  'Private Speedboat & Heli Transfers',
  '24/7 Concierge & Security',
  'Private Chef & Farm-to-Table Dining',
  'Heated Infinity Pools & Cedar Spas',
  'Guided Alpine & Himalayan Expeditions',
  'Zero Hidden Fees — One Seamless Tariff',
  'Starlink High-Speed Connectivity'
];

const AMENITY_SHOWCASE = [
  {
    id: 'chef',
    label: 'Private Chef & Butler',
    title: 'Bespoke Culinary Craft in Every Sanctuary',
    desc: 'Wake up to coastal Konkan feasts, alpine fondue, or Himalayan organic breakfasts prepared fresh in your private kitchen.',
    img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'pool',
    label: 'Heated Infinity Pools',
    title: 'Temperature-Controlled Waters Facing the Horizon',
    desc: 'Swim at dawn or beneath the stars in ozone-purified lap pools cantilevered over orchards, beaches, and mountain valleys.',
    img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'charter',
    label: 'Speedboat & Heli Access',
    title: 'Skip the Traffic. Arrive Effortlessly.',
    desc: 'From private speedboats at the Gateway of India to Airbus helicopters in Paro and Zermatt, your journey begins the moment you step out.',
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'spa',
    label: 'Cedar Spa & Hot-Stone Baths',
    title: 'Restorative Rituals After Every Expedition',
    desc: 'Unwind in glass-walled Finnish saunas, traditional Bhutanese river-stone baths, and private ayurvedic recovery pavilions.',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'workspace',
    label: 'Starlink & Creative Studios',
    title: 'Work or Unplug From the Edge of the World',
    desc: 'Every villa and basecamp is equipped with redundant high-speed satellite internet, ergonomic acoustic studies, and power backup.',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
  }
];

const FAQ_DATA = [
  {
    category: 'About Opulent Oasis',
    q: 'What does "All-Inclusive Sanctuary Living" mean at Opulent Oasis?',
    a: 'Just like our modular Oasis concept, one transparent tariff covers your entire experience: private villa or expedition dome, on-site chef & butler team, daily breakfast and sundowners, 24/7 security, high-speed WiFi, and full access to wellness and spa spaces. No hidden resort fees or surprises.'
  },
  {
    category: 'Booking & Charters',
    q: 'How can I book a Sanctuary, Tour, or Trek?',
    a: 'Click "Book Your Oasis" anywhere on the site to choose your sanctuary, preferred tier (Kick, Boost, Flex, or Vibe), and dates. Our concierge team confirms availability immediately via WhatsApp or phone and arranges all transfers.'
  },
  {
    category: 'Booking & Charters',
    q: 'Can I schedule a virtual walkthrough or private preview before booking?',
    a: 'Absolutely! In our booking drawer, simply select "Remote Video Walkthrough" or "On-Site Preview". Our sanctuary managers will host a live video tour of the villa, orchard, or expedition basecamp.'
  },
  {
    category: 'Safety & Operations',
    q: 'What security and medical measures are in place for stays and treks?',
    a: 'Every coastal and alpine estate features 24/7 discreet perimeter security, smart keyless access, and on-call medical support. All high-altitude treks include certified mountaineering leaders, satellite communication, and supplemental oxygen.'
  },
  {
    category: 'Pricing & Flexibility',
    q: 'What is your weather-window & rescheduling policy?',
    a: 'All reservations include flexible date-shift protection up to 7 days prior to arrival, and helicopter/speedboat charters include automatic backup ground luxury SUV convoys in case of inclement weather.'
  }
];

export default function App() {
  const [isDay, setIsDay] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'unit-detail' | 'way-of-living' | 'community' | 'faqs' | 'contact'
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [activeUnit, setActiveUnit] = useState(INITIAL_LISTINGS[0]);
  const [activeTierIndex, setActiveTierIndex] = useState(1);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  // Navigation & Filter states
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAmenityId, setActiveAmenityId] = useState('chef');
  const [activeFaqCategory, setActiveFaqCategory] = useState('All');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Modals / Drawers
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [hostPasscode, setHostPasscode] = useState('');
  const [isHostAuthenticated, setIsHostAuthenticated] = useState(false);
  const [hostPasscodeError, setHostPasscodeError] = useState('');

  // Units.gr-style Booking Drawer State
  const [bookingForm, setBookingForm] = useState({
    selectedUnitName: 'Oasis Alibaug — The Banyan Glasshouse',
    unitTier: 'Boost Pavilion',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    guestType: 'Couple / Friends',
    tourType: 'Direct Reservation',
    dates: '',
    notes: '',
    gdprConsent: true
  });

  // Host Studio (Cloudflare D1)
  const [newListing, setNewListing] = useState({
    name: '',
    subtitle: '',
    locationName: '',
    country: 'India',
    region: '',
    category: 'Stay',
    subType: 'Private Villa',
    price: '₹45,000 / night',
    numericPrice: 45000,
    duration: 'Min 2 Nights',
    groupSize: 'Up to 8 Guests',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85',
    description: ''
  });
  const [savingToD1, setSavingToD1] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Ensure Tailwind CSS is loaded
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="tailwindcss"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tailwindcss.com';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Fetch live sanctuaries from Cloudflare D1 Edge API
  useEffect(() => {
    fetch('/api/listings')
      .then((res) => {
        if (!res.ok) throw new Error('Fallback');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const normalizedD1 = data.map((d) => ({
            ...INITIAL_LISTINGS[0],
            ...d,
            id: d.id || `oasis-${Math.random()}`,
            name: d.name || 'Oasis Sanctuary',
            subtitle: d.subtitle || d.sub_type || 'Private Sanctuary',
            locationName: d.locationName || d.location_name || 'Coastal Sanctuary',
            numericPrice: Number(d.numericPrice || d.numeric_price || 32000),
            subType: d.subType || d.sub_type || 'Private Sanctuary',
            groupSize: d.groupSize || d.group_size || 'Up to 8 Guests',
            published: d.published !== 0 && d.published !== false
          }));
          const existingIds = new Set(normalizedD1.map((item) => item.id));
          setListings([
            ...normalizedD1,
            ...INITIAL_LISTINGS.filter((item) => !existingIds.has(item.id))
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (!item.published) return false;
      if (categoryFilter !== 'ALL' && item.category.toUpperCase() !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [listings, categoryFilter]);

  const openUnitPage = (unit) => {
    setActiveUnit(unit);
    setActiveTierIndex(1);
    setActiveGalleryIdx(0);
    setCurrentPage('unit-detail');
    setNavDropdownOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBookingWithUnit = (unitName, tierName = 'Boost Pavilion') => {
    setBookingForm((prev) => ({
      ...prev,
      selectedUnitName: unitName || prev.selectedUnitName,
      unitTier: tierName
    }));
    setBookingDrawerOpen(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const message = encodeURIComponent(
      `Hello Opulent Oasis! I would like to book:\n• Sanctuary: ${bookingForm.selectedUnitName}\n• Tier: ${bookingForm.unitTier}\n• Guest: ${bookingForm.firstName} ${bookingForm.lastName} (${bookingForm.guestType})\n• Preference: ${bookingForm.tourType}\n• Dates/Notes: ${bookingForm.dates} ${bookingForm.notes}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleHostLogin = (e) => {
    e.preventDefault();
    if (hostPasscode === 'oasis2026') {
      setIsHostAuthenticated(true);
      setHostPasscodeError('');
    } else {
      setHostPasscodeError('Incorrect passcode. Use demo code: oasis2026');
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSavingToD1(true);
    setSaveSuccessMessage('');

    const payload = {
      ...INITIAL_LISTINGS[0],
      ...newListing,
      id: `oasis-${Date.now()}`,
      numericPrice: Number(newListing.numericPrice) || 45000,
      statusBadge: 'Newly Added',
      published: true
    };

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSaveSuccessMessage('Sanctuary saved to Cloudflare D1 Edge Database!');
      } else {
        setSaveSuccessMessage('Sanctuary added to live collection!');
      }
    } catch {
      setSaveSuccessMessage('Sanctuary added to live collection!');
    } finally {
      setListings((prev) => [payload, ...prev]);
      setSavingToD1(false);
      setNewListing({
        ...newListing,
        name: '',
        subtitle: '',
        locationName: '',
        region: '',
        description: ''
      });
    }
  };

  const activeAmenityObj =
    AMENITY_SHOWCASE.find((a) => a.id === activeAmenityId) || AMENITY_SHOWCASE[0];

  return (
    <div
      className={`font-body min-h-screen w-full transition-colors duration-500 ${
        isDay ? 'bg-[#f4f0e8] text-[#121214]' : 'bg-[#09090b] text-[#f5f2eb]'
      }`}
    >
      <style>{UNITS_OASIS_CSS}</style>

      {/* =====================================================================
          FLOATING PILL NAVIGATION BAR (1:1 UNITS.GR ARCHITECTURE)
      ===================================================================== */}
      <header className="sticky top-3 sm:top-5 z-40 px-3 sm:px-6">
        <div
          className={`mx-auto max-w-[1400px] rounded-full px-4 sm:px-7 h-16 sm:h-20 flex items-center justify-between border backdrop-blur-2xl transition-all shadow-2xl ${
            isDay
              ? 'bg-[#ffffff]/90 border-black/10 text-[#121214]'
              : 'bg-[#141418]/90 border-white/10 text-[#f5f2eb]'
          }`}
        >
          {/* Left: Brand Logo Pill */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setCurrentPage('home');
                setNavDropdownOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#d6c5b3] text-[#09090b] flex items-center justify-center font-display font-extrabold text-sm tracking-tighter group-hover:rotate-12 transition-transform">
                OO
              </div>
              <div>
                <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight block leading-none">
                  OPULENT OASIS
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#d6c5b3] block mt-0.5">
                  Stays • Tours • Treks
                </span>
              </div>
            </button>

            {/* Center Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {/* Dropdown Trigger like "Student Homes ▾" on units.gr */}
              <div className="relative">
                <button
                  onClick={() => setNavDropdownOpen(!navDropdownOpen)}
                  className={`px-4 py-2 rounded-full inline-flex items-center gap-1.5 transition ${
                    navDropdownOpen
                      ? 'bg-[#d6c5b3] text-[#09090b] font-semibold'
                      : 'hover:bg-current/5'
                  }`}
                >
                  <span>Sanctuaries</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      navDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {navDropdownOpen && (
                  <div
                    className={`absolute left-0 mt-3 w-[540px] rounded-[28px] p-6 border shadow-2xl grid grid-cols-2 gap-4 z-50 ${
                      isDay
                        ? 'bg-[#f9f6f0] border-black/10 text-[#121214]'
                        : 'bg-[#16161b] border-white/15 text-[#f5f2eb]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-[#d6c5b3] font-semibold">
                        Coastal & Alpine Stays
                      </div>
                      {listings
                        .filter((l) => l.category === 'Stay')
                        .map((unit) => (
                          <button
                            key={unit.id}
                            onClick={() => openUnitPage(unit)}
                            className="w-full text-left p-3 rounded-2xl hover:bg-current/5 transition flex items-center justify-between group"
                          >
                            <div>
                              <div className="font-display font-bold text-sm">{unit.name}</div>
                              <div className="text-xs opacity-60">{unit.locationName}</div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                          </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-[#9eb393] font-semibold">
                        Expeditions & Tours
                      </div>
                      {listings
                        .filter((l) => l.category !== 'Stay')
                        .map((unit) => (
                          <button
                            key={unit.id}
                            onClick={() => openUnitPage(unit)}
                            className="w-full text-left p-3 rounded-2xl hover:bg-current/5 transition flex items-center justify-between group"
                          >
                            <div>
                              <div className="font-display font-bold text-sm">{unit.name}</div>
                              <div className="text-xs opacity-60">
                                {unit.category} • {unit.country}
                              </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setCurrentPage('way-of-living');
                  setNavDropdownOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-full transition ${
                  currentPage === 'way-of-living'
                    ? 'bg-current/10 font-semibold'
                    : 'hover:bg-current/5 opacity-80 hover:opacity-100'
                }`}
              >
                Our Way of Living
              </button>

              <button
                onClick={() => {
                  setCurrentPage('community');
                  setNavDropdownOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-full transition ${
                  currentPage === 'community'
                    ? 'bg-current/10 font-semibold'
                    : 'hover:bg-current/5 opacity-80 hover:opacity-100'
                }`}
              >
                Community & Stories
              </button>

              <button
                onClick={() => {
                  setCurrentPage('faqs');
                  setNavDropdownOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-full transition ${
                  currentPage === 'faqs'
                    ? 'bg-current/10 font-semibold'
                    : 'hover:bg-current/5 opacity-80 hover:opacity-100'
                }`}
              >
                FAQs
              </button>

              <button
                onClick={() => {
                  setCurrentPage('contact');
                  setNavDropdownOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-full transition ${
                  currentPage === 'contact'
                    ? 'bg-current/10 font-semibold'
                    : 'hover:bg-current/5 opacity-80 hover:opacity-100'
                }`}
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Right Actions: Theme Switch, Host CMS, & "Book your Oasis" Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsDay(!isDay)}
              className={`p-2.5 rounded-full border transition ${
                isDay ? 'border-black/10 hover:bg-black/5' : 'border-white/10 hover:bg-white/5'
              }`}
              title="Toggle Atmosphere"
            >
              {isDay ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#d6c5b3]" />}
            </button>

            <button
              onClick={() => setHostModalOpen(true)}
              className={`hidden md:inline-flex px-4 py-2.5 rounded-full text-xs font-semibold border transition ${
                isDay
                  ? 'border-black/15 hover:bg-black/5'
                  : 'border-white/15 hover:bg-white/5'
              }`}
            >
              + Host Unit
            </button>

            <button
              onClick={() => openBookingWithUnit(activeUnit?.name)}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-display font-bold bg-[#d6c5b3] text-[#09090b] hover:bg-[#e5d7c7] transition inline-flex items-center gap-2 shadow-lg"
            >
              <span>Book your Oasis</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full border border-current/15"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden mt-2 rounded-[28px] p-6 border shadow-2xl space-y-4 ${
              isDay
                ? 'bg-[#ffffff] border-black/10 text-[#121214]'
                : 'bg-[#141418] border-white/15 text-[#f5f2eb]'
            }`}
          >
            <div className="text-xs uppercase tracking-[0.2em] text-[#d6c5b3] font-semibold">
              Explore Sanctuaries
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {listings.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => openUnitPage(unit)}
                  className="p-3 rounded-2xl bg-current/5 text-left flex items-center justify-between"
                >
                  <div>
                    <div className="font-display font-bold text-sm">{unit.name}</div>
                    <div className="text-xs opacity-65">{unit.price}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              ))}
            </div>
            <div className="border-t border-current/10 pt-4 flex flex-wrap gap-2">
              {[
                { id: 'home', label: 'Home' },
                { id: 'way-of-living', label: 'Our Way of Living' },
                { id: 'community', label: 'Community' },
                { id: 'faqs', label: 'FAQs' },
                { id: 'contact', label: 'Contact' }
              ].map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => {
                    setCurrentPage(nav.id);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-current/15"
                >
                  {nav.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setHostModalOpen(true);
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#d6c5b3]/20 text-[#d6c5b3]"
              >
                + Host Studio
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          PAGE 1: HOMEPAGE (1:1 UNITS.GR MODULAR BENTO ARCHITECTURE)
      ===================================================================== */}
      {currentPage === 'home' && (
        <main className="mx-auto max-w-[1400px] px-3 sm:px-6 pt-4 pb-16 space-y-6 sm:space-y-8">
          {/* 1. HERO UNIT BLOCK ("Home of the uniquely extraordinary") */}
          <section
            className={`rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 lg:p-16 border relative overflow-hidden ${
              isDay
                ? 'bg-[#e9e2d6] border-black/10 text-[#121214]'
                : 'bg-[#121216] border-white/10 text-[#f5f2eb]'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 sm:space-y-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d6c5b3] text-[#09090b]">
                    All-Inclusive Sanctuaries
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-xs font-semibold border border-current/15">
                    Stays • Private Tours • Alpine Treks
                  </span>
                </div>

                <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-[4.6rem] leading-[0.96] tracking-tight">
                  Home of the{' '}
                  <span className="font-serif-accent italic font-normal text-[#d6c5b3]">
                    uniquely
                  </span>{' '}
                  extraordinary.
                </h1>

                <p className="text-base sm:text-xl opacity-80 max-w-2xl leading-relaxed font-normal">
                  All-inclusive architectural villas, private helicopter charters, and guided mountain
                  expeditions with everything you need to live, explore, and disconnect.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => openBookingWithUnit(listings[0]?.name)}
                    className="px-7 py-4 rounded-full font-display font-bold text-sm bg-[#d6c5b3] text-[#09090b] hover:bg-[#e5d7c7] transition inline-flex items-center gap-2 shadow-xl"
                  >
                    <span>Book your Oasis</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('locations-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-7 py-4 rounded-full font-display font-semibold text-sm border border-current/20 hover:bg-current/5 transition"
                  >
                    Explore Locations ↓
                  </button>
                </div>

                {/* Quick Metric Pills */}
                <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg">
                  <div className="p-4 rounded-2xl bg-current/[0.04] border border-current/10">
                    <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#d6c5b3]">
                      100%
                    </div>
                    <div className="text-xs opacity-65 mt-0.5">All-Inclusive Tariffs</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-current/[0.04] border border-current/10">
                    <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#9eb393]">
                      24/7
                    </div>
                    <div className="text-xs opacity-65 mt-0.5">Private Concierge</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-current/[0.04] border border-current/10">
                    <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#d49a7b]">
                      4 Countries
                    </div>
                    <div className="text-xs opacity-65 mt-0.5">Curated Units</div>
                  </div>
                </div>
              </div>

              {/* Hero Right Interactive Featured Unit Card */}
              <div className="lg:col-span-5">
                <div
                  onClick={() => openUnitPage(listings[1] || listings[0])}
                  className="group cursor-pointer rounded-[28px] overflow-hidden border border-current/15 bg-black/30 relative aspect-[4/4.3] flex flex-col justify-between p-6 text-white shadow-2xl"
                >
                  <img
                    src={(listings[1] || listings[0]).image}
                    alt="Featured Oasis"
                    className="absolute inset-0 w-full h-full object-cover img-zoom"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#9eb393] text-[#09090b]">
                      Move-in & Charter Ready
                    </span>
                    <span className="w-11 h-11 rounded-full bg-white/90 text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#d6c5b3]">
                      {(listings[1] || listings[0]).locationName} • 20' Speedboat from Mumbai
                    </div>
                    <h2 className="font-display font-extrabold text-3xl sm:text-4xl">
                      {(listings[1] || listings[0]).name}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/80 line-clamp-2">
                      {(listings[1] || listings[0]).description}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-white/15 text-xs">
                      <span>4 Unit Tiers Available</span>
                      <span className="font-bold text-[#d6c5b3]">
                        From {(listings[1] || listings[0]).price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. KINETIC MARQUEE STRIP (1:1 UNITS.GR TICKER) */}
          <div
            className={`rounded-full py-4 border overflow-hidden ${
              isDay
                ? 'bg-[#121214] text-[#f5f2eb] border-black/10'
                : 'bg-[#d6c5b3] text-[#09090b] border-white/10'
            }`}
          >
            <div className="animate-marquee flex items-center gap-10 text-xs sm:text-sm font-display font-bold uppercase tracking-[0.18em]">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, idx) => (
                <div key={idx} className="flex items-center gap-10 shrink-0">
                  <span>{text}</span>
                  <span className="w-2 h-2 rounded-full bg-current opacity-50" />
                </div>
              ))}
            </div>
          </div>

          {/* 3. LOCATIONS SECTION ("Where your everyday / journey just works") */}
          <section
            id="locations-section"
            className={`rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 lg:p-14 border space-y-10 ${
              isDay
                ? 'bg-[#ffffff] border-black/10'
                : 'bg-[#121216] border-white/10'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#d6c5b3]/20 text-[#d6c5b3]">
                  Locations & Sanctuaries
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl leading-[0.98]">
                  Where your escape{' '}
                  <span className="font-serif-accent italic font-normal text-[#d6c5b3]">
                    just works.
                  </span>
                </h2>
                <p className="text-sm sm:text-base opacity-75 leading-relaxed">
                  Wake up, step out, you’re there. Private beaches, mango orchards, alpine pistes, and
                  Himalayan monasteries — all without wasted transit time. Every Oasis location is
                  chosen to match your rhythm.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'ALL', label: 'All Units (' + listings.length + ')' },
                  { id: 'STAY', label: 'Private Stays' },
                  { id: 'TOUR', label: 'Bespoke Tours' },
                  { id: 'TREK', label: 'Guided Treks' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-5 py-2.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition ${
                      categoryFilter === tab.id
                        ? 'bg-[#d6c5b3] text-[#09090b]'
                        : 'border border-current/15 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modular Unit Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((unit) => (
                <article
                  key={unit.id}
                  onClick={() => openUnitPage(unit)}
                  className={`group cursor-pointer rounded-[28px] overflow-hidden border unit-card-hover flex flex-col justify-between ${
                    isDay
                      ? 'bg-[#f7f4ee] border-black/10'
                      : `${unit.cardBgDark || 'bg-[#17171c]'} border-white/10 hover:border-[#d6c5b3]/50`
                  }`}
                >
                  <div>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={unit.image}
                        alt={unit.name}
                        loading="lazy"
                        className="w-full h-full object-cover img-zoom"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span
                          className="px-3 py-1 rounded-full text-[11px] font-display font-bold text-[#09090b]"
                          style={{ backgroundColor: unit.accentColor || '#d6c5b3' }}
                        >
                          {unit.statusBadge || unit.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-black/65 text-white backdrop-blur-md">
                          {unit.country}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                        <div>
                          <div className="text-[11px] uppercase tracking-widest text-[#d6c5b3]">
                            {unit.locationName}
                          </div>
                          <h3 className="font-display font-extrabold text-2xl leading-tight">
                            {unit.name}
                          </h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 group-hover:rotate-45 transition-transform">
                          <ArrowUpRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <p className="text-xs sm:text-sm opacity-75 line-clamp-2 leading-relaxed">
                        {unit.description}
                      </p>

                      {/* Proximity Pills Preview */}
                      {unit.proximities && (
                        <div className="flex flex-wrap gap-1.5">
                          {unit.proximities.slice(0, 2).map((prox, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-full text-[11px] bg-current/[0.06] border border-current/10"
                            >
                              <strong className="text-[#d6c5b3]">{prox.time}</strong> {prox.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-3 border-t border-current/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-50">
                        All-Inclusive From
                      </div>
                      <div className="font-display font-extrabold text-lg text-[#d6c5b3]">
                        {unit.price}
                      </div>
                    </div>
                    <span className="px-4 py-2 rounded-full text-xs font-display font-bold bg-current/10 group-hover:bg-[#d6c5b3] group-hover:text-[#09090b] transition">
                      Explore Unit →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 4. ALL-INCLUSIVE LIVING ("One Oasis. An entire universe.") */}
          <section
            className={`rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 lg:p-14 border space-y-10 ${
              isDay
                ? 'bg-[#e8e1d5] border-black/10'
                : 'bg-[#141418] border-white/10'
            }`}
          >
            <div className="max-w-3xl space-y-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#9eb393]/20 text-[#9eb393]">
                All-Inclusive Philosophy
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl leading-[0.98]">
                One Oasis.{' '}
                <span className="font-serif-accent italic font-normal text-[#d6c5b3]">
                  An entire universe.
                </span>
              </h2>
              <p className="text-sm sm:text-base opacity-75 leading-relaxed">
                Your tariff covers everything. Each Opulent Oasis is its own self-contained universe,
                combining private architectural spaces, culinary brigades, and expedition logistics
                with zero hidden fees or surprises.
              </p>
            </div>

            {/* 4-Card Bento Grid (1:1 from units.gr) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  badge: 'Open Access 24/7',
                  title: 'Sanctuary Living Spaces',
                  color: '#d6c5b3',
                  items: [
                    'Heated Ozone Infinity Pools',
                    'Cedar Sauna & Hot-Stone Baths',
                    'Private Cinema & Vinyl Lounges',
                    'Heirloom Orchard & Beach Decks'
                  ]
                },
                {
                  badge: 'Day and Night',
                  title: 'Security & Discretion',
                  color: '#9eb393',
                  items: [
                    '24/7 Perimeter Security & Patrol',
                    'Gated Private Estate Access',
                    'Discreet VIP & Celebrity Protocol',
                    'Wilderness Medic & Satellite Link'
                  ]
                },
                {
                  badge: "We've Got You Covered",
                  title: '24/7 Bespoke Support',
                  color: '#d49a7b',
                  items: [
                    'Dedicated Live-In Butler & Chef',
                    'Speedboat & Helicopter Charters',
                    'Instant WhatsApp Concierge Desk',
                    'Flexible Weather-Window Shifts'
                  ]
                },
                {
                  badge: 'Everyday Ease',
                  title: 'Smart Sanctuary Tech',
                  color: '#c4b5fd',
                  items: [
                    'Digital Mobile Key & Itinerary',
                    'Starlink High-Speed Mesh WiFi',
                    '100% Solar & Generator Backup',
                    'EV & Yacht Mooring Stations'
                  ]
                }
              ].map((box, i) => (
                <div
                  key={i}
                  className={`rounded-[28px] p-6 sm:p-7 border flex flex-col justify-between space-y-6 ${
                    isDay
                      ? 'bg-[#ffffff] border-black/10'
                      : 'bg-[#0d0d10] border-white/10'
                  }`}
                >
                  <div className="space-y-4">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[11px] font-display font-bold text-[#09090b]"
                      style={{ backgroundColor: box.color }}
                    >
                      {box.badge}
                    </span>
                    <h3 className="font-display font-extrabold text-2xl leading-tight">
                      {box.title}
                    </h3>
                    <ul className="space-y-2.5 pt-2 text-xs sm:text-sm opacity-80">
                      {box.items.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#d6c5b3] shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-[11px] uppercase tracking-widest opacity-40">
                    0{i + 1} // Included in Tariff
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. INTERACTIVE "PRESS TO EXPLORE" AMENITY SHOWCASE (1:1 UNITS.GR) */}
          <section
            className={`rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 lg:p-14 border ${
              isDay
                ? 'bg-[#ffffff] border-black/10'
                : 'bg-[#121216] border-white/10'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#d49a7b]/20 text-[#d49a7b]">
                  Our Sanctuaries • Press to Switch
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-5xl leading-[0.98]">
                  Luxury travel,{' '}
                  <span className="font-serif-accent italic font-normal text-[#d6c5b3]">
                    redefined.
                  </span>
                </h2>
                <p className="text-sm sm:text-base opacity-75 leading-relaxed">
                  Click any capability pill below to inspect how every Opulent Oasis unit is
                  engineered for effortless comfort, culinary excellence, and adventure.
                </p>

                {/* Interactive Pill Buttons */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {AMENITY_SHOWCASE.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveAmenityId(item.id)}
                      className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-display font-bold transition ${
                        activeAmenityId === item.id
                          ? 'bg-[#d6c5b3] text-[#09090b] shadow-md scale-105'
                          : 'border border-current/15 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="p-6 rounded-3xl bg-current/[0.04] border border-current/10 space-y-2">
                  <div className="text-xs uppercase tracking-widest text-[#d6c5b3] font-bold">
                    {activeAmenityObj.label}
                  </div>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl">
                    {activeAmenityObj.title}
                  </h3>
                  <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                    {activeAmenityObj.desc}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-[28px] overflow-hidden aspect-[16/11] border border-current/15 shadow-2xl">
                  <img
                    src={activeAmenityObj.img}
                    alt={activeAmenityObj.title}
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white">
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-black/70 backdrop-blur-md">
                      {activeAmenityObj.label}
                    </span>
                    <button
                      onClick={() => openBookingWithUnit(listings[0]?.name)}
                      className="px-4 py-2 rounded-full text-xs font-display font-bold bg-[#d6c5b3] text-[#09090b]"
                    >
                      Book Experience →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. "WHAT DEFINES US" 3-COLUMN COLOR-BLOCKED PILLARS (1:1 UNITS.GR) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                num: '01',
                title: 'For People',
                subtitle: 'Human-First Hospitality',
                desc: 'Everything starts with how it feels to wake up here. From private orchard breakfasts to high-altitude campfires, your rhythm always comes first.',
                bg: isDay ? 'bg-[#e6dfd3]' : 'bg-[#17161b]',
                accent: '#d6c5b3'
              },
              {
                num: '02',
                title: 'By Design',
                subtitle: 'Architectural Precision',
                desc: 'Nothing is accidental. Every courtyard, cantilevered pool, and geodesic star-bed is sculpted to frame nature without sacrificing comfort.',
                bg: isDay ? 'bg-[#dde5d9]' : 'bg-[#131916]',
                accent: '#9eb393'
              },
              {
                num: '03',
                title: 'With Care',
                subtitle: 'Local Ecology & Craft',
                desc: 'At the heart of everything we do. We care for our guests, our local mountain guides and chefs, and the pristine ecosystems we inhabit.',
                bg: isDay ? 'bg-[#eadccf]' : 'bg-[#1b1614]',
                accent: '#d49a7b'
              }
            ].map((pillar) => (
              <div
                key={pillar.num}
                className={`rounded-[32px] p-8 sm:p-10 border border-current/10 flex flex-col justify-between space-y-10 ${pillar.bg}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-3.5 py-1 rounded-full text-xs font-display font-bold text-[#09090b]"
                    style={{ backgroundColor: pillar.accent }}
                  >
                    {pillar.subtitle}
                  </span>
                  <span className="font-serif-accent italic text-3xl opacity-50">{pillar.num}</span>
                </div>
                <div className="space-y-3">
                  <h3 className="font-display font-extrabold text-3xl sm:text-4xl">
                    {pillar.title}
                  </h3>
                  <p className="text-sm opacity-80 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* 7. HOMEPAGE FAQ PREVIEW ACCORDION */}
          <section
            className={`rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 lg:p-14 border space-y-8 ${
              isDay ? 'bg-[#ffffff] border-black/10' : 'bg-[#121216] border-white/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#d6c5b3] font-bold">
                  Practicalities & Answers
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-5xl mt-1">
                  Frequently Asked Questions
                </h2>
              </div>
              <button
                onClick={() => {
                  setCurrentPage('faqs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-full text-xs font-display font-bold border border-current/15 hover:bg-current/5 self-start sm:self-auto"
              >
                View All FAQs →
              </button>
            </div>

            <div className="space-y-3">
              {FAQ_DATA.slice(0, 4).map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-current/10 overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-[#d6c5b3] block">
                          {faq.category}
                        </span>
                        <h3 className="font-display font-bold text-base sm:text-lg">{faq.q}</h3>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-current/15 flex items-center justify-center shrink-0">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm opacity-75 leading-relaxed border-t border-current/5 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {/* =====================================================================
          PAGE 2: DEDICATED UNIT / SANCTUARY DETAIL PAGE (1:1 UNITS.GR/UNIT/)
      ===================================================================== */}
      {currentPage === 'unit-detail' && activeUnit && (
        <main className="mx-auto max-w-[1400px] px-3 sm:px-6 pt-4 pb-16 space-y-6 sm:space-y-8">
          {/* Top Back Breadcrumb Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('home')}
              className="px-4 py-2 rounded-full text-xs font-display font-bold border border-current/15 hover:bg-current/5 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Sanctuaries
            </button>
            <div className="text-xs opacity-60 hidden sm:block">
              {activeUnit.country} • {activeUnit.region}
            </div>
          </div>

          {/* Unit Hero Block */}
          <section
            className={`rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 border space-y-8 ${
              isDay ? 'bg-[#ffffff] border-black/10' : 'bg-[#121216] border-white/10'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-3.5 py-1 rounded-full text-xs font-display font-bold text-[#09090b]"
                    style={{ backgroundColor: activeUnit.accentColor || '#d6c5b3' }}
                  >
                    {activeUnit.statusBadge || activeUnit.category}
                  </span>
                  <span className="px-3.5 py-1 rounded-full text-xs border border-current/15">
                    {activeUnit.locationName}, {activeUnit.country}
                  </span>
                </div>

                <h1 className="font-display font-extrabold text-4xl sm:text-6xl leading-[0.96]">
                  {activeUnit.name}
                </h1>
                <div className="text-lg sm:text-xl font-serif-accent italic text-[#d6c5b3]">
                  {activeUnit.subtitle}
                </div>
                <p className="text-sm sm:text-base opacity-80 leading-relaxed">
                  {activeUnit.description}
                </p>

                <div className="p-4 rounded-2xl bg-current/[0.04] border border-current/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#d6c5b3] shrink-0" />
                    <span>{activeUnit.address || activeUnit.region}</span>
                  </div>
                  <span className="font-display font-bold text-[#d6c5b3]">
                    {activeUnit.duration} • {activeUnit.groupSize}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() =>
                      openBookingWithUnit(
                        activeUnit.name,
                        activeUnit.tiers?.[activeTierIndex]?.name || 'Boost Tier'
                      )
                    }
                    className="px-7 py-4 rounded-full font-display font-bold text-xs sm:text-sm bg-[#d6c5b3] text-[#09090b] hover:bg-[#e5d7c7] transition inline-flex items-center gap-2"
                  >
                    <span>Book this Oasis</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')
                    }
                    className="px-6 py-4 rounded-full font-display font-semibold text-xs sm:text-sm border border-current/20 hover:bg-current/5 transition"
                  >
                    Call / WhatsApp Concierge
                  </button>
                </div>
              </div>

              {/* Interactive Gallery / 360 Switcher */}
              <div className="lg:col-span-6 space-y-3">
                <div className="relative rounded-[28px] overflow-hidden aspect-[16/11] border border-current/15">
                  <img
                    src={
                      (activeUnit.gallery && activeUnit.gallery[activeGalleryIdx]) ||
                      activeUnit.image
                    }
                    alt={activeUnit.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-xs font-bold bg-black/70 text-white backdrop-blur-md inline-flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#d6c5b3]" /> Sanctuary Gallery View
                  </div>
                </div>
                {activeUnit.gallery && activeUnit.gallery.length > 1 && (
                  <div className="flex gap-2">
                    {activeUnit.gallery.map((gUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveGalleryIdx(idx)}
                        className={`relative h-16 w-24 rounded-xl overflow-hidden border-2 transition ${
                          activeGalleryIdx === idx
                            ? 'border-[#d6c5b3] scale-105'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={gUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* "ALL YOU NEED, JUST STEPS AWAY" PROXIMITY GRID (1:1 UNITS.GR) */}
          {activeUnit.proximities && (
            <section
              className={`rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 border space-y-8 ${
                isDay ? 'bg-[#e9e2d6] border-black/10' : 'bg-[#15151a] border-white/10'
              }`}
            >
              <div className="max-w-2xl space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#d6c5b3] font-bold">
                  Seamless Connectivity
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-5xl">
                  All you need,{' '}
                  <span className="font-serif-accent italic font-normal text-[#d6c5b3]">
                    just moments away.
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {activeUnit.proximities.map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-3xl p-5 border flex flex-col justify-between space-y-4 ${
                      isDay ? 'bg-white border-black/10' : 'bg-[#0d0d10] border-white/10'
                    }`}
                  >
                    <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#d6c5b3]">
                      {item.time}
                    </div>
                    <div className="text-xs opacity-75 leading-snug">{item.label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* INTERACTIVE UNIT TIER SELECTOR: KICK / BOOST / FLEX / VIBE (1:1 UNITS.GR) */}
          {activeUnit.tiers && activeUnit.tiers.length > 0 && (
            <section
              className={`rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 border space-y-8 ${
                isDay ? 'bg-[#ffffff] border-black/10' : 'bg-[#121216] border-white/10'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#9eb393] font-bold">
                    Check Out Our Unit Tiers
                  </span>
                  <h2 className="font-display font-extrabold text-3xl sm:text-5xl mt-1">
                    Choose Your Oasis Configuration
                  </h2>
                </div>

                {/* Tier Tabs (Kick / Boost / Flex / Vibe) */}
                <div className="flex flex-wrap gap-2">
                  {activeUnit.tiers.map((tier, idx) => (
                    <button
                      key={tier.id}
                      onClick={() => setActiveTierIndex(idx)}
                      className={`px-5 py-3 rounded-full text-xs sm:text-sm font-display font-bold transition ${
                        activeTierIndex === idx
                          ? 'bg-[#d6c5b3] text-[#09090b] shadow-lg'
                          : 'border border-current/15 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {tier.name} • {tier.price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Tier Detail Card */}
              {(() => {
                const currentTier =
                  activeUnit.tiers[activeTierIndex] || activeUnit.tiers[0];
                return (
                  <div
                    className={`rounded-[28px] p-6 sm:p-10 border grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                      isDay
                        ? 'bg-[#f6f2ea] border-black/10'
                        : 'bg-[#18181f] border-white/10'
                    }`}
                  >
                    <div className="lg:col-span-7 space-y-5">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#d6c5b3] text-[#09090b]">
                        <span>{currentTier.size}</span>
                        <span>•</span>
                        <span>{currentTier.bed}</span>
                      </div>

                      <h3 className="font-display font-extrabold text-3xl sm:text-4xl">
                        {currentTier.name} —{' '}
                        <span className="text-[#d6c5b3]">{currentTier.price}</span>
                      </h3>

                      <p className="text-sm sm:text-base opacity-80 leading-relaxed">
                        {currentTier.tagline} Your tariff covers everything: private chef &
                        butler service, electricity & climate control, high-speed Starlink WiFi,
                        and unlimited access to all Sanctuary Living Spaces.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                        {currentTier.perks.map((perk, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-2xl bg-current/[0.05] border border-current/10 text-xs font-semibold flex items-center gap-2"
                          >
                            <Check className="w-4 h-4 text-[#9eb393] shrink-0" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-5 p-6 rounded-3xl bg-current/[0.04] border border-current/10 space-y-5">
                      <div className="text-xs uppercase tracking-widest text-[#d6c5b3] font-bold">
                        Each Sanctuary Tier Features:
                      </div>
                      <p className="text-xs opacity-75 leading-relaxed">
                        Anatomical luxury mattresses, organic 600-thread-count linens, private
                        barista station, Marshall sound system, climate control, rain showers,
                        botanical bath amenities, private outdoor seating, and 24/7 concierge
                        intercom.
                      </p>
                      <button
                        onClick={() =>
                          openBookingWithUnit(activeUnit.name, currentTier.name)
                        }
                        className="w-full py-4 rounded-full font-display font-bold text-xs sm:text-sm bg-[#d6c5b3] text-[#09090b] hover:bg-[#e5d7c7] transition"
                      >
                        Book {currentTier.name} ({currentTier.price}) →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </section>
          )}
        </main>
      )}

      {/* =====================================================================
          PAGE 3: OUR WAY OF LIVING (1:1 UNITS.GR PHILOSOPHY PAGE)
      ===================================================================== */}
      {currentPage === 'way-of-living' && (
        <main className="mx-auto max-w-[1400px] px-3 sm:px-6 pt-4 pb-16 space-y-6 sm:space-y-8">
          <section
            className={`rounded-[32px] sm:rounded-[44px] p-8 sm:p-14 border space-y-6 ${
              isDay ? 'bg-[#e9e2d6] border-black/10' : 'bg-[#121216] border-white/10'
            }`}
          >
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#d6c5b3] text-[#09090b]">
              Our Way of Living
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[0.95] max-w-4xl">
              Why Opulent Oasis{' '}
              <span className="font-serif-accent italic font-normal text-[#d6c5b3]">
                hits different.
              </span>
            </h1>
            <p className="text-base sm:text-xl opacity-80 max-w-2xl leading-relaxed">
              We stripped away complicated hotel check-ins, hidden resort surcharges, and rigid
              itineraries—replacing them with modular, all-inclusive private sanctuaries.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Practical ease and luxury, every single day',
                points: [
                  'All-inclusive tariff covering private chef, butler, utilities & transfers.',
                  'Smooth private speedboat or heli check-in with our team by your side.',
                  'Live video walkthroughs before you reserve.',
                  'Fast on-ground concierge support whenever you need it.'
                ]
              },
              {
                num: '02',
                title: 'A new take on experiential travel',
                points: [
                  'Privacy-first architectural villas & geodesic summit camps.',
                  'Seamless transition from coastal estates to Himalayan treks.',
                  'Starlink high-speed connectivity in every remote sanctuary.',
                  'Sustainable solar-powered & plastic-free operations.'
                ]
              },
              {
                num: '03',
                title: 'Security and comfort from day one',
                points: [
                  '24/7 discreet estate security & wilderness medics.',
                  '7/7 night perimeter monitoring and gated privacy.',
                  'Guaranteed weather-window rescheduling flexibility.',
                  '24/7 hot water, climate control & backup power.'
                ]
              }
            ].map((card) => (
              <div
                key={card.num}
                className={`rounded-[32px] p-8 border space-y-6 ${
                  isDay ? 'bg-white border-black/10' : 'bg-[#141418] border-white/10'
                }`}
              >
                <div className="font-serif-accent italic text-5xl text-[#d6c5b3]">
                  {card.num}
                </div>
                <h3 className="font-display font-extrabold text-2xl">{card.title}</h3>
                <ul className="space-y-3 text-xs sm:text-sm opacity-80">
                  {card.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#9eb393] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </main>
      )}

      {/* =====================================================================
          PAGE 4: COMMUNITY & STORIES (1:1 UNITS.GR/EN/COMMUNITY/)
      ===================================================================== */}
      {currentPage === 'community' && (
        <main className="mx-auto max-w-[1400px] px-3 sm:px-6 pt-4 pb-16 space-y-6 sm:space-y-8">
          <section
            className={`rounded-[32px] sm:rounded-[44px] p-8 sm:p-14 border space-y-6 ${
              isDay ? 'bg-[#dde5d9] border-black/10' : 'bg-[#131815] border-white/10'
            }`}
          >
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#9eb393] text-[#09090b]">
              How We See Community
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[0.95] max-w-4xl">
              More than shared spaces.{' '}
              <span className="font-serif-accent italic font-normal text-[#d6c5b3]">
                A shared way of living.
              </span>
            </h1>
            <p className="text-base sm:text-xl opacity-80 max-w-2xl leading-relaxed">
              We don’t believe in forced group tours or rigid schedules. Whether gathering around a
              cliffside bonfire in the Sahyadris or hosting a sunset table in Alibaug, you choose
              what fits—we make it happen.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                tag: 'Health & Wellness',
                title: 'Dawn Yoga, Ice Baths & Sound Healing',
                desc: 'Guided breathwork on private Gorai decks, Himalayan singing bowl sessions in Paro, and alpine thermal recovery.'
              },
              {
                tag: 'Social Days & Nights',
                title: 'Orchard Sundowners & Star-Bed Bonfires',
                desc: 'Acoustic vinyl sessions, coastal seafood barbecues, and intimate astronomer-led stargazing under zero light pollution.'
              },
              {
                tag: 'Culture & Craft',
                title: 'Monastery Trails & Culinary Masterclasses',
                desc: 'Forage with local Konkan chefs, learn Bhutanese archery, or walk ancient silk-route trails with local historians.'
              }
            ].map((ev, i) => (
              <div
                key={i}
                className={`rounded-[32px] p-8 border space-y-4 ${
                  isDay ? 'bg-white border-black/10' : 'bg-[#141418] border-white/10'
                }`}
              >
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d6c5b3]/20 text-[#d6c5b3]">
                  {ev.tag}
                </span>
                <h3 className="font-display font-extrabold text-2xl">{ev.title}</h3>
                <p className="text-sm opacity-75 leading-relaxed">{ev.desc}</p>
              </div>
            ))}
          </section>
        </main>
      )}

      {/* =====================================================================
          PAGE 5: FULL CATEGORIZED FAQs PAGE
      ===================================================================== */}
      {currentPage === 'faqs' && (
        <main className="mx-auto max-w-[1100px] px-3 sm:px-6 pt-4 pb-16 space-y-6">
          <section
            className={`rounded-[32px] p-8 sm:p-12 border space-y-6 ${
              isDay ? 'bg-white border-black/10' : 'bg-[#121216] border-white/10'
            }`}
          >
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl">
              Frequently Asked Questions
            </h1>
            <div className="flex flex-wrap gap-2">
              {['All', 'About Opulent Oasis', 'Booking & Charters', 'Safety & Operations', 'Pricing & Flexibility'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFaqCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-display font-bold transition ${
                      activeFaqCategory === cat
                        ? 'bg-[#d6c5b3] text-[#09090b]'
                        : 'border border-current/15 opacity-70'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            <div className="space-y-3 pt-4">
              {FAQ_DATA.filter(
                (f) => activeFaqCategory === 'All' || f.category === activeFaqCategory
              ).map((faq, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-current/10 space-y-2"
                >
                  <div className="text-[10px] uppercase tracking-widest text-[#d6c5b3] font-bold">
                    {faq.category}
                  </div>
                  <h3 className="font-display font-bold text-lg">{faq.q}</h3>
                  <p className="text-sm opacity-75 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* =====================================================================
          PAGE 6: CONTACT CONCIERGE PAGE (1:1 UNITS.GR/CONTACT)
      ===================================================================== */}
      {currentPage === 'contact' && (
        <main className="mx-auto max-w-[1200px] px-3 sm:px-6 pt-4 pb-16">
          <section
            className={`rounded-[32px] sm:rounded-[44px] p-8 sm:p-14 border grid grid-cols-1 lg:grid-cols-12 gap-10 ${
              isDay ? 'bg-white border-black/10' : 'bg-[#121216] border-white/10'
            }`}
          >
            <div className="lg:col-span-6 space-y-6">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#d6c5b3] text-[#09090b]">
                Connect With Us
              </span>
              <h1 className="font-display font-extrabold text-4xl sm:text-6xl leading-none">
                Have questions?{' '}
                <span className="font-serif-accent italic font-normal text-[#d6c5b3]">
                  Let’s talk.
                </span>
              </h1>
              <p className="text-sm sm:text-base opacity-75 leading-relaxed">
                Our sanctuary specialists and expedition leaders are available 24/7 across Mumbai,
                Alibaug, Paro Valley, and Zermatt.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-5 rounded-2xl bg-current/[0.04] border border-current/10">
                  <div className="text-xs uppercase tracking-widest opacity-50">
                    Direct WhatsApp & Phone
                  </div>
                  <div className="font-display font-extrabold text-2xl text-[#d6c5b3] mt-1">
                    +91 98200 00000
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-current/[0.04] border border-current/10">
                  <div className="text-xs uppercase tracking-widest opacity-50">
                    Concierge Desk Email
                  </div>
                  <div className="font-display font-extrabold text-2xl mt-1">
                    concierge@opulentoasis.co.in
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <form
                onSubmit={handleBookingSubmit}
                className="p-6 sm:p-8 rounded-3xl bg-current/[0.03] border border-current/10 space-y-4"
              >
                <h3 className="font-display font-bold text-2xl">Send a Direct Inquiry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="First Name *"
                    value={bookingForm.firstName}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, firstName: e.target.value })
                    }
                    className="px-4 py-3.5 rounded-2xl bg-transparent border border-current/15 text-sm"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Last Name *"
                    value={bookingForm.lastName}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, lastName: e.target.value })
                    }
                    className="px-4 py-3.5 rounded-2xl bg-transparent border border-current/15 text-sm"
                  />
                </div>
                <input
                  required
                  type="tel"
                  placeholder="WhatsApp / Phone Number *"
                  value={bookingForm.phone}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-3.5 rounded-2xl bg-transparent border border-current/15 text-sm"
                />
                <textarea
                  rows={3}
                  placeholder="Tell us which sanctuary or dates you are interested in..."
                  value={bookingForm.notes}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, notes: e.target.value })
                  }
                  className="w-full px-4 py-3.5 rounded-2xl bg-transparent border border-current/15 text-sm"
                />
                <button
                  type="submit"
                  className="w-full py-4 rounded-full font-display font-bold text-sm bg-[#d6c5b3] text-[#09090b] hover:bg-[#e5d7c7] transition"
                >
                  Dispatch to Concierge →
                </button>
              </form>
            </div>
          </section>
        </main>
      )}

      {/* =====================================================================
          SLIDE-OVER DRAWER: "BOOK YOUR OASIS" (1:1 UNITS.GR BOOKING MODAL)
      ===================================================================== */}
      {bookingDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md">
          <div
            className={`relative w-full max-w-xl h-full overflow-y-auto p-6 sm:p-10 space-y-8 border-l ${
              isDay
                ? 'bg-[#f7f4ee] text-[#121214] border-black/10'
                : 'bg-[#121216] text-[#f5f2eb] border-white/15'
            }`}
          >
            <div className="flex items-center justify-between border-b border-current/10 pb-5">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#d6c5b3] font-bold">
                  Direct Sanctuary Reservation
                </span>
                <h2 className="font-display font-extrabold text-3xl mt-0.5">
                  Book your Oasis
                </h2>
              </div>
              <button
                onClick={() => setBookingDrawerOpen(false)}
                className="p-2.5 rounded-full border border-current/15 hover:bg-current/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6 text-sm">
              {/* Step 1: Select Unit */}
              <div className="space-y-2">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-[#d6c5b3]">
                  1. Which Sanctuary or Expedition are you interested in? *
                </label>
                <select
                  value={bookingForm.selectedUnitName}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, selectedUnitName: e.target.value })
                  }
                  className={`w-full px-4 py-3.5 rounded-2xl border border-current/15 font-medium ${
                    isDay ? 'bg-white text-black' : 'bg-[#1a1a20] text-white'
                  }`}
                >
                  {listings.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.locationName} — {u.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Unit Tier */}
              <div className="space-y-2">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-[#d6c5b3]">
                  2. Preferred Oasis Tier *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Kick Suite', 'Boost Pavilion', 'Flex Wing', 'Vibe Full Buyout'].map(
                    (tier) => (
                      <button
                        type="button"
                        key={tier}
                        onClick={() => setBookingForm({ ...bookingForm, unitTier: tier })}
                        className={`py-2.5 px-3 rounded-xl text-xs font-display font-bold border transition ${
                          bookingForm.unitTier === tier
                            ? 'bg-[#d6c5b3] text-[#09090b] border-[#d6c5b3]'
                            : 'border-current/15 opacity-70'
                        }`}
                      >
                        {tier}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Step 3: Guest Profile ("I am a *") */}
              <div className="space-y-2">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-[#d6c5b3]">
                  3. Guest Profile *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Solo / Couple ✨', 'Family & Friends 👨‍👩‍👧‍👦', 'Private Charter 🚁'].map(
                    (role) => (
                      <button
                        type="button"
                        key={role}
                        onClick={() =>
                          setBookingForm({ ...bookingForm, guestType: role })
                        }
                        className={`py-2.5 px-2 rounded-xl text-xs font-display font-bold border transition ${
                          bookingForm.guestType === role
                            ? 'bg-[#9eb393] text-[#09090b] border-[#9eb393]'
                            : 'border-current/15 opacity-70'
                        }`}
                      >
                        {role}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Step 4: Contact Info */}
              <div className="space-y-3">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-[#d6c5b3]">
                  4. Guest Contact Details *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="First Name *"
                    value={bookingForm.firstName}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, firstName: e.target.value })
                    }
                    className="px-4 py-3 rounded-2xl bg-transparent border border-current/15"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Surname *"
                    value={bookingForm.lastName}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, lastName: e.target.value })
                    }
                    className="px-4 py-3 rounded-2xl bg-transparent border border-current/15"
                  />
                </div>
                <input
                  required
                  type="tel"
                  placeholder="Phone / WhatsApp Number *"
                  value={bookingForm.phone}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-transparent border border-current/15"
                />
                <input
                  type="text"
                  placeholder="Preferred Dates & Number of Guests"
                  value={bookingForm.dates}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, dates: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-transparent border border-current/15"
                />
              </div>

              {/* Step 5: Tour / Walkthrough Preference */}
              <div className="space-y-2">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-[#d6c5b3]">
                  5. Would you like a preview walkthrough?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Direct Reservation 🏠', 'Remote Video Walkthrough 🌐'].map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setBookingForm({ ...bookingForm, tourType: mode })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-display font-bold border transition ${
                        bookingForm.tourType === mode
                          ? 'bg-[#d6c5b3] text-[#09090b] border-[#d6c5b3]'
                          : 'border-current/15 opacity-70'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full font-display font-extrabold text-sm bg-[#d6c5b3] text-[#09090b] hover:bg-[#e5d7c7] transition shadow-xl"
              >
                Confirm & Connect via WhatsApp →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CURATOR HOST STUDIO (CLOUDFLARE D1 EDGE PERSISTENCE)
      ===================================================================== */}
      {hostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div
            className={`relative w-full max-w-lg rounded-[32px] p-8 max-h-[88vh] overflow-y-auto border ${
              isDay
                ? 'bg-[#f7f4ee] text-[#121214] border-black/10'
                : 'bg-[#141418] text-[#f5f2eb] border-white/15'
            }`}
          >
            <div className="flex justify-between items-center pb-4 border-b border-current/10">
              <h3 className="font-display font-extrabold text-2xl">
                Curator Host Studio (Cloudflare D1)
              </h3>
              <button onClick={() => setHostModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isHostAuthenticated ? (
              <form onSubmit={handleHostLogin} className="py-6 space-y-4 text-sm">
                <p className="opacity-75">
                  Enter curator passcode to publish new Units to your Cloudflare D1 database
                  (Passcode: <code className="px-2 py-0.5 rounded bg-current/10">oasis2026</code>)
                </p>
                <input
                  type="password"
                  value={hostPasscode}
                  onChange={(e) => setHostPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full px-4 py-3 rounded-2xl bg-transparent border border-current/15"
                />
                {hostPasscodeError && (
                  <p className="text-rose-400 text-xs">{hostPasscodeError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full font-display font-bold text-xs uppercase tracking-wider bg-[#d6c5b3] text-[#09090b]"
                >
                  Unlock Host Studio
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateListing} className="py-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="Unit Name (e.g. Oasis Lonavala)"
                    value={newListing.name}
                    onChange={(e) =>
                      setNewListing({ ...newListing, name: e.target.value })
                    }
                    className="px-3.5 py-2.5 rounded-xl bg-transparent border border-current/15"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Location Label (e.g. Lonavala Crest)"
                    value={newListing.locationName}
                    onChange={(e) =>
                      setNewListing({ ...newListing, locationName: e.target.value })
                    }
                    className="px-3.5 py-2.5 rounded-xl bg-transparent border border-current/15"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newListing.category}
                    onChange={(e) =>
                      setNewListing({ ...newListing, category: e.target.value })
                    }
                    className="px-3 py-2.5 rounded-xl bg-transparent border border-current/15"
                  >
                    <option value="Stay" className="bg-zinc-900 text-white">
                      Stay
                    </option>
                    <option value="Tour" className="bg-zinc-900 text-white">
                      Tour
                    </option>
                    <option value="Trek" className="bg-zinc-900 text-white">
                      Trek
                    </option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tariff (₹45,000 / night)"
                    value={newListing.price}
                    onChange={(e) =>
                      setNewListing({ ...newListing, price: e.target.value })
                    }
                    className="px-3 py-2.5 rounded-xl bg-transparent border border-current/15"
                  />
                  <input
                    type="text"
                    placeholder="Country (e.g. India)"
                    value={newListing.country}
                    onChange={(e) =>
                      setNewListing({ ...newListing, country: e.target.value })
                    }
                    className="px-3 py-2.5 rounded-xl bg-transparent border border-current/15"
                  />
                </div>

                <input
                  type="url"
                  placeholder="Photography URL (Unsplash)"
                  value={newListing.image}
                  onChange={(e) =>
                    setNewListing({ ...newListing, image: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-current/15"
                />

                <textarea
                  rows={3}
                  placeholder="Editorial description of the sanctuary..."
                  value={newListing.description}
                  onChange={(e) =>
                    setNewListing({ ...newListing, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-current/15"
                />

                {saveSuccessMessage && (
                  <p className="text-[#9eb393] font-semibold text-xs">
                    {saveSuccessMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingToD1}
                  className="w-full py-3.5 rounded-full font-display font-bold text-xs uppercase tracking-wider bg-[#d6c5b3] text-[#09090b]"
                >
                  {savingToD1 ? 'Publishing to D1...' : 'Publish Sanctuary Unit'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          FOOTER UNIT BLOCK (1:1 UNITS.GR ROUNDED FOOTER CARD)
      ===================================================================== */}
      <footer className="mx-auto max-w-[1400px] px-3 sm:px-6 pb-8">
        <div
          className={`rounded-[32px] sm:rounded-[44px] p-8 sm:p-14 border space-y-10 ${
            isDay
              ? 'bg-[#121214] text-[#f5f2eb] border-black/10'
              : 'bg-[#141418] text-[#f5f2eb] border-white/10'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border-b border-white/10 pb-10">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs uppercase tracking-[0.2em] text-[#d6c5b3] font-bold">
                Ready for Your Next Chapter?
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl">
                {listings.length} Sanctuaries. One unmistakable standard.
              </h2>
            </div>
            <button
              onClick={() => openBookingWithUnit(listings[0]?.name)}
              className="px-8 py-4 rounded-full font-display font-extrabold text-sm bg-[#d6c5b3] text-[#09090b] hover:bg-[#e5d7c7] transition inline-flex items-center gap-2 shrink-0"
            >
              <span>Book your Oasis</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs opacity-70">
            <div className="font-display font-bold text-sm text-white">
              © 2026 OPULENT OASIS (`opulentoasis.co.in`) — Curated Stays, Tours & Expeditions
            </div>
            <div className="flex flex-wrap gap-6">
              <button onClick={() => setCurrentPage('home')} className="hover:text-[#d6c5b3]">
                Sanctuaries
              </button>
              <button
                onClick={() => setCurrentPage('way-of-living')}
                className="hover:text-[#d6c5b3]"
              >
                Our Way of Living
              </button>
              <button onClick={() => setCurrentPage('community')} className="hover:text-[#d6c5b3]">
                Community
              </button>
              <button onClick={() => setCurrentPage('faqs')} className="hover:text-[#d6c5b3]">
                FAQs
              </button>
              <button onClick={() => setCurrentPage('contact')} className="hover:text-[#d6c5b3]">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
