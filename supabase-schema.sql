-- ==========================================================
-- AURA LUXE — Supabase PostgreSQL Database Schema & Migration
-- ==========================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Click "SQL Editor" on the left menu
-- 3. Click "New Query", paste this entire script, and click "RUN"
-- ==========================================================

-- 1. Create PROFILES Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'AURA VIP Member',
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to basic profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow individual users to insert their profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow individual users to update their profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Trigger: Automatically insert profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, role, avatar_url, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'AURA VIP Member'),
    COALESCE(new.raw_user_meta_data->>'avatar', upper(substring(COALESCE(new.raw_user_meta_data->>'username', new.email) from 1 for 1))),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Create PRODUCTS Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  category TEXT NOT NULL,
  category_label TEXT,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  rating NUMERIC(3, 1) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  badge TEXT,
  badge_type TEXT,
  is_featured BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 10,
  colors JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert/update products"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Create ORDERS Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2),
  discount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  shipping_address JSONB,
  payment_method TEXT DEFAULT 'Credit Card',
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public and visitors to insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to read their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 5. SEED INITIAL PRODUCTS DATA
INSERT INTO public.products (id, name, tagline, category, category_label, price, original_price, rating, reviews_count, image, badge, badge_type, is_featured, stock, colors, features, description, specs)
VALUES
(
  'aura-hp-01',
  'Aura Horizon ANC Headphones',
  'Lossless Spatial Acoustics with Adaptive Active Noise Cancellation',
  'audio',
  'Audio & Sound',
  349.00,
  429.00,
  4.9,
  384,
  'assets/aura_headphones.jpg',
  'Flagship',
  'hot',
  true,
  6,
  '[{"name": "Obsidian Black", "hex": "#15161b", "active": true}, {"name": "Cyan Pulse", "hex": "#00d2ff", "active": false}, {"name": "Titanium Gold", "hex": "#d4af37", "active": false}]'::jsonb,
  '["Custom 45mm Graphene Acoustic Transducers", "Next-Gen 48dB Hybrid ANC with Transparency", "55-Hour Continuous Battery Life", "Ultra-Low Latency Lossless Bluetooth 5.4"]'::jsonb,
  'Engineered from aerospace-grade titanium and handcrafted memory foam, the Aura Horizon delivers sound so immersive that boundaries dissolve.',
  '{"Driver Size": "45mm Diamond-coated Graphene", "Frequency Response": "5Hz - 45,000Hz", "Battery Life": "55 Hours (ANC off)", "Weight": "248g Ultra-lightweight"}'::jsonb
),
(
  'aura-sw-02',
  'Aura Chrono Cyber Smartwatch',
  'Titanium Chassis with Holographic AMOLED Display & Health Engine',
  'wearables',
  'Smart Wearables',
  389.00,
  459.00,
  4.8,
  295,
  'assets/aura_smartwatch.jpg',
  'Bestseller',
  'popular',
  true,
  9,
  '[{"name": "Space Titanium", "hex": "#8a8f98", "active": true}, {"name": "Stealth Noir", "hex": "#1b1c20", "active": false}, {"name": "Cyber Purple", "hex": "#9b51e0", "active": false}]'::jsonb,
  '["Grade 5 Titanium Monoblock Shell", "1.96-inch Sapphire Glass Curved AMOLED (2000 nits)", "Continuous ECG, SpO2, HRV & VO2 Max Bio-Sensors", "14-Day Power Reserve Battery Architecture"]'::jsonb,
  'The apex of biometric intelligence and haute horlogerie aesthetics. Machined from solid aerospace titanium with a sapphire crystal touch surface.',
  '{"Display": "1.96\" Sapphire Glass Always-On AMOLED", "Water Resistance": "10 ATM / 100M", "Battery Life": "Up to 14 Days", "Weight": "52g"}'::jsonb
),
(
  'aura-sp-03',
  'Aura Levitate Levitating Speaker',
  '360° Omnidirectional Acoustic Orb Floating on Magnetic Obsidian Base',
  'audio',
  'Audio & Sound',
  279.00,
  329.00,
  4.9,
  182,
  'assets/aura_speaker.jpg',
  'Innovation',
  'innovative',
  true,
  4,
  '[{"name": "Obsidian & Violet", "hex": "#2b1055", "active": true}, {"name": "Cyber Silver", "hex": "#c0c0c0", "active": false}, {"name": "Matte Carbon", "hex": "#1f222e", "active": false}]'::jsonb,
  '["Patented Active Magnetic Levitation Cradle", "360-Degree Spatial Sound Dispersion", "Dynamic Neon Audio-Reactive Ambient Ring", "Wirelessly Recharges Directly While Levitating"]'::jsonb,
  'Suspended mid-air by magnetic levitation, the Aura Levitate eliminates acoustic surface resonance entirely, producing zero-distortion audio.',
  '{"Acoustic Output": "60W Peak", "Levitation Height": "18mm Magnetic Air Gap", "Battery Life": "24 Hours Floating Playback", "Weight": "1.2kg"}'::jsonb
),
(
  'aura-kb-04',
  'Aura Genesis Custom Keyboard',
  'Frosted Acrylic Mechanical Masterpiece with Hot-Swap Lubed Switches',
  'desk',
  'Desk & Tech',
  219.00,
  269.00,
  4.9,
  421,
  'assets/aura_keyboard.jpg',
  'Staff Pick',
  'popular',
  false,
  12,
  '[{"name": "Frosted Smoke", "hex": "#2d3139", "active": true}, {"name": "Deep Space Black", "hex": "#0f1115", "active": false}, {"name": "Cosmic Amber", "hex": "#d97706", "active": false}]'::jsonb,
  '["CNC Machined Frosted Polycarbonate Chassis", "Pre-lubed Factory Custom Linear Switches (45g)", "Gasket Mounted with 5-Layer Acoustic Poron Dampening", "Custom Artisan Galaxy Escape and Enter Keycaps"]'::jsonb,
  'Experience typing bliss with our tuned acoustic gasket-mount system. Each keypress delivers a deep, satisfying thock with zero ping.',
  '{"Layout": "75% Compact Layout", "Switches": "Aura Cream Linear Pre-lubed", "Polling Rate": "1000Hz Wired / 2.4GHz / BT 5.2", "Weight": "1.45kg"}'::jsonb
),
(
  'aura-gl-05',
  'Aura Vision AR Smart Audio Glasses',
  'Electrochromic Smart Lenses with Directional Bone Conduction Audio',
  'wearables',
  'Smart Wearables',
  299.00,
  379.00,
  4.7,
  167,
  'assets/aura_glasses.jpg',
  'New Release',
  'new',
  false,
  5,
  '[{"name": "Stealth Titanium", "hex": "#22252a", "active": true}, {"name": "Night Sunset", "hex": "#7c2d12", "active": false}, {"name": "Cyber Silver", "hex": "#94a3b8", "active": false}]'::jsonb,
  '["Ultra-Light 38g Titanium Micro-Chassis", "Instant 0.1s Electrochromic Lens Tint Control", "Private Directional Acoustic Audio Beams", "AI Voice Assistant Integration"]'::jsonb,
  'Look into the future. Aura Vision combines discreet micro-speakers that beam private sound directly into your ears with intelligent electrochromic lenses.',
  '{"Frame Material": "Beta-Titanium & TR90", "Battery Life": "8 Hours Audio / 48hr Standby", "Weight": "38g Featherlight", "Water Resistance": "IPX5"}'::jsonb
),
(
  'aura-bp-06',
  'Aura Nomad Carbon Tech Backpack',
  'Waterproof Carbon Fiber Weave with Magnetic Fidlock & Charging Port',
  'gear',
  'Everyday Carry',
  189.00,
  229.00,
  4.9,
  512,
  'assets/aura_backpack.jpg',
  'Travel Choice',
  'popular',
  false,
  14,
  '[{"name": "Carbon Fiber Noir", "hex": "#1a1d24", "active": true}, {"name": "Slate Matte", "hex": "#334155", "active": false}]'::jsonb,
  '["Ballistic Carbon Fiber Weave Composite Shell", "German Engineered Fidlock Magnetic Quick-Release Buckles", "TSA 180 Lay-Flat 16 Suspended Laptop Chamber", "Integrated 100W USB-C Fast-Charging Pass-through"]'::jsonb,
  'Built for modern digital architects and globetrotters. The Aura Nomad shields your high-value tech gear with armor-like carbon fiber weave.',
  '{"Capacity": "24L expandable to 30L", "Laptop Sleeve": "Up to 16.2 inch MacBook Pro", "Weight": "1.1kg Optimized Ergonomics"}'::jsonb
),
(
  'aura-dk-07',
  'Aura Orbit 3-in-1 Magnetic Dock',
  'Sculptural Obsidian Stone & Titanium Fast Wireless Charging Station',
  'desk',
  'Desk & Tech',
  149.00,
  189.00,
  4.8,
  340,
  'assets/aura_dock.jpg',
  'Sale -21%',
  'sale',
  false,
  8,
  '[{"name": "Obsidian Stone", "hex": "#1e2229", "active": true}, {"name": "Champagne Metal", "hex": "#bfa378", "active": false}]'::jsonb,
  '["Carved from Solid Natural Heavy Volcanic Obsidian", "Simultaneous 15W Qi2 Fast Wireless Charging for 3 Devices", "Ultra-Strong N52 Neodymium Magnetic Snap Alignment"]'::jsonb,
  'Transform your nightstand or workspace into a museum gallery piece. The Aura Orbit securely floats your phone at the ideal viewing angle.',
  '{"Compatibility": "MagSafe & Qi2 Compatible", "Output": "15W + 5W + 5W (25W Total)", "Weight": "850g Anti-Slip Counterweight"}'::jsonb
),
(
  'aura-lb-08',
  'Aura Lumos Dynamic Desk Light Bar',
  'Asymmetric Optical Glare-Free Bar with Dual-Sided RGB Backlight',
  'desk',
  'Desk & Tech',
  129.00,
  159.00,
  4.9,
  228,
  'assets/aura_lightbar.jpg',
  'Top Rated',
  'hot',
  false,
  11,
  '[{"name": "Anodized Black", "hex": "#181a1f", "active": true}, {"name": "Silver Frost", "hex": "#cbd5e1", "active": false}]'::jsonb,
  '["Patented Asymmetric Optical Beam Zero Screen Glare", "Dual-Zone Illumination: Natural Task Light + Ambient RGB", "Wireless Touch Dial Controller with Smooth Stepless Dimming"]'::jsonb,
  'Protect your eyesight and elevate desk ambience during late-night coding or design sprints. Projects glare-free light onto your keyboard.',
  '{"Color Temperature": "2700K to 6500K", "CRI": "Ra98 Museum-Grade Color Fidelity", "Control": "Wireless 2.4G Rotary Controller"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  image = EXCLUDED.image,
  stock = EXCLUDED.stock,
  colors = EXCLUDED.colors,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  specs = EXCLUDED.specs;

-- 6. GRANT PERMISSIONS TO ANON & AUTHENTICATED ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO anon, authenticated;
GRANT ALL ON TABLE public.products TO anon, authenticated;
GRANT ALL ON TABLE public.orders TO anon, authenticated;
