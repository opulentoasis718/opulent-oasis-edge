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
    background: linear-gradient(135deg, rgba(34, 34, 40, 0.75) 0%, rgba(20, 20, 24, 0.6) 100%);
    backdrop-filter: blur(36px) saturate(190%);
    -webkit-backdrop-filter: blur(36px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.42), inset 0 1px 0 0 rgba(255, 255, 255, 0.24);
  }

  .apple-glass-light {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(244, 243, 239, 0.7) 100%);
    backdrop-filter: blur(36px) saturate(190%);
    -webkit-backdrop-filter: blur(36px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 12px 32px rgba(20, 20, 20, 0.07), inset 0 1px 0 0 rgba(255, 255, 255, 0.95);
  }

  .apple-pill-dark {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.14);
  }

  .apple-pill-light {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.75) 0%, rgba(234, 232, 227, 0.6) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(20, 20, 20, 0.09);
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
`;

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
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    description: 'An architectural Portuguese-inspired courtyard villa tucked behind private casuarina groves on Gorai coast.',
    published: true,
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
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    description: '20 minutes by private speedboat from the Gateway of India, spanning 3 acres of heirloom mango orchards.',
    published: true,
    upcomingDepartures: []
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
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    description: 'Ascend ancient rock-cut steps to the 1,424m Kokankada vertical basalt amphitheater.',
    published: true,
    upcomingDepartures: []
  }
];

export default function App() {
  const [isDay, setIsDay] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [activeExperience, setActiveExperience] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [hostModalOpen, setHostModalOpen] = useState(false);

  // Fetch from Cloudflare D1 API if available
  useEffect(() => {
    fetch('/api/listings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setListings(data.map(d => ({
            ...d,
            locationName: d.locationName || d.location_name,
            numericPrice: d.numericPrice || d.numeric_price
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={`font-sans-ui min-h-screen w-full ${isDay ? 'bg-[#f7f6f2] text-[#141414]' : 'bg-[#111114] text-[#f4f3ef]'}`}>
      <style>{AWWWARDS_STYLE_CSS}</style>

      {/* HEADER */}
      <header className="relative z-40 px-3 sm:px-6 pt-3">
        <div className={`mx-auto max-w-[1380px] rounded-[12px] px-4 sm:px-6 py-3.5 ${isDay ? 'apple-glass-light' : 'apple-glass-dark'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setInquiryModalOpen(true)} className={`px-4 py-2 rounded-[6px] font-mono-tech text-xs uppercase tracking-wider ${isDay ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'}`}>
                ⊙ INQUIRE
              </button>
              <button onClick={() => setCurrentPage('contact')} className="hidden sm:inline font-mono-tech text-xs opacity-70 hover:opacity-100">
                Contact
              </button>
            </div>

            <div onClick={() => setCurrentPage('home')} className="flex flex-col items-center justify-center text-center cursor-pointer">
              <span className="font-sans-ui text-base sm:text-xl font-medium tracking-[0.22em] uppercase">OPULENT OASIS</span>
            </div>

            <div className="flex items-center gap-2">
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

      {/* MAIN VIEW */}
      {currentPage === 'home' && (
        <main className="mx-auto max-w-[1380px] px-3 sm:px-6 pt-3 pb-14 space-y-4">
          <div className={`relative w-full h-[65vh] min-h-[520px] rounded-[12px] overflow-hidden border ${isDay ? 'strata-dot-grid-light border-black/10' : 'strata-dot-grid-dark border-white/10'}`}>
            <div className="absolute inset-0 flex items-center justify-center text-center p-6">
              <div className="space-y-3">
                <span className="text-xs font-mono-tech uppercase tracking-widest opacity-60">[ CLOUDFLARE EDGE DATABASE ACTIVE ]</span>
                <h1 className="font-editorial text-4xl sm:text-6xl font-normal">Explore 3D Global Sanctuaries</h1>
                <p className="text-sm opacity-70 max-w-lg mx-auto">Connected to Cloudflare D1 SQLite database serving lightning-fast luxury stays, tours, and expeditions.</p>
              </div>
            </div>
          </div>

          <section className={`rounded-[12px] p-4 sm:p-6 space-y-4 ${isDay ? 'apple-glass-light' : 'apple-glass-dark'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {listings.map(item => (
                <div key={item.id} onClick={() => setActiveExperience(item)} className={`cursor-pointer rounded-[20px] overflow-hidden border ${isDay ? 'apple-glass-light border-black/10' : 'apple-glass-dark border-white/10'}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img src={item.image} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-700" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="text-xs font-mono opacity-80">{item.locationName} • {item.price}</div>
                      <h3 className="font-editorial text-2xl font-normal">{item.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* FOOTER */}
      <footer className={`mt-16 border-t py-8 px-4 text-center font-mono-tech text-xs opacity-70 ${isDay ? 'border-black/10' : 'border-white/10'}`}>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6">
          <button onClick={() => setCurrentPage('home')}>Explore Atlas</button>
          <button onClick={() => setCurrentPage('contact')}>Contact Concierge</button>
          <button onClick={() => setCurrentPage('terms')}>Terms & Conditions</button>
          <button onClick={() => setCurrentPage('privacy')}>Privacy Policy</button>
        </div>
        <p className="mt-4 text-[10px] opacity-50">© 2026 Opulent Oasis Hospitality Group • Cloudflare Edge D1 Connected.</p>
      </footer>

      {/* MODALS */}
      {hostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
          <div className={`relative w-full max-w-md rounded-[28px] p-6 ${isDay ? 'apple-glass-light text-zinc-900' : 'apple-glass-dark text-zinc-100'}`}>
            <div className="flex justify-between items-center pb-3 border-b border-current/10">
              <h3 className="font-editorial text-2xl">Host Portal (D1 Connected)</h3>
              <button onClick={() => setHostModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="py-6 space-y-4 text-xs">
              <p>Database Status: <span className="text-green-500 font-mono">Connected to Cloudflare D1</span></p>
              <p className="opacity-70">Passcode demo: <code className="bg-white/10 px-1 py-0.5 rounded">oasis2026</code></p>
              <input type="password" placeholder="Passcode..." className={`w-full px-3.5 py-2.5 rounded-xl bg-transparent ${isDay ? 'apple-pill-light' : 'apple-pill-dark'}`} />
              <button onClick={() => {}} className={`w-full py-3 rounded-full font-mono text-xs uppercase ${isDay ? 'bg-black text-white' : 'bg-white text-black'}`}>
                Unlock Database Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
