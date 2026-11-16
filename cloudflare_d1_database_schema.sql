-- ============================================================================
-- OPULENT OASIS CLOUDFLARE D1 SCHEMA (SQLite at the Edge)
-- ============================================================================

DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS listings;

CREATE TABLE listings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location_name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_type TEXT,
  price TEXT NOT NULL,
  numeric_price REAL NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  altitude TEXT,
  duration TEXT,
  group_size TEXT,
  terrain_type TEXT,
  base_index REAL,
  published INTEGER DEFAULT 1,
  image TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  destination TEXT NOT NULL,
  dates TEXT,
  guests INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'New Inquiry',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial luxury listings
INSERT INTO listings (id, name, location_name, country, region, category, sub_type, price, numeric_price, lat, lng, altitude, duration, group_size, terrain_type, base_index, published, image, description) VALUES
('gorai-villa-1', 'Casa De Mar — Gorai Beachfront Sanctuary', 'Gorai Coast', 'India', 'North Mumbai Coast, Maharashtra', 'Stay', 'Villa', '₹32,000 / night', 32000, 19.24, 72.78, '12m ASL', 'Min 2 Nights', 'Up to 10 Guests', 'Coastal Palm Sanctuary', 9.2, 1, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'An architectural Portuguese-inspired courtyard villa tucked behind private casuarina groves on Gorai coast.'),
('alibaug-villa-1', 'The Banyan Glasshouse — Alibaug Sanctuary', 'Alibaug', 'India', 'Mandwa & Awas, Raigad Coast', 'Stay', 'Villa', '₹48,000 / night', 48000, 18.64, 72.87, '15m ASL', '2–7 Nights', 'Up to 12 Guests', 'Tropical Mango Estate', 9.5, 1, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', '20 minutes by private speedboat from the Gateway of India, spanning 3 acres of heirloom mango orchards.'),
('sahyadri-trek-1', 'Harishchandragad & Kokankada Cliff Crest Trek', 'Sahyadri Range', 'India', 'Western Ghats, Maharashtra', 'Trek', 'Mountains', '₹14,500 / person', 14500, 19.38, 73.77, '1,424m ASL', '3 Days / 2 Nights', 'Max 8 Explorers', 'Basalt Cliff Overhang', 9.3, 1, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', 'Ascend ancient rock-cut steps to the 1,424m Kokankada vertical basalt amphitheater.');