import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  X,
  ArrowUpRight,
  MapPin,
  ArrowLeft,
  Compass,
  Plus,
  Check,
  Star,
  Info,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  Phone,
  Send,
  Calendar,
  Heart,
  Trash2,
  Clock,
  Sparkles,
  Sun,
  Copy,
  BarChart3,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

// ============================================================================
// OMNICHANNEL ATTRIBUTION, META PIXEL DEDUPLICATION & EDGE ANALYTICS ENGINE
// ============================================================================
function getCookieValue(name) {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : '';
}

function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem('oasis_session_id');
    if (!sid) {
      sid = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem('oasis_session_id', sid);
    }
    return sid;
  } catch {
    return `sess-${Date.now()}`;
  }
}

function getAttributionContext() {
  if (typeof window === 'undefined') {
    return { utm_source: '', utm_medium: '', utm_campaign: '', fbp: '', fbc: '' };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const cached = JSON.parse(sessionStorage.getItem('oasis_utm_ctx') || '{}');
    const utm_source = params.get('utm_source') || cached.utm_source || '';
    const utm_medium = params.get('utm_medium') || cached.utm_medium || '';
    const utm_campaign = params.get('utm_campaign') || cached.utm_campaign || '';
    const fbclid = params.get('fbclid') || '';
    const fbp = getCookieValue('_fbp');
    const fbc =
      getCookieValue('_fbc') || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : cached.fbc || '');

    const ctx = { utm_source, utm_medium, utm_campaign, fbp, fbc };
    sessionStorage.setItem('oasis_utm_ctx', JSON.stringify(ctx));
    return ctx;
  } catch {
    return { utm_source: '', utm_medium: '', utm_campaign: '', fbp: '', fbc: '' };
  }
}

function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function generateMetaEventId(prefix = 'evt') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function trackOmnichannelEvent({
  eventName,
  category = '',
  destination = '',
  listingId = '',
  valueInr = 0,
  metaEventId = ''
}) {
  const ctx = getAttributionContext();
  const sessionId = getOrCreateSessionId();
  const evtId = metaEventId || generateMetaEventId(eventName);

  // 1. First-Party Cloudflare D1 Edge Analytics (Ad-Blocker Proof)
  try {
    fetch('/api/analytics', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        eventName,
        category,
        destination,
        listingId,
        valueInr: Number(valueInr || 0),
        utm_source: ctx.utm_source,
        utm_campaign: ctx.utm_campaign,
        deviceType: getDeviceType()
      })
    }).catch(() => {});
  } catch {
    // Non-blocking telemetry
  }

  // 2. Meta Pixel Browser Event (Paired with CAPI eventID for deduplication)
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    const metaMap = {
      globe_stamp_click: 'ViewContent',
      detail_view: 'ViewContent',
      estimator_update: 'InitiateCheckout',
      wishlist_save: 'AddToWishlist',
      whatsapp_handoff: 'Contact',
      lead_submitted: 'Lead'
    };
    const fbEvent = metaMap[eventName];
    if (fbEvent) {
      window.fbq(
        'track',
        fbEvent,
        {
          content_name: destination || 'Opulent Oasis',
          content_category: category || 'Stay',
          content_ids: listingId ? [listingId] : undefined,
          value: Number(valueInr || 0),
          currency: 'INR'
        },
        { eventID: evtId }
      );
    }
  }

  // 3. Google Analytics 4 (GA4) Event
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    const gaMap = {
      page_view: 'page_view',
      globe_stamp_click: 'select_item',
      detail_view: 'view_item',
      estimator_update: 'begin_checkout',
      wishlist_save: 'add_to_wishlist',
      whatsapp_handoff: 'contact',
      lead_submitted: 'generate_lead'
    };
    const gaEvent = gaMap[eventName] || eventName;
    window.gtag('event', gaEvent, {
      event_category: category || 'Voyage',
      item_name: destination || 'Opulent Oasis',
      item_id: listingId || undefined,
      value: Number(valueInr || 0),
      currency: 'INR'
    });
  }

  return evtId;
}

async function dispatchOmnichannelLead(lead) {
  const ctx = getAttributionContext();
  const metaEventId = generateMetaEventId('lead');

  trackOmnichannelEvent({
    eventName: 'lead_submitted',
    category: lead.category,
    destination: lead.destination,
    listingId: lead.listingId || '',
    valueInr: lead.estimatedValueInr || 0,
    metaEventId
  });

  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...lead,
        metaEventId,
        utm_source: ctx.utm_source,
        utm_medium: ctx.utm_medium,
        utm_campaign: ctx.utm_campaign,
        fbp: ctx.fbp,
        fbc: ctx.fbc,
        pageUrl: typeof window !== 'undefined' ? window.location.href : 'https://opulentoasis.co.in/'
      })
    });
    if (res.ok) return await res.json();
  } catch {
    // Graceful fallback if offline / local preview
  }
  return { success: false, metaEventId };
}

// ============================================================================
// EDITABLE BUSINESS & MANDATORY PAGES CONFIGURATION
// ============================================================================
const DEFAULT_SITE_CONTENT = {
  businessName: 'Opulent Oasis',
  tagline: 'OPULENT OASIS',
  domain: 'OPULENTOASIS.CO.IN',
  whatsappNumber: '919820000000',
  phoneDisplay: '+91 98200 00000',
  email: 'Sheldon@opulentoasis.co.in',
  address: 'Ballard Estate & Gorai Coast, Mumbai 400001, India',
  aboutTitle: 'Curating Rare Architectural Sanctuaries & Voyages',
  aboutDescription:
    'Opulent Oasis is a private luxury hospitality and expedition house crafting unhurried stays, chartered yacht & helicopter tours, and high-altitude guided treks across India, Bhutan, and the Swiss Alps.\n\nEvery villa, vessel, and trail in our collection is personally vetted for architectural provenance, seclusion, and warm, anticipatory service.',
  stat1Value: '18+',
  stat1Label: 'Curated Stays, Tours & Treks',
  stat2Value: '6',
  stat2Label: 'Signature Global Destinations',
  stat3Value: '24/7',
  stat3Label: 'Private Concierge Desk',
  faqs: [
    {
      q: 'How do I confirm a reservation or bespoke itinerary?',
      a: 'Select any Stay, Tour, or Trek from our 3D Stamp Atlas or Catalog, configure your preferred dates and party size in the Live Tariff Estimator, and dispatch your request directly to our 24/7 WhatsApp Concierge.'
    },
    {
      q: 'Are private speedboats, helicopters, and 4x4 transfers included?',
      a: 'We arrange end-to-end private transfers—including Gateway of India speedboats to Alibaug, Defender 4x4 convoys in the Western Ghats and Spiti, and Airbus H130 helicopters in Bhutan and Zermatt.'
    },
    {
      q: 'Can we combine multiple destinations into one voyage?',
      a: 'Yes. Tap the Star or Heart icon on any experience to build your Saved Voyages shortlist, then send the combined itinerary to our concierge in one click.'
    }
  ],
  refundPolicy1:
    '1. Flexible Cancellation Window: Reservations cancelled 30 or more days prior to check-in or expedition departure qualify for a 100% refund or complimentary date reschedule.',
  refundPolicy2:
    '2. Moderate Window (15–29 Days): Cancellations made between 15 and 29 days prior to arrival receive a 50% refund or 100% credit toward a future Opulent Oasis voyage valid for 12 months.',
  refundPolicy3:
    '3. Within 14 Days & Weather Safety: Bookings cancelled within 14 days are non-refundable unless cancelled by Opulent Oasis due to severe maritime or alpine weather advisories, in which case a full refund or priority rebooking is guaranteed.',
  termsParagraph1:
    'All bookings with Opulent Oasis are subject to guest identity verification (valid government photo ID or passport for international guests) and adherence to local sanctuary quiet hours and environmental preservation guidelines.',
  termsParagraph2:
    'Tariffs displayed in INR, USD, EUR, or CHF are indicative estimates excluding applicable statutory taxes unless specified. All legal disputes are subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.',
  privacyParagraph1:
    'Opulent Oasis respects your privacy and complies with India’s Digital Personal Data Protection (DPDP) Act and GDPR principles. We collect only the contact details and travel preferences you voluntarily submit to fulfill concierge inquiries and bookings.',
  privacyParagraph2:
    'We never sell, rent, or trade guest data to third-party advertisers. All transmissions are encrypted over HTTPS/TLS.'
};

// Precomputed SHA-256 hex digest of default curator passcode ('oasis2026')
const CURATOR_PASSCODE_SHA256 =
  '457e60590089897c1e7b8293681b6577049a20b56634194a0e9d76294b929a22';

async function computeSha256Hex(message) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return message === 'oasis2026' ? CURATOR_PASSCODE_SHA256 : '';
}

// Multi-currency conversion table for international luxury guests
const CURRENCY_CONFIG = {
  INR: { symbol: '₹', rate: 1, locale: 'en-IN' },
  USD: { symbol: '$', rate: 1 / 84, locale: 'en-US' },
  EUR: { symbol: '€', rate: 1 / 91, locale: 'de-DE' },
  CHF: { symbol: 'CHF ', rate: 1 / 96, locale: 'de-CH' }
};

function formatConvertedTariff(inrAmount, currencyCode = 'INR') {
  const cfg = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.INR;
  const converted = Math.round(inrAmount * cfg.rate);
  return `${cfg.symbol}${converted.toLocaleString(cfg.locale)}`;
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

  .matte-frame-grain {
    background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 0);
    background-size: 24px 24px;
  }

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

  @keyframes editorialFadeUp {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-editorial-in {
    animation: editorialFadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .card-sheen {
    position: relative;
    overflow: hidden;
  }

  .card-sheen::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      115deg,
      transparent 20%,
      rgba(246, 238, 220, 0.14) 50%,
      transparent 80%
    );
    transform: translateX(-120%);
    transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
    z-index: 15;
  }

  .card-sheen:hover::after {
    transform: translateX(120%);
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-editorial-in {
      animation: none;
    }
    .postage-stamp {
      transition: none;
    }
    .card-sheen::after {
      display: none;
    }
  }

  /* Awwwards Accessibility: Crisp Keyboard Focus Indicators */
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid #d6c5b3;
    outline-offset: 2px;
  }
`;

// Destination Hubs with Illustrated Postage Stamp themes & Seasonal Climate Windows
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
    peakMonths: [10, 11, 12, 1, 2, 3, 4, 5],
    climateLabel: '26°C Coastal Breeze',
    heroImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85',
    summary: 'Heirloom mango orchards, private speedboat jetties, and coastal Portuguese glasshouses.'
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
    peakMonths: [11, 12, 1, 2, 3, 4],
    climateLabel: '25°C Arabian Sea Air',
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85',
    summary: 'Secluded beachfront courtyards where the Arabian Sea meets unspoiled palm groves.'
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
    peakMonths: [7, 8, 9, 10, 11, 12, 1, 2],
    climateLabel: '18°C Highland Mist',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
    summary: 'Dramatic basalt cliff amphitheaters, cloud-forest waterfalls, and luxury geodesic star-beds.'
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
    peakMonths: [5, 6, 7, 8, 9, 10],
    climateLabel: '11°C Crisp Alpine Sky',
    heroImage: 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1200&q=85',
    summary: 'Ancient Trans-Himalayan silk-route monasteries and high-altitude glacier sanctuaries.'
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
    peakMonths: [3, 4, 5, 9, 10, 11],
    climateLabel: '14°C Blue Pine Valley',
    heroImage: 'https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?auto=format&fit=crop&w=1200&q=85',
    summary: 'Sacred cliffside monasteries, helicopter valley charters, and riverfront hot-stone baths.'
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
    peakMonths: [12, 1, 2, 3, 4, 6, 7, 8, 9],
    climateLabel: '-2°C Matterhorn Snow',
    heroImage: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=85',
    summary: 'Ski-in glass-walled alpine chalets, cedar thermal spas, and private glacier helicopters.'
  }
];

const INITIAL_EXPERIENCES = [
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

function getExperienceTravelMeta(exp) {
  const currentMonth = new Date().getMonth() + 1;
  const loc = DESTINATION_LOCATIONS.find((l) => l.id === exp.locationId);
  const inSeasonNow = loc ? loc.peakMonths.includes(currentMonth) : true;
  const climateLabel = loc?.climateLabel || '22°C Mild Climate';

  const seasonByLocation = {
    'loc-alibaug': 'Oct – May (Coastal Breeze)',
    'loc-gorai': 'Nov – Apr (Clear Arabian Skies)',
    'loc-sahyadri': 'Jul – Feb (Mist & Starlight)',
    'loc-spiti': 'May – Oct (High-Pass Window)',
    'loc-paro': 'Mar – May & Sep – Nov',
    'loc-zermatt': 'Dec – Apr (Ski) • Jun – Sep (Alps)'
  };

  const transferByLocation = {
    'loc-alibaug': '20-min Private Speedboat from Gateway of India',
    'loc-gorai': 'Private Jetty Ferry or Chauffeur Coastal Drive',
    'loc-sahyadri': 'Chauffeur 4x4 Defender Transfer from Mumbai / Pune',
    'loc-spiti': 'Private Heated 4x4 Convoy + Heli Charter Option',
    'loc-paro': 'Paro International VIP Reception + Private SUV / Heli',
    'loc-zermatt': 'First-Class Alpine Rail or Private Glacier Helicopter'
  };

  const inclusionsByCategory = {
    Stay: [
      'Private Farm-to-Table Estate Chef & Daily Breakfast',
      '24/7 Dedicated Sanctuary Butler & Concierge',
      'Curated Welcome Ritual & Sunset Aperitifs',
      'High-Speed Starlink Wi-Fi & Private Grounds Access'
    ],
    Tour: [
      'Private Chartered Vessel, 4x4 Convoy, or Aviation',
      'Lead Cultural Historian / Naturalist Curator',
      'Gourmet Trail Dining & Artisanal Refreshments',
      'All Permits, Heritage Access Fees & Concierge Logistics'
    ],
    Trek: [
      'UIAA / NIM Certified Lead Mountain Expedition Guide',
      'Full Porter Support & Luxury Heated Basecamp Domes',
      'Satellite Safety Comms, Oxygen & First-Aid Protocol',
      'Chef-Prepared High-Altitude Trail Nutrition'
    ]
  };

  const itineraryByCategory = {
    Stay: [
      {
        day: 'Day 01',
        title: 'Private Arrival & Golden-Hour Welcome',
        detail: `Private transfer into ${exp.locationName}, chilled artisanal aperitifs by the terrace, and a five-course chef’s welcome supper under the stars.`
      },
      {
        day: 'Day 02',
        title: 'Unscripted Sanctuary Living',
        detail: 'Slow sunlit breakfast, private spa or wellness ritual, optional naturalist walk across the estate, and candlelit bonfire lounge.'
      },
      {
        day: 'Day 03',
        title: 'Morning Coffee & Seamless Departure',
        detail: 'Leisurely brunch overlooking the landscape followed by priority chauffeur or speedboat departure.'
      }
    ],
    Tour: [
      {
        day: 'Stage 01',
        title: 'Curator Briefing & Private Charter Launch',
        detail: `Meet your private lead curator in ${exp.locationName} for an unhurried departure aboard our private vessel, 4x4, or helicopter.`
      },
      {
        day: 'Stage 02',
        title: 'Behind-the-Scenes Cultural Immersion',
        detail: 'Exclusive private access to historic sanctuaries, local master artisans, and hidden scenic viewpoints far from commercial crowds.'
      },
      {
        day: 'Stage 03',
        title: 'Sunset Chef’s Table & Return',
        detail: 'Toast the horizon with curated regional vintages and a private gourmet tasting menu before returning in comfort.'
      }
    ],
    Trek: [
      {
        day: 'Day 01',
        title: 'Trailhead Briefing & Ridge Ascent',
        detail: `Acclimatization briefing with our UIAA-certified guide in ${exp.locationName}, followed by a scenic ascent to our heated geodesic basecamp.`
      },
      {
        day: 'Day 02',
        title: 'Dawn Summit & Alpine Vista',
        detail: 'First-light ridge traverse to the signature lookout with hot trail espresso, panoramic photography stops, and celebratory basecamp dinner.'
      },
      {
        day: 'Day 03',
        title: 'Descent & Recovery Lounge',
        detail: 'Gentle descent through forest or valley trails to a hot-stone recovery bath and private return transfer.'
      }
    ]
  };

  const galleryByCategory = {
    Stay: [
      { url: exp.image, label: 'Architectural Sanctuary' },
      {
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85',
        label: 'Infinity Terrace & Horizon'
      },
      {
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85',
        label: 'Evening Courtyard Ambience'
      }
    ],
    Tour: [
      { url: exp.image, label: 'Signature Expedition' },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        label: 'Golden-Hour Charter'
      },
      {
        url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
        label: 'Heritage & Landscapes'
      }
    ],
    Trek: [
      { url: exp.image, label: 'High-Altitude Crest' },
      {
        url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85',
        label: 'Alpine Valley Traverse'
      },
      {
        url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=85',
        label: 'Dawn Summit Camp'
      }
    ]
  };

  return {
    inSeasonNow,
    climateLabel,
    bestSeason: seasonByLocation[exp.locationId] || 'Year-Round Curated Window',
    transfer: transferByLocation[exp.locationId] || 'Private Chauffeur Transfer Available',
    inclusions: inclusionsByCategory[exp.category] || inclusionsByCategory.Stay,
    itinerary: itineraryByCategory[exp.category] || itineraryByCategory.Stay,
    gallery: galleryByCategory[exp.category] || galleryByCategory.Stay
  };
}

// Illustrated SVG Stamp Artworks for the 3D Globe
function StampArtworkSVG({ motif, bg, accent }) {
  return (
    <svg viewBox="0 0 80 68" className="w-full h-full block">
      <rect width="80" height="68" fill={bg} />
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

// Interactive 4K 3D Black Globe with Projected Perforated Postage Stamps
function StampGlobeHero({
  locations,
  selectedLocation,
  onSelectLocation,
  onScrollToExplorer
}) {
  const mountRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const [stampCoords, setStampCoords] = useState([]);
  const targetRotRef = useRef({ y: -1.35, x: 0.32 });
  const isDraggingRef = useRef(false);

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

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#050507');
    grad.addColorStop(0.5, '#020203');
    grad.addColorStop(1, '#050507');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    bCtx.fillStyle = '#000000';
    bCtx.fillRect(0, 0, W, H);

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

    const lonLatToXY = (lon, lat) => [
      ((lon + 180) / 360) * W,
      ((90 - lat) / 180) * H
    ];

    const WORLD_LANDMASSES = [
      [
        [-168, 66], [-162, 70], [-140, 70], [-125, 72], [-95, 74], [-80, 70],
        [-65, 62], [-55, 52], [-60, 46], [-70, 42], [-75, 35], [-81, 25],
        [-83, 30], [-90, 29], [-97, 26], [-96, 19], [-87, 21], [-83, 10],
        [-78, 8], [-85, 11], [-92, 15], [-105, 20], [-110, 24], [-114, 30],
        [-117, 32], [-122, 37], [-124, 48], [-135, 58], [-150, 61], [-162, 55], [-168, 66]
      ],
      [
        [-52, 60], [-42, 60], [-22, 70], [-18, 81], [-45, 83], [-68, 76], [-56, 68], [-52, 60]
      ],
      [
        [-78, 9], [-72, 12], [-62, 10], [-50, 2], [-35, -6], [-38, -14],
        [-40, -22], [-48, -28], [-54, -34], [-62, -40], [-66, -48], [-68, -55],
        [-74, -52], [-73, -40], [-71, -30], [-70, -18], [-77, -12], [-81, -4], [-78, 2], [-78, 9]
      ],
      [
        [-17, 15], [-13, 28], [-6, 36], [10, 37], [11, 33], [25, 32], [33, 31],
        [39, 20], [43, 12], [51, 12], [41, -1], [40, -10], [35, -24], [28, -33],
        [18, -35], [15, -24], [12, -15], [9, -2], [8, 4], [2, 6], [-8, 4], [-14, 9], [-17, 15]
      ],
      [
        [49, -12], [50, -18], [47, -25], [44, -25], [44, -17], [49, -12]
      ],
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
      [
        [80, 9.8], [81.8, 7.5], [80.6, 5.9], [79.8, 7.5], [80, 9.8]
      ],
      [
        [-5, 50], [1.5, 51], [0, 54], [-2, 57], [-5, 58.5], [-5, 54], [-5, 50]
      ],
      [
        [-10, 51.5], [-6, 52], [-6, 55], [-9.5, 54.5], [-10, 51.5]
      ],
      [
        [-24, 64], [-14, 64.5], [-14, 66.5], [-23, 66], [-24, 64]
      ],
      [
        [130, 31], [135, 34], [140, 36], [141, 41], [145, 44], [140, 43], [137, 37], [131, 34], [130, 31]
      ],
      [
        [95, 5.5], [102, 1], [106, -5.5], [103, -5], [95, 5.5]
      ],
      [
        [106, -6], [114, -7.5], [114, -8.5], [106, -7], [106, -6]
      ],
      [
        [109, 2], [117, 6], [118, 1], [116, -4], [111, -3], [109, 2]
      ],
      [
        [114, -22], [122, -17], [131, -12], [136, -12], [137, -16], [142, -11],
        [146, -18], [153, -26], [150, -37], [142, -38], [136, -35], [130, -32],
        [122, -34], [115, -34], [113, -26], [114, -22]
      ],
      [
        [173, -35], [178, -38], [175, -41], [172, -43], [167, -46], [169, -44], [174, -39], [173, -35]
      ]
    ];

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

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const dirLight = new THREE.DirectionalLight(0xf6eedc, 1.85);
    dirLight.position.set(4, 3, 5);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0xd6c5b3, 0.9);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

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

    const stampRadialOffsets = [
      { dx: -68, dy: 28 },
      { dx: -76, dy: -36 },
      { dx: 66, dy: 34 },
      { dx: 18, dy: -66 },
      { dx: 82, dy: -16 },
      { dx: -58, dy: -48 }
    ];

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

      if (!isDraggingRef.current && !prefersReducedMotion) {
        targetRotRef.current.y += 0.0008;
      }

      globeGroup.rotation.y += (targetRotRef.current.y - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotRef.current.x - globeGroup.rotation.x) * 0.08;
      if (!prefersReducedMotion) {
        ringMesh.rotation.z += 0.0009;
      }

      globeGroup.updateMatrixWorld();

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

  const currentMonth = new Date().getMonth() + 1;
  const selectedInSeason = selectedLocation?.peakMonths?.includes(currentMonth);

  return (
    <div
      ref={canvasWrapRef}
      className="relative w-full h-[500px] sm:h-[600px] lg:h-[650px] overflow-hidden select-none bg-[#050506]"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(214, 197, 179, 0.12) 0%, rgba(5, 5, 6, 0.96) 70%)'
        }}
      />

      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

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

      <div className="absolute top-5 left-0 right-0 flex items-center justify-center pointer-events-none z-30 px-4">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/75 border border-white/15 backdrop-blur-md text-[11px] font-mono-tech uppercase tracking-widest text-[#d6c5b3] shadow-lg">
          <Globe className="w-3.5 h-3.5" />
          <span>Drag 3D Globe or Click Any Postage Stamp</span>
        </div>
      </div>

      {selectedLocation && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-xl pointer-events-auto">
          <div className="rounded-2xl bg-[#141416]/90 border border-[#d6c5b3]/30 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/20 shrink-0">
                <img
                  src={selectedLocation.heroImage}
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif-editorial text-lg sm:text-xl text-white truncate">
                    {selectedLocation.name}
                  </span>
                  <span
                    className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono-tech uppercase tracking-wider border ${
                      selectedInSeason
                        ? 'bg-[#9eb393]/15 border-[#9eb393]/40 text-[#9eb393]'
                        : 'bg-white/10 border-white/20 text-white/70'
                    }`}
                  >
                    <Sun className="w-2.5 h-2.5" />
                    {selectedInSeason ? 'In Season' : 'Plan Ahead'} • {selectedLocation.climateLabel}
                  </span>
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
  const [siteContent, setSiteContent] = useState(() => {
    try {
      const saved = localStorage.getItem('opulent_oasis_site_content_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tagline === 'OPULENT OASIS • DESIGNED FOR EXPLORERS') {
          parsed.tagline = 'OPULENT OASIS';
        }
        return { ...DEFAULT_SITE_CONTENT, ...parsed };
      }
      return DEFAULT_SITE_CONTENT;
    } catch {
      return DEFAULT_SITE_CONTENT;
    }
  });
  const [experiences, setExperiences] = useState(INITIAL_EXPERIENCES);
  const [selectedCategory, setSelectedCategory] = useState('Stay');
  const [activeLocation, setActiveLocation] = useState(DESTINATION_LOCATIONS[0]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogLocationFilter, setCatalogLocationFilter] = useState('ALL');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [savedIds, setSavedIds] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [detailExperience, setDetailExperience] = useState(null);
  const [detailGalleryIdx, setDetailGalleryIdx] = useState(0);
  const [detailTab, setDetailTab] = useState('overview');
  const [currency, setCurrency] = useState('INR');
  const [toastMessage, setToastMessage] = useState('');
  const [tripEstimator, setTripEstimator] = useState({
    checkIn: '',
    nights: 2,
    guests: 2,
    guestName: '',
    guestPhone: ''
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [crmInquiries, setCrmInquiries] = useState([]);
  const [crmLoading, setCrmLoading] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const touchStartXRef = useRef(null);
  const toastTimerRef = useRef(null);
  const [activePage, setActivePage] = useState('home');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Stay',
    destination: 'Alibaug Coast',
    message: '',
    website_trap: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [studioTab, setStudioTab] = useState('listings');
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

  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 2800);
  };

  const toggleSaveExperience = (item) => {
    const exists = savedIds.includes(item.id);
    setSavedIds((prev) =>
      exists ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
    if (!exists) {
      trackOmnichannelEvent({
        eventName: 'wishlist_save',
        category: item.category,
        destination: item.locationName,
        listingId: item.id,
        valueInr: item.numericPrice || 35000
      });
    }
    showToast(
      exists
        ? `Removed "${item.name}" from Saved Voyages`
        : `Saved "${item.name}" to your Voyage Shortlist`
    );
  };

  const openDetailModal = (item) => {
    setDetailExperience(item);
    setDetailGalleryIdx(0);
    setDetailTab('overview');
    trackOmnichannelEvent({
      eventName: 'detail_view',
      category: item.category,
      destination: item.locationName,
      listingId: item.id,
      valueInr: item.numericPrice || 35000
    });
  };

  const handleNavigatePage = (pageKey) => {
    setActivePage(pageKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.website_trap) return;
    setContactSubmitted(true);

    const cleanName = sanitizeClientInput(contactForm.name, 80);
    const cleanEmail = sanitizeClientInput(contactForm.email, 100);
    const cleanPhoneInput = sanitizeClientInput(contactForm.phone, 40);
    const cleanMsg = sanitizeClientInput(contactForm.message, 400);

    dispatchOmnichannelLead({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhoneInput,
      category: contactForm.category,
      destination: contactForm.destination,
      estimatedValueInr: 45000,
      currency,
      notes: cleanMsg,
      sourceChannel: 'website'
    });

    const cleanPhone = (siteContent.whatsappNumber || '919820000000').replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello ${siteContent.businessName} Concierge!\nName: ${cleanName}\nEmail: ${cleanEmail}\nPhone: ${cleanPhoneInput}\nInterest: ${contactForm.category} — ${contactForm.destination}\nMessage: ${cleanMsg}`
    );
    setTimeout(() => {
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
    }, 350);
  };

  const handleSaveSiteContent = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('opulent_oasis_site_content_v1', JSON.stringify(siteContent));
      setD1Status('Saved! Your business details and pages are updated live.');
    } catch {
      setD1Status('Updated in current session.');
    }
  };

  const handleResetSiteContent = () => {
    setSiteContent(DEFAULT_SITE_CONTENT);
    try {
      localStorage.removeItem('opulent_oasis_site_content_v1');
    } catch {
      // ignore storage restrictions
    }
    setD1Status('Restored default business content.');
  };

  // Ensure Tailwind CSS is loaded
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="tailwindcss"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tailwindcss.com';
      script.async = true;
      document.head.appendChild(script);
    }
    trackOmnichannelEvent({ eventName: 'page_view', destination: 'Home Atlas' });
  }, []);

  const loadCuratorOmnichannelData = async (tokenOverride = '') => {
    const token = tokenOverride || curatorTokenHash;
    if (!token) return;
    setCrmLoading(true);
    try {
      const [anaRes, inqRes] = await Promise.all([
        fetch('/api/analytics', { headers: { 'X-Curator-Token': token } }),
        fetch('/api/inquiries', { headers: { 'X-Curator-Token': token } })
      ]);
      if (anaRes.ok) {
        setAnalyticsData(await anaRes.json());
      }
      if (inqRes.ok) {
        const json = await inqRes.json();
        setCrmInquiries(Array.isArray(json.inquiries) ? json.inquiries : []);
      }
    } catch {
      // Offline / preview mode fallback
    } finally {
      setCrmLoading(false);
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    setCrmInquiries((prev) =>
      prev.map((row) => (row.id === inquiryId ? { ...row, status: newStatus } : row))
    );
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Curator-Token': curatorTokenHash
        },
        body: JSON.stringify({ id: inquiryId, status: newStatus })
      });
      if (res.ok) {
        const result = await res.json();
        if (newStatus === 'Confirmed') {
          showToast(
            result.purchaseCapiTriggered
              ? 'Confirmed! Meta CAPI Purchase & Interakt drip triggered.'
              : 'Booking Confirmed & synced to D1 CRM!'
          );
        } else {
          showToast(`Lead updated to ${newStatus}`);
        }
      }
    } catch {
      showToast(`Status updated locally to ${newStatus}`);
    }
  };

  // Sync live Cloudflare D1 listings
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

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isCatalogOpen && !detailExperience && !wishlistOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (detailExperience) setDetailExperience(null);
        else if (wishlistOpen) setWishlistOpen(false);
        else setIsCatalogOpen(false);
      }
      if (detailExperience) {
        if (e.key === 'ArrowLeft') {
          setDetailGalleryIdx((prev) => (prev + 2) % 3);
        }
        if (e.key === 'ArrowRight') {
          setDetailGalleryIdx((prev) => (prev + 1) % 3);
        }
      } else if (isCatalogOpen && !wishlistOpen) {
        if (e.key === 'ArrowLeft') {
          setActiveSlideIndex((prev) => Math.max(0, prev - 1));
        }
        if (e.key === 'ArrowRight') {
          setActiveSlideIndex((prev) => prev + 1);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCatalogOpen, detailExperience, wishlistOpen]);

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

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [selectedCategory, catalogLocationFilter, isCatalogOpen]);

  const handleOpenCategoryCatalog = (categoryName, locationFilterId = 'ALL') => {
    setSelectedCategory(categoryName);
    setCatalogLocationFilter(locationFilterId);
    setIsCatalogOpen(true);
    setActiveSlideIndex(0);
    const matchedLoc = DESTINATION_LOCATIONS.find((l) => l.id === locationFilterId);
    trackOmnichannelEvent({
      eventName: 'catalog_open',
      category: categoryName,
      destination: matchedLoc ? matchedLoc.name : 'All Destinations'
    });
    setTimeout(() => {
      document
        .getElementById('destination-toggler-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleWhatsAppReserve = (exp) => {
    trackOmnichannelEvent({
      eventName: 'whatsapp_handoff',
      category: exp.category,
      destination: exp.locationName,
      listingId: exp.id,
      valueInr: exp.numericPrice || 35000
    });
    const cleanPhone = (siteContent.whatsappNumber || '919820000000').replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello ${siteContent.businessName}! I would like to reserve:\n• ${sanitizeClientInput(exp.category, 20)}: ${sanitizeClientInput(exp.name, 120)}\n• Location: ${sanitizeClientInput(exp.locationName, 80)} (${sanitizeClientInput(exp.country, 50)})\n• Tariff: ${sanitizeClientInput(exp.price, 50)}\nPlease share availability.`
    );
    window.open(
      `https://wa.me/${cleanPhone}?text=${text}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const savedExperiences = useMemo(
    () => fullEnrichedCatalog.filter((item) => savedIds.includes(item.id)),
    [fullEnrichedCatalog, savedIds]
  );

  const handleBookWithEstimate = (exp) => {
    const cleanPhone = (siteContent.whatsappNumber || '919820000000').replace(/\D/g, '');
    const baseUnit = exp.numericPrice || 35000;
    const multiplier = exp.category === 'Stay' ? tripEstimator.nights : tripEstimator.guests;
    const estimatedTotal = baseUnit * Math.max(1, multiplier);
    const formattedTotal = formatConvertedTariff(estimatedTotal, currency);
    const unitLabel =
      exp.category === 'Stay'
        ? `${tripEstimator.nights} Nights`
        : `${tripEstimator.guests} Explorers`;

    // Sync to D1 + Interakt WhatsApp API + Meta CAPI Lead deduplication
    if (tripEstimator.guestPhone.replace(/\D/g, '').length >= 8) {
      dispatchOmnichannelLead({
        name: sanitizeClientInput(tripEstimator.guestName || 'Website Guest', 80),
        phone: sanitizeClientInput(tripEstimator.guestPhone, 30),
        category: exp.category,
        destination: exp.locationName,
        listingId: exp.id,
        dates: tripEstimator.checkIn || 'Flexible',
        nights: tripEstimator.nights,
        guests: tripEstimator.guests,
        estimatedValueInr: estimatedTotal,
        currency,
        notes: `Estimator Request: ${exp.name} (${unitLabel})`,
        sourceChannel: 'website'
      });
      showToast('Brochure & availability request dispatched via Interakt Concierge!');
    } else {
      trackOmnichannelEvent({
        eventName: 'whatsapp_handoff',
        category: exp.category,
        destination: exp.locationName,
        listingId: exp.id,
        valueInr: estimatedTotal
      });
    }

    const dateLine = tripEstimator.checkIn ? `\n• Preferred Date: ${tripEstimator.checkIn}` : '';
    const text = encodeURIComponent(
      `Hello ${siteContent.businessName}! I would like to request availability:\n• ${sanitizeClientInput(exp.category, 20)}: ${sanitizeClientInput(exp.name, 120)}\n• Destination: ${sanitizeClientInput(exp.locationName, 80)} (${sanitizeClientInput(exp.country, 50)})${dateLine}\n• Party & Duration: ${tripEstimator.guests} Guests • ${unitLabel}\n• Estimated Tariff (${currency}): ${formattedTotal}\nPlease share curated itinerary & booking link.`
    );
    window.open(
      `https://wa.me/${cleanPhone}?text=${text}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleCopyShortlist = async () => {
    if (savedExperiences.length === 0) return;
    const totalInr = savedExperiences.reduce((acc, item) => acc + (item.numericPrice || 35000), 0);
    const summary = [
      `${siteContent.businessName} — Saved Voyages Shortlist`,
      ...savedExperiences.map(
        (item, idx) =>
          `${idx + 1}. [${item.category}] ${item.name} — ${item.locationName} (${formatConvertedTariff(item.numericPrice || 35000, currency)})`
      ),
      `Combined Base Estimate (${currency}): ${formatConvertedTariff(totalInr, currency)}`
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      showToast('Shortlist copied to clipboard for sharing!');
    } catch {
      showToast('Shortlist ready — send via Concierge below.');
    }
  };

  const handleSendWishlistToConcierge = () => {
    if (savedExperiences.length === 0) return;
    const totalInr = savedExperiences.reduce((acc, item) => acc + (item.numericPrice || 35000), 0);
    trackOmnichannelEvent({
      eventName: 'whatsapp_handoff',
      category: savedExperiences[0]?.category || 'Stay',
      destination: savedExperiences.map((i) => i.locationName).slice(0, 3).join(', '),
      valueInr: totalInr
    });
    const cleanPhone = (siteContent.whatsappNumber || '919820000000').replace(/\D/g, '');
    const lines = savedExperiences
      .map(
        (item, idx) =>
          `${idx + 1}. [${item.category}] ${item.name} — ${item.locationName} (${item.price})`
      )
      .join('\n');
    const text = encodeURIComponent(
      `Hello ${siteContent.businessName} Concierge! Here is my curated Saved Voyages shortlist:\n\n${lines}\n\nPlease help me plan a bespoke itinerary around these selections.`
    );
    window.open(
      `https://wa.me/${cleanPhone}?text=${text}`,
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
      loadCuratorOmnichannelData(digest);
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
      numericPrice: Number(String(newExp.price).replace(/[^0-9]/g, '')) || 45000,
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

      {/* OUTER ARCHITECTURAL MATTE POSTER FRAME */}
      <div className="mx-auto max-w-[1440px] bg-[#18181a] matte-frame-grain border border-white/15 rounded-[6px] shadow-[0_30px_100px_rgba(0,0,0,0.95)] relative overflow-hidden">
        {/* LEFT & RIGHT VERTICAL RULER TICK MARKS */}
        <div className="hidden sm:flex flex-col justify-between items-start absolute left-2.5 top-28 bottom-28 w-3 pointer-events-none z-30 opacity-45">
          {Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              className={`block h-[1px] bg-[#f4efe6] ${i % 5 === 0 ? 'w-3' : 'w-1.5'}`}
            />
          ))}
        </div>
        <div className="hidden sm:flex flex-col justify-between items-end absolute right-2.5 top-28 bottom-28 w-3 pointer-events-none z-30 opacity-45">
          {Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              className={`block h-[1px] bg-[#f4efe6] ${i % 5 === 0 ? 'w-3' : 'w-1.5'}`}
            />
          ))}
        </div>

        {/* 1. TOP EDITORIAL HEADER BAR */}
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
              aria-label="Open Curator Studio"
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

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleNavigatePage('home')}
                className="font-script text-4xl sm:text-5xl lg:text-6xl text-[#f4efe6] hover:text-[#d6c5b3] transition tracking-wide leading-none"
              >
                {siteContent.businessName}
              </button>
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

          <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-around max-w-3xl mx-auto text-[9px] text-[#d6c5b3]">
            <span>▲</span>
            <span>▲</span>
            <span>▲</span>
            <span>▲</span>
            <span>▲</span>
          </div>
        </header>

        {activePage === 'home' ? (
          <>
            {/* 2. 4K 3D BLACK GLOBE HERO WITH PERFORATED POSTAGE STAMPS */}
            <section
              id="globe-hero-section"
              className="relative mx-2 sm:mx-8 my-2 rounded-[18px] overflow-hidden border border-white/15 shadow-2xl"
            >
              <StampGlobeHero
                locations={DESTINATION_LOCATIONS}
                selectedLocation={activeLocation}
                onSelectLocation={(loc) => {
                  setActiveLocation(loc);
                  trackOmnichannelEvent({
                    eventName: 'globe_stamp_click',
                    category: selectedCategory,
                    destination: loc.name
                  });
                  handleOpenCategoryCatalog(selectedCategory, loc.id);
                }}
                onScrollToExplorer={(loc) =>
                  handleOpenCategoryCatalog(selectedCategory, loc.id)
                }
              />
            </section>

            {/* 3. MIDDLE ARCHITECTURAL DIVIDER & "START YOUR VOYAGE" */}
            <div className="relative z-20 px-4 sm:px-12 py-6 bg-[#18181a] border-t border-white/10">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
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

            {/* 4. "CHOOSE A DESTINATION" TOGGLER & 3 CATEGORY WINDOWS */}
            <section
              id="destination-toggler-section"
              className="relative px-4 sm:px-10 pt-10 pb-20 border-t border-white/10 overflow-hidden min-h-[760px] flex flex-col justify-center"
            >
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
                <div className="text-center space-y-6">
                  <h2 className="font-sans-clean font-bold text-3xl sm:text-5xl tracking-tight text-white">
                    Choose a Destination
                  </h2>

                  <div className="mx-auto max-w-xl rounded-full p-1 border border-white/60 bg-black/25 backdrop-blur-2xl grid grid-cols-3 items-center shadow-2xl">
                    {['Stay', 'Tour', 'Trek'].map((option) => {
                      const isActive = selectedCategory === option;
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedCategory(option);
                            setCatalogLocationFilter('ALL');
                            trackOmnichannelEvent({
                              eventName: 'category_select',
                              category: option,
                              destination: 'All Destinations'
                            });
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

                {!isCatalogOpen ? (
                  <div className="space-y-8 animate-editorial-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center pt-4">
                      {categoryWindows.map((win) => {
                        const isActiveCard = selectedCategory === win.category;
                        return (
                          <div
                            key={win.category}
                            onClick={() =>
                              handleOpenCategoryCatalog(win.category, 'ALL')
                            }
                            className={`card-sheen group cursor-pointer relative rounded-[28px] overflow-hidden border transition-all duration-500 aspect-[3/4.15] flex flex-col justify-between p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.75)] ${
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

                            <div className="relative z-10">
                              <h3 className="font-sans-clean font-bold text-2xl sm:text-[1.75rem] text-white leading-tight drop-shadow-md">
                                {win.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-white/85 mt-1">
                                {win.subtitle}
                              </p>
                            </div>

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
                      <div className="relative pt-2 pb-4 flex flex-col items-center space-y-7 select-none animate-editorial-in">
                        {/* Top Spatial Frosted Glass Bar */}
                        <div className="w-full max-w-3xl rounded-full px-3 sm:px-5 py-2.5 bg-white/[0.14] border border-white/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                              onClick={() => setIsCatalogOpen(false)}
                              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition"
                              title="Back to 3 Windows"
                              aria-label="Back to 3 Category Windows"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handlePrevSlide}
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
                              title="Previous in Catalog"
                              aria-label="Previous option"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleNextSlide}
                              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
                              title="Next in Catalog"
                              aria-label="Next option"
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
                              onClick={() => setWishlistOpen(true)}
                              className="relative w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition"
                              title="Open Saved Voyages Shortlist"
                              aria-label="Open Saved Voyages Shortlist"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  savedIds.length > 0
                                    ? 'fill-[#e63946] text-[#e63946]'
                                    : ''
                                }`}
                              />
                              {savedIds.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f6eedc] text-[#09090b] text-[9px] font-bold flex items-center justify-center">
                                  {savedIds.length}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => openDetailModal(currentSlide)}
                              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition"
                              title="View Full Itinerary & Estimate"
                              aria-label="View Full Itinerary & Estimate"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setIsCatalogOpen(false)}
                              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition"
                              title="Close Catalog"
                              aria-label="Close Catalog"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Spatial 3D Fanned Card Deck with Native Touch-Swipe */}
                        <div
                          className="relative w-full max-w-5xl h-[430px] sm:h-[470px] flex items-center justify-center touch-pan-y"
                          onTouchStart={(e) => {
                            touchStartXRef.current = e.touches[0].clientX;
                          }}
                          onTouchEnd={(e) => {
                            if (touchStartXRef.current === null) return;
                            const deltaX =
                              e.changedTouches[0].clientX - touchStartXRef.current;
                            touchStartXRef.current = null;
                            if (deltaX > 45) handlePrevSlide();
                            if (deltaX < -45) handleNextSlide();
                          }}
                        >
                          <div className="hidden md:flex flex-col items-center gap-3 p-2 rounded-full bg-white/[0.14] border border-white/30 backdrop-blur-2xl shadow-2xl absolute left-2 lg:left-6 z-30">
                            <button
                              onClick={() => openDetailModal(currentSlide)}
                              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white transition"
                              title="Inspect Details & Price Estimator"
                              aria-label="Inspect Details & Price Estimator"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleSaveExperience(currentSlide)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                                savedIds.includes(currentSlide.id)
                                  ? 'bg-[#e63946] text-white'
                                  : 'bg-white/10 hover:bg-white/25 text-white'
                              }`}
                              title="Save to Wishlist"
                              aria-label="Save to Wishlist"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setIsCatalogOpen(false)}
                              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
                              title="Back to 3 Windows"
                              aria-label="Back to 3 Windows"
                            >
                              <Compass className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="relative w-full max-w-[440px] sm:max-w-[490px] h-full flex items-center justify-center">
                            {[-2, -1, 0, 1, 2].map((offset) => {
                              const slideIdx =
                                ((safeIndex + offset) % slides.length + slides.length) %
                                slides.length;
                              const item = slides[slideIdx];
                              const isCenter = offset === 0;

                              const spreadPx =
                                viewportWidth < 640
                                  ? 42
                                  : viewportWidth < 1024
                                  ? 76
                                  : 105;
                              const translateX = offset * spreadPx;
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
                                    <div className="relative z-20 p-4 flex items-center justify-between">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePrevSlide();
                                        }}
                                        className="w-9 h-9 rounded-full bg-black/35 hover:bg-black/55 border border-white/25 backdrop-blur-md flex items-center justify-center text-white transition"
                                        title="Previous in Catalog"
                                        aria-label="Previous in Catalog"
                                      >
                                        <ChevronLeft className="w-4 h-4" />
                                      </button>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openDetailModal(item);
                                          }}
                                          className="px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-white/25 border border-white/30 backdrop-blur-md text-xs font-sans-clean font-semibold text-white transition inline-flex items-center gap-1.5 shadow-lg"
                                        >
                                          <Info className="w-3.5 h-3.5" />
                                          <span>Details &amp; Estimate</span>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleWhatsAppReserve(item);
                                          }}
                                          className="px-3.5 py-1.5 rounded-full bg-[#f6eedc] hover:bg-[#d6c5b3] text-[#09090b] text-xs font-sans-clean font-bold transition inline-flex items-center gap-1 shadow-lg"
                                        >
                                          <ArrowUpRight className="w-3.5 h-3.5" />
                                          <span>Book</span>
                                        </button>
                                      </div>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleNextSlide();
                                        }}
                                        className="w-9 h-9 rounded-full bg-black/35 hover:bg-black/55 border border-white/25 backdrop-blur-md flex items-center justify-center text-white transition"
                                        title="Next in Catalog"
                                        aria-label="Next in Catalog"
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

                        {/* Bottom Spatial Location Switcher Pill */}
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
          </>
        ) : (
          /* MANDATORY PAGES VIEW (ABOUT, CONTACT, FAQ, REFUNDS, TERMS, PRIVACY) */
          <section className="px-4 sm:px-12 py-12 sm:py-16 min-h-[680px] animate-editorial-in">
            <div className="max-w-4xl mx-auto space-y-8">
              <button
                type="button"
                onClick={() => handleNavigatePage('home')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono-tech uppercase tracking-widest text-[#d6c5b3] transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to 3D Stamp Atlas</span>
              </button>

              {activePage === 'about' && (
                <div className="space-y-6 bg-black/35 border border-white/15 rounded-[28px] p-6 sm:p-10">
                  <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                    OUR STORY &amp; MANIFESTO
                  </span>
                  <h2 className="font-script text-5xl sm:text-6xl text-[#f4efe6]">
                    {siteContent.aboutTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed whitespace-pre-line">
                    {siteContent.aboutDescription}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="font-serif-editorial text-3xl text-[#d6c5b3]">{siteContent.stat1Value}</div>
                      <div className="text-xs text-white/70 mt-1">{siteContent.stat1Label}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="font-serif-editorial text-3xl text-[#d6c5b3]">{siteContent.stat2Value}</div>
                      <div className="text-xs text-white/70 mt-1">{siteContent.stat2Label}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="font-serif-editorial text-3xl text-[#d6c5b3]">{siteContent.stat3Value}</div>
                      <div className="text-xs text-white/70 mt-1">{siteContent.stat3Label}</div>
                    </div>
                  </div>
                </div>
              )}

              {activePage === 'contact' && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-black/35 border border-white/15 rounded-[28px] p-6 sm:p-10">
                  <div className="lg:col-span-2 space-y-5">
                    <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                      24/7 PRIVATE DESK
                    </span>
                    <h2 className="font-script text-5xl text-[#f4efe6]">
                      Contact Us
                    </h2>
                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                      Reach our hospitality concierge for private villa reservations, helicopter transfers, or custom expedition itineraries.
                    </p>
                    <div className="space-y-3 pt-2 text-xs text-white/85">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-[#d6c5b3] shrink-0" />
                        <span>{siteContent.phoneDisplay}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-[#d6c5b3] shrink-0" />
                        <span>{siteContent.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-[#d6c5b3] shrink-0" />
                        <span>{siteContent.address}</span>
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={handleContactSubmit}
                    className="lg:col-span-3 space-y-4 bg-white/[0.04] border border-white/10 rounded-2xl p-6"
                  >
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={contactForm.website_trap}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, website_trap: e.target.value })
                      }
                      className="hidden"
                      aria-hidden="true"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        required
                        type="text"
                        placeholder="Your Full Name"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, name: e.target.value })
                        }
                        className="px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-xs text-white"
                      />
                      <input
                        required
                        type="email"
                        placeholder="Email Address"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, email: e.target.value })
                        }
                        className="px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        required
                        type="tel"
                        placeholder="Phone / WhatsApp"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, phone: e.target.value })
                        }
                        className="px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-xs text-white"
                      />
                      <select
                        value={contactForm.category}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, category: e.target.value })
                        }
                        className="px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-xs text-white"
                      >
                        <option value="Stay">Curated Stay</option>
                        <option value="Tour">Bespoke Tour</option>
                        <option value="Trek">Guided Trek</option>
                      </select>
                      <select
                        value={contactForm.destination}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, destination: e.target.value })
                        }
                        className="px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-xs text-white"
                      >
                        {DESTINATION_LOCATIONS.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      required
                      rows={4}
                      placeholder="Preferred dates, number of guests, or special requests..."
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-xs text-white"
                    />
                    {contactSubmitted && (
                      <p className="text-xs text-[#9eb393]">
                        Concierge dispatch initiated! Opening WhatsApp confirmation...
                      </p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-[#f6eedc] text-[#09090b] font-bold text-xs uppercase tracking-widest hover:bg-[#d6c5b3] transition inline-flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Concierge Inquiry</span>
                    </button>
                  </form>
                </div>
              )}

              {activePage === 'faq' && (
                <div className="space-y-6 bg-black/35 border border-white/15 rounded-[28px] p-6 sm:p-10">
                  <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                    GUEST ASSISTANCE
                  </span>
                  <h2 className="font-script text-5xl text-[#f4efe6]">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {(siteContent.faqs || DEFAULT_SITE_CONTENT.faqs).map((item, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <h3 className="font-sans-clean font-bold text-base text-white">{item.q}</h3>
                        <p className="text-xs sm:text-sm text-white/75 leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePage === 'refunds' && (
                <div className="space-y-5 bg-black/35 border border-white/15 rounded-[28px] p-6 sm:p-10 text-xs sm:text-sm text-white/80 leading-relaxed">
                  <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                    BOOKING ASSURANCE
                  </span>
                  <h2 className="font-script text-5xl text-[#f4efe6]">
                    Cancellation &amp; Refund Policy
                  </h2>
                  <p className="whitespace-pre-line">{siteContent.refundPolicy1}</p>
                  <p className="whitespace-pre-line">{siteContent.refundPolicy2}</p>
                  <p className="whitespace-pre-line">{siteContent.refundPolicy3}</p>
                </div>
              )}

              {activePage === 'terms' && (
                <div className="space-y-5 bg-black/35 border border-white/15 rounded-[28px] p-6 sm:p-10 text-xs sm:text-sm text-white/80 leading-relaxed">
                  <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                    LEGAL GOVERNANCE
                  </span>
                  <h2 className="font-script text-5xl text-[#f4efe6]">
                    Terms &amp; Conditions
                  </h2>
                  <p className="whitespace-pre-line">{siteContent.termsParagraph1}</p>
                  <p className="whitespace-pre-line">{siteContent.termsParagraph2}</p>
                </div>
              )}

              {activePage === 'privacy' && (
                <div className="space-y-5 bg-black/35 border border-white/15 rounded-[28px] p-6 sm:p-10 text-xs sm:text-sm text-white/80 leading-relaxed">
                  <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                    DATA PROTECTION &amp; DPDP COMPLIANCE
                  </span>
                  <h2 className="font-script text-5xl text-[#f4efe6]">
                    Privacy Policy
                  </h2>
                  <p className="whitespace-pre-line">{siteContent.privacyParagraph1}</p>
                  <p className="whitespace-pre-line">
                    {siteContent.privacyParagraph2} For data deletion requests, contact <code>{siteContent.email}</code>.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Bottom Architectural Footer Strip with Mandatory Legal & Hospitality Links */}
        <footer className="px-4 sm:px-10 py-6 bg-[#141416] border-t border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[10px] font-mono-tech uppercase tracking-widest text-white/75">
            <button onClick={() => handleNavigatePage('home')} className="hover:text-[#d6c5b3] transition">
              3D Atlas
            </button>
            <button onClick={() => handleNavigatePage('about')} className="hover:text-[#d6c5b3] transition">
              About Us
            </button>
            <button onClick={() => handleNavigatePage('contact')} className="hover:text-[#d6c5b3] transition">
              Contact Us
            </button>
            <button onClick={() => handleNavigatePage('faq')} className="hover:text-[#d6c5b3] transition">
              FAQs
            </button>
            <button onClick={() => handleNavigatePage('refunds')} className="hover:text-[#d6c5b3] transition">
              Cancellation &amp; Refunds
            </button>
            <button onClick={() => handleNavigatePage('terms')} className="hover:text-[#d6c5b3] transition">
              Terms &amp; Conditions
            </button>
            <button onClick={() => handleNavigatePage('privacy')} className="hover:text-[#d6c5b3] transition">
              Privacy Policy
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono-tech uppercase tracking-[0.22em] text-white/60">
            <span>{siteContent.tagline}</span>
            <span>{siteContent.domain}</span>
          </div>
        </footer>
      </div>

      {/* TOAST FEEDBACK PILL */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-full bg-[#18181a]/95 border border-[#d6c5b3]/50 backdrop-blur-xl text-xs font-sans-clean text-[#f6eedc] shadow-2xl flex items-center gap-2 animate-editorial-in">
          <Sparkles className="w-3.5 h-3.5 text-[#d6c5b3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* FLOATING SAVED VOYAGES SHORTLIST BUTTON */}
      {savedIds.length > 0 && !wishlistOpen && (
        <button
          type="button"
          onClick={() => setWishlistOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-[#18181a]/95 border border-[#d6c5b3]/50 backdrop-blur-xl text-[#f4efe6] shadow-[0_18px_50px_rgba(0,0,0,0.85)] hover:bg-[#f6eedc] hover:text-[#09090b] transition inline-flex items-center gap-2.5 text-xs font-mono-tech uppercase tracking-wider"
        >
          <Heart className="w-4 h-4 fill-[#e63946] text-[#e63946]" />
          <span>Saved Voyages ({savedIds.length})</span>
        </button>
      )}

      {/* EXPERIENCE DETAIL, MULTI-IMAGE GALLERY, SAMPLE ITINERARY & LIVE TRIP ESTIMATOR MODAL */}
      {detailExperience && (() => {
        const meta = getExperienceTravelMeta(detailExperience);
        const unitPrice = detailExperience.numericPrice || 35000;
        const factor =
          detailExperience.category === 'Stay'
            ? tripEstimator.nights
            : tripEstimator.guests;
        const estimatedTotal = unitPrice * Math.max(1, factor);
        const isSaved = savedIds.includes(detailExperience.id);
        const activePhoto = meta.gallery[detailGalleryIdx] || meta.gallery[0];

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
            onClick={() => setDetailExperience(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[28px] bg-[#161619] border border-white/20 text-[#f4efe6] shadow-[0_30px_100px_rgba(0,0,0,0.9)] animate-editorial-in"
            >
              {/* Multi-Image Editorial Gallery Header */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                <img
                  src={activePhoto.url}
                  alt={detailExperience.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161619] via-black/30 to-black/45" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-[10px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                      {detailExperience.category} • {detailExperience.locationName}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full border backdrop-blur-md text-[10px] font-mono-tech uppercase tracking-wider inline-flex items-center gap-1 ${
                        meta.inSeasonNow
                          ? 'bg-[#9eb393]/20 border-[#9eb393]/45 text-[#d9ead3]'
                          : 'bg-black/55 border-white/20 text-white/80'
                      }`}
                    >
                      <Sun className="w-3 h-3" />
                      <span>
                        {meta.inSeasonNow ? 'In Season Now' : 'Plan Ahead'} • {meta.climateLabel}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleSaveExperience(detailExperience)}
                      className={`w-9 h-9 rounded-full border backdrop-blur-md flex items-center justify-center transition ${
                        isSaved
                          ? 'bg-[#e63946] border-[#e63946] text-white'
                          : 'bg-black/55 border-white/25 text-white hover:bg-white/20'
                      }`}
                      aria-label={isSaved ? 'Remove from Saved Voyages' : 'Save to Voyages'}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailExperience(null)}
                      className="w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 border border-white/25 backdrop-blur-md flex items-center justify-center text-white transition"
                      aria-label="Close Details Modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Gallery Navigation Arrows */}
                <button
                  type="button"
                  onClick={() =>
                    setDetailGalleryIdx((prev) => (prev - 1 + meta.gallery.length) % meta.gallery.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/75 border border-white/25 backdrop-blur-md flex items-center justify-center text-white transition"
                  aria-label="Previous gallery photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDetailGalleryIdx((prev) => (prev + 1) % meta.gallery.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/75 border border-white/25 backdrop-blur-md flex items-center justify-center text-white transition"
                  aria-label="Next gallery photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Gallery Thumbnails Strip */}
                <div className="absolute bottom-4 left-6 right-6 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/50 border border-white/15 backdrop-blur-md text-[10px] font-mono-tech text-[#d6c5b3] mb-1.5">
                      <span>{activePhoto.label}</span>
                      <span className="opacity-60">•</span>
                      <span>
                        {detailGalleryIdx + 1}/{meta.gallery.length}
                      </span>
                    </div>
                    <h3 className="font-serif-editorial text-3xl sm:text-4xl text-white leading-tight">
                      {detailExperience.name}
                    </h3>
                    <p className="text-xs text-white/75 mt-1">
                      {detailExperience.subtitle} • {detailExperience.country} • ★ {detailExperience.rating}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {meta.gallery.map((g, gIdx) => (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => setDetailGalleryIdx(gIdx)}
                        className={`relative w-12 h-9 rounded-lg overflow-hidden border transition ${
                          detailGalleryIdx === gIdx
                            ? 'border-[#f6eedc] ring-2 ring-[#d6c5b3]/60 scale-105'
                            : 'border-white/30 opacity-70 hover:opacity-100'
                        }`}
                        title={g.label}
                        aria-label={`View ${g.label}`}
                      >
                        <img src={g.url} alt={g.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Editorial Overview / Sample Itinerary Switcher */}
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                  <div className="inline-flex items-center gap-2 p-1 rounded-full bg-white/[0.05] border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setDetailTab('overview')}
                      className={`px-4 py-1.5 rounded-full font-semibold transition ${
                        detailTab === 'overview'
                          ? 'bg-[#f6eedc] text-[#09090b]'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Overview &amp; Inclusions
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('itinerary')}
                      className={`px-4 py-1.5 rounded-full font-semibold transition ${
                        detailTab === 'itinerary'
                          ? 'bg-[#f6eedc] text-[#09090b]'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Curated Itinerary
                    </button>
                  </div>
                  <div className="font-mono-tech text-xs sm:text-sm font-bold text-[#d6c5b3]">
                    {detailExperience.price}
                  </div>
                </div>

                {detailTab === 'overview' ? (
                  <div className="space-y-6">
                    <p className="text-sm text-white/85 leading-relaxed">
                      {detailExperience.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                        <div className="text-[10px] font-mono-tech uppercase text-[#d6c5b3] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Best Season</span>
                        </div>
                        <div className="text-white/90 font-medium">{meta.bestSeason}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                        <div className="text-[10px] font-mono-tech uppercase text-[#d6c5b3] flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          <span>Private Transfer</span>
                        </div>
                        <div className="text-white/90 font-medium">{meta.transfer}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                        <div className="text-[10px] font-mono-tech uppercase text-[#d6c5b3] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Duration &amp; Party</span>
                        </div>
                        <div className="text-white/90 font-medium">
                          {detailExperience.duration} • {detailExperience.groupSize}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                        CURATED INCLUSIONS
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-white/85">
                        {meta.inclusions.map((inc, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10"
                          >
                            <Check className="w-4 h-4 text-[#9eb393] shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {meta.itinerary.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row gap-3 sm:gap-5"
                      >
                        <div className="font-mono-tech text-xs uppercase tracking-widest text-[#d6c5b3] shrink-0 sm:w-20 pt-0.5">
                          {step.day}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-serif-editorial text-xl text-white">
                            {step.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactive Live Trip Estimator */}
                <div className="p-5 rounded-2xl bg-black/45 border border-[#d6c5b3]/30 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                      LIVE TARIFF ESTIMATOR
                    </span>
                    <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-white/[0.06] border border-white/15">
                      {Object.keys(CURRENCY_CONFIG).map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setCurrency(code);
                            trackOmnichannelEvent({
                              eventName: 'currency_switch',
                              category: detailExperience.category,
                              destination: detailExperience.locationName,
                              listingId: detailExperience.id
                            });
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono-tech transition ${
                            currency === code
                              ? 'bg-[#f6eedc] text-[#09090b] font-bold'
                              : 'text-white/70 hover:text-white'
                          }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase text-white/60 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={tripEstimator.checkIn}
                        onChange={(e) =>
                          setTripEstimator({ ...tripEstimator, checkIn: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase text-white/60 mb-1">
                        {detailExperience.category === 'Stay' ? 'Nights' : 'Days / Sessions'}
                      </label>
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15">
                        <button
                          type="button"
                          onClick={() =>
                            setTripEstimator((prev) => ({
                              ...prev,
                              nights: Math.max(1, prev.nights - 1)
                            }))
                          }
                          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                          aria-label="Decrease nights"
                        >
                          -
                        </button>
                        <span className="font-mono-tech font-bold text-white">
                          {tripEstimator.nights}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setTripEstimator((prev) => ({
                              ...prev,
                              nights: Math.min(21, prev.nights + 1)
                            }))
                          }
                          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                          aria-label="Increase nights"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase text-white/60 mb-1">
                        Guests / Explorers
                      </label>
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15">
                        <button
                          type="button"
                          onClick={() =>
                            setTripEstimator((prev) => ({
                              ...prev,
                              guests: Math.max(1, prev.guests - 1)
                            }))
                          }
                          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                          aria-label="Decrease guests"
                        >
                          -
                        </button>
                        <span className="font-mono-tech font-bold text-white">
                          {tripEstimator.guests}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTripEstimator((prev) => ({
                              ...prev,
                              guests: Math.min(16, prev.guests + 1)
                            }));
                            trackOmnichannelEvent({
                              eventName: 'estimator_update',
                              category: detailExperience.category,
                              destination: detailExperience.locationName,
                              listingId: detailExperience.id,
                              valueInr: estimatedTotal
                            });
                          }}
                          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                          aria-label="Increase guests"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Optional Quick Interakt WhatsApp Brochure Capture */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <input
                      type="text"
                      placeholder="Your Name (Optional — for instant brochure)"
                      value={tripEstimator.guestName}
                      onChange={(e) =>
                        setTripEstimator({ ...tripEstimator, guestName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder:text-white/40 text-xs"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp Number (Triggers automated PDF)"
                      value={tripEstimator.guestPhone}
                      onChange={(e) =>
                        setTripEstimator({ ...tripEstimator, guestPhone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder:text-white/40 text-xs"
                    />
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono-tech uppercase text-white/60">
                        Estimated Sanctuary Total ({currency})
                      </div>
                      <div className="font-serif-editorial text-3xl text-[#f6eedc]">
                        {formatConvertedTariff(estimatedTotal, currency)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBookWithEstimate(detailExperience)}
                      className="px-6 py-3.5 rounded-full bg-[#f6eedc] hover:bg-[#d6c5b3] text-[#09090b] font-bold text-xs uppercase tracking-widest transition inline-flex items-center justify-center gap-2 shadow-xl"
                    >
                      <span>Request Availability via Concierge</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SAVED VOYAGES (WISHLIST) SLIDE-OVER DRAWER */}
      {wishlistOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
          onClick={() => setWishlistOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full bg-[#141417] border-l border-white/15 p-6 flex flex-col justify-between shadow-2xl"
          >
            <div className="space-y-5 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                    YOUR CURATED SHORTLIST
                  </span>
                  <h3 className="font-serif-editorial text-3xl text-white">
                    Saved Voyages ({savedExperiences.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setWishlistOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                  aria-label="Close Saved Voyages"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {savedExperiences.length === 0 ? (
                <div className="py-16 text-center space-y-3 text-white/65">
                  <Heart className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-sm">No saved Stays, Tours, or Treks yet.</p>
                  <p className="text-xs text-white/45">
                    Tap the Star or Heart icon on any catalog card to build your multi-stop itinerary.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedExperiences.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3.5"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/15"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono-tech uppercase text-[#d6c5b3]">
                          {item.category} • {item.locationName}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setWishlistOpen(false);
                            openDetailModal(item);
                          }}
                          className="text-left font-sans-clean font-bold text-xs sm:text-sm text-white hover:text-[#d6c5b3] truncate block w-full"
                        >
                          {item.name}
                        </button>
                        <div className="text-[11px] text-white/65 mt-0.5">{item.price}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSaveExperience(item)}
                        className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-[#e63946] transition"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {savedExperiences.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono-tech uppercase text-white/55">
                      {new Set(savedExperiences.map((i) => i.locationName)).size} Destination(s) • Base Estimate ({currency})
                    </div>
                    <div className="font-serif-editorial text-2xl text-[#f6eedc]">
                      {formatConvertedTariff(
                        savedExperiences.reduce(
                          (sum, item) => sum + (item.numericPrice || 35000),
                          0
                        ),
                        currency
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyShortlist}
                    className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono-tech uppercase inline-flex items-center gap-1.5 transition"
                    title="Copy Shortlist to Clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendWishlistToConcierge}
                  className="w-full py-3.5 rounded-full bg-[#f6eedc] hover:bg-[#d6c5b3] text-[#09090b] font-bold text-xs uppercase tracking-widest transition inline-flex items-center justify-center gap-2"
                >
                  <span>Send Full Shortlist to Concierge</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSavedIds([])}
                  className="w-full py-2 text-[11px] font-mono-tech uppercase text-white/50 hover:text-white transition"
                >
                  Clear All Saved Items
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CURATOR HOST STUDIO */}
      {hostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#161619] border border-white/20 p-6 sm:p-7 text-[#f4efe6] space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                  CURATOR &amp; BUSINESS CMS STUDIO
                </span>
                <h3 className="font-serif-editorial text-3xl">Manage Listings &amp; Pages</h3>
              </div>
              <button onClick={() => setHostModalOpen(false)} aria-label="Close Curator Studio">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isHostAuthenticated ? (
              <form onSubmit={handleCuratorLogin} className="space-y-4 text-xs">
                <p className="text-white/70">
                  Enter curator passcode (<code className="text-[#d6c5b3]">oasis2026</code>) verified via Web Crypto SHA-256 to publish listings or customize your business pages.
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
                  <p className="text-[#e63946] font-mono-tech text-[11px]">{authError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#f6eedc] text-[#09090b] font-bold uppercase tracking-wider"
                >
                  Unlock Studio
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full bg-black/40 border border-white/15 text-[11px] sm:text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStudioTab('listings');
                      setD1Status('');
                    }}
                    className={`py-2 rounded-full font-bold transition ${
                      studioTab === 'listings'
                        ? 'bg-[#f6eedc] text-[#09090b]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    1. Add Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudioTab('pages');
                      setD1Status('');
                    }}
                    className={`py-2 rounded-full font-bold transition ${
                      studioTab === 'pages'
                        ? 'bg-[#f6eedc] text-[#09090b]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    2. Business Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudioTab('analytics');
                      setD1Status('');
                      loadCuratorOmnichannelData();
                    }}
                    className={`py-2 rounded-full font-bold transition inline-flex items-center justify-center gap-1 ${
                      studioTab === 'analytics'
                        ? 'bg-[#f6eedc] text-[#09090b]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>3. Analytics &amp; CRM</span>
                  </button>
                </div>

                {studioTab === 'listings' ? (
                  <form onSubmit={handleCreateD1Experience} className="space-y-3 text-xs">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <select
                        value={newExp.locationId}
                        onChange={(e) =>
                          setNewExp({ ...newExp, locationId: e.target.value })
                        }
                        className="px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white"
                      >
                        {DESTINATION_LOCATIONS.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name} ({loc.country})
                          </option>
                        ))}
                      </select>
                      <select
                        value={newExp.category}
                        onChange={(e) =>
                          setNewExp({ ...newExp, category: e.target.value })
                        }
                        className="px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white"
                      >
                        <option value="Stay">Stay</option>
                        <option value="Tour">Tour</option>
                        <option value="Trek">Trek</option>
                      </select>
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="Experience / Villa Title"
                      value={newExp.name}
                      onChange={(e) => setNewExp({ ...newExp, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20"
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
                    <input
                      type="url"
                      placeholder="HTTPS Image URL (https://...)"
                      value={newExp.image}
                      onChange={(e) => setNewExp({ ...newExp, image: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20"
                    />
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
                      Publish to Location Window &amp; D1
                    </button>
                  </form>
                ) : studioTab === 'pages' ? (
                  <form onSubmit={handleSaveSiteContent} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono-tech uppercase text-[#d6c5b3] mb-1">
                          Brand Name
                        </label>
                        <input
                          type="text"
                          value={siteContent.businessName}
                          onChange={(e) =>
                            setSiteContent({ ...siteContent, businessName: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono-tech uppercase text-[#d6c5b3] mb-1">
                          WhatsApp Number (Digits with Country Code)
                        </label>
                        <input
                          type="text"
                          value={siteContent.whatsappNumber}
                          onChange={(e) =>
                            setSiteContent({ ...siteContent, whatsappNumber: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono-tech uppercase text-[#d6c5b3] mb-1">
                          Contact Phone Display
                        </label>
                        <input
                          type="text"
                          value={siteContent.phoneDisplay}
                          onChange={(e) =>
                            setSiteContent({ ...siteContent, phoneDisplay: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono-tech uppercase text-[#d6c5b3] mb-1">
                          Official Email
                        </label>
                        <input
                          type="email"
                          value={siteContent.email}
                          onChange={(e) =>
                            setSiteContent({ ...siteContent, email: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase text-[#d6c5b3] mb-1">
                        Office / Sanctuary Address (Contact Page)
                      </label>
                      <input
                        type="text"
                        value={siteContent.address}
                        onChange={(e) =>
                          setSiteContent({ ...siteContent, address: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase text-[#d6c5b3] mb-1">
                        About Us Story
                      </label>
                      <textarea
                        rows={3}
                        value={siteContent.aboutDescription}
                        onChange={(e) =>
                          setSiteContent({ ...siteContent, aboutDescription: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase text-[#d6c5b3] mb-1">
                        Cancellation &amp; Refund Policy
                      </label>
                      <textarea
                        rows={2}
                        value={siteContent.refundPolicy2}
                        onChange={(e) =>
                          setSiteContent({ ...siteContent, refundPolicy2: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase text-[#d6c5b3] mb-1">
                        Terms &amp; Conditions
                      </label>
                      <textarea
                        rows={2}
                        value={siteContent.termsParagraph1}
                        onChange={(e) =>
                          setSiteContent({ ...siteContent, termsParagraph1: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase text-[#d6c5b3] mb-1">
                        Privacy Policy
                      </label>
                      <textarea
                        rows={2}
                        value={siteContent.privacyParagraph1}
                        onChange={(e) =>
                          setSiteContent({ ...siteContent, privacyParagraph1: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20"
                      />
                    </div>

                    {d1Status && <p className="text-[#9eb393] font-bold">{d1Status}</p>}

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-full bg-[#f6eedc] text-[#09090b] font-bold uppercase tracking-wider"
                      >
                        Save Custom Page Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleResetSiteContent}
                        className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white/80 font-mono-tech text-[10px] uppercase"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-5 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono-tech uppercase text-[#d6c5b3]">
                          CLOUDFLARE D1 + INTERAKT + META CAPI
                        </div>
                        <div className="text-sm font-bold text-white">
                          Live 30-Day Omnichannel Funnel &amp; Leads
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadCuratorOmnichannelData()}
                        className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono-tech text-[10px] uppercase inline-flex items-center gap-1.5 transition"
                      >
                        <RefreshCw className={`w-3 h-3 ${crmLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {/* Funnel KPIs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                        <div className="text-[10px] font-mono-tech uppercase text-white/55">
                          Stamp Clicks
                        </div>
                        <div className="font-serif-editorial text-2xl text-[#f6eedc]">
                          {analyticsData?.funnel?.globe_stamp_click ?? 0}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                        <div className="text-[10px] font-mono-tech uppercase text-white/55">
                          Detail Views
                        </div>
                        <div className="font-serif-editorial text-2xl text-[#f6eedc]">
                          {analyticsData?.funnel?.detail_view ?? 0}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                        <div className="text-[10px] font-mono-tech uppercase text-white/55">
                          Total Leads
                        </div>
                        <div className="font-serif-editorial text-2xl text-[#9eb393]">
                          {crmInquiries.length}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                        <div className="text-[10px] font-mono-tech uppercase text-white/55">
                          Pipeline Value
                        </div>
                        <div className="font-serif-editorial text-2xl text-[#d6c5b3]">
                          ₹
                          {crmInquiries
                            .reduce((s, r) => s + Number(r.estimated_value_inr || 0), 0)
                            .toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Destination Intent Breakdown */}
                    {analyticsData?.destinations?.length > 0 && (
                      <div className="p-4 rounded-2xl bg-black/35 border border-white/10 space-y-2.5">
                        <div className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                          TOP DESTINATIONS BY INTENT
                        </div>
                        <div className="space-y-1.5">
                          {analyticsData.destinations.map((d) => (
                            <div
                              key={d.destination}
                              className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 text-[11px]"
                            >
                              <span className="font-medium text-white">{d.destination}</span>
                              <span className="font-mono-tech text-white/70">
                                {d.stamp_clicks} Stamps • {d.detail_views} Views • {d.intents} Intents
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Omnichannel CRM Leads Inbox */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d6c5b3]">
                          OMNICHANNEL INQUIRIES (MARKING &ldquo;CONFIRMED&rdquo; FIRES META CAPI PURCHASE)
                        </span>
                      </div>

                      {crmInquiries.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-black/35 border border-white/10 text-center text-white/55">
                          No D1 leads recorded yet. Submit the Contact form, Estimator WhatsApp field, or an Instagram/WhatsApp message via Interakt to see live attribution here.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                          {crmInquiries.map((inq) => (
                            <div
                              key={inq.id}
                              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-white">{inq.name}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-mono-tech uppercase text-[#d6c5b3]">
                                    {inq.source_channel || 'website'}
                                  </span>
                                  {inq.interakt_synced === 1 && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-mono-tech text-[#9eb393]">
                                      <CheckCircle2 className="w-3 h-3" /> Interakt
                                    </span>
                                  )}
                                  {inq.capi_synced === 1 && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-mono-tech text-[#9eb393]">
                                      <CheckCircle2 className="w-3 h-3" /> CAPI
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-white/70 truncate">
                                  {inq.category} • {inq.destination} • {inq.country_code || '+91'}{' '}
                                  {inq.phone}
                                </div>
                                {Number(inq.estimated_value_inr) > 0 && (
                                  <div className="text-[10px] font-mono-tech text-[#d6c5b3]">
                                    Est. ₹{Number(inq.estimated_value_inr).toLocaleString('en-IN')} •{' '}
                                    {inq.dates || 'Flexible'}
                                  </div>
                                )}
                              </div>

                              <select
                                value={inq.status || 'New Inquiry'}
                                onChange={(e) =>
                                  handleUpdateInquiryStatus(inq.id, e.target.value)
                                }
                                className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-[11px] text-white shrink-0"
                              >
                                <option value="New Inquiry">New Inquiry</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Proposal Sent">Proposal Sent</option>
                                <option value="Confirmed">Confirmed (CAPI Purchase)</option>
                                <option value="Completed">Completed</option>
                                <option value="Archived">Archived</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
