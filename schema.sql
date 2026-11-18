-- ============================================================================
-- OPULENT OASIS CLOUDFLARE D1 SCHEMA (SQLite at the Edge — Hardened & Indexed)
-- ============================================================================

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS security_audit_logs;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS listings;

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

-- High-Velocity Edge Composite Indexes for Sub-Millisecond Lookups
CREATE INDEX idx_listings_category_published ON listings(category, published, created_at DESC);
CREATE INDEX idx_listings_location ON listings(location_name, category);

CREATE TABLE inquiries (
  id TEXT PRIMARY KEY CHECK (length(id) <= 128),
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 120),
  phone TEXT NOT NULL CHECK (length(phone) >= 6 AND length(phone) <= 32),
  category TEXT NOT NULL CHECK (category IN ('Stay', 'Tour', 'Trek')),
  destination TEXT NOT NULL CHECK (length(destination) <= 120),
  dates TEXT CHECK (length(dates) <= 120),
  guests INTEGER CHECK (guests >= 1 AND guests <= 100),
  notes TEXT CHECK (length(notes) <= 1500),
  status TEXT DEFAULT 'New Inquiry' CHECK (status IN ('New Inquiry', 'Contacted', 'Confirmed', 'Archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inquiries_status_created ON inquiries(status, created_at DESC);

-- Zero-Trust Edge Security Audit Log Table
CREATE TABLE security_audit_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_ip_hash TEXT NOT NULL,
  resource_id TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_created_at ON security_audit_logs(created_at DESC);

-- Seed initial luxury listings
INSERT INTO listings (id, name, location_name, country, region, category, sub_type, price, numeric_price, lat, lng, altitude, duration, group_size, terrain_type, base_index, published, image, description) VALUES
('gorai-villa-1', 'Casa De Mar — Gorai Beachfront Sanctuary', 'Gorai Coast', 'India', 'North Mumbai Coast, Maharashtra', 'Stay', 'Villa', '₹32,000 / night', 32000, 19.24, 72.78, '12m ASL', 'Min 2 Nights', 'Up to 10 Guests', 'Coastal Palm Sanctuary', 9.2, 1, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'An architectural Portuguese-inspired courtyard villa tucked behind private casuarina groves on Gorai coast.'),
('alibaug-villa-1', 'The Banyan Glasshouse — Alibaug Sanctuary', 'Alibaug', 'India', 'Mandwa & Awas, Raigad Coast', 'Stay', 'Villa', '₹48,000 / night', 48000, 18.64, 72.87, '15m ASL', '2–7 Nights', 'Up to 12 Guests', 'Tropical Mango Estate', 9.5, 1, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', '20 minutes by private speedboat from the Gateway of India, spanning 3 acres of heirloom mango orchards.'),
('sahyadri-trek-1', 'Harishchandragad & Kokankada Cliff Crest Trek', 'Sahyadri Range', 'India', 'Western Ghats, Maharashtra', 'Trek', 'Mountains', '₹14,500 / person', 14500, 19.38, 73.77, '1,424m ASL', '3 Days / 2 Nights', 'Max 8 Explorers', 'Basalt Cliff Overhang', 9.3, 1, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', 'Ascend ancient rock-cut steps to the 1,424m Kokankada vertical basalt amphitheater.');
