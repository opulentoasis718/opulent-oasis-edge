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
// 0. AWWWARDS TYPOGRAPHY & LIQUID-GLASS STYLING ENGINE
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

  .apple-glass-dark {
    background: linear-gradient(135deg, rgba(34, 34, 40, 0.78) 0%, rgba(18, 18, 22, 0.68) 100%);
    backdrop-filter: blur(36px) saturate(190%);
    -webkit-backdrop-filter: blur(36px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.22);
  }

  .apple-glass-light {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(244, 243, 239, 0.74) 100%);
    backdrop-filter: blur(36px) saturate(190%);
    -webkit-backdrop-filter: blur(36px) saturate(190%);
    border: 1px solid rgba(20, 20, 20, 0.12);
    box-shadow: 0 12px 32px rgba(20, 20, 20, 0.07), inset 0 1px 0 0 rgba(255, 255, 255, 0.95);
  }

  .apple-pill-dark {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.14);
  }

  .apple-pill-light {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.85) 0%, rgba(234, 232, 227, 0.65) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(20, 20, 20, 0.12);
  }

  .strata-dot-grid-light {
    background-color: #f4f3ef;
    background-image: radial-gradient(rgba(20, 20, 20, 0.14) 1px, transparent 1px);
    background-size: 16px 16px;
  }

  .strata-dot-grid-dark {
    background-color: #141417;
    background-image: radial-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1px);
    background-size: 16px 16px;
  }
`;

// ============================================================================
// 1. INITIAL SEED LISTINGS (FALLBACK & MERGED WITH CLOUDFLARE D1)
// ============================================================================
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
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    description: 'An architectural Portuguese-inspired courtyard villa tucked behind private casuarina groves on Gorai coast.',
    published: true
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
    terrainType: 'Tropical Mango Estate',
    baseIndex: 9.5,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    description: '20 minutes by private speedboat from the Gateway of India, spanning 3 acres of heirloom mango orchards.',
    published: true
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
    terrainType: 'Basalt Cliff Overhang',
    baseIndex: 9.3,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    description: 'Ascend ancient rock-cut steps to the 1,424m Kokankada vertical basalt amphitheater.',
    published: true
  },
  {
    id: 'udaipur-tour-1',
    name: 'Aravalli Royal Heritage & Thar Desert Odyssey',
    locationName: 'Udaipur & Thar',
    country: 'India',
    region: 'Rajasthan Royal Circuit',
    category: 'Tour',
    subType: 'Cultural',
    price: '₹95,000 / person',
    numericPrice: 95000,
    lat: 24.58,
    lng: 73.68,
    altitude: '598m ASL',
    duration: '6 Days / 5 Nights',
    groupSize: 'Private Charter (2–8)',
    terrainType: 'Lake Palaces & Dunes',
    baseIndex: 9.6,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    description: 'Private vintage car convoys, lakeside palace dining, and starlit tented camps across the Thar desert.',
    published: true
  },
  {
    id: 'spiti-trek-1',
    name: 'Pin Parvati & Spiti High-Altitude Monastery Traverse',
    locationName: 'Spiti Valley',
    country: 'India',
    region: 'Himachal Trans-Himalaya',
    category: 'Trek',
    subType: 'Himalayan',
    price: '₹64,000 / person',
    numericPrice: 64000,
    lat: 32.24,
    lng: 78.03,
    altitude: '4,270m ASL',
    duration: '8 Days / 7 Nights',
    groupSize: 'Max 6 Explorers',
    terrainType: 'High Cold Desert',
    baseIndex: 9.4,
    image: 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1200&q=80',
    description: 'Traverse ancient silk-route gompas perched on sheer canyon spires with luxury geodesic basecamps.',
    published: true
  },
  {
    id: 'paro-tour-1',
    name: 'Kingdom of the Thunder Dragon Sacred Valley Tour',
    locationName: 'Paro Valley',
    country: 'Bhutan',
    region: 'Paro, Thimphu & Punakha',
    category: 'Tour',
    subType: 'Spiritual',
    price: '₹1,85,000 / person',
    numericPrice: 185000,
    lat: 27.42,
    lng: 89.41,
    altitude: '3,120m ASL',
    duration: '7 Days / 6 Nights',
    groupSize: 'Up to 6 Guests',
    terrainType: 'Eastern Himalayan Pine',
    baseIndex: 9.8,
    image: 'https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?auto=format&fit=crop&w=1200&q=80',
    description: 'Helicopter transfers through misty Himalayan valleys and private blessings at Taktsang Monastery.',
    published: true
  },
  {
    id: 'zermatt-stay-1',
    name: 'Chalet Matterhorn Zenith — Ski-In Alpine Sanctuary',
    locationName: 'Zermatt Alps',
    country: 'Switzerland',
    region: 'Valais Canton, Swiss Alps',
    category: 'Stay',
    subType: 'Chalet',
    price: '₹2,10,000 / night',
    numericPrice: 210000,
    lat: 46.02,
    lng: 7.74,
    altitude: '1,620m ASL',
    duration: 'Min 4 Nights',
    groupSize: 'Up to 10 Guests',
    terrainType: 'Glacial Alpine Peak',
    baseIndex: 9.9,
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
    description: 'Unobstructed glass-walled cedar spa overlooking the east face of the Matterhorn.',
    published: true
  },
  {
    id: 'lofoten-tour-1',
    name: 'Lofoten Arctic Aurora & Fjord Yacht Expedition',
    locationName: 'Lofoten',
    country: 'Norway',
    region: 'Nordland Arctic Circle',
    category: 'Tour',
    subType: 'Expedition',
    price: '₹2,40,000 / person',
    numericPrice: 240000,
    lat: 68.2,
    lng: 13.88,
    altitude: '0–650m ASL',
    duration: '5 Days / 4 Nights',
    groupSize: 'Max 8 Guests',
    terrainType: 'Arctic Granite Fjord',
    baseIndex: 9.7,
    image: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    description: 'Sail aboard an ice-class explorer yacht beneath dancing solar auroras and sheer granite peaks.',
    published: true
  }
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Helper to convert lat/lng to 3D sphere coordinates
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Procedural texture generator for the 3D Globe
function createProceduralGlobeTexture(surfaceStyle, visualMode, isDay) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Ocean base
  if (surfaceStyle === 'sat') {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0c1f33');
    grad.addColorStop(0.5, '#12314d');
    grad.addColorStop(1, '#091929');
    ctx.fillStyle = grad;
  } else if (surfaceStyle === 'topo') {
    ctx.fillStyle = '#151b18';
  } else if (surfaceStyle === 'night') {
    ctx.fillStyle = '#07080c';
  } else {
    ctx.fillStyle = isDay ? '#d8d5cc' : '#181a20';
  }
  ctx.fillRect(0, 0, 1024, 512);

  // Graticule grid
  ctx.strokeStyle = surfaceStyle === 'sat' ? 'rgba(120, 200, 255, 0.12)' : 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Simplified stylized continent polygons (Equirectangular approximations)
  const continents = [
    // Africa
    [[480, 190], [560, 185], [615, 240], [595, 345], [550, 395], [515, 340], [465, 260]],
    // Eurasia
    [[470, 175], [520, 100], [640, 85], [820, 105], [875, 185], [790, 255], [725, 295], [690, 235], [635, 245], [580, 190]],
    // India Subcontinent highlight
    [[695, 215], [745, 220], [725, 305], [695, 255]],
    // North America
    [[120, 95], [295, 85], [335, 190], [255, 245], [175, 195]],
    // South America
    [[275, 265], [355, 285], [345, 425], [295, 440], [265, 335]],
    // Australia
    [[775, 335], [885, 335], [890, 415], [785, 405]]
  ];

  ctx.fillStyle =
    surfaceStyle === 'sat'
      ? '#2d4c3b'
      : surfaceStyle === 'topo'
      ? '#28362c'
      : surfaceStyle === 'night'
      ? '#141824'
      : isDay
      ? '#b8b4a8'
      : '#262932';
  ctx.strokeStyle =
    surfaceStyle === 'sat'
      ? 'rgba(134, 239, 172, 0.45)'
      : 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.8;

  continents.forEach((poly) => {
    ctx.beginPath();
    poly.forEach(([px, py], idx) => {
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Dot matrix / radial vector dashes across continents
  ctx.fillStyle =
    visualMode === 'Color'
      ? 'rgba(74, 222, 128, 0.45)'
      : 'rgba(255, 255, 255, 0.28)';
  for (let x = 16; x < 1024; x += 18) {
    for (let y = 16; y < 512; y += 18) {
      if (visualMode === 'Radial') {
        ctx.fillRect(x, y, 4, 1.5);
      } else if (visualMode === 'Circles') {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ============================================================================
// 2. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const [isDay, setIsDay] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [d1Connected, setD1Connected] = useState(false);

  // Guaranteed Tailwind CSS Runtime Loader (ensures styling works even if index.html lacks the script tag)
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="tailwindcss"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tailwindcss.com';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Filter & Search States
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState(250000);
  const [selectedCountry, setSelectedCountry] = useState('All Countries');

  // Globe & Telemetry States
  const [surfaceStyle, setSurfaceStyle] = useState('sat'); // 'sat' | 'topo' | 'night' | 'map'
  const [visualMode, setVisualMode] = useState('Radial'); // 'Radial' | 'Color' | 'Circles' | 'Dots'
  const [aqiOn, setAqiOn] = useState(false);
  const [sunlightOn, setSunlightOn] = useState(false);
  const [weatherOn, setWeatherOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.5);
  const [selectedMonth, setSelectedMonth] = useState(10); // Nov default
  const [isPlayingMonths, setIsPlayingMonths] = useState(false);

  // Modals & Interactive Selections
  const [selectedLocationHub, setSelectedLocationHub] = useState(null);
  const [activeExperience, setActiveExperience] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [hostPasscode, setHostPasscode] = useState('');
  const [isHostAuthenticated, setIsHostAuthenticated] = useState(false);
  const [hostPasscodeError, setHostPasscodeError] = useState('');

  // New Listing Form State (Saves to Cloudflare D1)
  const [newListing, setNewListing] = useState({
    name: '',
    locationName: '',
    country: 'India',
    region: '',
    category: 'Stay',
    subType: 'Villa',
    price: '₹45,000 / night',
    numericPrice: 45000,
    lat: 19.07,
    lng: 72.87,
    altitude: '25m ASL',
    duration: 'Min 2 Nights',
    groupSize: 'Up to 8 Guests',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    description: ''
  });
  const [savingToD1, setSavingToD1] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    destination: 'Gorai Coast / Alibaug',
    dates: 'Nov 14–18',
    guests: '2 Guests',
    notes: ''
  });

  // 3D Globe Refs & Projected Beacons
  const mountRef = useRef(null);
  const globeGroupRef = useRef(null);
  const cameraRef = useRef(null);
  const targetRotationRef = useRef({ x: 0.32, y: -2.15 });
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const [projectedBeacons, setProjectedBeacons] = useState([]);

  // Fetch Live Listings from Cloudflare D1 Edge API (/api/listings)
  useEffect(() => {
    fetch('/api/listings')
      .then((res) => {
        if (!res.ok) throw new Error('API fallback');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setD1Connected(true);
          const normalizedD1 = data.map((d) => ({
            ...d,
            locationName: d.locationName || d.location_name || 'Sanctuary',
            numericPrice: Number(d.numericPrice || d.numeric_price || 32000),
            subType: d.subType || d.sub_type || 'Villa',
            groupSize: d.groupSize || d.group_size || 'Up to 8 Guests',
            lat: Number(d.lat || 19.24),
            lng: Number(d.lng || 72.78),
            published: d.published !== 0 && d.published !== false
          }));
          // Merge D1 records with initial global atlas destinations so the globe always has rich pins
          const existingIds = new Set(normalizedD1.map((item) => item.id));
          const merged = [
            ...normalizedD1,
            ...INITIAL_LISTINGS.filter((item) => !existingIds.has(item.id))
          ];
          setListings(merged);
        }
      })
      .catch(() => {
        setD1Connected(false);
      });
  }, []);

  // Seasonal Month Auto-Player
  useEffect(() => {
    if (!isPlayingMonths) return;
    const interval = setInterval(() => {
      setSelectedMonth((prev) => (prev + 1) % 12);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlayingMonths]);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (!item.published) return false;
      if (categoryFilter !== 'ALL' && item.category.toUpperCase() !== categoryFilter) {
        return false;
      }
      if (selectedCountry !== 'All Countries' && item.country !== selectedCountry) {
        return false;
      }
      if (item.numericPrice && item.numericPrice > maxPriceFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const match =
          item.name?.toLowerCase().includes(q) ||
          item.locationName?.toLowerCase().includes(q) ||
          item.country?.toLowerCase().includes(q) ||
          item.region?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [listings, categoryFilter, selectedCountry, maxPriceFilter, searchQuery]);

  // Unique Locations for 3D Globe Beacons
  const uniqueLocations = useMemo(() => {
    const map = new Map();
    filteredListings.forEach((item) => {
      const key = item.locationName;
      if (!map.has(key)) {
        map.set(key, {
          locationName: item.locationName,
          country: item.country,
          region: item.region,
          lat: item.lat,
          lng: item.lng,
          items: [item]
        });
      } else {
        map.get(key).items.push(item);
      }
    });
    return Array.from(map.values());
  }, [filteredListings]);

  // Initialize and Animate Three.js 3D Globe
  useEffect(() => {
    if (currentPage !== 'home') return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.z = 5.4;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = targetRotationRef.current.x;
    globeGroup.rotation.y = targetRotationRef.current.y;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xa5f3fc, 1.3);
    dirLight.position.set(5, 4, 6);
    scene.add(dirLight);

    // Core Textured Sphere
    const radius = 1.72;
    const sphereGeo = new THREE.SphereGeometry(radius, 64, 64);
    const globeTex = createProceduralGlobeTexture(surfaceStyle, visualMode, isDay);
    const sphereMat = new THREE.MeshPhongMaterial({
      map: globeTex,
      shininess: 18,
      specular: new THREE.Color(0x334155)
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // Atmospheric Rim Halo
    const haloGeo = new THREE.SphereGeometry(radius * 1.03, 64, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: aqiOn ? 0x4ade80 : sunlightOn ? 0xfacc15 : weatherOn ? 0x38bdf8 : 0x64748b,
      transparent: true,
      opacity: aqiOn || sunlightOn || weatherOn ? 0.18 : 0.08,
      side: THREE.BackSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation & 2D Beacon Projection Loop
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Smooth damping rotation
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.0006;
      }
      globeGroup.rotation.x += (targetRotationRef.current.x - globeGroup.rotation.x) * 0.08;
      globeGroup.rotation.y += (targetRotationRef.current.y - globeGroup.rotation.y) * 0.08;

      // Smooth camera zoom
      const desiredZ = 5.6 - Math.min(Math.max(zoomLevel, 0.5), 4) * 0.62;
      camera.position.z += (desiredZ - camera.position.z) * 0.1;

      renderer.render(scene, camera);

      // Project 3D coordinates of unique locations to 2D overlay labels
      const w = container.clientWidth;
      const h = container.clientHeight;
      const nextBeacons = [];

      uniqueLocations.forEach((loc) => {
        const localVec = latLngToVector3(loc.lat, loc.lng, radius * 1.01);
        const worldVec = localVec.clone().applyEuler(globeGroup.rotation);

        // Check if on front hemisphere facing camera
        if (worldVec.z > 0.15) {
          const projected = worldVec.clone().project(camera);
          const x = (projected.x * 0.5 + 0.5) * w;
          const y = (-(projected.y * 0.5) + 0.5) * h;
          nextBeacons.push({
            ...loc,
            x,
            y
          });
        }
      });
      setProjectedBeacons(nextBeacons);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [currentPage, surfaceStyle, visualMode, isDay, aqiOn, sunlightOn, weatherOn, zoomLevel, uniqueLocations]);

  // Pointer Drag Handlers for 3D Globe
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  };
  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevPointerRef.current.x;
    const dy = e.clientY - prevPointerRef.current.y;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
    targetRotationRef.current.y += dx * 0.006;
    targetRotationRef.current.x = Math.max(
      -1.1,
      Math.min(1.1, targetRotationRef.current.x + dy * 0.006)
    );
  };
  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Country Focus Rotation
  const handleCountrySelect = (countryName) => {
    setSelectedCountry(countryName);
    if (countryName === 'India') {
      targetRotationRef.current = { x: 0.34, y: -2.15 };
    } else if (countryName === 'Switzerland' || countryName === 'Norway') {
      targetRotationRef.current = { x: 0.75, y: -1.4 };
    } else if (countryName === 'Bhutan') {
      targetRotationRef.current = { x: 0.42, y: -2.42 };
    }
  };

  // Host Portal Authentication & D1 Submission
  const handleHostLogin = (e) => {
    e.preventDefault();
    if (hostPasscode === 'oasis2026') {
      setIsHostAuthenticated(true);
      setHostPasscodeError('');
    } else {
      setHostPasscodeError('Invalid passcode. Use demo passcode: oasis2026');
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSavingToD1(true);
    setSaveSuccessMessage('');

    const payload = {
      ...newListing,
      id: `oasis-${Date.now()}`,
      numericPrice: Number(newListing.numericPrice) || 45000,
      lat: Number(newListing.lat) || 19.07,
      lng: Number(newListing.lng) || 72.87,
      published: true
    };

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setD1Connected(true);
        setSaveSuccessMessage('Saved directly to Cloudflare D1 Edge Database!');
      } else {
        setSaveSuccessMessage('Added to live session (Bind D1 in Cloudflare dashboard for persistence).');
      }
    } catch {
      setSaveSuccessMessage('Added to live session.');
    } finally {
      setListings((prev) => [payload, ...prev]);
      setSavingToD1(false);
      setNewListing({
        ...newListing,
        name: '',
        locationName: '',
        region: '',
        description: ''
      });
    }
  };

  // WhatsApp Concierge Dispatch
  const openWhatsAppInquiry = (subjectText) => {
    const text = encodeURIComponent(
      `Hello Opulent Oasis Concierge, I would like to inquire about: ${subjectText}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  return (
    <div
      className={`font-sans-ui min-h-screen w-full transition-colors duration-300 ${
        isDay ? 'bg-[#f4f3ef] text-[#141414]' : 'bg-[#0e0f12] text-[#f4f3ef]'
      }`}
    >
      <style>{AWWWARDS_STYLE_CSS}</style>

      {/* =====================================================================
          TOP NAVIGATION & FILTER BAR (EXACT AWWWARDS GLASS LAYOUT)
      ===================================================================== */}
      <header className="relative z-40 px-3 sm:px-6 pt-3">
        <div
          className={`mx-auto max-w-[1380px] rounded-[18px] px-4 sm:px-6 py-3.5 space-y-3 ${
            isDay ? 'apple-glass-light' : 'apple-glass-dark'
          }`}
        >
          {/* Row 1: Inquire | Brand Title | Host + Theme */}
          <div className="flex items-center justify-between border-b border-current/10 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono-tech text-xs uppercase tracking-wider transition ${
                  isDay ? 'apple-pill-light hover:bg-black/10' : 'apple-pill-dark hover:bg-white/15'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                INQUIRE
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className="hidden sm:inline font-mono-tech text-xs opacity-70 hover:opacity-100 transition"
              >
                Concierge
              </button>
            </div>

            <div
              onClick={() => setCurrentPage('home')}
              className="flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 opacity-70 mb-0.5 group-hover:rotate-45 transition" />
              <span className="font-sans-ui text-base sm:text-xl font-normal tracking-[0.28em] uppercase">
                OPULENT OASIS
              </span>
              <span className="font-mono-tech text-[9px] tracking-[0.3em] uppercase opacity-55">
                STAYS • TOUR • TREK
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setHostModalOpen(true)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono-tech text-xs transition ${
                  isDay ? 'apple-pill-light' : 'apple-pill-dark'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Host</span>
              </button>
              <div
                className={`flex items-center p-1 rounded-full ${
                  isDay ? 'apple-pill-light' : 'apple-pill-dark'
                }`}
              >
                <button
                  onClick={() => setIsDay(true)}
                  className={`p-1.5 rounded-full transition ${
                    isDay ? 'bg-[#111111] text-white' : 'opacity-45'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsDay(false)}
                  className={`p-1.5 rounded-full transition ${
                    !isDay ? 'bg-white text-[#111111]' : 'opacity-45'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Category Pill Switcher + Search + Date + Budget */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-0.5">
            <div
              className={`flex items-center p-1 rounded-full ${
                isDay ? 'apple-pill-light' : 'apple-pill-dark'
              }`}
            >
              {['ALL', 'STAY', 'TOUR', 'TREK'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setCurrentPage('home');
                  }}
                  className={`px-3.5 py-1 rounded-full font-mono-tech text-[11px] tracking-wider transition ${
                    categoryFilter === cat
                      ? isDay
                        ? 'bg-[#141414] text-white font-medium'
                        : 'bg-white text-[#141414] font-medium'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input Pill */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full w-60 sm:w-64 ${
                isDay ? 'apple-pill-light' : 'apple-pill-dark'
              }`}
            >
              <Search className="w-3.5 h-3.5 opacity-60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations, villas, treks..."
                className="bg-transparent text-xs w-full focus:outline-none placeholder:opacity-50"
              />
            </div>

            {/* Date / Window Pill */}
            <button
              onClick={() => setInquiryModalOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono-tech text-[11px] ${
                isDay ? 'apple-pill-light' : 'apple-pill-dark'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              <span>{MONTHS[selectedMonth]} 14–18 • 2G</span>
            </button>

            {/* Price Filter Pill */}
            <button
              onClick={() =>
                setMaxPriceFilter((prev) => (prev >= 250000 ? 60000 : prev + 65000))
              }
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono-tech text-[11px] ${
                isDay ? 'apple-pill-light' : 'apple-pill-dark'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 opacity-70" />
              <span>₹0k – ₹{Math.round(maxPriceFilter / 1000)}k</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          HOME VIEW: 3D BLACK MAP GLOBE + TELEMETRY CONTROLS + SANCTUARY GRID
      ===================================================================== */}
      {currentPage === 'home' && (
        <main className="mx-auto max-w-[1380px] px-3 sm:px-6 pt-3 pb-16 space-y-4">
          {/* 3D GLOBE VIEWPORT */}
          <div
            className={`relative w-full h-[64vh] min-h-[500px] rounded-[22px] overflow-hidden border select-none ${
              isDay
                ? 'strata-dot-grid-light border-black/10'
                : 'strata-dot-grid-dark border-white/10'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Three.js Canvas Mount */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Projected 2D Interactive Location Beacons on 3D Globe */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {projectedBeacons.map((beacon) => (
                <button
                  key={beacon.locationName}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLocationHub(beacon);
                  }}
                  style={{
                    transform: `translate3d(${beacon.x}px, ${beacon.y}px, 0)`
                  }}
                  className="pointer-events-auto -translate-x-1/2 -translate-y-1/2 absolute flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18191e]/90 hover:bg-black text-white border border-white/20 shadow-lg backdrop-blur-md transition-transform hover:scale-110"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
                  <span className="font-sans-ui text-[11px] font-medium whitespace-nowrap">
                    {beacon.locationName}
                  </span>
                </button>
              ))}
            </div>

            {/* LEFT SURFACE SWITCHER (SAT | TOPO | NIGHT | MAP) */}
            <div
              className={`absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-1.5 rounded-[16px] ${
                isDay ? 'apple-glass-light' : 'apple-glass-dark'
              }`}
            >
              {[
                { id: 'sat', label: 'SAT' },
                { id: 'topo', label: 'TOPO' },
                { id: 'night', label: 'NIGHT' },
                { id: 'map', label: 'MAP' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSurfaceStyle(st.id)}
                  className={`px-2.5 py-2 rounded-[10px] font-mono-tech text-[10px] tracking-wider transition ${
                    surfaceStyle === st.id
                      ? isDay
                        ? 'bg-[#141414] text-white font-semibold'
                        : 'bg-white text-[#141414] font-semibold'
                      : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* RIGHT ZOOM SWITCHER (4x | 3x | 2x | 1x | 0.5x) */}
            <div
              className={`absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-1.5 rounded-[16px] ${
                isDay ? 'apple-glass-light' : 'apple-glass-dark'
              }`}
            >
              {[4, 3, 2, 1, 0.5].map((z) => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`px-2.5 py-1.5 rounded-[10px] font-mono-tech text-[10px] transition ${
                    zoomLevel === z
                      ? isDay
                        ? 'bg-[#141414] text-white font-semibold'
                        : 'bg-white text-[#141414] font-semibold'
                      : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  {z}x
                </button>
              ))}
            </div>

            {/* TOP-RIGHT D1 EDGE TELEMETRY BADGE */}
            <div className="absolute top-4 right-4 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-mono-tech text-white/80">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>{d1Connected ? 'CLOUDFLARE D1 LIVE' : 'EDGE ATLAS READY'}</span>
            </div>
          </div>

          {/* SENSORY MODE & TELEMETRY BAR (Radial | Color | Circles | Dots | AQI | Sunlight | Weather) */}
          <div className="flex justify-center">
            <div
              className={`inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full ${
                isDay ? 'apple-glass-light' : 'apple-glass-dark'
              }`}
            >
              <span className="font-mono-tech text-[10px] uppercase tracking-widest opacity-50 px-1">
                MODE
              </span>
              {['Radial', 'Color', 'Circles', 'Dots'].map((m) => (
                <button
                  key={m}
                  onClick={() => setVisualMode(m)}
                  className={`px-3 py-1 rounded-full font-mono-tech text-[11px] transition ${
                    visualMode === m
                      ? isDay
                        ? 'bg-[#141414] text-white'
                        : 'bg-white text-[#141414]'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {m}
                </button>
              ))}

              <span className="h-4 w-[1px] bg-current/15 mx-1" />

              <button
                onClick={() => setAqiOn(!aqiOn)}
                className={`px-2.5 py-1 rounded-full font-mono-tech text-[11px] transition ${
                  aqiOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'opacity-65'
                }`}
              >
                AQI {aqiOn ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setSunlightOn(!sunlightOn)}
                className={`px-2.5 py-1 rounded-full font-mono-tech text-[11px] transition ${
                  sunlightOn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'opacity-65'
                }`}
              >
                Sunlight {sunlightOn ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setWeatherOn(!weatherOn)}
                className={`px-2.5 py-1 rounded-full font-mono-tech text-[11px] transition ${
                  weatherOn ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'opacity-65'
                }`}
              >
                Weather {weatherOn ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => setHostModalOpen(true)}
                className="px-3.5 py-1 rounded-full font-mono-tech text-[11px] bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-300 border border-emerald-500/30 transition"
              >
                + Add Operating Location
              </button>
            </div>
          </div>

          {/* SEASONAL TIMELINE & COUNTRY SELECTOR BAR */}
          <div
            className={`rounded-[18px] px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${
              isDay ? 'apple-glass-light' : 'apple-glass-dark'
            }`}
          >
            {/* Country Selector */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedCountry}
                onChange={(e) => handleCountrySelect(e.target.value)}
                className={`px-3.5 py-1.5 rounded-full font-mono-tech text-xs focus:outline-none ${
                  isDay ? 'apple-pill-light text-black' : 'apple-pill-dark text-white bg-[#18191e]'
                }`}
              >
                {['All Countries', 'India', 'Bhutan', 'Switzerland', 'Norway'].map((c) => (
                  <option key={c} value={c} className="bg-[#18191e] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Months Scrubber */}
            <div
              className={`flex items-center gap-1 p-1 rounded-full overflow-x-auto ${
                isDay ? 'apple-pill-light' : 'apple-pill-dark'
              }`}
            >
              {MONTHS.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(idx)}
                  className={`px-2.5 py-1 rounded-full font-mono-tech text-[11px] transition ${
                    selectedMonth === idx
                      ? isDay
                        ? 'bg-[#141414] text-white font-semibold'
                        : 'bg-white text-[#141414] font-semibold'
                      : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Play Months Button */}
            <button
              onClick={() => setIsPlayingMonths(!isPlayingMonths)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono-tech text-xs transition ${
                isDay ? 'apple-pill-light' : 'apple-pill-dark'
              }`}
            >
              {isPlayingMonths ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingMonths ? 'Pause' : 'Play Months'}</span>
            </button>
          </div>

          {/* CURATED SANCTUARIES & EXPEDITIONS CARDS */}
          <section
            className={`rounded-[22px] p-5 sm:p-7 space-y-5 ${
              isDay ? 'apple-glass-light' : 'apple-glass-dark'
            }`}
          >
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-current/10 pb-4">
              <div>
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-emerald-400">
                  [ CURATED GLOBAL SANCTUARIES • {filteredListings.length} ACTIVE ]
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-normal mt-1">
                  Architectural Stays, Private Charters & Alpine Treks
                </h2>
              </div>
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="font-mono-tech text-xs underline opacity-75 hover:opacity-100"
              >
                Request Bespoke Itinerary →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveExperience(item)}
                  className={`group cursor-pointer rounded-[20px] overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
                    isDay
                      ? 'apple-glass-light border-black/10'
                      : 'apple-glass-dark border-white/10'
                  }`}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono-tech uppercase bg-black/65 text-white backdrop-blur-md border border-white/15">
                        {item.category} • {item.subType}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono-tech bg-emerald-500/20 text-emerald-300 backdrop-blur-md border border-emerald-400/30">
                        {item.altitude || '15m ASL'}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="text-[11px] font-mono-tech opacity-80 flex items-center justify-between">
                        <span>
                          {item.locationName}, {item.country}
                        </span>
                        <span className="text-emerald-300 font-medium">{item.price}</span>
                      </div>
                      <h3 className="font-editorial text-2xl font-normal mt-0.5 leading-snug">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between text-xs font-mono-tech opacity-75">
                    <span>{item.duration || 'Flexible Dates'}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                      Explore Dossier <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* =====================================================================
          MULTI-PAGE ROUTER: CONTACT CONCIERGE, TERMS, PRIVACY
      ===================================================================== */}
      {currentPage !== 'home' && (
        <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-8 pb-20">
          <div
            className={`rounded-[24px] p-6 sm:p-10 space-y-6 ${
              isDay ? 'apple-glass-light' : 'apple-glass-dark'
            }`}
          >
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 font-mono-tech text-xs opacity-70 hover:opacity-100"
            >
              <ArrowLeft className="w-4 h-4" /> Back to 3D Globe Atlas
            </button>

            {currentPage === 'contact' && (
              <div className="space-y-6">
                <h1 className="font-editorial text-4xl sm:text-5xl">Private Concierge Desk</h1>
                <p className="text-sm opacity-75 leading-relaxed">
                  Our aviation, yacht charter, and private sanctuary specialists operate 24/7 across
                  Mumbai, Alibaug, Zermatt, and Paro Valley.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className={`p-5 rounded-2xl ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                    <Phone className="w-5 h-5 text-emerald-400 mb-2" />
                    <div className="font-mono-tech text-xs opacity-60">DIRECT WHATSAPP DESK</div>
                    <div className="text-lg font-medium mt-1">+91 98200 00000</div>
                  </div>
                  <div className={`p-5 rounded-2xl ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                    <Mail className="w-5 h-5 text-emerald-400 mb-2" />
                    <div className="font-mono-tech text-xs opacity-60">CONCIERGE DISPATCH</div>
                    <div className="text-lg font-medium mt-1">concierge@opulentoasis.co.in</div>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'terms' && (
              <div className="space-y-4">
                <h1 className="font-editorial text-4xl">Terms & Charter Conditions</h1>
                <p className="text-sm opacity-75 leading-relaxed">
                  All private villa reservations, high-altitude treks, and bespoke tours booked via
                  Opulent Oasis (`opulentoasis.co.in`) include dedicated ground concierge support and
                  verified weather-window flexibility.
                </p>
              </div>
            )}

            {currentPage === 'privacy' && (
              <div className="space-y-4">
                <h1 className="font-editorial text-4xl">Privacy & Guest Discretion Policy</h1>
                <p className="text-sm opacity-75 leading-relaxed">
                  Guest manifests, private aviation tail numbers, and Cloudflare D1 encrypted booking
                  records are strictly confidential and never shared with third-party brokers.
                </p>
              </div>
            )}
          </div>
        </main>
      )}

      {/* =====================================================================
          MODAL 1: LOCATION HUB (OPENS WHEN CLICKING A 3D GLOBE BEACON)
      ===================================================================== */}
      {selectedLocationHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
          <div
            className={`relative w-full max-w-2xl rounded-[26px] p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto ${
              isDay ? 'apple-glass-light text-zinc-900' : 'apple-glass-dark text-zinc-100'
            }`}
          >
            <div className="flex items-start justify-between border-b border-current/10 pb-4">
              <div>
                <span className="font-mono-tech text-[10px] uppercase tracking-widest text-emerald-400">
                  [ OPERATING NODE • {selectedLocationHub.country} ]
                </span>
                <h3 className="font-editorial text-3xl sm:text-4xl mt-1">
                  {selectedLocationHub.locationName}
                </h3>
                <p className="text-xs opacity-70 font-mono-tech mt-0.5">
                  {selectedLocationHub.region} • {selectedLocationHub.lat.toFixed(2)}°N,{' '}
                  {selectedLocationHub.lng.toFixed(2)}°E
                </p>
              </div>
              <button
                onClick={() => setSelectedLocationHub(null)}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedLocationHub.items.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => {
                    setSelectedLocationHub(null);
                    setActiveExperience(exp);
                  }}
                  className={`cursor-pointer p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:scale-[1.01] ${
                    isDay ? 'apple-pill-light' : 'apple-pill-dark'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={exp.image}
                      alt={exp.name}
                      className="w-20 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <span className="text-[10px] font-mono-tech uppercase text-emerald-400">
                        {exp.category} • {exp.subType}
                      </span>
                      <h4 className="font-editorial text-xl">{exp.name}</h4>
                      <p className="text-xs opacity-70">{exp.price}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-full font-mono-tech text-xs bg-white text-black shrink-0">
                    Inspect →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: EXPERIENCE DOSSIER MODAL
      ===================================================================== */}
      {activeExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
          <div
            className={`relative w-full max-w-2xl rounded-[28px] overflow-hidden ${
              isDay ? 'apple-glass-light text-zinc-900' : 'apple-glass-dark text-zinc-100'
            }`}
          >
            <div className="relative h-72">
              <img
                src={activeExperience.image}
                alt={activeExperience.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <button
                onClick={() => setActiveExperience(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-5 left-6 right-6 text-white">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono-tech uppercase bg-emerald-500/30 border border-emerald-400/40">
                  {activeExperience.category} • {activeExperience.locationName}
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl mt-2">
                  {activeExperience.name}
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-sm leading-relaxed opacity-85">{activeExperience.description}</p>
              <div className="grid grid-cols-3 gap-3 text-center font-mono-tech text-xs">
                <div className={`p-3 rounded-xl ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                  <div className="opacity-50 text-[10px]">TARIFF</div>
                  <div className="mt-1 font-medium">{activeExperience.price}</div>
                </div>
                <div className={`p-3 rounded-xl ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                  <div className="opacity-50 text-[10px]">DURATION</div>
                  <div className="mt-1 font-medium">{activeExperience.duration || '2–5 Nights'}</div>
                </div>
                <div className={`p-3 rounded-xl ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`}>
                  <div className="opacity-50 text-[10px]">CAPACITY</div>
                  <div className="mt-1 font-medium">{activeExperience.groupSize || 'Private'}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => openWhatsAppInquiry(activeExperience.name)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full font-mono-tech text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition"
                >
                  Reserve via WhatsApp Concierge →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: INQUIRE CONCIERGE MODAL
      ===================================================================== */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
          <div
            className={`relative w-full max-w-md rounded-[28px] p-6 space-y-4 ${
              isDay ? 'apple-glass-light text-zinc-900' : 'apple-glass-dark text-zinc-100'
            }`}
          >
            <div className="flex justify-between items-center border-b border-current/10 pb-3">
              <h3 className="font-editorial text-2xl">Bespoke Concierge Inquiry</h3>
              <button onClick={() => setInquiryModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Your Full Name"
                value={inquiryForm.name}
                onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-transparent ${
                  isDay ? 'apple-pill-light' : 'apple-pill-dark'
                }`}
              />
              <input
                type="text"
                placeholder="Preferred Destination (e.g., Gorai, Alibaug, Zermatt)"
                value={inquiryForm.destination}
                onChange={(e) => setInquiryForm({ ...inquiryForm, destination: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-transparent ${
                  isDay ? 'apple-pill-light' : 'apple-pill-dark'
                }`}
              />
              <textarea
                rows={3}
                placeholder="Dates, guest count, or special helicopter/yacht requests..."
                value={inquiryForm.notes}
                onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-transparent ${
                  isDay ? 'apple-pill-light' : 'apple-pill-dark'
                }`}
              />
              <button
                onClick={() =>
                  openWhatsAppInquiry(
                    `${inquiryForm.destination} (${inquiryForm.name || 'Guest'}): ${inquiryForm.notes}`
                  )
                }
                className="w-full py-3 rounded-full font-mono-tech text-xs uppercase bg-emerald-500 text-black font-semibold"
              >
                Dispatch to Concierge WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: HOST PORTAL CMS (CONNECTED TO CLOUDFLARE D1 EDGE SQLITE)
      ===================================================================== */}
      {hostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
          <div
            className={`relative w-full max-w-lg rounded-[28px] p-6 max-h-[88vh] overflow-y-auto ${
              isDay ? 'apple-glass-light text-zinc-900' : 'apple-glass-dark text-zinc-100'
            }`}
          >
            <div className="flex justify-between items-center pb-3 border-b border-current/10">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="font-editorial text-2xl">Host Studio • Cloudflare D1 CMS</h3>
              </div>
              <button onClick={() => setHostModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isHostAuthenticated ? (
              <form onSubmit={handleHostLogin} className="py-6 space-y-4 text-xs">
                <p>
                  Edge Database Status:{' '}
                  <span className="text-emerald-400 font-mono-tech">
                    {d1Connected ? 'Connected to opulent-oasis-db (D1)' : 'Ready for D1 Binding'}
                  </span>
                </p>
                <p className="opacity-70">
                  Enter Host Passcode (Demo:{' '}
                  <code className="bg-white/10 px-1.5 py-0.5 rounded">oasis2026</code>)
                </p>
                <input
                  type="password"
                  value={hostPasscode}
                  onChange={(e) => setHostPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-transparent ${
                    isDay ? 'apple-pill-light' : 'apple-pill-dark'
                  }`}
                />
                {hostPasscodeError && <p className="text-rose-400">{hostPasscodeError}</p>}
                <button
                  type="submit"
                  className={`w-full py-3 rounded-full font-mono-tech text-xs uppercase ${
                    isDay ? 'bg-black text-white' : 'bg-white text-black font-medium'
                  }`}
                >
                  Unlock Cloudflare D1 Studio
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateListing} className="py-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono-tech text-[11px]">
                  Publishing a sanctuary here sends a POST request to <code>/api/listings</code> and
                  inserts a row into your Cloudflare D1 database, plus plots its 3D beacon on the
                  globe immediately.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="Sanctuary / Villa Name"
                    value={newListing.name}
                    onChange={(e) => setNewListing({ ...newListing, name: e.target.value })}
                    className={`px-3.5 py-2 rounded-xl bg-transparent ${
                      isDay ? 'apple-pill-light' : 'apple-pill-dark'
                    }`}
                  />
                  <input
                    required
                    type="text"
                    placeholder="Beacon Label (e.g. Lonavala Crest)"
                    value={newListing.locationName}
                    onChange={(e) => setNewListing({ ...newListing, locationName: e.target.value })}
                    className={`px-3.5 py-2 rounded-xl bg-transparent ${
                      isDay ? 'apple-pill-light' : 'apple-pill-dark'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newListing.category}
                    onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                    className={`px-3 py-2 rounded-xl bg-[#18191e] text-white ${
                      isDay ? 'apple-pill-light' : 'apple-pill-dark'
                    }`}
                  >
                    <option value="Stay">Stay</option>
                    <option value="Tour">Tour</option>
                    <option value="Trek">Trek</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Display Price (₹45,000 / night)"
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                    className={`px-3 py-2 rounded-xl bg-transparent ${
                      isDay ? 'apple-pill-light' : 'apple-pill-dark'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Numeric Price (45000)"
                    value={newListing.numericPrice}
                    onChange={(e) => setNewListing({ ...newListing, numericPrice: e.target.value })}
                    className={`px-3 py-2 rounded-xl bg-transparent ${
                      isDay ? 'apple-pill-light' : 'apple-pill-dark'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Latitude (e.g. 18.75)"
                    value={newListing.lat}
                    onChange={(e) => setNewListing({ ...newListing, lat: e.target.value })}
                    className={`px-3 py-2 rounded-xl bg-transparent ${
                      isDay ? 'apple-pill-light' : 'apple-pill-dark'
                    }`}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Longitude (e.g. 73.40)"
                    value={newListing.lng}
                    onChange={(e) => setNewListing({ ...newListing, lng: e.target.value })}
                    className={`px-3 py-2 rounded-xl bg-transparent ${
                      isDay ? 'apple-pill-light' : 'apple-pill-dark'
                    }`}
                  />
                </div>

                <input
                  type="url"
                  placeholder="Image URL (Unsplash)"
                  value={newListing.image}
                  onChange={(e) => setNewListing({ ...newListing, image: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl bg-transparent ${
                    isDay ? 'apple-pill-light' : 'apple-pill-dark'
                  }`}
                />

                <textarea
                  rows={2}
                  placeholder="Architectural & sanctuary description..."
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl bg-transparent ${
                    isDay ? 'apple-pill-light' : 'apple-pill-dark'
                  }`}
                />

                {saveSuccessMessage && (
                  <p className="text-emerald-400 font-mono-tech">{saveSuccessMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={savingToD1}
                  className="w-full py-3 rounded-full font-mono-tech text-xs uppercase bg-emerald-500 text-black font-semibold"
                >
                  {savingToD1 ? 'Writing to Cloudflare D1...' : 'Publish Sanctuary to D1 & 3D Globe'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          FOOTER
      ===================================================================== */}
      <footer
        className={`mt-12 border-t py-8 px-4 text-center font-mono-tech text-xs opacity-70 ${
          isDay ? 'border-black/10' : 'border-white/10'
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6">
          <button onClick={() => setCurrentPage('home')}>Explore 3D Atlas</button>
          <button onClick={() => setCurrentPage('contact')}>Contact Concierge</button>
          <button onClick={() => setCurrentPage('terms')}>Terms & Conditions</button>
          <button onClick={() => setCurrentPage('privacy')}>Privacy Policy</button>
        </div>
        <p className="mt-4 text-[10px] opacity-50">
          © 2026 Opulent Oasis Hospitality Group • Powered by Cloudflare Pages & D1 Edge SQLite.
        </p>
      </footer>
    </div>
  );
}
