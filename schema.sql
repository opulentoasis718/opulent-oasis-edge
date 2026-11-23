-- ============================================================================
-- OPULENT OASIS CLOUDFLARE D1 SCHEMA (SQLite at the Edge — Omnichannel Ready)
-- Supports: Listings, Omnichannel Inquiries, Meta CAPI, Interakt Sync & Analytics
-- ============================================================================

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS automation_logs;
DROP TABLE IF EXISTS analytics_events;
DROP TABLE IF EXISTS security_audit_logs;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS listings;

-- 1. LUXURY SANCTUARY, TOUR & TREK CATALOG
CREATE TABLE listings (
  id TEXT PRIMARY KEY CHECK (length(id) <= 128),
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 180),
  location_name TEXT NOT NULL CHECK (length(location_name) <= 120),
  country TEXT NOT NULL CHECK (length(country) <= 80),
  region TEXT NOT NULL CHECK (length(region) <= 140),
  category TEXT NOT NULL CHECK (category IN ('Stay', 'Tour', 'Trek')),
  sub_type TEXT CHECK (length(sub_type) <= 80),
  price TEXT NOT NULL CHECK (length(price) <= 64),
  numeric_price REAL NOT NULL CHECK (numeric_price >= 0 AND numeric_price <= 10000000),
  lat REAL NOT NULL CHECK (lat >= -90.0 AND lat <= 90.0),
  lng REAL NOT NULL CHECK (lng >= -180.0 AND lng <= 180.0),
  altitude TEXT CHECK (length(altitude) <= 64),
  duration TEXT CHECK (length(duration) <= 64),
  group_size TEXT CHECK (length(group_size) <= 64),
  terrain_type TEXT CHECK (length(terrain_type) <= 80),
  base_index REAL DEFAULT 9.5 CHECK (base_index >= 0.0 AND base_index <= 10.0),
  published INTEGER DEFAULT 1 CHECK (published IN (0, 1)),
  image TEXT CHECK (image LIKE 'https://%'),
  description TEXT CHECK (length(description) <= 2000),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listings_category_published ON listings(category, published, created_at DESC);
CREATE INDEX idx_listings_location ON listings(location_name, category);

-- 2. OMNICHANNEL LEADS & INQUIRIES (Web + Instagram DM + Facebook + WhatsApp/Interakt)
CREATE TABLE inquiries (
  id TEXT PRIMARY KEY CHECK (length(id) <= 128),
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 120),
  email TEXT CHECK (length(email) <= 160),
  phone TEXT NOT NULL CHECK (length(phone) >= 6 AND length(phone) <= 32),
  country_code TEXT DEFAULT '+91' CHECK (length(country_code) <= 8),
  category TEXT NOT NULL CHECK (category IN ('Stay', 'Tour', 'Trek')),
  destination TEXT NOT NULL CHECK (length(destination) <= 120),
  listing_id TEXT CHECK (length(listing_id) <= 128),
  dates TEXT CHECK (length(dates) <= 120),
  nights INTEGER DEFAULT 2 CHECK (nights >= 1 AND nights <= 60),
  guests INTEGER DEFAULT 2 CHECK (guests >= 1 AND guests <= 100),
  estimated_value_inr REAL DEFAULT 0 CHECK (estimated_value_inr >= 0),
  currency TEXT DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'CHF')),
  notes TEXT CHECK (length(notes) <= 1500),

  -- Omnichannel Attribution & Meta CAPI Deduplication
  source_channel TEXT DEFAULT 'website' CHECK (
    source_channel IN ('website', 'instagram_dm', 'instagram_comment', 'facebook_ad', 'whatsapp_ctwa', 'whatsapp_organic', 'referral')
  ),
  utm_source TEXT CHECK (length(utm_source) <= 100),
  utm_medium TEXT CHECK (length(utm_medium) <= 100),
  utm_campaign TEXT CHECK (length(utm_campaign) <= 160),
  fbp TEXT CHECK (length(fbp) <= 160),
  fbc TEXT CHECK (length(fbc) <= 200),
  meta_event_id TEXT CHECK (length(meta_event_id) <= 128),

  -- Automation Sync Flags
  interakt_synced INTEGER DEFAULT 0 CHECK (interakt_synced IN (0, 1)),
  interakt_user_id TEXT CHECK (length(interakt_user_id) <= 128),
  capi_synced INTEGER DEFAULT 0 CHECK (capi_synced IN (0, 1)),

  -- CRM Pipeline Status
  status TEXT DEFAULT 'New Inquiry' CHECK (
    status IN ('New Inquiry', 'Qualified', 'Proposal Sent', 'Confirmed', 'Completed', 'Archived')
  ),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inquiries_status_created ON inquiries(status, created_at DESC);
CREATE INDEX idx_inquiries_phone ON inquiries(phone);
CREATE INDEX idx_inquiries_channel ON inquiries(source_channel, created_at DESC);

-- 3. FIRST-PARTY EDGE FUNNEL ANALYTICS (Ad-Blocker Proof)
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY CHECK (length(id) <= 128),
  session_id TEXT NOT NULL CHECK (length(session_id) <= 128),
  event_name TEXT NOT NULL CHECK (
    event_name IN (
      'page_view',
      'globe_stamp_click',
      'category_select',
      'catalog_open',
      'detail_view',
      'estimator_update',
      'currency_switch',
      'wishlist_save',
      'whatsapp_handoff',
      'lead_submitted'
    )
  ),
  category TEXT CHECK (length(category) <= 32),
  destination TEXT CHECK (length(destination) <= 120),
  listing_id TEXT CHECK (length(listing_id) <= 128),
  value_inr REAL DEFAULT 0,
  utm_source TEXT CHECK (length(utm_source) <= 100),
  utm_campaign TEXT CHECK (length(utm_campaign) <= 160),
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  country_code TEXT CHECK (length(country_code) <= 8),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_event_time ON analytics_events(event_name, created_at DESC);
CREATE INDEX idx_analytics_destination ON analytics_events(destination, event_name);

-- 4. AUTOMATION & WEBHOOK OBSERVABILITY LOGS (Interakt + Meta CAPI)
CREATE TABLE automation_logs (
  id TEXT PRIMARY KEY CHECK (length(id) <= 128),
  provider TEXT NOT NULL CHECK (provider IN ('interakt', 'meta_capi', 'instagram_webhook', 'razorpay')),
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  event_type TEXT NOT NULL CHECK (length(event_type) <= 80),
  reference_id TEXT CHECK (length(reference_id) <= 128),
  http_status INTEGER,
  payload_summary TEXT CHECK (length(payload_summary) <= 1000),
  success INTEGER DEFAULT 1 CHECK (success IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_automation_provider_time ON automation_logs(provider, created_at DESC);

-- 5. ZERO-TRUST EDGE SECURITY AUDIT LOGS
CREATE TABLE security_audit_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_ip_hash TEXT NOT NULL,
  resource_id TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_created_at ON security_audit_logs(created_at DESC);

-- SEED INITIAL LUXURY LISTINGS
INSERT INTO listings (id, name, location_name, country, region, category, sub_type, price, numeric_price, lat, lng, altitude, duration, group_size, terrain_type, base_index, published, image, description) VALUES
('gorai-villa-1', 'Casa De Mar — Gorai Beachfront Sanctuary', 'Gorai Coast', 'India', 'North Mumbai Coast, Maharashtra', 'Stay', 'Villa', '₹32,000 / night', 32000, 19.24, 72.78, '12m ASL', 'Min 2 Nights', 'Up to 10 Guests', 'Coastal Palm Sanctuary', 9.2, 1, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'An architectural Portuguese-inspired courtyard villa tucked behind private casuarina groves on Gorai coast.'),
('alibaug-villa-1', 'The Banyan Glasshouse — Alibaug Sanctuary', 'Alibaug', 'India', 'Mandwa & Awas, Raigad Coast', 'Stay', 'Villa', '₹48,000 / night', 48000, 18.64, 72.87, '15m ASL', '2–7 Nights', 'Up to 12 Guests', 'Tropical Mango Estate', 9.5, 1, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', '20 minutes by private speedboat from the Gateway of India, spanning 3 acres of heirloom mango orchards.'),
('sahyadri-trek-1', 'Harishchandragad & Kokankada Cliff Crest Trek', 'Sahyadri Range', 'India', 'Western Ghats, Maharashtra', 'Trek', 'Mountains', '₹14,500 / person', 14500, 19.38, 73.77, '1,424m ASL', '3 Days / 2 Nights', 'Max 8 Explorers', 'Basalt Cliff Overhang', 9.3, 1, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', 'Ascend ancient rock-cut steps to the 1,424m Kokankada vertical basalt amphitheater.');
