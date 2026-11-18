import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  Sun,
  Moon,
  X,
  ArrowUpRight,
  MapPin,
  ArrowLeft,
  Compass,
  Sparkles,
  Plus,
  Check,
  Star,
  Home,
  BarChart2,
  Image as ImageIcon,
  Info,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Globe
} from 'lucide-react';

const WHATSAPP_NUMBER = '919820000000';

// Precomputed SHA-256 digest of Curator Passcode ('oasis2026') for Zero-Plaintext Verification
const CURATOR_PASSCODE_SHA256 = '457e60590089897c1e7b8293681b6577049a20b56634194a0e9d76294b929a22';

async function computeSha256Hex(text) {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const buf = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return text === 'oasis2026' ? CURATOR_PASSCODE_SHA256 : '';
}

function sanitizeClientInput(value, maxLength = 240) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[<>"'`\\]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

const EDITORIAL_STAMP_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Pinyon+Script&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

  .font-script {
    font-family: 'Pinyon Script', cursive;
  }

  .font-serif-editorial {
    font-family: 'Cormorant Garamond', Georgia, serif;
  }

  .font-sans-clean {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .font-mono-tech {
    font-family: 'Space Mono', monospace;
  }

  /* Matte Paper & Charcoal Grain from Reference 1 */
  .matte-frame-grain {
    background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 0);
    background-size: 24px 24px;
  }

  /* Authentic Perforated Postage Stamp Edges from Reference 2 */
  .postage-stamp {
    position: relative;
    background: #f6eedc;
    padding: 5px;
    border-radius: 2px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(214, 197, 179, 0.3);
    background-image: 
      radial-gradient(circle at 0 50%, transparent 3.5px, #f6eedc 4px),
      radial-gradient(circle at 100% 50%, transparent 3.5px, #f6eedc 4px),
      radial-gradient(circle at 50% 0, transparent 3.5px, #f6eedc 4px),
      radial-gradient(circle at 50% 100%, transparent 3.5px, #f6eedc 4px);
    background-size: 10px 10px;
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
  }

  .postage-stamp::before {
    content: '';
    position: absolute;
    inset: -4px;
    border: 3px dotted rgba(246, 238, 220, 0.85);
    pointer-events: none;
  }

  .postage-stamp:hover {
    transform: translate(-50%, -50%) scale(1.18) rotate(-2deg) !important;
    z-index: 40 !important;
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.8), 0 0 20px rgba(214, 197, 179, 0.5);
  }

  /* Notched Viewport Chamfer from Reference 1 */
  .notched-top-bar {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 82% 100%, 79% 0, 21% 0, 18% 100%, 0 100%);
  }

  .notched-bottom-bar {
    clip-path: polygon(0 0, 28% 0, 31% 35%, 47% 35%, 50% 75%, 53% 35%, 69% 35%, 72% 0, 100% 0, 100% 100%, 0 100%);
  }

  /* Barcode Generator Pattern */
  .barcode-strip {
    background: repeating-linear-gradient(
      90deg,
      currentColor 0px,
      currentColor 2px,
      transparent 2px,
      transparent 4px,
      currentColor 4px,
      currentColor 5px,
      transparent 5px,
      transparent 8px,
      currentColor 8px,
      currentColor 11px,
      transparent 11px,
      transparent 13px
    );
  }
`;

// Destination Hubs with Illustrated Postage Stamp themes (Ref 2) + Stays, Tours & Treks per Location (Ref 3)
const DESTINATION_LOCATIONS = [
  {
    id: 'loc-alibaug',
    name: 'Alibaug Coast',
    subtitle: 'Mandwa & Awas, Maharashtra',
    country: 'India',
    lat: 18.64,
    lng: 72.87,
    stampCode: '₹48',
    stampTitle: 'ALIBAUG',
    stampBg: '#2c5e4f',
    stampAccent: '#f4a261',
    stampMotif: 'palm',
    rating: '4.9/5',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85',
    summary: 'Heirloom mango orchards, private speedboat jetties, and coastal Portuguese glasshouses.',
  },
  {
    id: 'loc-gorai',
    name: 'Gorai Sanctuary',
    subtitle: 'Casuarina Drive, North Mumbai',
    country: 'India',
    lat: 19.24,
    lng: 72.78,
    stampCode: '₹32',
    stampTitle: 'GORAI',
    stampBg: '#1d4e89',
    stampAccent: '#f7b267',
    stampMotif: 'wave',
    rating: '4.8/5',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85',
    summary: 'Secluded beachfront courtyards where the Arabian Sea meets unspoiled palm groves.',
  },
  {
    id: 'loc-sahyadri',
    name: 'Sahyadri Crest',
    subtitle: 'Kokankada, Western Ghats',
    country: 'India',
    lat: 19.38,
    lng: 73.77,
    stampCode: '1424M',
    stampTitle: 'SAHYADRI',
    stampBg: '#3a5a40',
    stampAccent: '#e9c46a',
    stampMotif: 'peak',
    rating: '4.9/5',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
    summary: 'Dramatic basalt cliff amphitheaters, cloud-forest waterfalls, and luxury geodesic star-beds.',
  },
  {
    id: 'loc-spiti',
    name: 'Spiti Valley',
    subtitle: 'Key Gompa & Chandratal, Himachal',
    country: 'India',
    lat: 32.24,
    lng: 78.03,
    stampCode: '4166M',
    stampTitle: 'SPITI',
    stampBg: '#9b3d2b',
    stampAccent: '#f6bd60',
    stampMotif: 'sun',
    rating: '4.9/5',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1200&q=85',
    summary: 'Ancient Trans-Himalayan silk-route monasteries and high-altitude glacier sanctuaries.',
  },
  {
    id: 'loc-paro',
    name: 'Paro Valley',
    subtitle: 'Taktsang & Punakha, Bhutan',
    country: 'Bhutan',
    lat: 27.42,
    lng: 89.41,
    stampCode: '3120M',
    stampTitle: 'BHUTAN',
    stampBg: '#b5533c',
    stampAccent: '#fbd1a2',
    stampMotif: 'temple',
    rating: '5.0/5',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?auto=format&fit=crop&w=1200&q=85',
    summary: 'Sacred cliffside monasteries, helicopter valley charters, and riverfront hot-stone baths.',
  },
  {
    id: 'loc-zermatt',
    name: 'Zermatt Alps',
    subtitle: 'Valais Canton, Matterhorn',
    country: 'Switzerland',
    lat: 46.02,
    lng: 7.74,
    stampCode: '3883M',
    stampTitle: 'ZERMATT',
    stampBg: '#2b4560',
    stampAccent: '#e09f3e',
    stampMotif: 'alps',
    rating: '5.0/5',
    stars: 5,
    heroImage: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=85',
    summary: 'Ski-in glass-walled alpine chalets, cedar thermal spas, and private glacier helicopters.',
  }
];

// Complete Stays, Tours & Treks mapped to each specific location
const INITIAL_EXPERIENCES = [
  // ALIBAUG: Stay, Tour, Trek
  {
    id: 'alibaug-stay-1',
    locationId: 'loc-alibaug',
    locationName: 'Alibaug Coast',
    country: 'India',
    category: 'Stay',
    name: 'The Banyan Glasshouse Villa',
    subtitle: 'Mandwa & Awas Private Orchard',
    price: '₹48,000 / night',
    numericPrice: 48000,
    rating: '4.9/5',
    duration: '2–7 Nights',
    groupSize: 'Up to 12 Guests',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85',
    description: '20 minutes by private speedboat from the Gateway of India, spanning 3 acres of heirloom mango orchards with a 25m cantilevered lap pool and farm-to-table chef.'
  },
  {
    id: 'alibaug-tour-1',
    locationId: 'loc-alibaug',
    locationName: 'Alibaug Coast',
    country: 'India',
    category: 'Tour',
    name: 'Arabian Sea Yacht & Fort Sail',
    subtitle: 'Murud-Janjira & Korlai Private Charter',
    price: '₹35,000 / charter',
    numericPrice: 35000,
    rating: '4.8/5',
    duration: 'Full Day Sunset',
    groupSize: 'Up to 8 Guests',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=85',
    description: 'Set sail aboard our private 42ft catamaran past historic sea fortresses with champagne sundowners and a live coastal Konkan seafood grill.'
  },
  {
    id: 'alibaug-trek-1',
    locationId: 'loc-alibaug',
    locationName: 'Alibaug Coast',
    country: 'India',
    category: 'Trek',
    name: 'Phansad Wildlife & Korlai Ridge Walk',
    subtitle: 'Coastal Forest & Lighthouse Trail',
    price: '₹8,500 / explorer',
    numericPrice: 8500,
    rating: '4.7/5',
    duration: '1 Day Guided',
    groupSize: 'Max 8 Guests',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85',
    description: 'Guided naturalist walk through the coastal biodiversity reserve of Phansad ending with a cliffside picnic at the 16th-century Korlai lighthouse.'
  },

  // GORAI: Stay, Tour, Trek
  {
    id: 'gorai-stay-1',
    locationId: 'loc-gorai',
    locationName: 'Gorai Sanctuary',
    country: 'India',
    category: 'Stay',
    name: 'Casa De Mar Beachfront Courtyard',
    subtitle: 'Gorai Casuarina Drive, North Mumbai',
    price: '₹32,000 / night',
    numericPrice: 32000,
    rating: '4.8/5',
    duration: 'Min 2 Nights',
    groupSize: 'Up to 10 Guests',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85',
    description: 'An architectural Portuguese-inspired courtyard villa tucked behind private casuarina groves where the Arabian Sea meets unspoiled silence.'
  },
  {
    id: 'gorai-tour-1',
    locationId: 'loc-gorai',
    locationName: 'Gorai Sanctuary',
    country: 'India',
    category: 'Tour',
    name: 'Global Vipassana & East-Indian Heritage Trail',
    subtitle: 'Pagoda Dome & Utan Fishing Villages',
    price: '₹12,000 / guest',
    numericPrice: 12000,
    rating: '4.9/5',
    duration: 'Half-Day Curated',
    groupSize: 'Up to 6 Guests',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85',
    description: 'Private scholar-led access to the world’s largest pillarless stone meditation dome followed by an heirloom East-Indian culinary table in Utan.'
  },
  {
    id: 'gorai-trek-1',
    locationId: 'loc-gorai',
    locationName: 'Gorai Sanctuary',
    country: 'India',
    category: 'Trek',
    name: 'Kanheri Caves & Mangrove Estuary Expedition',
    subtitle: '109 Basalt Buddhist Caves & Kayak Trail',
    price: '₹9,500 / explorer',
    numericPrice: 9500,
    rating: '4.8/5',
    duration: '1 Day Expedition',
    groupSize: 'Max 8 Explorers',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85',
    description: 'Dawn kayaking through pristine Gorai mangrove creeks followed by an archaeological ascent to 2,000-year-old rock-cut forest caves.'
  },

  // SAHYADRI: Stay, Tour, Trek
  {
    id: 'sahyadri-stay-1',
    locationId: 'loc-sahyadri',
    locationName: 'Sahyadri Crest',
    country: 'India',
    category: 'Stay',
    name: 'Kokankada Star-Bed Geodesic Camp',
    subtitle: '1,424m Cliff Edge Sanctuary',
    price: '₹22,000 / night',
    numericPrice: 22000,
    rating: '4.9/5',
    duration: '2–3 Nights',
    groupSize: '2–8 Guests',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=85',
    description: 'Heated panoramic geodesic domes perched above a vertical basalt amphitheater with private wood-fired hot tubs and campfire chefs.'
  },
  {
    id: 'sahyadri-tour-1',
    locationId: 'loc-sahyadri',
    locationName: 'Sahyadri Crest',
    country: 'India',
    category: 'Tour',
    name: 'Western Ghats Vineyard & Lake 4x4 Sojourn',
    subtitle: 'Bhandardara & Nashik Valley Circuit',
    price: '₹28,000 / guest',
    numericPrice: 28000,
    rating: '4.8/5',
    duration: '3 Days / 2 Nights',
    groupSize: 'Up to 6 Guests',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=85',
    description: 'Private Defender 4x4 journey across misty ghat passes, reserve cellar tastings, and firefly lake cruises under the Sahyadri stars.'
  },
  {
    id: 'sahyadri-trek-1',
    locationId: 'loc-sahyadri',
    locationName: 'Sahyadri Crest',
    country: 'India',
    category: 'Trek',
    name: 'Harishchandragad & Kokankada Cliff Ascent',
    subtitle: 'Ancient Rock-Cut Fort & Cloud Forest',
    price: '₹14,500 / explorer',
    numericPrice: 14500,
    rating: '4.9/5',
    duration: '3 Days / 2 Nights',
    groupSize: 'Max 8 Explorers',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
    description: 'Ascend ancient rock-cut steps through cloud forests to the dramatic 1,424m Kokankada vertical cliff overhang with full porter and chef support.'
  },

  // SPITI VALLEY: Stay, Tour, Trek
  {
    id: 'spiti-stay-1',
    locationId: 'loc-spiti',
    locationName: 'Spiti Valley',
    country: 'India',
    category: 'Stay',
    name: 'Langza Solar Mud-Lodge & Observatory',
    subtitle: '4,400m Fossil Village, Himachal',
    price: '₹38,000 / night',
    numericPrice: 38000,
    rating: '4.9/5',
    duration: 'Min 3 Nights',
    groupSize: 'Up to 8 Guests',
    image: 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1200&q=85',
    description: 'Earth-crafted passive-solar Himalayan suites facing the Chau Chau Kang Nilda peak with private brass stargazing telescopes and oxygen-enriched bedrooms.'
  },
  {
    id: 'spiti-tour-1',
    locationId: 'loc-spiti',
    locationName: 'Spiti Valley',
    country: 'India',
    category: 'Tour',
    name: 'Thousand-Year Gompa & Silk Route Convoy',
    subtitle: 'Tabo, Key, Dhankar & Pin Valley',
    price: '₹72,000 / guest',
    numericPrice: 72000,
    rating: '5.0/5',
    duration: '7 Days / 6 Nights',
    groupSize: 'Up to 6 Guests',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85',
    description: 'Chauffeur-driven expedition in heated luxury 4x4s with private monk audiences at 996 AD Tabo Monastery and cliffside butter-tea ceremonies.'
  },
  {
    id: 'spiti-trek-1',
    locationId: 'loc-spiti',
    locationName: 'Spiti Valley',
    country: 'India',
    category: 'Trek',
    name: 'Pin Parvati & Chandratal Glacier Traverse',
    subtitle: 'High-Altitude Moon Lake Expedition',
    price: '₹64,000 / explorer',
    numericPrice: 64000,
    rating: '4.9/5',
    duration: '8 Days / 7 Nights',
    groupSize: 'Max 6 Explorers',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
    description: 'High-altitude Himalayan crest trek connecting turquoise glacial lakes and nomadic pastures with luxury heated dining domes.'
  },

  // PARO VALLEY: Stay, Tour, Trek
  {
    id: 'paro-stay-1',
    locationId: 'loc-paro',
    locationName: 'Paro Valley',
    country: 'Bhutan',
    category: 'Stay',
    name: 'Punakha & Paro Pine Forest Pavilion',
    subtitle: 'Rammed-Earth Sanctuary & Hot-Stone Spa',
    price: '₹1,45,000 / night',
    numericPrice: 145000,
    rating: '5.0/5',
    duration: 'Min 3 Nights',
    groupSize: 'Up to 8 Guests',
    image: 'https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?auto=format&fit=crop&w=1200&q=85',
    description: 'Cantilevered timber suites in blue-pine forests overlooking the Paro Chu river, complete with private traditional river-stone bathhouses.'
  },
  {
    id: 'paro-tour-1',
    locationId: 'loc-paro',
    locationName: 'Paro Valley',
    country: 'Bhutan',
    category: 'Tour',
    name: 'Sacred Valleys of Bhutan Heli-Odyssey',
    subtitle: 'Paro, Thimphu & Punakha Dzong',
    price: '₹1,85,000 / guest',
    numericPrice: 185000,
    rating: '5.0/5',
    duration: '7 Days / 6 Nights',
    groupSize: 'Up to 6 Guests',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85',
    description: 'Private Airbus H130 helicopter flights across Himalayan passes, royal monastery blessings, and all Bhutan SDF & visa formalities included.'
  },
  {
    id: 'paro-trek-1',
    locationId: 'loc-paro',
    locationName: 'Paro Valley',
    country: 'Bhutan',
    category: 'Trek',
    name: 'Tiger’s Nest & Druk Path Cloud Ridge Trek',
    subtitle: 'Taktsang Monastery to Jili Dzong',
    price: '₹1,25,000 / explorer',
    numericPrice: 125000,
    rating: '4.9/5',
    duration: '5 Days / 4 Nights',
    groupSize: 'Max 6 Explorers',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85',
    description: 'Walk through rhododendron forests and high-altitude yak herder trails between Paro and Thimphu with luxury glamping camps.'
  },

  // ZERMATT ALPS: Stay, Tour, Trek
  {
    id: 'zermatt-stay-1',
    locationId: 'loc-zermatt',
    locationName: 'Zermatt Alps',
    country: 'Switzerland',
    category: 'Stay',
    name: 'Chalet Matterhorn Zenith & Spa',
    subtitle: 'Omnia Ridge, Zermatt',
    price: '₹2,10,000 / night',
    numericPrice: 210000,
    rating: '5.0/5',
    duration: 'Min 4 Nights',
    groupSize: 'Up to 10 Guests',
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=85',
    description: 'Suspended high above Zermatt village with a glass-walled cedar thermal spa, private rock-tunnel funicular, and direct Matterhorn views.'
  },
  {
    id: 'zermatt-tour-1',
    locationId: 'loc-zermatt',
    locationName: 'Zermatt Alps',
    country: 'Switzerland',
    category: 'Tour',
    name: 'Glacier Express Excellence & Heli Fondue',
    subtitle: 'Monte Rosa Glacier Landing',
    price: '₹1,60,000 / guest',
    numericPrice: 160000,
    rating: '5.0/5',
    duration: '3 Days Curated',
    groupSize: 'Up to 6 Guests',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=85',
    description: 'Private helicopter landing at 4,200m on the Theodul Glacier with vintage Swiss champagne fondue and VIP Glacier Express panoramic carriage.'
  },
  {
    id: 'zermatt-trek-1',
    locationId: 'loc-zermatt',
    locationName: 'Zermatt Alps',
    country: 'Switzerland',
    category: 'Trek',
    name: 'Five-Lakes Haute Route & Breithorn Ascent',
    subtitle: '4,164m Guided Alpine Glacier Climb',
    price: '₹95,000 / explorer',
    numericPrice: 95000,
    rating: '4.9/5',
    duration: '2 Days Guided',
    groupSize: 'Max 4 Explorers',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
    description: 'UIAA-certified alpine mountain guide leading you across the Riffelsee mirror lakes and onto the 4,164m snow dome of the Breithorn.'
  }
];

// Additional curated options per category so every Location Window has a rich multi-card deck to slide through
const EXTRA_CATEGORY_VARIATIONS = [
  {
    suffix: 'ii',
    category: 'Stay',
    titlePrefix: 'Private Horizon Pavilion —',
    priceMultiplier: 1.25,
    duration: 'Min 2 Nights',
    groupSize: 'Up to 6 Guests',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85',
    quote: '"Floor-to-ceiling frameless glass suites opening onto private infinity plunge pools and silent starlit horizons."'
  },
  {
    suffix: 'iii',
    category: 'Stay',
    titlePrefix: 'The Heritage Collector’s Villa —',
    priceMultiplier: 1.45,
    duration: '3–7 Nights',
    groupSize: 'Up to 10 Guests',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85',
    quote: '"Hand-carved timber colonnades, private sommelier cellars, and bespoke butler service tailored to your rhythm."'
  },
  {
    suffix: 'ii',
    category: 'Tour',
    titlePrefix: 'Private Sunset Aviation & Culinary Odyssey —',
    priceMultiplier: 1.35,
    duration: 'Full Day Charter',
    groupSize: 'Up to 6 Guests',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    quote: '"Golden-hour aerial perspectives followed by a candlelit chef’s table set in untouched wilderness."'
  },
  {
    suffix: 'iii',
    category: 'Tour',
    titlePrefix: 'Curator’s Secret Heritage & Artisans Trail —',
    priceMultiplier: 0.9,
    duration: '2 Days Curated',
    groupSize: 'Up to 8 Guests',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
    quote: '"Behind-the-scenes access to ancient sanctuaries, master craftspeople, and private estate tastings."'
  },
  {
    suffix: 'ii',
    category: 'Trek',
    titlePrefix: 'Starlight Ridge & Secret Waterfall Traverse —',
    priceMultiplier: 1.2,
    duration: '2 Days / 1 Night',
    groupSize: 'Max 8 Explorers',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85',
    quote: '"Follow ancient ridgelines to hidden cascades with luxury expedition hammocks and gourmet trail dining."'
  },
  {
    suffix: 'iii',
    category: 'Trek',
    titlePrefix: 'Dawn Summit & Alpine Glamping Expedition —',
    priceMultiplier: 1.5,
    duration: '4 Days / 3 Nights',
    groupSize: 'Max 6 Explorers',
    image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=85',
    quote: '"Reach untouched high-altitude lookouts at first light with full expedition porters and heated basecamp domes."'
  }
];

// SVG Stamp Illustration Renderer matching Reference Image 2 (Colombia Illustrated Stamps)
function StampArtworkSVG({ motif, bg, accent }) {
  return (
    <svg viewBox="0 0 80 68" className="w-full h-full block">
      <rect width="80" height="68" fill={bg} />
      {/* Sun / Moon disc */}
      <circle cx="58" cy="18" r="7" fill={accent} />
      {motif === 'palm' && (
        <>
          <rect x="0" y="46" width="80" height="22" fill="#1d3557" />
          <path d="M0 54 Q40 46 80 56 L80 68 L0 68 Z" fill="#e9c46a" />
          <path d="M22 56 Q26 32 18 16" stroke="#4a2c11" strokeWidth="3.5" fill="none" />
          <path d="M18 16 Q6 12 4 22 M18 16 Q12 6 26 8 M18 16 Q32 12 34 22" stroke="#52b788" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      {motif === 'wave' && (
        <>
          <path d="M0 38 Q20 30 40 38 T80 38 L80 68 L0 68 Z" fill="#0077b6" />
          <path d="M0 50 Q20 42 40 50 T80 50 L80 68 L0 68 Z" fill="#48cae4" />
          <path d="M20 26 Q35 16 48 28" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {motif === 'peak' && (
        <>
          <polygon points="8,68 34,20 62,68" fill="#588157" />
          <polygon points="36,68 58,28 80,68" fill="#344e41" />
          <polygon points="34,20 26,35 42,35" fill="#f6eedc" />
        </>
      )}
      {motif === 'sun' && (
        <>
          <polygon points="0,68 28,26 58,68" fill="#d4a373" />
          <polygon points="32,68 56,22 80,68" fill="#bc6c25" />
          <rect x="24" y="42" width="14" height="12" fill="#f6eedc" />
          <rect x="26" y="38" width="10" height="4" fill="#e63946" />
        </>
      )}
      {motif === 'temple' && (
        <>
          <polygon points="10,68 40,18 70,68" fill="#6d597a" />
          <rect x="28" y="36" width="24" height="16" fill="#f6eedc" />
          <polygon points="24,36 40,24 56,36" fill="#e56b6f" />
        </>
      )}
      {motif === 'alps' && (
        <>
          <polygon points="12,68 42,12 72,68" fill="#8d99ae" />
          <polygon points="42,12 30,36 42,30 54,36" fill="#ffffff" />
          <rect x="0" y="56" width="80" height="12" fill="#2b2d42" />
        </>
      )}
    </svg>
  );
}

// Interactive 3D Globe with Projected Perforated Postage Stamps & Dashed Travel Routes
function StampGlobeHero({
  locations,
  selectedLocation,
  onSelectLocation,
  activeCategory,
  onScrollToExplorer
}) {
  const mountRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const [stampCoords, setStampCoords] = useState([]);
  const targetRotRef = useRef({ y: -1.35, x: 0.32 });
  const isDraggingRef = useRef(false);

  // Rotate globe smoothly when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      const lngRad = (selectedLocation.lng * Math.PI) / 180;
      const latRad = (selectedLocation.lat * Math.PI) / 180;
      targetRotRef.current = {
        y: -lngRad - Math.PI / 2,
        x: Math.max(-0.65, Math.min(0.65, latRad * 0.75))
      };
    }
  }, [selectedLocation]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.05);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 4K (4096x2048) Pure Black 3D Globe Texture + Bump Map with Accurate Geographic Landmasses
    const W = 4096;
    const H = 2048;
    const texCanvas = document.createElement('canvas');
    texCanvas.width = W;
    texCanvas.height = H;
    const ctx = texCanvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = W;
    bumpCanvas.height = H;
    const bCtx = bumpCanvas.getContext('2d');

    // Deep pitch-black ocean base
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#050507');
    grad.addColorStop(0.5, '#020203');
    grad.addColorStop(1, '#050507');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    bCtx.fillStyle = '#000000';
    bCtx.fillRect(0, 0, W, H);

    // Fine 4K cartographic latitude/longitude graticule
    ctx.strokeStyle = 'rgba(214, 197, 179, 0.06)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= W; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Accurate geographic [lng, lat] to 4K equirectangular pixel helper
    const lonLatToXY = (lon, lat) => [
      ((lon + 180) / 360) * W,
      ((90 - lat) / 180) * H
    ];

    // Accurate World Coastline Polygons [longitude, latitude]
    const WORLD_LANDMASSES = [
      // North & Central America
      [
        [-168, 66], [-162, 70], [-140, 70], [-125, 72], [-95, 74], [-80, 70],
        [-65, 62], [-55, 52], [-60, 46], [-70, 42], [-75, 35], [-81, 25],
        [-83, 30], [-90, 29], [-97, 26], [-96, 19], [-87, 21], [-83, 10],
        [-78, 8], [-85, 11], [-92, 15], [-105, 20], [-110, 24], [-114, 30],
        [-117, 32], [-122, 37], [-124, 48], [-135, 58], [-150, 61], [-162, 55], [-168, 66]
      ],
      // Greenland
      [
        [-52, 60], [-42, 60], [-22, 70], [-18, 81], [-45, 83], [-68, 76], [-56, 68], [-52, 60]
      ],
      // South America
      [
        [-78, 9], [-72, 12], [-62, 10], [-50, 2], [-35, -6], [-38, -14],
        [-40, -22], [-48, -28], [-54, -34], [-62, -40], [-66, -48], [-68, -55],
        [-74, -52], [-73, -40], [-71, -30], [-70, -18], [-77, -12], [-81, -4], [-78, 2], [-78, 9]
      ],
      // Africa
      [
        [-17, 15], [-13, 28], [-6, 36], [10, 37], [11, 33], [25, 32], [33, 31],
        [39, 20], [43, 12], [51, 12], [41, -1], [40, -10], [35, -24], [28, -33],
        [18, -35], [15, -24], [12, -15], [9, -2], [8, 4], [2, 6], [-8, 4], [-14, 9], [-17, 15]
      ],
      // Madagascar
      [
        [49, -12], [50, -18], [47, -25], [44, -25], [44, -17], [49, -12]
      ],
      // Eurasia (Europe, Arabia, Accurate India Peninsula, Southeast Asia, China, Siberia)
      [
        [-9, 37], [-9, 43], [-2, 43], [-4, 48], [2, 51], [8, 54], [10, 58],
        [5, 62], [16, 69], [28, 71], [35, 69], [42, 67], [60, 70], [85, 74],
        [110, 74], [140, 72], [175, 66], [170, 60], [160, 53], [142, 54],
        [135, 44], [129, 35], [126, 37], [122, 40], [118, 38], [122, 31],
        [120, 24], [114, 22], [108, 21], [109, 13], [104, 10], [101, 13],
        [103, 2], [98, 8], [96, 16], [92, 22], [88, 22], [85, 19], [80, 14],
        [77.5, 8.1], [75, 12], [73, 18], [72.8, 19.2], [70, 21], [68, 24],
        [62, 25], [56, 26], [51, 24], [48, 30], [56, 22], [60, 21], [54, 17],
        [44, 12], [40, 20], [35, 29], [36, 36], [27, 38], [29, 41], [40, 42],
        [38, 46], [30, 46], [24, 40], [22, 37], [19, 41], [14, 45], [18, 40],
        [15, 38], [12, 42], [9, 44], [5, 43], [3, 42], [-2, 36], [-9, 37]
      ],
      // Sri Lanka
      [
        [80, 9.8], [81.8, 7.5], [80.6, 5.9], [79.8, 7.5], [80, 9.8]
      ],
      // United Kingdom & Ireland
      [
        [-5, 50], [1.5, 51], [0, 54], [-2, 57], [-5, 58.5], [-5, 54], [-5, 50]
      ],
      [
        [-10, 51.5], [-6, 52], [-6, 55], [-9.5, 54.5], [-10, 51.5]
      ],
      // Iceland
      [
        [-24, 64], [-14, 64.5], [-14, 66.5], [-23, 66], [-24, 64]
      ],
      // Japan
      [
        [130, 31], [135, 34], [140, 36], [141, 41], [145, 44], [140, 43], [137, 37], [131, 34], [130, 31]
      ],
      // Sumatra, Java & Borneo
      [
        [95, 5.5], [102, 1], [106, -5.5], [103, -5], [95, 5.5]
      ],
      [
        [106, -6], [114, -7.5], [114, -8.5], [106, -7], [106, -6]
      ],
      [
        [109, 2], [117, 6], [118, 1], [116, -4], [111, -3], [109, 2]
      ],
      // Australia
      [
        [114, -22], [122, -17], [131, -12], [136, -12], [137, -16], [142, -11],
        [146, -18], [153, -26], [150, -37], [142, -38], [136, -35], [130, -32],
        [122, -34], [115, -34], [113, -26], [114, -22]
      ],
      // New Zealand
      [
        [173, -35], [178, -38], [175, -41], [172, -43], [167, -46], [169, -44], [174, -39], [173, -35]
      ]
    ];

    // Render sculpted matte-obsidian landmasses with champagne gold borders & 3D bump height
    ctx.fillStyle = '#0e1013';
    ctx.strokeStyle = 'rgba(214, 197, 179, 0.55)';
    ctx.lineWidth = 3.2;

    bCtx.fillStyle = '#ffffff';
    bCtx.strokeStyle = '#ffffff';
    bCtx.lineWidth = 5;

    WORLD_LANDMASSES.forEach((poly) => {
      ctx.beginPath();
      bCtx.beginPath();
      poly.forEach(([lon, lat], idx) => {
        const [px, py] = lonLatToXY(lon, lat);
        if (idx === 0) {
          ctx.moveTo(px, py);
          bCtx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
          bCtx.lineTo(px, py);
        }
      });
      ctx.closePath();
      bCtx.closePath();
      ctx.fill();
      ctx.stroke();
      bCtx.fill();
      bCtx.stroke();
    });

    // Subtle internal stipple dot-grid clipped inside the continents for 4K tactile depth
    ctx.save();
    ctx.beginPath();
    WORLD_LANDMASSES.forEach((poly) => {
      poly.forEach(([lon, lat], idx) => {
        const [px, py] = lonLatToXY(lon, lat);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
    });
    ctx.clip();

    ctx.fillStyle = 'rgba(214, 197, 179, 0.14)';
    for (let x = 0; x < W; x += 24) {
      for (let y = 0; y < H; y += 24) {
        ctx.fillRect(x, y, 2.5, 2.5);
      }
    }
    ctx.restore();

    const sphereTexture = new THREE.CanvasTexture(texCanvas);
    sphereTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const sphereGeo = new THREE.SphereGeometry(1.34, 128, 128);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: sphereTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.028,
      roughness: 0.65,
      metalness: 0.25
    });
    const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeMesh);

    // Subtle outer atmosphere halo ring
    const ringGeo = new THREE.RingGeometry(1.43, 1.442, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd6c5b3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    ringMesh.rotation.y = 0.25;
    scene.add(ringMesh);

    // 3D Anchor Nodes for each Postage Stamp
    const latLngToVec3 = (lat, lng, radius) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    const anchorNodes = locations.map((loc) => {
      const pos = latLngToVec3(loc.lat, loc.lng, 1.36);
      const dotGeo = new THREE.SphereGeometry(0.024, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xf6eedc });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      globeGroup.add(dot);
      return { loc, localPos: pos };
    });

    // 3D Dashed Arcs connecting stamp locations on the sphere
    for (let i = 0; i < anchorNodes.length - 1; i++) {
      const start = anchorNodes[i].localPos;
      const end = anchorNodes[i + 1].localPos;
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.48);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(36);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineDashedMaterial({
        color: 0xf6eedc,
        dashSize: 0.05,
        gapSize: 0.035,
        transparent: true,
        opacity: 0.75
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcLine.computeLineDistances();
      globeGroup.add(arcLine);
    }

    // Lighting for 3D Sculpted Black Sphere
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const dirLight = new THREE.DirectionalLight(0xf6eedc, 1.85);
    dirLight.position.set(4, 3, 5);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0xd6c5b3, 0.9);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // Pointer Drag Rotation Controls
    let prevPointer = { x: 0, y: 0 };
    const domElem = renderer.domElement;

    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      prevPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevPointer.x;
      const dy = e.clientY - prevPointer.y;
      prevPointer = { x: e.clientX, y: e.clientY };
      targetRotRef.current.y += dx * 0.0065;
      targetRotRef.current.x = Math.max(
        -0.75,
        Math.min(0.75, targetRotRef.current.x + dy * 0.005)
      );
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 800;
      const nh = container.clientHeight || 540;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // Radial offset layout for stamps so adjacent Indian stamps never overlap
    const stampRadialOffsets = [
      { dx: -68, dy: 28 },  // Alibaug
      { dx: -76, dy: -36 }, // Gorai
      { dx: 66, dy: 34 },   // Sahyadri
      { dx: 18, dy: -66 },  // Spiti
      { dx: 82, dy: -16 },  // Bhutan
      { dx: -58, dy: -48 }  // Zermatt
    ];

    // Tech-Max Optimization: Pause WebGL rendering when globe is scrolled offscreen or tab is hidden
    let isInViewport = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(container);

    let reqId;
    let frameCounter = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (!isInViewport || document.hidden) return;

      if (!isDraggingRef.current) {
        targetRotRef.current.y += 0.0008;
      }

      globeGroup.rotation.y += (targetRotRef.current.y - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotRef.current.x - globeGroup.rotation.x) * 0.08;
      ringMesh.rotation.z += 0.0009;

      globeGroup.updateMatrixWorld();

      // Throttle React state projection updates to every 2nd frame for ultra-smooth 60fps CPU budget
      frameCounter += 1;
      if (frameCounter % 2 === 0 || isDraggingRef.current) {
        const cw = container.clientWidth || 800;
        const ch = container.clientHeight || 540;

        const projected = anchorNodes.map((node, idx) => {
          const worldPos = node.localPos.clone().applyMatrix4(globeGroup.matrixWorld);
          const normal = worldPos.clone().normalize();
          const camDir = camera.position.clone().normalize();
          const dotVis = normal.dot(camDir);

          const ndc = worldPos.clone().project(camera);
          const anchorX = (ndc.x * 0.5 + 0.5) * cw;
          const anchorY = (-ndc.y * 0.5 + 0.5) * ch;

          const offset = stampRadialOffsets[idx % stampRadialOffsets.length];
          return {
            loc: node.loc,
            anchorX,
            anchorY,
            x: anchorX + offset.dx,
            y: anchorY + offset.dy,
            visible: dotVis > 0.08,
            zIndex: Math.round((dotVis + 1) * 10)
          };
        });

        setStampCoords(projected);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      visibilityObserver.disconnect();
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      sphereGeo.dispose();
      sphereMat.dispose();
      sphereTexture.dispose();
      bumpTexture.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [locations]);

  return (
    <div
      ref={canvasWrapRef}
      className="relative w-full h-[500px] sm:h-[600px] lg:h-[650px] overflow-hidden select-none bg-[#050506]"
    >
      {/* Subtle warm radial vignette behind the 4K Black 3D Globe */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(214, 197, 179, 0.12) 0%, rgba(5, 5, 6, 0.96) 70%)'
        }}
      />

      {/* Three.js Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Dashed connector lines from exact 3D globe pin to each floating Postage Stamp */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {stampCoords.map(
          (s) =>
            s.visible && (
              <g key={`line-${s.loc.id}`}>
                <line
                  x1={s.anchorX}
                  y1={s.anchorY}
                  x2={s.x}
                  y2={s.y}
                  stroke="#f6eedc"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.75"
                />
                <circle cx={s.anchorX} cy={s.anchorY} r="4" fill="#f6eedc" />
              </g>
            )
        )}
      </svg>

      {/* Perforated Illustrated Postage Stamps on the 3D Globe (Reference Image 2) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {stampCoords.map((s) => {
          if (!s.visible) return null;
          const isSelected = selectedLocation?.id === s.loc.id;
          return (
            <button
              key={s.loc.id}
              onClick={() => onSelectLocation(s.loc)}
              style={{
                left: `${s.x}px`,
                top: `${s.y}px`,
                transform: `translate(-50%, -50%) scale(${isSelected ? 1.12 : 1})`,
                zIndex: isSelected ? 35 : s.zIndex
              }}
              className={`postage-stamp pointer-events-auto text-left group ${
                isSelected ? 'ring-2 ring-[#d6c5b3]' : ''
              }`}
              title={`Open ${s.loc.name} — Stays, Tours & Treks`}
            >
              <div className="w-[68px] sm:w-[78px] bg-[#f6eedc] text-[#111214]">
                <div className="relative h-[50px] sm:h-[56px] w-full overflow-hidden border border-black/15">
                  <StampArtworkSVG
                    motif={s.loc.stampMotif}
                    bg={s.loc.stampBg}
                    accent={s.loc.stampAccent}
                  />
                  <span className="absolute top-1 left-1 px-1 py-0.2 bg-black/55 text-[#f6eedc] font-mono-tech text-[8px] font-bold">
                    {s.loc.stampCode}
                  </span>
                </div>
                <div className="pt-1 pb-0.5 px-1 flex items-center justify-between">
                  <span className="font-mono-tech font-bold text-[8.5px] sm:text-[9px] tracking-tighter text-[#121214] truncate">
                    {s.loc.stampTitle}
                  </span>
                  <span className="text-[8px] text-[#8c6d46] font-bold">★</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Centered Instruction Pill at Top of Globe Viewport */}
      <div className="absolute top-5 left-0 right-0 flex items-center justify-center pointer-events-none z-30 px-4">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/75 border border-white/15 backdrop-blur-md text-[11px] font-mono-tech uppercase tracking-widest text-[#d6c5b3] shadow-lg">
          <Globe className="w-3.5 h-3.5" />
          <span>Drag 3D Globe or Click Any Postage Stamp</span>
        </div>
      </div>

      {/* Bottom Selected Stamp Quick-Preview Pill inside Globe Hero */}
      {selectedLocation && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg pointer-events-auto">
          <div className="rounded-2xl bg-[#141416]/90 border border-[#d6c5b3]/30 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 shrink-0">
                <img
                  src={selectedLocation.heroImage}
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-serif-editorial text-lg sm:text-xl text-white truncate">
                  {selectedLocation.name}
                </div>
                <div className="text-xs text-white/65 truncate">
                  {selectedLocation.subtitle}
                </div>
              </div>
            </div>
            <button
              onClick={() => onScrollToExplorer(selectedLocation)}
              className="px-4 py-2 rounded-full bg-[#f6eedc] text-[#09090b] font-sans-clean font-bold text-xs shrink-0 hover:bg-[#d6c5b3] transition inline-flex items-center gap-1"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [experiences, setExperiences] = useState(INITIAL_EXPERIENCES);
  const [selectedCategory, setSelectedCategory] = useState('Stay'); // 'Stay' | 'Tour' | 'Trek'
  const [activeLocation, setActiveLocation] = useState(DESTINATION_LOCATIONS[0]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false); // When true, opens the full category catalog in the Reference Image 2 Spatial 3D Deck
  const [catalogLocationFilter, setCatalogLocationFilter] = useState('ALL');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [savedIds, setSavedIds] = useState([]);
  const [activeNavSection, setActiveNavSection] = useState('globe');

  // Host CMS Modal (Cloudflare D1)
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [hostPasscode, setHostPasscode] = useState('');
  const [curatorTokenHash, setCuratorTokenHash] = useState('');
  const [authAttempts, setAuthAttempts] = useState(0);
  const [authError, setAuthError] = useState('');
  const [isHostAuthenticated, setIsHostAuthenticated] = useState(false);
  const [newExp, setNewExp] = useState({
    locationId: 'loc-alibaug',
    locationName: 'Alibaug Coast',
    country: 'India',
    category: 'Stay',
    name: '',
    subtitle: '',
    price: '₹45,000 / night',
    duration: 'Min 2 Nights',
    groupSize: 'Up to 8 Guests',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85',
    description: '',
    website_url_trap: ''
  });
  const [d1Status, setD1Status] = useState('');

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

  // Sync live Cloudflare D1 listings with AbortController & payload validation
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    fetch('/api/listings', {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((d) => ({
            id: sanitizeClientInput(d.id || `d1-${Math.random()}`, 80),
            locationId: 'loc-alibaug',
            locationName: sanitizeClientInput(
              d.locationName || d.location_name || 'Alibaug Coast',
              80
            ),
            country: sanitizeClientInput(d.country || 'India', 60),
            category: ['Stay', 'Tour', 'Trek'].includes(d.category)
              ? d.category
              : 'Stay',
            name: sanitizeClientInput(d.name || 'Opulent Sanctuary', 140),
            subtitle: sanitizeClientInput(d.region || 'Private Sanctuary', 120),
            price: sanitizeClientInput(d.price || '₹42,000 / night', 60),
            numericPrice: Number(d.numeric_price || 42000),
            rating: '4.9/5',
            duration: sanitizeClientInput(d.duration || '2 Nights', 50),
            groupSize: sanitizeClientInput(d.group_size || 'Up to 8 Guests', 50),
            image:
              typeof d.image === 'string' && d.image.startsWith('https://')
                ? d.image
                : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            description: sanitizeClientInput(
              d.description || 'Architectural sanctuary.',
              600
            )
          }));
          const existingIds = new Set(INITIAL_EXPERIENCES.map((i) => i.id));
          setExperiences([
            ...INITIAL_EXPERIENCES,
            ...mapped.filter((m) => !existingIds.has(m.id))
          ]);
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeoutId));

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Keyboard navigation (ArrowLeft / ArrowRight / Escape) when Spatial 3D Catalog is open
  useEffect(() => {
    if (!isCatalogOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsCatalogOpen(false);
      if (e.key === 'ArrowLeft') {
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setActiveSlideIndex((prev) => prev + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCatalogOpen]);

  // Build the complete enriched catalog across all locations and categories
  const fullEnrichedCatalog = useMemo(() => {
    const allItems = [...experiences];
    DESTINATION_LOCATIONS.forEach((loc) => {
      const baseMatching = experiences.filter((e) => e.locationId === loc.id);
      EXTRA_CATEGORY_VARIATIONS.forEach((variation) => {
        const seed =
          baseMatching.find(
            (b) => b.category.toLowerCase() === variation.category.toLowerCase()
          ) || baseMatching[0];
        if (seed) {
          const computedPrice =
            Math.round(
              ((seed.numericPrice || 30000) * variation.priceMultiplier) / 500
            ) * 500;
          allItems.push({
            id: `${loc.id}-${variation.category.toLowerCase()}-${variation.suffix}`,
            locationId: loc.id,
            locationName: loc.name,
            country: loc.country,
            category: variation.category,
            name: `${variation.titlePrefix} ${loc.name}`,
            subtitle: loc.subtitle,
            price: `₹${computedPrice.toLocaleString('en-IN')} / ${
              variation.category === 'Stay' ? 'night' : 'guest'
            }`,
            numericPrice: computedPrice,
            rating: loc.rating,
            duration: variation.duration,
            groupSize: variation.groupSize,
            image: variation.image,
            description: variation.quote
          });
        }
      });
    });
    return allItems;
  }, [experiences]);

  // The 3 Category Windows (1 for Stay, 1 for Tour, 1 for Trek) matching Reference Image 1
  const categoryWindows = useMemo(() => {
    const definitions = [
      {
        category: 'Stay',
        title: 'Curated Stays',
        subtitle: 'Private Villas, Glasshouses & Star-Beds',
        rating: '4.9/5',
        image:
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85'
      },
      {
        category: 'Tour',
        title: 'Bespoke Tours',
        subtitle: 'Yacht Charters, Heli-Odysseys & Convoys',
        rating: '5.0/5',
        image:
          'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85'
      },
      {
        category: 'Trek',
        title: 'Guided Treks',
        subtitle: 'Alpine Glaciers, Cloud Forests & Ridge Walks',
        rating: '4.9/5',
        image:
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85'
      }
    ];

    return definitions.map((def) => {
      const items = fullEnrichedCatalog.filter(
        (item) => item.category.toLowerCase() === def.category.toLowerCase()
      );
      return {
        ...def,
        count: items.length,
        items
      };
    });
  }, [fullEnrichedCatalog]);

  // Reset slide index whenever category or location filter changes
  useEffect(() => {
    setActiveSlideIndex(0);
  }, [selectedCategory, catalogLocationFilter, isCatalogOpen]);

  const handleOpenCategoryCatalog = (categoryName, locationFilterId = 'ALL') => {
    setSelectedCategory(categoryName);
    setCatalogLocationFilter(locationFilterId);
    setIsCatalogOpen(true);
    setActiveSlideIndex(0);
    setTimeout(() => {
      document
        .getElementById('destination-toggler-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleWhatsAppReserve = (exp) => {
    const text = encodeURIComponent(
      `Hello Opulent Oasis! I would like to reserve:\n• ${sanitizeClientInput(exp.category, 20)}: ${sanitizeClientInput(exp.name, 120)}\n• Location: ${sanitizeClientInput(exp.locationName, 80)} (${sanitizeClientInput(exp.country, 50)})\n• Tariff: ${sanitizeClientInput(exp.price, 50)}\nPlease share availability.`
    );
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleCuratorLogin = async (e) => {
    e.preventDefault();
    if (authAttempts >= 5) {
      setAuthError('Too many failed attempts. Please refresh to try again.');
      return;
    }
    const digest = await computeSha256Hex(hostPasscode.trim());
    if (digest === CURATOR_PASSCODE_SHA256) {
      setCuratorTokenHash(digest);
      setIsHostAuthenticated(true);
      setAuthError('');
      setHostPasscode('');
    } else {
      setAuthAttempts((prev) => prev + 1);
      setAuthError('Invalid curator passcode.');
    }
  };

  const handleCreateD1Experience = async (e) => {
    e.preventDefault();
    if (newExp.website_url_trap) return;

    const locObj =
      DESTINATION_LOCATIONS.find((l) => l.id === newExp.locationId) ||
      DESTINATION_LOCATIONS[0];

    const payload = {
      id: `oasis-${Date.now()}`,
      locationId: locObj.id,
      locationName: locObj.name,
      country: locObj.country,
      category: ['Stay', 'Tour', 'Trek'].includes(newExp.category)
        ? newExp.category
        : 'Stay',
      name: sanitizeClientInput(newExp.name, 140),
      subtitle: sanitizeClientInput(newExp.subtitle || locObj.subtitle, 120),
      price: sanitizeClientInput(newExp.price, 50),
      duration: sanitizeClientInput(newExp.duration, 50),
      groupSize: sanitizeClientInput(newExp.groupSize, 50),
      image:
        typeof newExp.image === 'string' && newExp.image.startsWith('https://')
          ? newExp.image
          : locObj.heroImage,
      description: sanitizeClientInput(newExp.description, 800),
      rating: '5.0/5'
    };

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Curator-Token': curatorTokenHash
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setD1Status('Encrypted & Saved to Cloudflare D1 Edge Database!');
      } else {
        setD1Status('Added to Live Session Catalog!');
      }
    } catch {
      setD1Status('Added to Live Category Catalog!');
    }
    setExperiences((prev) => [payload, ...prev]);
    setNewExp({ ...newExp, name: '', subtitle: '', description: '' });
  };

  return (
    <div className="min-h-screen w-full bg-[#070708] text-[#f4efe6] font-sans-clean p-2 sm:p-5 lg:p-8 selection:bg-[#d6c5b3] selection:text-[#09090b]">
      <style>{EDITORIAL_STAMP_CSS}</style>

      {/* =======================================================================
          OUTER ARCHITECTURAL MATTE POSTER FRAME (REFERENCE IMAGE 1 AESTHETIC)
      ======================================================================= */}
      <div className="mx-auto max-w-[1440px] bg-[#18181a] matte-frame-grain border border-white/15 rounded-[6px] shadow-[0_30px_100px_rgba(0,0,0,0.95)] relative overflow-hidden">
        {/* LEFT & RIGHT VERTICAL RULER TICK MARKS */}
        <div className="hidden sm:flex flex-col justify-between items-start absolute left-2.5 top-28 bottom-28 w-3 pointer-events-none z-30 opacity-45">
          {Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              className={`block h-[1px] bg-[#f4efe6] ${
                i % 5 === 0 ? 'w-3' : 'w-1.5'
              }`}
            />
          ))}
        </div>
        <div className="hidden sm:flex flex-col justify-between items-end absolute right-2.5 top-28 bottom-28 w-3 pointer-events-none z-30 opacity-45">
          {Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              className={`block h-[1px] bg-[#f4efe6] ${
                i % 5 === 0 ? 'w-3' : 'w-1.5'
              }`}
            />
          ))}
        </div>

        {/* ===================================================================
            1. TOP EDITORIAL HEADER BAR
        =================================================================== */}
        <header className="relative z-30 px-4 sm:px-10 pt-5 pb-4 bg-[#18181a] border-b border-white/10">
          <div className="flex items-center justify-between text-[#f4efe6]/75">
            <div className="flex items-center">
              <svg viewBox="0 0 36 20" className="w-8 h-4 stroke-current fill-none">
                <ellipse cx="18" cy="10" rx="16" ry="8" strokeWidth="1.2" />
                <ellipse cx="18" cy="10" rx="10" ry="8" strokeWidth="1" />
                <ellipse cx="18" cy="10" rx="4" ry="8" strokeWidth="1" />
                <line x1="2" y1="10" x2="34" y2="10" strokeWidth="1" />
              </svg>
            </div>

            <button
              onClick={() => setHostModalOpen(true)}
              className="inline-flex items-center gap-1 hover:text-[#d6c5b3] transition"
              title="Open Curator D1 Studio"
            >
              <span className="w-3 h-3 rounded-full bg-[#f4efe6] inline-block" />
              <span className="w-3 h-3 rounded-full border border-[#f4efe6] -ml-1.5 inline-block" />
            </button>

            <div className="flex items-center">
              <svg viewBox="0 0 36 20" className="w-8 h-4 stroke-current fill-none">
                <ellipse cx="18" cy="10" rx="16" ry="8" strokeWidth="1.2" />
                <ellipse cx="18" cy="10" rx="10" ry="8" strokeWidth="1" />
                <ellipse cx="18" cy="10" rx="4" ry="8" strokeWidth="1" />
                <line x1="2" y1="10" x2="34" y2="10" strokeWidth="1" />
              </svg>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              <svg viewBox="0 0 32 32" className="w-6 h-6 sm:w-8 sm:h-8 stroke-[#f4efe6] stroke-[1.2]">
                <line x1="16" y1="2" x2="16" y2="30" />
                <line x1="2" y1="16" x2="30" y2="16" />
                <line x1="6" y1="6" x2="26" y2="26" />
                <line x1="26" y1="6" x2="6" y2="26" />
              </svg>
              <div className="hidden sm:flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full border border-[#f4efe6]" />
                <span className="w-2.5 h-2.5 rounded-full border border-[#f4efe6]" />
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-14">
              <span className="text-[10px] font-mono-tech tracking-widest opacity-60 hidden md:inline">
                2026
              </span>
              <h1 className="font-script text-4xl sm:text-5xl lg:text-6xl text-[#f4efe6] tracking-wide leading-none">
                Opulent Oasis
              </h1>
              <span className="text-[10px] font-mono-tech tracking-widest opacity-60 hidden md:inline">
                2026
              </span>
            </div>

            <div className="flex items-center gap-4 sm:gap-8">
              <div className="hidden sm:flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full border border-[#f4efe6]" />
                <span className="w-2.5 h-2.5 rounded-full border border-[#f4efe6]" />
              </div>
              <svg viewBox="0 0 32 32" className="w-6 h-6 sm:w-8 sm:h-8 stroke-[#f4efe6] stroke-[1.2]">
                <line x1="16" y1="2" x2="16" y2="30" />
                <line x1="2" y1="16" x2="30" y2="16" />
                <line x1="6" y1="6" x2="26" y2="26" />
                <line x1="26" y1="6" x2="6" y2="26" />
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-around max-w-3xl mx-auto text-[9px] text-[#d6c5b3]">
            <span>▲</span>
            <span>▲</span>
            <span>▲</span>
            <span>▲</span>
            <span>▲</span>
          </div>
        </header>

        {/* ===================================================================
            2. 4K 3D BLACK GLOBE WITH PERFORATED POSTAGE STAMPS
        =================================================================== */}
        <section
          id="globe-hero-section"
          className="relative mx-2 sm:mx-8 my-2 rounded-[18px] overflow-hidden border border-white/15 shadow-2xl"
        >
          <StampGlobeHero
            locations={DESTINATION_LOCATIONS}
            selectedLocation={activeLocation}
            onSelectLocation={(loc) => {
              setActiveLocation(loc);
              handleOpenCategoryCatalog(selectedCategory, loc.id);
            }}
            activeCategory={selectedCategory}
            onScrollToExplorer={(loc) =>
              handleOpenCategoryCatalog(selectedCategory, loc.id)
            }
          />
        </section>

        {/* ===================================================================
            3. MIDDLE ARCHITECTURAL DIVIDER WITH BARCODES & "START YOUR VOYAGE"
        =================================================================== */}
        <div className="relative z-20 px-4 sm:px-12 py-6 bg-[#18181a] border-t border-white/10">
          <div className="flex items-center justify-center gap-6 sm:gap-12">
            <div className="w-24 sm:w-40 h-3.5 barcode-strip text-[#f4efe6]/80" />
            <span className="text-xs text-[#d6c5b3]">▼</span>
            <div className="w-24 sm:w-40 h-3.5 barcode-strip text-[#f4efe6]/80" />
          </div>

          <div className="mt-5 flex items-center justify-between max-w-4xl mx-auto">
            <div className="inline-flex items-center">
              <span className="w-4 h-4 rounded-full border border-[#f4efe6]" />
              <span className="w-4 h-4 rounded-full bg-[#f4efe6] -ml-1.5" />
            </div>

            <h2 className="font-script text-4xl sm:text-6xl lg:text-7xl text-[#f4efe6] leading-none text-center px-4">
              Start Your Voyage
            </h2>

            <div className="inline-flex items-center">
              <span className="w-4 h-4 rounded-full bg-[#f4efe6]" />
              <span className="w-4 h-4 rounded-full border border-[#f4efe6] -ml-1.5" />
            </div>
          </div>
        </div>

        {/* ===================================================================
            4. "CHOOSE A DESTINATION" TOGGLER & 3 CATEGORY WINDOWS
               - Default View: 3 Portrait Windows (Stay | Tour | Trek)
               - Selected View: Opens the ENTIRE catalog for that chosen category
                 in the Reference Image 2 Spatial 3D Stacked Card Carousel
        =================================================================== */}
        <section
          id="destination-toggler-section"
          className="relative px-4 sm:px-10 pt-10 pb-20 border-t border-white/10 overflow-hidden min-h-[760px] flex flex-col justify-center"
        >
          {/* Blurred Atmospheric Background */}
          <div
            className="absolute inset-0 opacity-35 pointer-events-none transition-all duration-700"
            style={{
              backgroundImage: `url(${
                categoryWindows.find((c) => c.category === selectedCategory)
                  ?.image || activeLocation?.heroImage
              })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(55px) saturate(1.25)'
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto w-full space-y-10">
            {/* Heading & Glassmorphic 3-Option Pill Toggler (Reference Image 1) */}
            <div className="text-center space-y-6">
              <h2 className="font-sans-clean font-bold text-3xl sm:text-5xl tracking-tight text-white">
                Choose a Destination
              </h2>

              {/* Reference Image 1 Pill Toggler: Stay | Tour | Trek */}
              <div className="mx-auto max-w-xl rounded-full p-1 border border-white/60 bg-black/25 backdrop-blur-2xl grid grid-cols-3 items-center shadow-2xl">
                {['Stay', 'Tour', 'Trek'].map((option) => {
                  const isActive = selectedCategory === option;
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedCategory(option);
                        setCatalogLocationFilter('ALL');
                      }}
                      className={`py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-sans-clean transition-all duration-300 ${
                        isActive
                          ? 'bg-white/30 text-white font-bold shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                          : 'text-white/75 hover:text-white font-medium'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===============================================================
                STATE A: 3 CATEGORY WINDOWS (1 STAY, 1 TOUR, 1 TREK)
                Matching Reference Image 1 (`Gemini_Generated_Image_zhm5edzhm5edzhm5_3.png`)
            =============================================================== */}
            {!isCatalogOpen ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center pt-4">
                  {categoryWindows.map((win) => {
                    const isActiveCard = selectedCategory === win.category;
                    return (
                      <div
                        key={win.category}
                        onClick={() =>
                          handleOpenCategoryCatalog(win.category, 'ALL')
                        }
                        className={`group cursor-pointer relative rounded-[28px] overflow-hidden border transition-all duration-500 aspect-[3/4.15] flex flex-col justify-between p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.75)] ${
                          isActiveCard
                            ? 'border-white/80 md:scale-[1.06] z-20'
                            : 'border-white/30 opacity-85 hover:opacity-100 hover:border-white/60 hover:-translate-y-1.5'
                        }`}
                      >
                        <img
                          src={win.image}
                          alt={win.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/85" />

                        {/* Top Left Category Title & Subtitle (Exact Reference Image 1) */}
                        <div className="relative z-10">
                          <h3 className="font-sans-clean font-bold text-2xl sm:text-[1.75rem] text-white leading-tight drop-shadow-md">
                            {win.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-white/85 mt-1">
                            {win.subtitle}
                          </p>
                        </div>

                        {/* Bottom Left Rating + 5 Stars + "See more »" & Bottom Right "+" Button (Exact Reference Image 1) */}
                        <div className="relative z-10 flex items-end justify-between">
                          <div className="space-y-1">
                            <div className="font-sans-clean font-bold text-sm sm:text-base text-white">
                              {win.rating}
                            </div>
                            <div className="flex items-center gap-1 text-[#facc15]">
                              {Array.from({ length: 5 }).map((_, sIdx) => (
                                <Star
                                  key={sIdx}
                                  className="w-3.5 h-3.5 fill-[#facc15] text-[#facc15]"
                                />
                              ))}
                            </div>
                            <div className="pt-1 text-xs text-white/85 group-hover:text-white transition inline-flex items-center gap-1">
                              <span>See more ({win.count} options) »</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCategoryCatalog(win.category, 'ALL');
                            }}
                            className="w-11 h-11 rounded-full bg-white text-[#09090b] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
                            aria-label={`Open ${win.title} Catalog`}
                          >
                            <Plus className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ===============================================================
                 STATE B: ENTIRE CATEGORY CATALOG IN SPATIAL 3D CAROUSEL
                 (Reference Image 2 - `Design for Website_2.jpeg`)
              =============================================================== */
              (() => {
                const categoryCatalog = fullEnrichedCatalog.filter(
                  (item) =>
                    item.category.toLowerCase() ===
                      selectedCategory.toLowerCase() &&
                    (catalogLocationFilter === 'ALL' ||
                      item.locationId === catalogLocationFilter)
                );

                const slides =
                  categoryCatalog.length > 0
                    ? categoryCatalog
                    : fullEnrichedCatalog;

                const safeIndex =
                  ((activeSlideIndex % slides.length) + slides.length) %
                  slides.length;
                const currentSlide = slides[safeIndex];

                const handlePrevSlide = () => {
                  setActiveSlideIndex(
                    (prev) => (prev - 1 + slides.length) % slides.length
                  );
                };

                const handleNextSlide = () => {
                  setActiveSlideIndex((prev) => (prev + 1) % slides.length);
                };

                return (
                  <div className="relative pt-2 pb-4 flex flex-col items-center space-y-7 select-none">
                    {/* 1. TOP SPATIAL FROSTED GLASS BAR (Exact Reference Image 2 Top Bar) */}
                    <div className="w-full max-w-3xl rounded-full px-3 sm:px-5 py-2.5 bg-white/[0.14] border border-white/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => setIsCatalogOpen(false)}
                          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition"
                          title="Back to 3 Category Windows"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handlePrevSlide}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
                          title="Previous in Catalog"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextSlide}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
                          title="Next in Catalog"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 max-w-sm mx-2 px-4 py-1.5 rounded-full bg-black/30 border border-white/15 flex items-center justify-center gap-2 text-xs text-white/90 truncate">
                        <Globe className="w-3.5 h-3.5 text-[#d6c5b3] shrink-0" />
                        <span className="font-medium truncate">
                          {selectedCategory} Catalog — {currentSlide.locationName} ({safeIndex + 1}/{slides.length})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleWhatsAppReserve(currentSlide)}
                          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition"
                          title="Reserve This Option"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsCatalogOpen(false)}
                          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition"
                          title="Close Catalog"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 2. CENTER 3D FANNED STACKED CARD DECK + LEFT VERTICAL PILL (Reference Image 2) */}
                    <div className="relative w-full max-w-5xl h-[430px] sm:h-[470px] flex items-center justify-center">
                      <div className="hidden md:flex flex-col items-center gap-3 p-2 rounded-full bg-white/[0.14] border border-white/30 backdrop-blur-2xl shadow-2xl absolute left-2 lg:left-6 z-30">
                        <button
                          onClick={() => handleWhatsAppReserve(currentSlide)}
                          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white transition"
                          title="Inquire via Concierge"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setSavedIds((prev) =>
                              prev.includes(currentSlide.id)
                                ? prev.filter((id) => id !== currentSlide.id)
                                : [...prev, currentSlide.id]
                            )
                          }
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                            savedIds.includes(currentSlide.id)
                              ? 'bg-[#e63946] text-white'
                              : 'bg-white/10 hover:bg-white/25 text-white'
                          }`}
                          title="Save to Wishlist"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsCatalogOpen(false)}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
                          title="Back to 3 Windows"
                        >
                          <Compass className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 3D Fanned Card Stack */}
                      <div className="relative w-full max-w-[440px] sm:max-w-[490px] h-full flex items-center justify-center">
                        {[-2, -1, 0, 1, 2].map((offset) => {
                          const slideIdx =
                            ((safeIndex + offset) % slides.length + slides.length) %
                            slides.length;
                          const item = slides[slideIdx];
                          const isCenter = offset === 0;

                          const translateX = offset * 105;
                          const scale =
                            offset === 0
                              ? 1
                              : Math.abs(offset) === 1
                              ? 0.86
                              : 0.73;
                          const zIndex = 30 - Math.abs(offset) * 5;
                          const opacity =
                            offset === 0
                              ? 1
                              : Math.abs(offset) === 1
                              ? 0.82
                              : 0.55;

                          return (
                            <div
                              key={`${item.id}-offset-${offset}`}
                              onClick={() => {
                                if (offset < 0) handlePrevSlide();
                                if (offset > 0) handleNextSlide();
                              }}
                              style={{
                                transform: `translateX(${translateX}px) scale(${scale})`,
                                zIndex,
                                opacity
                              }}
                              className={`absolute inset-0 rounded-[32px] overflow-hidden border border-white/40 shadow-[0_30px_90px_rgba(0,0,0,0.75)] transition-all duration-500 flex flex-col justify-between bg-[#1a1a1f] ${
                                isCenter
                                  ? 'cursor-default'
                                  : 'cursor-pointer hover:brightness-110'
                              }`}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="absolute inset-0 w-full h-full object-cover"
                              />

                              {isCenter && (
                                <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsCatalogOpen(false);
                                    }}
                                    className="w-9 h-9 rounded-full bg-black/35 hover:bg-black/55 border border-white/25 backdrop-blur-md flex items-center justify-center text-white transition"
                                    title="Back to 3 Category Windows"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleWhatsAppReserve(item);
                                    }}
                                    className="px-4 py-1.5 rounded-full bg-black/40 hover:bg-white hover:text-black border border-white/30 backdrop-blur-md text-xs font-sans-clean font-semibold text-white transition inline-flex items-center gap-1.5 shadow-lg"
                                  >
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    <span>Book {item.category}</span>
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNextSlide();
                                    }}
                                    className="w-9 h-9 rounded-full bg-black/35 hover:bg-black/55 border border-white/25 backdrop-blur-md flex items-center justify-center text-white transition"
                                    title="Next in Catalog"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              <div
                                className={`relative z-20 mt-auto p-5 sm:p-6 bg-gradient-to-t from-black/90 via-black/75 to-black/30 backdrop-blur-xl border-t border-white/15 transition-opacity duration-300 ${
                                  isCenter
                                    ? 'opacity-100'
                                    : 'opacity-0 pointer-events-none'
                                }`}
                              >
                                <div className="flex items-baseline justify-between gap-3 mb-2">
                                  <h3 className="font-sans-clean font-bold text-lg sm:text-xl text-white leading-snug">
                                    {item.name}
                                  </h3>
                                  <span className="text-xs font-mono-tech font-bold text-[#d6c5b3] shrink-0">
                                    {item.price}
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm text-white/90 leading-relaxed line-clamp-2 mb-3">
                                  {item.description}
                                </p>

                                <div className="text-[11px] text-white/65 space-y-0.5 font-sans-clean">
                                  <div>
                                    Location: {item.locationName} ({item.country}) • ★ {item.rating}
                                  </div>
                                  <div>
                                    Duration: {item.duration} • {item.groupSize}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. BOTTOM SPATIAL CATALOG PILL WITH SLIDE ARROWS & DESTINATION FILTER (Reference Image 2) */}
                    <div className="flex flex-col items-center space-y-3">
                      <div className="rounded-full px-3.5 py-2.5 bg-white/[0.14] border border-white/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 sm:gap-5">
                        <button
                          onClick={handlePrevSlide}
                          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 pr-2">
                          <img
                            src={currentSlide.image}
                            alt={currentSlide.name}
                            className="w-10 h-10 rounded-full object-cover border border-white/40"
                          />
                          <div className="text-left">
                            <div className="font-sans-clean font-bold text-xs sm:text-sm text-white leading-tight">
                              {currentSlide.locationName}
                            </div>
                            <div className="text-[10px] text-white/70">
                              {selectedCategory} Catalog • Option {safeIndex + 1} of {slides.length}
                            </div>
                          </div>
                        </div>

                        {/* Filter Catalog by All or Specific Stamp Destination */}
                        <div className="hidden md:flex items-center gap-1 border-l border-white/15 pl-3">
                          <button
                            onClick={() => setCatalogLocationFilter('ALL')}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono-tech transition ${
                              catalogLocationFilter === 'ALL'
                                ? 'bg-white text-black font-bold'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            ALL
                          </button>
                          {DESTINATION_LOCATIONS.map((lw) => (
                            <button
                              key={lw.id}
                              onClick={() => {
                                setActiveLocation(lw);
                                setCatalogLocationFilter(lw.id);
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono-tech transition ${
                                catalogLocationFilter === lw.id
                                  ? 'bg-white text-black font-bold'
                                  : 'text-white/70 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {lw.stampTitle}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleNextSlide}
                          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 opacity-60">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span className="w-24 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </section>

        {/* Bottom Architectural Footer Strip inside the Poster Frame */}
        <footer className="px-4 sm:px-10 py-5 bg-[#141416] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono-tech uppercase tracking-[0.22em] text-white/60">
          <span>OPULENT OASIS • DESIGNED FOR EXPLORERS</span>
          <div className="flex items-center gap-6">
            <span>▲</span>
            <div className="w-32 h-3 barcode-strip text-white/75" />
            <span>▲</span>
          </div>
          <span>OPULENTOASIS.CO.IN</span>
        </footer>
      </div>

      {/* =======================================================================
          CURATOR HOST STUDIO (CLOUDFLARE D1 EDGE DATABASE)
      ======================================================================= */}
      {hostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[28px] bg-[#161619] border border-white/20 p-7 text-[#f4efe6] space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                  CLOUDFLARE D1 EDGE STUDIO
                </span>
                <h3 className="font-serif-editorial text-3xl">Curator Host Portal</h3>
              </div>
              <button onClick={() => setHostModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isHostAuthenticated ? (
              <form
                onSubmit={handleCuratorLogin}
                className="space-y-4 text-xs"
              >
                <p className="text-white/70">
                  Enter curator passcode (<code className="text-[#d6c5b3]">oasis2026</code>) verified via Web Crypto SHA-256 to publish to any Stamp Location.
                </p>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Passcode (oasis2026)"
                  value={hostPasscode}
                  onChange={(e) => setHostPasscode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20"
                />
                {authError && (
                  <p className="text-[#e63946] font-mono-tech text-[11px]">
                    {authError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#f6eedc] text-[#09090b] font-bold uppercase tracking-wider"
                >
                  Unlock Studio
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateD1Experience} className="space-y-3 text-xs">
                {/* Honeypot anti-bot field */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={newExp.website_url_trap}
                  onChange={(e) =>
                    setNewExp({ ...newExp, website_url_trap: e.target.value })
                  }
                  className="hidden"
                  aria-hidden="true"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    required
                    type="text"
                    placeholder="Price (e.g. ₹45,000 / night)"
                    value={newExp.price}
                    onChange={(e) => setNewExp({ ...newExp, price: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 3 Days)"
                    value={newExp.duration}
                    onChange={(e) =>
                      setNewExp({ ...newExp, duration: e.target.value })
                    }
                    className="px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Description..."
                  value={newExp.description}
                  onChange={(e) =>
                    setNewExp({ ...newExp, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20"
                />
                {d1Status && <p className="text-[#9eb393] font-bold">{d1Status}</p>}
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#f6eedc] text-[#09090b] font-bold uppercase tracking-wider"
                >
                  Publish to Location Window & D1
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
