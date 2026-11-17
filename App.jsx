import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  Sun,
  Moon,
  Search,
  Calendar,
  Sliders,
  Play,
  Pause,
  Plus,
  X,
  ChevronDown,
  Globe,
  Shield,
  Sparkles,
  Check,
  Trash2,
  Edit3,
  ArrowUpRight,
  MessageCircle,
  Wind,
  Lock,
  Unlock,
  BarChart3,
  Layers,
  Database,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

// ============================================================================
// 0. AWWWARDS TYPOGRAPHY, LIQUID-GLASS SHIMMER & WEB AUDIO SOUNDSCAPE ENGINE
// ============================================================================
const WHATSAPP_NUMBER = '919820000000';

const AWWWARDS_STYLE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');

  .font-editorial {
    font-family: 'Cormorant Garamond', Georgia, serif;
  }
  .font-sans-ui {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .font-mono-tech {
    font-family: 'JetBrains Mono', monospace;
  }

  /* Primary Outer Glass Containers (Header, Sections, Modals) */
  .apple-glass-dark {
    background: linear-gradient(
      135deg,
      rgba(34, 34, 40, 0.62) 0%,
      rgba(20, 20, 24, 0.48) 100%
    );
    backdrop-filter: blur(36px) saturate(190%);
    -webkit-backdrop-filter: blur(36px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow:
      0 16px 40px rgba(0, 0, 0, 0.42),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.24),
      inset 0 -1px 0 0 rgba(255, 255, 255, 0.05);
  }

  .apple-glass-light {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.72) 0%,
      rgba(244, 243, 239, 0.56) 100%
    );
    backdrop-filter: blur(36px) saturate(190%);
    -webkit-backdrop-filter: blur(36px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.75);
    box-shadow:
      0 12px 32px rgba(20, 20, 20, 0.07),
      0 1px 2px rgba(20, 20, 20, 0.05),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.95),
      inset 0 -1px 0 0 rgba(20, 20, 20, 0.05);
  }

  /* Inner Capsules & Control Trays (Search, Filters, Mode, Month Bar, Cards, HUD) */
  .apple-pill-dark {
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.09) 0%,
      rgba(255, 255, 255, 0.03) 100%
    );
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.28),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.22),
      inset 0 -1px 0 0 rgba(255, 255, 255, 0.04);
  }

  .apple-pill-light {
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.68) 0%,
      rgba(234, 232, 227, 0.52) 100%
    );
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(20, 20, 20, 0.09);
    box-shadow:
      0 6px 18px rgba(20, 20, 20, 0.05),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 0 rgba(20, 20, 20, 0.04);
  }

  .strata-dot-grid-light {
    background-color: #f4f3ef;
    background-image: radial-gradient(rgba(20, 20, 20, 0.14) 1px, transparent 1px);
    background-size: 16px 16px;
  }

  .strata-dot-grid-dark {
    background-color: #141417;
    background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 16px 16px;
  }

  @keyframes glassShimmerSweep {
    0% { transform: translateX(-140%) skewX(-20deg); }
    45%, 100% { transform: translateX(240%) skewX(-20deg); }
  }

  @keyframes appleGlassPulse {
    0%, 100% {
      box-shadow:
        0 6px 20px rgba(0, 0, 0, 0.14),
        inset 0 1px 1px rgba(255, 255, 255, 0.35);
    }
    50% {
      box-shadow:
        0 8px 26px rgba(0, 0, 0, 0.22),
        inset 0 1px 2px rgba(255, 255, 255, 0.6);
    }
  }

  .inquire-live-glass {
    animation: appleGlassPulse 4s ease-in-out infinite;
  }

  .inquire-shimmer-bar {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
    animation: glassShimmerSweep 4.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }

  .sd-bracket-btn {
    letter-spacing: 0.14em;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .sd-bracket-btn:hover {
    letter-spacing: 0.22em;
  }
`;

// Son Daven Pixel-Art WebGL / Canvas Halftone Transition Component
function SonDavenPixelCanvasImage({ src, alt, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let animId;

    img.onload = () => {
      const w = (canvas.width = canvas.clientWidth || 640);
      const h = (canvas.height = canvas.clientHeight || 380);
      const steps = [28, 18, 12, 7, 4, 1];
      let stepIdx = 0;

      const renderStep = () => {
        const pxSize = steps[stepIdx];
        if (pxSize === 1) {
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(img, 0, 0, w, h);
          return;
        }
        const sw = Math.max(1, Math.floor(w / pxSize));
        const sh = Math.max(1, Math.floor(h / pxSize));
        const off = document.createElement('canvas');
        off.width = sw;
        off.height = sh;
        const offCtx = off.getContext('2d');
        offCtx.drawImage(img, 0, 0, sw, sh);

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(off, 0, 0, sw, sh, 0, 0, w, h);

        stepIdx += 1;
        if (stepIdx < steps.length) {
          animId = setTimeout(renderStep, 55);
        }
      };

      renderStep();
    };
    img.src = src;

    return () => {
      if (animId) clearTimeout(animId);
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

const SON_DAVEN_PROXIMITY_MAP = {
  'Gorai Coast': [
    { minutes: '05', unit: 'min.', mode: 'On foot', landmark: 'Gorai Private Casuarina Beach' },
    { minutes: '08', unit: 'min.', mode: 'Drive', landmark: 'Global Vipassana Pagoda' },
    { minutes: '15', unit: 'min.', mode: 'Ferry', landmark: 'Borivali / Marve Speedboat Jetty' },
    { minutes: '12', unit: 'min.', mode: 'Cycle', landmark: 'East Indian Heritage Village' }
  ],
  'Manori Island': [
    { minutes: '04', unit: 'min.', mode: 'On foot', landmark: 'Manori Cliffside Sunset Point' },
    { minutes: '10', unit: 'min.', mode: 'Kayak', landmark: 'Manori Mangrove Lagoon' },
    { minutes: '15', unit: 'min.', mode: 'Ferry', landmark: 'Marve Landing Pier' },
    { minutes: '07', unit: 'min.', mode: 'On foot', landmark: 'Artisanal East Indian Bakehouse' }
  ],
  Alibaug: [
    { minutes: '20', unit: 'min.', mode: 'Speedboat', landmark: 'Gateway of India, South Mumbai' },
    { minutes: '08', unit: 'min.', mode: 'Drive', landmark: 'Mandwa Ro-Ro Jetty & Yacht Club' },
    { minutes: '06', unit: 'min.', mode: 'On foot', landmark: 'Awas Virgin Casuarina Coast' },
    { minutes: '18', unit: 'min.', mode: 'Boat', landmark: 'Kolaba Sea Fort Ruins' }
  ],
  'Sahyadri Range': [
    { minutes: '15', unit: 'min.', mode: 'Ridge walk', landmark: 'Kokankada 1,424m Vertical Cliff' },
    { minutes: '06', unit: 'min.', mode: 'On foot', landmark: 'Ancient Kedareshwar Cave Temple' },
    { minutes: '35', unit: 'min.', mode: 'Ascent', landmark: 'Taramati Cloud Summit' },
    { minutes: '10', unit: 'min.', mode: 'On foot', landmark: 'Geodesic Starlight Basecamp' }
  ]
};

const DEFAULT_PROXIMITY = [
  { minutes: '06', unit: 'min.', mode: 'On foot', landmark: 'Private Sanctuary Viewpoint' },
  { minutes: '14', unit: 'min.', mode: 'Transfer', landmark: 'Regional Helipad / Jetty Access' },
  { minutes: '22', unit: 'min.', mode: 'Trail', landmark: 'Old-Growth Heritage Forest Reserve' },
  { minutes: '05', unit: 'min.', mode: 'On foot', landmark: 'Chef’s Farm-to-Table Pavilion' }
];

const SON_DAVEN_SANCTUARY_TYPES = [
  {
    id: 'studio-loft',
    code: '01',
    title: 'Coastal Loft Suite',
    area: 'From 54 m²',
    guests: '2+1 guests',
    tariff: '₹16,500 / night',
    yieldPct: '11.2%',
    features: [
      'Panoramic Arabian Sea living area',
      'Private plunge tub on cantilevered deck',
      'Integrated artisanal coffee & wine bar',
      'Lime-plastered acoustic interiors'
    ],
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    description:
      'An intimate glass-wrapped suite perched above the tide line with uninterrupted horizon views and private butler pantry.'
  },
  {
    id: 'courtyard-villa',
    code: '02',
    title: '3-Bedroom Courtyard Villa',
    area: 'From 185 m²',
    guests: '6+2 guests',
    tariff: '₹32,000 / night',
    yieldPct: '12.8%',
    features: [
      'Private saltwater infinity pool',
      'Portuguese-inspired verandas & courtyard',
      'Outdoor rain showers & bonfire orchard',
      'Dedicated in-house coastal chef kitchen'
    ],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    description:
      'Crafted from laterite stone and reclaimed Burma teak, surrounded by casuarina and mango groves for slow group retreats.'
  },
  {
    id: 'banyan-estate',
    code: '03',
    title: '5-Bedroom Banyan Glasshouse',
    area: 'From 340 m²',
    guests: '10+4 guests',
    tariff: '₹48,000 / night',
    yieldPct: '14.0%',
    features: [
      '25-meter ozone lap pool & spa pavilion',
      'Double-height glass living conservatory',
      'Private speedboat jetty transfer access',
      'Sunset rooftop bar & star-deck'
    ],
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    description:
      'Our flagship architectural estate in Alibaug & North Mumbai Coast, designed for multi-generational escapes and private celebrations.'
  },
  {
    id: 'alpine-dome',
    code: '04',
    title: 'Expedition Geodesic Sky-Pod',
    area: 'From 42 m²',
    guests: '2 guests',
    tariff: '₹14,500 / person',
    yieldPct: '13.5%',
    features: [
      '4-season insulated panoramic dome',
      'Wood-fired stove & heated expedition bedding',
      '1,424m–3,800m ridge-crest placement',
      'Garmin satellite telemetry & O₂ monitoring'
    ],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    description:
      'High-altitude architectural basecamp pods deployed across our Sahyadri, Spiti, and Himalayan ridge expeditions.'
  }
];

// ============================================================================
// 1. ZERO-DEPENDENCY GSAP-COMPATIBLE TWEEN ENGINE
// ============================================================================
const gsap = {
  to(target, vars) {
    if (!target) return;
    const duration = (vars.duration || 0.6) * 1000;
    const start = performance.now();
    const keys = Object.keys(vars).filter(
      (k) => !['duration', 'ease', 'onUpdate', 'onComplete'].includes(k)
    );
    const initial = {};
    keys.forEach((k) => {
      initial[k] = Number(target[k]) || 0;
    });

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      keys.forEach((k) => {
        target[k] = initial[k] + (vars[k] - initial[k]) * eased;
      });
      if (typeof vars.onUpdate === 'function') vars.onUpdate();
      if (t < 1) {
        requestAnimationFrame(step);
      } else if (typeof vars.onComplete === 'function') {
        vars.onComplete();
      }
    };
    requestAnimationFrame(step);
  }
};

// ============================================================================
// 2. MONTHS, COUNTRIES & CURATED OPERATING LOCATIONS DATA
// ============================================================================
const MONTHS = [
  { short: 'Jan', full: 'January' },
  { short: 'Feb', full: 'February' },
  { short: 'Mar', full: 'March' },
  { short: 'Apr', full: 'April' },
  { short: 'May', full: 'May' },
  { short: 'Jun', full: 'June' },
  { short: 'Jul', full: 'July' },
  { short: 'Aug', full: 'August' },
  { short: 'Sep', full: 'September' },
  { short: 'Oct', full: 'October' },
  { short: 'Nov', full: 'November' },
  { short: 'Dec', full: 'December' }
];

const WORLD_COUNTRIES = [
  { name: 'All Countries', lat: 19.07, lng: 72.87 },
  { name: 'India', lat: 20.59, lng: 78.96 },
  { name: 'Japan', lat: 36.2, lng: 138.25 },
  { name: 'Switzerland', lat: 46.81, lng: 8.22 },
  { name: 'Norway', lat: 60.47, lng: 8.46 },
  { name: 'Indonesia', lat: -8.4, lng: 115.18 },
  { name: 'Peru', lat: -13.16, lng: -72.54 },
  { name: 'Bhutan', lat: 27.51, lng: 90.43 },
  { name: 'Italy', lat: 41.87, lng: 12.56 },
  { name: 'France', lat: 46.22, lng: 2.21 },
  { name: 'United Kingdom', lat: 55.37, lng: -3.43 },
  { name: 'United States', lat: 37.09, lng: -95.71 }
];

const INITIAL_LISTINGS = [
  {
    id: 'gorai-villa-1',
    name: 'Casa De Mar — Gorai Beachfront Sanctuary',
    locationName: 'Gorai Coast',
    country: 'India',
    region: 'North Mumbai Coast, Maharashtra',
    category: 'Stay',
    subType: 'Villa',
    price: '₹32,000 / night',
    numericPrice: 32000,
    lat: 19.24,
    lng: 72.78,
    altitude: '12m ASL',
    duration: 'Min 2 Nights',
    groupSize: 'Up to 10 Guests',
    terrainType: 'Coastal Palm Sanctuary',
    baseIndex: 9.2,
    published: true,
    monthlyIndex: [9.4, 9.2, 8.6, 7.8, 7.2, 7.5, 7.9, 8.1, 8.6, 9.1, 9.5, 9.6],
    elevationProfile: [8, 12, 18, 22, 15, 10, 8, 6],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'An architectural Portuguese-inspired courtyard villa tucked behind private casuarina groves on Gorai coast, featuring a saltwater infinity pool, sunset deck, and farm-to-table East Indian cuisine.',
    highlights: ['Private Infinity Pool', 'In-House Coastal Chef', 'Speedboat Jetty Access', 'Bonfire Orchard'],
    itinerary: [],
    upcomingDepartures: [
      {
        id: 'dep-gorai-1',
        title: 'Gorai Coastal Weekend Retreat',
        type: 'Stay',
        dateRange: 'Nov 20 – Nov 22, 2026',
        duration: '2 Nights',
        spotsLeft: 4,
        price: '₹64,000'
      }
    ]
  },
  {
    id: 'manori-villa-1',
    name: 'Villa Solitude — Manori Cliffside Estate',
    locationName: 'Manori Island',
    country: 'India',
    region: 'Manori Creek, North Mumbai',
    category: 'Stay',
    subType: 'Villa',
    price: '₹28,500 / night',
    numericPrice: 28500,
    lat: 19.21,
    lng: 72.79,
    altitude: '18m ASL',
    duration: '2–5 Nights',
    groupSize: 'Up to 8 Guests',
    terrainType: 'Island Creek & Orchard',
    baseIndex: 9.0,
    published: true,
    monthlyIndex: [9.3, 9.1, 8.4, 7.6, 7.1, 7.4, 7.8, 8.0, 8.5, 9.0, 9.4, 9.5],
    elevationProfile: [10, 14, 18, 24, 20, 15, 12, 9],
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'],
    description:
      'Perched above the Arabian Sea in Manori, Villa Solitude blends lime-plastered walls, open-air rain showers, and sweeping verandas ideal for slow coastal mornings.',
    highlights: ['Arabian Sea Panorama', 'Private Yoga Pavilion', 'Artisanal Bakehouse'],
    itinerary: [],
    upcomingDepartures: []
  },
  {
    id: 'alibaug-villa-1',
    name: 'The Banyan Glasshouse — Alibaug Sanctuary',
    locationName: 'Alibaug',
    country: 'India',
    region: 'Mandwa & Awas, Raigad Coast',
    category: 'Stay',
    subType: 'Villa',
    price: '₹48,000 / night',
    numericPrice: 48000,
    lat: 18.64,
    lng: 72.87,
    altitude: '15m ASL',
    duration: '2–7 Nights',
    groupSize: 'Up to 12 Guests',
    terrainType: 'Tropical Mango & Banyan Estate',
    baseIndex: 9.5,
    published: true,
    monthlyIndex: [9.6, 9.4, 8.8, 8.1, 7.7, 8.0, 8.3, 8.5, 8.9, 9.3, 9.7, 9.8],
    elevationProfile: [10, 15, 19, 22, 18, 14, 12, 10],
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'],
    description:
      '20 minutes by private speedboat from the Gateway of India, The Banyan Glasshouse spans 3 acres of heirloom mango orchards with a 25-meter lap pool and private spa pavilion.',
    highlights: ['Ro-Ro & Speedboat Transfer', '25m Ozone Lap Pool', 'Private Padel Court'],
    itinerary: [],
    upcomingDepartures: [
      {
        id: 'dep-alibaug-1',
        title: 'Alibaug Festive Charter Villa Weekender',
        type: 'Stay',
        dateRange: 'Dec 04 – Dec 06, 2026',
        duration: '2 Nights',
        spotsLeft: 2,
        price: '₹96,000'
      }
    ]
  },
  {
    id: 'sahyadri-trek-1',
    name: 'Harishchandragad & Kokankada Cliff Crest Trek',
    locationName: 'Sahyadri Range',
    country: 'India',
    region: 'Western Ghats, Maharashtra',
    category: 'Trek',
    subType: 'Mountains',
    price: '₹14,500 / person',
    numericPrice: 14500,
    lat: 19.38,
    lng: 73.77,
    altitude: '1,424m ASL',
    duration: '3 Days / 2 Nights',
    groupSize: 'Max 8 Explorers',
    terrainType: 'Basalt Cliff Overhang & Cloud Forest',
    baseIndex: 9.3,
    published: true,
    monthlyIndex: [9.1, 8.9, 8.0, 7.1, 6.8, 8.9, 9.5, 9.6, 9.4, 9.2, 9.4, 9.3],
    elevationProfile: [420, 680, 910, 1180, 1424, 1310, 890, 460],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'],
    description:
      'Ascend ancient rock-cut steps to the 1,424m Kokankada vertical basalt amphitheater with luxury alpine dome tents, satellite telemetry, and a dedicated mountain chef.',
    highlights: ['1:4 Guide Ratio', 'Luxury Geodesic Basecamp', 'Kokankada Sunset Vigil'],
    itinerary: [],
    upcomingDepartures: [
      {
        id: 'dep-sahyadri-1',
        title: 'Sahyadri Starlight Crest Expedition',
        type: 'Trek',
        dateRange: 'Nov 27 – Nov 29, 2026',
        duration: '3 Days',
        spotsLeft: 5,
        price: '₹14,500'
      }
    ]
  },
  {
    id: 'spiti-tour-1',
    name: 'Trans-Himalayan Spiti 4x4 Overland Expedition',
    locationName: 'Spiti Valley',
    country: 'India',
    region: 'Himachal Pradesh, Indian Himalayas',
    category: 'Tour',
    subType: 'Domestic',
    price: '₹85,000 / person',
    numericPrice: 85000,
    lat: 32.24,
    lng: 78.03,
    altitude: '4,590m ASL',
    duration: '8 Days / 7 Nights',
    groupSize: 'Max 6 Guests',
    terrainType: 'High-Altitude Cold Desert',
    baseIndex: 9.4,
    published: true,
    monthlyIndex: [6.5, 6.8, 7.4, 8.2, 9.3, 9.7, 9.6, 9.5, 9.6, 8.9, 7.6, 6.8],
    elevationProfile: [2050, 2750, 3200, 3800, 4270, 4590, 4100, 3650],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'],
    description:
      'Traverse Kunzum La and Key Monastery in heated 4x4 convoys with oxygen-monitored boutique mud-walled lodges and private monastery blessings.',
    highlights: ['Heated 4x4 Convoy', 'Key Monastery Private Access', 'Supplemental O₂ Onboard'],
    itinerary: [],
    upcomingDepartures: []
  },
  {
    id: 'kyoto-tour-1',
    name: 'Kumano Kodo & Kyoto Ryokan Pilgrimage',
    locationName: 'Kyoto',
    country: 'Japan',
    region: 'Kansai & Wakayama Prefectures',
    category: 'Trek',
    subType: 'Jungles',
    price: '₹1,65,000 / person',
    numericPrice: 165000,
    lat: 35.01,
    lng: 135.76,
    altitude: '880m ASL',
    duration: '7 Days / 6 Nights',
    groupSize: 'Max 8 Guests',
    terrainType: 'Ancient Cedar Moss Trail',
    baseIndex: 9.6,
    published: true,
    monthlyIndex: [8.1, 8.3, 9.4, 9.8, 9.5, 8.2, 7.9, 8.0, 8.8, 9.7, 9.9, 8.6],
    elevationProfile: [120, 340, 620, 880, 740, 510, 290, 95],
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'],
    description:
      'Walk mist-draped cedar trails along the imperial Nakahechi route by day and soak in private cedar onsens with multi-course kaiseki dining by night.',
    highlights: ['Private Onsen Ryokans', 'Zen Temple Tea Ceremony', 'Luggage Shuttle Concierge'],
    itinerary: [],
    upcomingDepartures: []
  },
  {
    id: 'zermatt-stay-1',
    name: 'Chalet Matterhorn Glass — Zermatt Alpine Sanctuary',
    locationName: 'Zermatt Alps',
    country: 'Switzerland',
    region: 'Valais Canton, Swiss Alps',
    category: 'Stay',
    subType: 'Villa',
    price: '₹1,95,000 / night',
    numericPrice: 195000,
    lat: 46.02,
    lng: 7.74,
    altitude: '1,820m ASL',
    duration: 'Min 3 Nights',
    groupSize: 'Up to 8 Guests',
    terrainType: 'Glacier & Alpine Peak',
    baseIndex: 9.7,
    published: true,
    monthlyIndex: [9.8, 9.7, 9.4, 8.5, 8.1, 8.8, 9.2, 9.3, 8.9, 8.7, 9.3, 9.9],
    elevationProfile: [1620, 1780, 2100, 2580, 3100, 2890, 2200, 1820],
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80'],
    description:
      'Ski-in/ski-out architectural timber-and-glass chalet framing the east face of the Matterhorn, complete with a subterranean thermal Hammam and private mountain guide.',
    highlights: ['Matterhorn Panorama', 'Subterranean Hammam & Sauna', 'Heli-Ski Pad Access'],
    itinerary: [],
    upcomingDepartures: []
  }
];

function normalizeCategory(cat = '') {
  const c = cat.toLowerCase();
  if (c.includes('stay') || c.includes('villa') || c.includes('apart')) return 'Stay';
  if (c.includes('trek')) return 'Trek';
  return 'Tour';
}

const WORLD_POLYGONS = [
  [[-165, 65], [-140, 70], [-110, 72], [-80, 68], [-60, 52], [-65, 44], [-75, 35], [-81, 25], [-90, 20], [-84, 10], [-78, 8], [-85, 12], [-105, 20], [-118, 33], [-124, 48], [-145, 60]],
  [[-52, 60], [-42, 60], [-20, 70], [-22, 82], [-55, 81], [-58, 70]],
  [[-78, 10], [-62, 10], [-50, 0], [-35, -6], [-38, -16], [-48, -28], [-62, -42], [-68, -54], [-74, -50], [-72, -32], [-70, -18], [-77, -10], [-80, 0]],
  [[-10, 36], [5, 38], [15, 38], [28, 36], [42, 42], [55, 55], [55, 68], [28, 71], [10, 63], [5, 52], [-5, 48], [-9, 43]],
  [[-10, 51], [-2, 50], [2, 53], [-3, 59], [-8, 56]],
  [[-17, 15], [-10, 32], [10, 37], [32, 31], [43, 12], [51, 12], [41, -2], [39, -15], [32, -28], [20, -35], [14, -22], [12, -6], [8, 4], [-5, 5], [-15, 11]],
  [[44, -13], [50, -14], [49, -25], [43, -25]],
  [[28, 41], [36, 36], [35, 28], [44, 13], [58, 22], [67, 24], [72, 21], [77, 8], [80, 14], [88, 22], [94, 16], [100, 13], [104, 1], [108, 12], [118, 24], [124, 34], [132, 42], [142, 52], [165, 62], [175, 66], [140, 72], [100, 73], [60, 68], [45, 55]],
  [[130, 31], [136, 34], [141, 39], [145, 44], [140, 42], [134, 35]],
  [[96, 5], [105, -6], [115, -8], [122, -8], [118, 3], [110, 2]],
  [[114, -22], [128, -14], [142, -11], [153, -26], [148, -38], [136, -35], [122, -34], [114, -30]],
  [[166, -46], [174, -36], [178, -39], [170, -46]]
];

function computeRegionalTelemetry(lat, lng) {
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const localSolarHour = (utcHours + lng / 15 + 24) % 24;
  const isDaylight = localSolarHour >= 6 && localSolarHour < 18.2;
  const hh = Math.floor(localSolarHour);
  const mm = Math.floor((localSolarHour - hh) * 60);
  const formattedTime = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  const absLat = Math.abs(lat);
  const baseTemp = Math.round(31 - absLat * 0.45 + (isDaylight ? 3 : -2));
  const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233));
  const aqi = Math.max(12, Math.min(72, Math.round(16 + seed * 34)));
  return { formattedTime, isDaylight, tempC: baseTemp, aqi };
}

function generateEarthCanvasTexture(isDay, surfaceStyle = 'vector') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (surfaceStyle === 'satellite') {
    oceanGrad.addColorStop(0, '#071326');
    oceanGrad.addColorStop(1, '#040b16');
  } else if (surfaceStyle === 'topo') {
    oceanGrad.addColorStop(0, '#0f141c');
    oceanGrad.addColorStop(1, '#090c10');
  } else if (surfaceStyle === 'night') {
    oceanGrad.addColorStop(0, '#050508');
    oceanGrad.addColorStop(1, '#020204');
  } else {
    oceanGrad.addColorStop(0, '#0d0d10');
    oceanGrad.addColorStop(0.5, '#09090b');
    oceanGrad.addColorStop(1, '#050507');
  }
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.7;
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let lng = -150; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  WORLD_POLYGONS.forEach((poly) => {
    ctx.save();
    ctx.beginPath();
    poly.forEach(([lng, lat], idx) => {
      const x = ((lng + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    if (surfaceStyle === 'satellite') {
      ctx.fillStyle = '#16291b';
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.32)';
    } else if (surfaceStyle === 'topo') {
      ctx.fillStyle = '#1e1e24';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
    } else if (surfaceStyle === 'night') {
      ctx.fillStyle = '#0c0f17';
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    } else {
      ctx.fillStyle = '#18181c';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    }
    ctx.lineWidth = 1.3;
    ctx.fill();
    ctx.stroke();

    ctx.clip();
    ctx.fillStyle = surfaceStyle === 'night' ? 'rgba(250, 204, 21, 0.22)' : 'rgba(255, 255, 255, 0.22)';
    for (let gx = 0; gx < canvas.width; gx += 7) {
      for (let gy = 0; gy < canvas.height; gy += 7) {
        ctx.fillRect(gx, gy, 1.4, 1.4);
      }
    }
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function getStrataThermalColor(score) {
  if (score >= 9.3) return '#e64833';
  if (score >= 8.8) return '#f39c42';
  if (score >= 8.2) return '#e9d758';
  return '#65b741';
}

function StrataLogoGlyph({ isDay }) {
  const strokeColor = isDay ? '#1d1d1f' : '#f5f5f7';
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="shrink-0">
      <g stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round">
        <circle cx="16" cy="16" r="12" strokeOpacity="0.22" />
        <circle cx="16" cy="16" r="6.5" strokeOpacity="0.5" />
        <line x1="16" y1="2" x2="16" y2="30" />
        <line x1="2" y1="16" x2="30" y2="16" />
        <line x1="6.1" y1="6.1" x2="25.9" y2="25.9" strokeOpacity="0.6" />
        <line x1="25.9" y1="6.1" x2="6.1" y2="25.9" strokeOpacity="0.6" />
      </g>
      <circle cx="16" cy="16" r="2" fill={strokeColor} />
    </svg>
  );
}

// ============================================================================
// 3. THREE.JS GLOBE COMPONENT
// ============================================================================
function StrataGlobeCanvas({
  isDay,
  visualMode,
  surfaceStyle,
  selectedMonth,
  listings,
  onSelectLocationGroup,
  zoomLevel,
  onZoomChange,
  pickCoordsMode,
  onPickCoords,
  showAqiOverlay,
  showSunlightOverlay,
  showWeatherOverlay,
  focusCoords
}) {
  const mountRef = useRef(null);
  const globeGroupRef = useRef(null);
  const earthMatRef = useRef(null);
  const latticeGroupRef = useRef(null);
  const arcsGroupRef = useRef(null);
  const cameraRef = useRef(null);
  const rotationTargetRef = useRef({ x: 0.32, y: -2.8 });
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const [projectedLocations, setProjectedLocations] = useState([]);

  const operatingLocations = useMemo(() => {
    const map = new Map();
    listings.forEach((item) => {
      const locKey = (item.locationName || item.name.split(' ')[0]).trim();
      if (!map.has(locKey)) {
        map.set(locKey, {
          locationName: locKey,
          country: item.country,
          region: item.region,
          lat: Number(item.lat),
          lng: Number(item.lng),
          items: []
        });
      }
      map.get(locKey).items.push(item);
    });
    return Array.from(map.values());
  }, [listings]);

  const latLngToVec3 = (lat, lng, radius = 100) => {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lng + 180) * Math.PI) / 180;
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 2000);
    camera.position.set(0, 0, 335);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, isDay ? 1.15 : 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, isDay ? 1.4 : 1.1);
    sunLight.position.set(220, 140, 260);
    scene.add(sunLight);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = rotationTargetRef.current.x;
    globeGroup.rotation.y = rotationTargetRef.current.y;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const sphereGeo = new THREE.SphereGeometry(99.2, 64, 64);
    const tex = generateEarthCanvasTexture(isDay, surfaceStyle);
    const sphereMat = new THREE.MeshPhongMaterial({
      map: tex,
      shininess: 14,
      specular: new THREE.Color('#27272a')
    });
    earthMatRef.current = sphereMat;
    const earthMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(earthMesh);

    const haloGeo = new THREE.SphereGeometry(103.2, 48, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: isDay ? 0x18181b : 0xffffff,
      transparent: true,
      opacity: isDay ? 0.08 : 0.05,
      side: THREE.BackSide
    });
    globeGroup.add(new THREE.Mesh(haloGeo, haloMat));

    const latticeGroup = new THREE.Group();
    globeGroup.add(latticeGroup);
    latticeGroupRef.current = latticeGroup;

    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    const dom = renderer.domElement;
    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e) => {
      if (!isDraggingRef.current || !globeGroupRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      globeGroupRef.current.rotation.y += dx * 0.0055;
      globeGroupRef.current.rotation.x = Math.max(
        -1.1,
        Math.min(1.1, globeGroupRef.current.rotation.x + dy * 0.0055)
      );
      rotationTargetRef.current = {
        x: globeGroupRef.current.rotation.x,
        y: globeGroupRef.current.rotation.y
      };
    };
    const onPointerUp = (e) => {
      const moved =
        Math.hypot(e.clientX - prevMouseRef.current.x, e.clientY - prevMouseRef.current.y) > 5;
      isDraggingRef.current = false;
      if (!moved && pickCoordsMode && onPickCoords) {
        const rect = dom.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(earthMesh);
        if (hits.length > 0) {
          const localPt = globeGroup.worldToLocal(hits[0].point.clone()).normalize();
          const lat = 90 - (Math.acos(localPt.y) * 180) / Math.PI;
          const lng = ((Math.atan2(localPt.z, -localPt.x) * 180) / Math.PI) - 180;
          onPickCoords({ lat: Number(lat.toFixed(2)), lng: Number((((lng + 540) % 360) - 180).toFixed(2)) });
        }
      }
    };
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.18 : 0.18;
      onZoomChange(Math.max(0.5, Math.min(4.0, Number((zoomLevel + delta).toFixed(2)))));
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (!isDraggingRef.current && globeGroupRef.current) {
        globeGroupRef.current.rotation.y += 0.00055;
      }
      renderer.render(scene, camera);

      if (globeGroupRef.current && container) {
        const w = container.clientWidth || 900;
        const h = container.clientHeight || 560;
        const camDir = camera.position.clone().normalize();
        const nextProjected = [];
        operatingLocations.forEach((loc) => {
          const localVec = latLngToVec3(loc.lat, loc.lng, 100.8);
          const worldVec = localVec.clone().applyMatrix4(globeGroupRef.current.matrixWorld);
          if (worldVec.clone().normalize().dot(camDir) > 0.18) {
            const projected = worldVec.clone().project(camera);
            nextProjected.push({
              ...loc,
              sx: (projected.x * 0.5 + 0.5) * w,
              sy: (-projected.y * 0.5 + 0.5) * h,
              telemetry: computeRegionalTelemetry(loc.lat, loc.lng)
            });
          }
        });
        setProjectedLocations(nextProjected);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
    };
  }, [operatingLocations, pickCoordsMode, zoomLevel]);

  useEffect(() => {
    if (!earthMatRef.current) return;
    earthMatRef.current.map = generateEarthCanvasTexture(isDay, surfaceStyle);
    earthMatRef.current.needsUpdate = true;
  }, [isDay, surfaceStyle]);

  useEffect(() => {
    if (!cameraRef.current) return;
    gsap.to(cameraRef.current.position, { z: 340 - ((zoomLevel - 0.5) / 3.5) * 185, duration: 0.55 });
  }, [zoomLevel]);

  const flyToCoordinates = (lat, lng) => {
    if (!globeGroupRef.current) return;
    gsap.to(globeGroupRef.current.rotation, {
      x: Math.max(-1.0, Math.min(1.0, ((lat * Math.PI) / 180) * 0.75)),
      y: -((lng + 90) * Math.PI) / 180,
      duration: 0.95
    });
  };

  useEffect(() => {
    if (focusCoords && typeof focusCoords.lat === 'number') {
      flyToCoordinates(focusCoords.lat, focusCoords.lng);
    }
  }, [focusCoords]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {projectedLocations.map((loc) => (
          <div
            key={loc.locationName}
            style={{ transform: `translate3d(${loc.sx}px, ${loc.sy}px, 0)` }}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <button
              onClick={() => {
                flyToCoordinates(loc.lat, loc.lng);
                onSelectLocationGroup(loc);
              }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] font-mono-tech transition-all duration-200 backdrop-blur-xl bg-[#141417]/75 text-[#f4f3ef] border border-white/30 shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:bg-white hover:text-[#111111]"
            >
              <span className="text-[10px] leading-none opacity-80">⊙</span>
              <span className="text-[11px] font-normal tracking-tight whitespace-nowrap">
                {loc.locationName}
              </span>
              {showAqiOverlay && <span className="text-[9px] bg-white/15 px-1 rounded">AQI {loc.telemetry.aqi}</span>}
              {showSunlightOverlay && <span className="text-[9px] bg-white/15 px-1 rounded">{loc.telemetry.isDaylight ? '☀' : '☾'}</span>}
              {showWeatherOverlay && <span className="text-[9px] bg-white/15 px-1 rounded">{loc.telemetry.tempC}°C</span>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 4. MODALS & SUB-PAGES (Contact, Terms, Privacy, 404, Host, Hub, Dossier)
// ============================================================================
function ContactPage({ isDay, onNavigate }) {
  const [sent, setSent] = useState(false);
  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 space-y-8 ${isDay ? 'text-zinc-900' : 'text-zinc-100'}`}>
      <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-xs font-mono-tech opacity-70 hover:opacity-100">
        <ArrowLeft className="w-4 h-4" /> <span>Back to Atlas Explorer</span>
      </button>

      <div>
        <span className="text-xs font-mono-tech uppercase tracking-[0.2em] opacity-55">[ 24/7 CONCIERGE DESK ]</span>
        <h1 className="font-editorial text-4xl sm:text-6xl font-normal mt-1">Contact Our Concierge</h1>
        <p className="text-sm opacity-70 mt-2 max-w-xl">
          Whether arranging a private helicopter charter to Zermatt, a cliffside villa in Alibaug, or an oxygen-monitored Spiti expedition, our private advisors are at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-[20px] space-y-4 ${isDay ? 'apple-glass-light' : 'apple-glass-dark'}`}>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 opacity-70" />
            <div>
              <div className="text-xs font-mono-tech opacity-60 uppercase">Direct Voice & WhatsApp</div>
              <div className="text-base font-medium">+91 22 6800 0000 / +91 98200 00000</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 opacity-70" />
            <div>
              <div className="text-xs font-mono-tech opacity-60 uppercase">Secure Email</div>
              <div className="text-base font-medium">concierge@opulentoasis.co.in</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 opacity-70" />
            <div>
              <div className="text-xs font-mono-tech opacity-60 uppercase">Global Headquarters</div>
              <div className="text-sm font-medium">Opulent Oasis Tower, Bandra Kurla Complex, Mumbai 400051</div>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className={`p-6 rounded-[20px] space-y-4 ${isDay ? 'apple-glass-light' : 'apple-glass-dark'}`}>
          <h3 className="font-editorial text-2xl font-normal">Send a Secure Message</h3>
          {sent ? (
            <div className="p-4 rounded-xl bg-green-500/10 text-green-500 text-xs font-mono-tech">
              ✓ Message dispatched to Concierge Team. We will connect within 15 minutes.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-mono-tech uppercase opacity-60 mb-1">Your Name</label>
                <input type="text" required placeholder="Aarav Mehta" className={`w-full px-3.5 py-2.5 rounded-xl bg-transparent focus:outline-none ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`} />
              </div>
              <div>
                <label className="block text-[10px] font-mono-tech uppercase opacity-60 mb-1">Email or WhatsApp</label>
                <input type="text" required placeholder="+91 98200 00000" className={`w-full px-3.5 py-2.5 rounded-xl bg-transparent focus:outline-none ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`} />
              </div>
              <div>
                <label className="block text-[10px] font-mono-tech uppercase opacity-60 mb-1">Inquiry Details</label>
                <textarea rows={3} required placeholder="Destination, dates, bespoke requirements..." className={`w-full px-3.5 py-2 rounded-xl bg-transparent focus:outline-none ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`} />
              </div>
              <button type="submit" className={`w-full py-3 rounded-full font-mono-tech text-xs uppercase ${isDay ? 'bg-[#111111] text-white' : 'bg-white text-[#111111] font-medium'}`}>
                [ DISPATCH TO CONCIERGE ↗ ]
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function TermsPage({ isDay, onNavigate }) {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 space-y-6 text-xs leading-relaxed ${isDay ? 'text-zinc-900' : 'text-zinc-100'}`}>
      <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-xs font-mono-tech opacity-70 hover:opacity-100">
        <ArrowLeft className="w-4 h-4" /> <span>Back to Atlas Explorer</span>
      </button>
      <h1 className="font-editorial text-4xl sm:text-5xl font-normal">Terms & Conditions</h1>
      <p className="opacity-60 font-mono-tech">Effective Date: June 2026 • Opulent Oasis Hospitality Group</p>
      <div className="space-y-4 opacity-80 pt-4">
        <h3 className="text-sm font-medium uppercase font-mono-tech">01. Bespoke Reservations & Charters</h3>
        <p>All bookings for architectural stays, private 4x4 convoys, and high-altitude alpine treks are subject to availability and formal concierge confirmation via WhatsApp or secure deposit.</p>
        <h3 className="text-sm font-medium uppercase font-mono-tech">02. High-Altitude Expedition Waiver</h3>
        <p>Expeditions exceeding 3,000 meters (Spiti, Sahyadris, Bhutan) require mandatory health declarations, supplemental oxygen compliance, and adherence to certified mountain guide instructions.</p>
        <h3 className="text-sm font-medium uppercase font-mono-tech">03. Cancellation & Refund Protocol</h3>
        <p>Cancellations made 14 days prior to check-in receive 100% credit toward future Opulent Oasis stays or expeditions. Force majeure events are accommodated with full date flexibility.</p>
      </div>
    </div>
  );
}

function PrivacyPage({ isDay, onNavigate }) {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 space-y-6 text-xs leading-relaxed ${isDay ? 'text-zinc-900' : 'text-zinc-100'}`}>
      <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-xs font-mono-tech opacity-70 hover:opacity-100">
        <ArrowLeft className="w-4 h-4" /> <span>Back to Atlas Explorer</span>
      </button>
      <h1 className="font-editorial text-4xl sm:text-5xl font-normal">Privacy Policy</h1>
      <p className="opacity-60 font-mono-tech">Opulent Oasis Data Protection Standards</p>
      <div className="space-y-4 opacity-80 pt-4">
        <h3 className="text-sm font-medium uppercase font-mono-tech">01. Confidentiality of Guest Itineraries</h3>
        <p>We maintain strict anonymity for all private members, high-net-worth travelers, and corporate delegations. Your passport details, travel dates, and personal notes are encrypted on decentralized secure servers.</p>
        <h3 className="text-sm font-medium uppercase font-mono-tech">02. Cookies & Telemetry</h3>
        <p>We utilize zero third-party behavioral trackers. Local sessions are stored exclusively to remember your preferred currency, month timeline, and globe zoom configuration.</p>
      </div>
    </div>
  );
}

function NotFoundPage({ onNavigate, isDay }) {
  return (
    <div className={`min-h-[70vh] flex flex-col items-center justify-center text-center px-4 ${isDay ? 'text-zinc-900' : 'text-zinc-100'}`}>
      <span className="text-6xl sm:text-8xl font-editorial opacity-25">404</span>
      <h1 className="font-editorial text-3xl sm:text-4xl mt-2">Coordinates Not Found in Atlas</h1>
      <p className="text-xs opacity-60 max-w-sm mt-1">The sanctuary or destination you are searching for may have been relocated or archived.</p>
      <button
        onClick={() => onNavigate('home')}
        className={`mt-6 px-6 py-3 rounded-full font-mono-tech text-xs uppercase ${isDay ? 'bg-[#111111] text-white' : 'bg-white text-[#111111] font-medium'}`}
      >
        [ RETURN TO 3D ATLAS GLOBE ⊙ ]
      </button>
    </div>
  );
}

function LocationHubModal({ isOpen, onClose, locationGroup, isDay, onSelectExperience, onAddInLocation }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  if (!isOpen || !locationGroup) return null;
  const items = locationGroup.items || [];
  const filtered = items.filter(i => activeFilter === 'ALL' || normalizeCategory(i.category) === activeFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <div className={`relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-[28px] p-6 ${isDay ? 'apple-glass-light text-zinc-900' : 'apple-glass-dark text-zinc-100'}`}>
        <div className="flex items-center justify-between pb-4 border-b border-current/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-55">Operating Location Hub</span>
            <h2 className="font-editorial text-3xl font-normal mt-0.5">{locationGroup.locationName}</h2>
            <p className="text-xs opacity-60">{locationGroup.region} • {locationGroup.country}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onAddInLocation(locationGroup)} className={`px-3.5 py-2 rounded-full text-xs font-medium ${isDay ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-950'}`}>
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Here
            </button>
            <button onClick={onClose} className="p-2 rounded-full border border-current/15"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex gap-2 my-4">
          {['ALL', 'Stay', 'Tour', 'Trek'].map(tab => (
            <button key={tab} onClick={() => setActiveFilter(tab)} className={`px-4 py-1.5 rounded-full text-xs font-medium ${activeFilter === tab ? (isDay ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-950') : 'border border-current/15 opacity-70'}`}>
              {tab === 'Stay' ? 'Villas & Apartments' : tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => (
            <div key={item.id} onClick={() => { onClose(); onSelectExperience(item); }} className={`cursor-pointer group rounded-2xl overflow-hidden ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
              <div className="relative h-44 overflow-hidden">
                <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-mono bg-white/90 text-zinc-950 font-medium">{item.price}</span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-base font-medium">{item.name}</h3>
                <p className="text-xs opacity-65 line-clamp-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExperienceDossierModal({ isOpen, onClose, item, isDay, onInquireBooking }) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [waypointIdx, setWaypointIdx] = useState(3);
  const [aerotourActive, setAerotourActive] = useState(false);

  useEffect(() => {
    setActiveImgIdx(0);
    setWaypointIdx(3);
    setAerotourActive(false);
  }, [item]);

  if (!isOpen || !item) return null;
  const gallery = item.images?.length ? item.images : [item.image];
  const profile = item.elevationProfile || [40, 120, 260, 420, 510, 390, 220, 80];
  const maxElev = Math.max(...profile, 100);
  const currentElev = profile[waypointIdx] ?? profile[0];
  const oxygenPct = Math.max(58, Math.round(100 - (currentElev / 5000) * 42));
  const proximityList = SON_DAVEN_PROXIMITY_MAP[item.locationName] || DEFAULT_PROXIMITY;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[28px] p-6 ${isDay ? 'apple-glass-light text-zinc-900' : 'apple-glass-dark text-zinc-100'}`}>
        <div className="flex items-start justify-between pb-4 border-b border-current/10">
          <div>
            <span className="text-[10px] font-mono-tech uppercase tracking-widest px-2.5 py-1 rounded-full border border-current/15 opacity-75">
              [ {item.category} • {item.subType || item.region} ]
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-normal mt-2">{item.name}</h2>
            <p className="text-xs opacity-60">{item.region} • {item.altitude}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAerotourActive(!aerotourActive)} className={`sd-bracket-btn px-3 py-1.5 rounded-[6px] font-mono-tech text-[10px] uppercase ${aerotourActive ? (isDay ? 'bg-black text-white' : 'bg-white text-black') : (isDay ? 'apple-pill-light' : 'apple-pill-dark')}`}>
              [ {aerotourActive ? 'PHOTO VIEW' : 'AEROTOUR 360°'} ]
            </button>
            <button onClick={onClose} className="sd-bracket-btn px-2.5 py-1.5 rounded-[6px] font-mono-tech text-[11px] border border-current/15">
              [ x ]
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden">
            {aerotourActive ? (
              <div className="w-full h-full bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center relative">
                <span className="font-mono-tech text-[10px] uppercase tracking-widest text-zinc-400">[ 3D SATELLITE AEROTOUR ]</span>
                <h4 className="font-editorial text-2xl mt-2">{item.locationName} — {item.lat}° N, {item.lng}° E</h4>
                <a href={`https://earth.google.com/web/@${item.lat},${item.lng},120a,950d,35y,0h,60t,0r`} target="_blank" rel="noopener noreferrer" className="mt-4 px-5 py-2.5 rounded-[6px] bg-white text-zinc-950 font-mono-tech text-xs uppercase">
                  [ LAUNCH GOOGLE EARTH ↗ ]
                </a>
              </div>
            ) : (
              <SonDavenPixelCanvasImage src={gallery[activeImgIdx] || item.image} alt="" className="w-full h-full" />
            )}
          </div>
        </div>

        <div className={`mt-4 p-4 rounded-2xl ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
          <div className="text-[10px] font-mono-tech uppercase opacity-55 mb-2">[ INFRASTRUCTURE & PROXIMITY TICKER ]</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {proximityList.map((p, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-current/10">
                <div className="font-editorial text-2xl font-normal leading-none">{p.minutes} {p.unit}</div>
                <div className="text-[11px] mt-1">{p.mode} to {p.landmark}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
          <div className="md:col-span-2 space-y-4">
            <p className="text-sm leading-relaxed opacity-80">{item.description}</p>
          </div>
          <div className={`p-4 rounded-2xl flex flex-col justify-between space-y-4 ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
            <div>
              <div className="text-[10px] opacity-55 font-mono uppercase">Tariff</div>
              <div className="text-xl font-medium">{item.price}</div>
            </div>
            <button onClick={() => onInquireBooking(item)} className={`w-full py-3 rounded-full font-medium text-xs uppercase flex items-center justify-center gap-2 ${isDay ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-950'}`}>
              <MessageCircle className="w-4 h-4" /> <span>Inquire on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppInquiryModal({ isOpen, onClose, isDay, preselectedItem, defaultDates, defaultGuests }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState(preselectedItem?.category || 'Stay');
  const [destination, setDestination] = useState(preselectedItem?.name || 'Gorai / Alibaug Sanctuary');
  const [dates, setDates] = useState(defaultDates || 'Nov 14 – Nov 18, 2026');
  const [guests, setGuests] = useState(defaultGuests || 2);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = [
      `*OPULENT OASIS — CONCIERGE INQUIRY*`,
      `• *Name:* ${name}`,
      `• *Contact:* ${phone}`,
      `• *Category:* ${category}`,
      `• *Experience:* ${destination}`,
      `• *Dates:* ${dates}`,
      `• *Guests:* ${guests}`,
      notes ? `• *Notes:* ${notes}` : ''
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <div className={`relative w-full max-w-lg rounded-[28px] p-6 ${isDay ? 'apple-glass-light text-zinc-900' : 'apple-glass-dark text-zinc-100'}`}>
        <div className="flex items-center justify-between pb-4 border-b border-current/10">
          <h3 className="font-editorial text-2xl font-normal">Bespoke Reservation Inquiry</h3>
          <button onClick={onClose} className="p-1 rounded"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
          <div>
            <label className="block text-[10px] font-mono-tech uppercase opacity-60 mb-1">Your Name *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Aarav Mehta" className={`w-full px-3 py-2.5 rounded-xl bg-transparent ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`} />
          </div>
          <div>
            <label className="block text-[10px] font-mono-tech uppercase opacity-60 mb-1">WhatsApp / Phone *</label>
            <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98200 00000" className={`w-full px-3 py-2.5 rounded-xl bg-transparent ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`} />
          </div>
          <button type="submit" className={`w-full py-3 rounded-full font-mono-tech text-xs uppercase ${isDay ? 'bg-black text-white' : 'bg-white text-black font-medium'}`}>
            [ DISPATCH TO WHATSAPP CONCIERGE ↗ ]
          </button>
        </form>
      </div>
    </div>
  );
}

function AddLocationExperienceModal({ isOpen, onClose, isDay, prefillLocation, onSaveListing, onTriggerGlobePick }) {
  const [locationName, setLocationName] = useState(prefillLocation?.locationName || '');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Stay');
  const [price, setPrice] = useState('₹30,000 / night');
  const [lat, setLat] = useState(prefillLocation?.lat || 19.24);
  const [lng, setLng] = useState(prefillLocation?.lng || 72.78);
  const [image, setImage] = useState('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80');

  useEffect(() => {
    if (prefillLocation) {
      if (prefillLocation.locationName) setLocationName(prefillLocation.locationName);
      if (typeof prefillLocation.lat === 'number') setLat(prefillLocation.lat);
      if (typeof prefillLocation.lng === 'number') setLng(prefillLocation.lng);
    }
  }, [prefillLocation]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveListing({
      id: `custom-${Date.now()}`,
      locationName: locationName || 'Custom Region',
      name: name || 'Sanctuary Estate',
      country: 'India',
      region: 'Custom Atlas Location',
      category,
      subType: 'Villa',
      price,
      numericPrice: 30000,
      lat: Number(lat),
      lng: Number(lng),
      altitude: '20m ASL',
      duration: '2 Nights',
      groupSize: 'Up to 8 Guests',
      image,
      images: [image],
      description: 'Newly added custom sanctuary listed via Host CMS.',
      published: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <div className={`relative w-full max-w-lg rounded-[28px] p-6 ${isDay ? 'apple-glass-light text-zinc-900' : 'apple-glass-dark text-zinc-100'}`}>
        <div className="flex items-center justify-between pb-3 border-b border-current/10">
          <h3 className="font-editorial text-2xl">Add Listing / Operating Location</h3>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase opacity-60 mb-1">Location Name</label>
            <input type="text" required value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="Alibaug Coast" className={`w-full px-3 py-2 rounded-xl bg-transparent ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`} />
          </div>
          <div>
            <label className="block text-[10px] uppercase opacity-60 mb-1">Property / Tour Title</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Villa Maris" className={`w-full px-3 py-2 rounded-xl bg-transparent ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`} />
          </div>
          <button type="submit" className={`w-full py-3 rounded-full font-mono text-xs uppercase ${isDay ? 'bg-black text-white' : 'bg-white text-black font-medium'}`}>
            [ SAVE TO ATLAS ]
          </button>
        </form>
      </div>
    </div>
  );
}

function HostPortalModal({ isOpen, onClose, isDay, isAuthenticated, onAuthenticate, onLogout, listings, setListings, inquiries, onOpenAddModal }) {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'oasis2026' || email === 'host@opulentoasis.co.in') {
      setError('');
      onAuthenticate();
    } else {
      setError('Invalid passcode. Use demo key: oasis2026');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <div className={`relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-[28px] p-6 ${isDay ? 'apple-glass-light text-zinc-900' : 'apple-glass-dark text-zinc-100'}`}>
        <div className="flex items-center justify-between pb-4 border-b border-current/10">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <h3 className="font-editorial text-2xl">{isAuthenticated ? 'Host Studio & Inventory CMS' : 'Host Portal Sign-In'}</h3>
          </div>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="max-w-sm mx-auto py-8 space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase opacity-60 mb-1">Host Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="host@opulentoasis.co.in" className={`w-full px-3 py-2 rounded-xl bg-transparent ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`} />
            </div>
            <div>
              <label className="block text-[10px] uppercase opacity-60 mb-1">Passcode (demo: oasis2026)</label>
              <input type="password" value={passcode} onChange={e => setPasscode(e.target.value)} placeholder="••••••••" className={`w-full px-3 py-2 rounded-xl bg-transparent ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`} />
            </div>
            {error && <p className="text-red-500 text-[11px]">{error}</p>}
            <button type="submit" className={`w-full py-2.5 rounded-xl font-mono text-xs uppercase ${isDay ? 'bg-black text-white' : 'bg-white text-black font-medium'}`}>
              Unlock Studio
            </button>
          </form>
        ) : (
          <div className="space-y-4 mt-4 text-xs">
            <div className="flex justify-between items-center">
              <span>Total Listings: {listings.length} • Inquiries: {inquiries.length}</span>
              <button onClick={() => { onClose(); onOpenAddModal(); }} className={`px-4 py-2 rounded-xl ${isDay ? 'bg-black text-white' : 'bg-white text-black'}`}>
                + Add New Listing
              </button>
            </div>
            <div className="space-y-2">
              {listings.map(item => (
                <div key={item.id} className={`p-3 rounded-xl flex items-center justify-between ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-[10px] opacity-60">{item.locationName} • {item.price}</div>
                    </div>
                  </div>
                  <button onClick={() => setListings(prev => prev.filter(x => x.id !== item.id))} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 5. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const [isDay, setIsDay] = useState(() => new Date().getHours() >= 6 && new Date().getHours() < 18);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'contact' | 'terms' | 'privacy' | '404'

  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('oo_listings_v10');
      return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
    } catch {
      return INITIAL_LISTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('oo_listings_v10', JSON.stringify(listings));
    } catch {}
  }, [listings]);

  const [surfaceStyle, setSurfaceStyle] = useState('vector');
  const [zoomLevel, setZoomLevel] = useState(0.5);
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [isPlayingMonths, setIsPlayingMonths] = useState(false);
  const [globeFocusCoords, setGlobeFocusCoords] = useState(null);

  const [showAqiOverlay, setShowAqiOverlay] = useState(false);
  const [showSunlightOverlay, setShowSunlightOverlay] = useState(false);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSubType, setSelectedSubType] = useState('ALL');
  const [openCategoryMenu, setOpenCategoryMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(250000);
  const [showPriceMenu, setShowPriceMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [checkInDay, setCheckInDay] = useState(14);
  const [checkOutDay, setCheckOutDay] = useState(18);
  const [guestsCount, setGuestsCount] = useState(2);

  const [activeLocationGroup, setActiveLocationGroup] = useState(null);
  const [locationHubOpen, setLocationHubOpen] = useState(false);
  const [activeExperience, setActiveExperience] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [prefillLocationForAdd, setPrefillLocationForAdd] = useState(null);
  const [pickCoordsMode, setPickCoordsMode] = useState(false);

  const [isHostAuthenticated, setIsHostAuthenticated] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    if (!isPlayingMonths) return;
    const timer = setInterval(() => {
      setSelectedMonth(prev => (prev + 1) % 12);
    }, 2200);
    return () => clearInterval(timer);
  }, [isPlayingMonths]);

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (!isHostAuthenticated && item.published === false) return false;
      if (selectedCountry !== 'All Countries' && item.country !== selectedCountry) return false;
      if (selectedCategory !== 'ALL' && normalizeCategory(item.category) !== selectedCategory) return false;
      if (selectedSubType !== 'ALL' && (item.subType || '').toLowerCase() !== selectedSubType.toLowerCase()) return false;
      if (item.numericPrice < minPrice || item.numericPrice > maxPrice) return false;
      if (searchQuery.trim() && !`${item.name} ${item.locationName} ${item.country}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [listings, isHostAuthenticated, selectedCountry, selectedCategory, selectedSubType, minPrice, maxPrice, searchQuery]);

  const upcomingDeparturesList = useMemo(() => {
    const list = [];
    filteredListings.forEach(item => {
      (item.upcomingDepartures || []).forEach(dep => {
        list.push({ ...dep, parentItem: item });
      });
    });
    return list;
  }, [filteredListings]);

  return (
    <div className={`font-sans-ui min-h-screen w-full transition-colors duration-300 ${isDay ? 'bg-[#f7f6f2] text-[#141414]' : 'bg-[#111114] text-[#f4f3ef]'}`}>
      <style>{AWWWARDS_STYLE_CSS}</style>

      {/* LOCKED HEADER */}
      <header className="relative z-40 px-3 sm:px-6 pt-3">
        <div className={`mx-auto max-w-[1380px] rounded-[12px] px-4 sm:px-6 py-3.5 ${isDay ? 'apple-glass-light' : 'apple-glass-dark'}`}>
          <div className="grid grid-cols-3 items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className={`inquire-live-glass relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-[6px] font-mono-tech text-xs uppercase tracking-wider ${isDay ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'}`}
              >
                <span className="inquire-shimmer-bar absolute inset-y-0 w-12 opacity-60" />
                <span>⊙ INQUIRE</span>
              </button>
              <button onClick={() => setCurrentPage('contact')} className="hidden sm:inline font-mono-tech text-xs opacity-70 hover:opacity-100">
                Contact
              </button>
            </div>

            <div onClick={() => setCurrentPage('home')} className="flex flex-col items-center justify-center text-center cursor-pointer">
              <StrataLogoGlyph isDay={isDay} />
              <h1 className="font-sans-ui mt-1 text-base sm:text-xl font-medium tracking-[0.22em] uppercase">OPULENT OASIS</h1>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setHostModalOpen(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] font-mono-tech text-xs ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                <Shield className="w-3.5 h-3.5" /> <span className="hidden md:inline">Host</span>
              </button>
              <div className={`flex items-center p-1 rounded-[8px] ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                <button onClick={() => setIsDay(true)} className={`p-1.5 rounded-[5px] ${isDay ? 'bg-[#111111] text-white' : 'opacity-45'}`}><Sun className="w-3.5 h-3.5" /></button>
                <button onClick={() => setIsDay(false)} className={`p-1.5 rounded-[5px] ${!isDay ? 'bg-white text-[#111111]' : 'opacity-45'}`}><Moon className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* RENDER CURRENT PAGE */}
      {currentPage === 'contact' && <ContactPage isDay={isDay} onNavigate={setCurrentPage} />}
      {currentPage === 'terms' && <TermsPage isDay={isDay} onNavigate={setCurrentPage} />}
      {currentPage === 'privacy' && <PrivacyPage isDay={isDay} onNavigate={setCurrentPage} />}
      {currentPage === '404' && <NotFoundPage isDay={isDay} onNavigate={setCurrentPage} />}

      {currentPage === 'home' && (
        <main className="mx-auto max-w-[1380px] px-3 sm:px-6 pt-3 pb-14 space-y-4">
          <div className={`relative w-full h-[65vh] min-h-[520px] rounded-[12px] overflow-hidden border ${isDay ? 'strata-dot-grid-light border-black/10' : 'strata-dot-grid-dark border-white/10'}`}>
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1 p-1.5 rounded-[10px] ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
              {[{ id: 'vector', label: 'MAP' }, { id: 'satellite', label: 'SAT' }, { id: 'topo', label: 'TOPO' }, { id: 'night', label: 'NIGHT' }].map(layer => (
                <button key={layer.id} onClick={() => setSurfaceStyle(layer.id)} className={`px-2.5 py-2 rounded-[6px] text-[10px] font-mono-tech uppercase ${surfaceStyle === layer.id ? (isDay ? 'bg-[#111111] text-white' : 'bg-white text-[#111111] font-semibold') : 'opacity-55'}`}>
                  {layer.label}
                </button>
              ))}
            </div>

            <StrataGlobeCanvas
              isDay={isDay}
              surfaceStyle={surfaceStyle}
              selectedMonth={selectedMonth}
              listings={filteredListings}
              onSelectLocationGroup={(loc) => { setActiveLocationGroup(loc); setLocationHubOpen(true); }}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              pickCoordsMode={pickCoordsMode}
              onPickCoords={(c) => { setPickCoordsMode(false); setPrefillLocationForAdd({ lat: c.lat, lng: c.lng }); setAddModalOpen(true); }}
              showAqiOverlay={showAqiOverlay}
              showSunlightOverlay={showSunlightOverlay}
              showWeatherOverlay={showWeatherOverlay}
              focusCoords={globeFocusCoords}
            />
          </div>

          {/* MONTH BAR & WHERE TO GO */}
          <section className={`rounded-[12px] p-4 sm:p-6 space-y-4 ${isDay ? 'apple-glass-light' : 'apple-glass-dark'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2.5 font-mono-tech">
              <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); const c = WORLD_COUNTRIES.find(x => x.name === e.target.value); if (c) setGlobeFocusCoords({ lat: c.lat, lng: c.lng }); }} className={`px-3 py-2 rounded-[10px] bg-transparent text-xs ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                {WORLD_COUNTRIES.map(c => <option key={c.name} value={c.name} className={isDay ? 'text-black' : 'text-black'}>{c.name}</option>)}
              </select>

              <div className={`relative flex-1 min-w-[300px] rounded-[10px] px-4 py-2 overflow-x-auto ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                <span className="block text-[10px] opacity-40 leading-none mb-1">2026</span>
                <div className="grid grid-cols-12 gap-1 items-center">
                  {MONTHS.map((m, idx) => (
                    <button key={m.short} onClick={() => setSelectedMonth(idx)} className="relative flex flex-col items-center py-1">
                      {selectedMonth === idx && <span className={`absolute -top-2 bottom-0 w-[2px] ${isDay ? 'bg-[#111111]' : 'bg-white'}`} />}
                      <span className={`text-[11px] ${selectedMonth === idx ? 'font-semibold' : 'opacity-55'}`}>{m.short}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setIsPlayingMonths(!isPlayingMonths)} className={`px-4 py-2 rounded-[10px] text-xs font-mono-tech flex items-center gap-2 ${isPlayingMonths ? (isDay ? 'bg-black text-white' : 'bg-white text-black') : (isDay ? 'apple-pill-light' : 'apple-pill-dark')}`}>
                {isPlayingMonths ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingMonths ? 'Pause' : 'Play'}</span>
              </button>
            </div>
          </section>

          {/* UPCOMING TOURS & TREKS */}
          <section className={`rounded-[12px] p-4 sm:p-6 space-y-4 ${isDay ? 'apple-glass-light' : 'apple-glass-dark'}`}>
            <div className="flex items-center justify-between border-b border-current/10 pb-3">
              <h3 className="font-sans-ui text-lg font-medium">Upcoming Tours & Treks</h3>
              <span className="text-xs font-mono-tech opacity-50">2026 Calendar</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {upcomingDeparturesList.map(dep => (
                <div key={dep.id} onClick={() => setActiveExperience(dep.parentItem)} className={`cursor-pointer rounded-[10px] p-4 ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase opacity-65">
                    <span>{dep.type} • {dep.parentItem.locationName}</span>
                    <span>{dep.spotsLeft} Spots Left</span>
                  </div>
                  <h4 className="text-sm font-medium mt-1">{dep.title}</h4>
                  <div className="text-xs font-mono opacity-60 mt-1">{dep.dateRange} • {dep.duration}</div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-current/10 text-xs font-mono">
                    <span>{dep.price}</span>
                    <span className="underline">Explore →</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* THREE-WINDOW TIER SHOWCASE */}
          {(() => {
            const [activeTab, setActiveTab] = useState('Stay');
            const catListings = listings.filter(i => normalizeCategory(i.category) === activeTab);
            const [slideIdx, setSlideIdx] = useState(0);

            return (
              <section className="space-y-6 pt-6">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-current/10 pb-4">
                  <div>
                    <span className="text-xs font-mono-tech uppercase tracking-[0.2em] opacity-60">Curated Collection</span>
                    <h2 className="font-editorial text-4xl sm:text-6xl font-normal mt-1">Choose Your Experience</h2>
                  </div>
                  <div className={`flex items-center p-1.5 rounded-[12px] text-sm font-medium ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                    {['Stay', 'Tour', 'Trek'].map(cat => (
                      <button key={cat} onClick={() => { setActiveTab(cat); setSlideIdx(0); }} className={`px-5 py-2.5 rounded-[10px] ${activeTab === cat ? (isDay ? 'bg-black text-white' : 'bg-white text-black font-semibold') : 'opacity-65'}`}>
                        {cat === 'Stay' ? 'Stays' : cat === 'Tour' ? 'Tours' : 'Treks'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Essential Sanctuary', 'Signature Estate', 'Flagship Masterpiece'].map((tier, cIdx) => {
                    const item = catListings[(slideIdx + cIdx) % Math.max(1, catListings.length)] || catListings[0];
                    if (!item) return null;
                    return (
                      <div key={tier} onClick={() => setActiveExperience(item)} className={`cursor-pointer group rounded-[20px] overflow-hidden border ${isDay ? 'apple-glass-light border-black/10' : 'apple-glass-dark border-white/10'}`}>
                        <div className="relative h-80 sm:h-96 overflow-hidden">
                          <img src={item.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                          <div className="absolute top-4 left-4">
                            <span className="px-3.5 py-1.5 rounded-[8px] text-xs font-mono uppercase bg-black/75 text-white">{tier}</span>
                          </div>
                          <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5">
                            <div className="text-xs font-mono opacity-80">{item.locationName} • {item.price}</div>
                            <h3 className="font-editorial text-3xl font-normal">{item.name}</h3>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}
        </main>
      )}

      {/* FOOTER MULTI-PAGE NAV */}
      <footer className={`mt-16 border-t py-8 px-4 text-center font-mono-tech text-xs opacity-70 ${isDay ? 'border-black/10' : 'border-white/10'}`}>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6">
          <button onClick={() => setCurrentPage('home')}>Explore Atlas</button>
          <button onClick={() => setCurrentPage('contact')}>Contact Concierge</button>
          <button onClick={() => setCurrentPage('terms')}>Terms & Conditions</button>
          <button onClick={() => setCurrentPage('privacy')}>Privacy Policy</button>
          <button onClick={() => setCurrentPage('404')}>404 Test</button>
        </div>
        <p className="mt-4 text-[10px] opacity-50">© 2026 Opulent Oasis Hospitality Group. All rights reserved.</p>
      </footer>

      {/* MODALS */}
      <LocationHubModal isOpen={locationHubOpen} onClose={() => setLocationHubOpen(false)} locationGroup={activeLocationGroup} isDay={isDay} onSelectExperience={setActiveExperience} onAddInLocation={(g) => { setLocationHubOpen(false); setPrefillLocationForAdd(g); setAddModalOpen(true); }} />
      <ExperienceDossierModal isOpen={Boolean(activeExperience)} onClose={() => setActiveExperience(null)} item={activeExperience} isDay={isDay} onInquireBooking={() => setInquiryModalOpen(true)} />
      <WhatsAppInquiryModal isOpen={inquiryModalOpen} onClose={() => setInquiryModalOpen(false)} isDay={isDay} preselectedItem={activeExperience} />
      <AddLocationExperienceModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} isDay={isDay} prefillLocation={prefillLocationForAdd} onSaveListing={(item) => setListings(prev => [item, ...prev])} onTriggerGlobePick={() => setPickCoordsMode(true)} />
      <HostPortalModal isOpen={hostModalOpen} onClose={() => setHostModalOpen(false)} isDay={isDay} isAuthenticated={isHostAuthenticated} onAuthenticate={() => setIsHostAuthenticated(true)} onLogout={() => setIsHostAuthenticated(false)} listings={listings} setListings={setListings} inquiries={inquiries} onOpenAddModal={() => setAddModalOpen(true)} />
    </div>
  );
}