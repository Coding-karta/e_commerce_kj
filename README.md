# AURA LUXE — Next-Gen E-Commerce Frontend Experience

A state-of-the-art, cyberpunk-minimalist luxury e-commerce frontend interface built with pure semantic HTML5, modern vanilla CSS design tokens, and modular Vanilla JavaScript.

---

## 🌟 Key Highlights & Design Aesthetics

- **Rich Modern Aesthetics**: Deep obsidian and cosmic indigo space themes with ambient glowing gradients, glassmorphism (`backdrop-filter: blur(20px)`), iridescent accent highlights, and smooth micro-animations.
- **Custom Flagship Product Renderings**: Includes 8 bespoke, photorealistic luxury tech artifacts generated directly for this store:
  - `Aura Horizon ANC Headphones` (Spatial Acoustics & Titanium Monoblock)
  - `Aura Chrono Cyber Smartwatch` (Titanium AMOLED & Biometric Engine)
  - `Aura Levitate Magnetic Floating Speaker` (360° Omnidirectional Audio Orb)
  - `Aura Genesis Custom Mechanical Keyboard` (Frosted Gasket Mount with Artisans)
  - `Aura Vision AR Smart Audio Glasses` (Electrochromic Lenses & Directional Audio)
  - `Aura Nomad Carbon Tech Backpack` (Waterproof Carbon Fiber & Magnetic Fidlock)
  - `Aura Orbit 3-in-1 Magnetic Dock` (Sculptural Volcanic Obsidian Fast Wireless Stand)
  - `Aura Lumos Dynamic Desk Light Bar` (Asymmetric Optical Glare-Free Ambient Bar)
- **Zero Dependencies**: Pure HTML5, Vanilla CSS3, and ES6+ JavaScript. Runs instantly in any modern web browser without compiling or build steps.

---

## 🚀 Interactive Features

1. **Header & Navigation**:
   - Sticky frosted glass navbar with dynamic blur on scroll.
   - Live Search with real-time dropdown suggestions and instant product preview.
   - Multi-currency Switcher (`USD $`, `EUR €`, `GBP £`, `INR ₹`) with instant dynamic price re-calculation across the entire store.
   - Interactive Light & Dark theme toggle.
   - Animated wishlist heart counter and shopping bag counter with pop springs.

2. **Hero Section**:
   - 3D interactive tilt showcase card responding dynamically to cursor position.
   - Floating feature hotspot chips with pulsing indicators.
   - Live metrics (12.4k+ owners, 4.9/5 rating, 3-year warranty).
   - "Quick Bag Flagship" instant action.

3. **Curated Product Catalog**:
   - Filter category pills (`All Items`, `Audio & Sound`, `Smart Wearables`, `Desk & Tech`, `Everyday Carry`).
   - Dynamic Price Range Slider with real-time price cap filtering.
   - Sorting by: Featured, Price (Low to High), Price (High to Low), Highest Rated, Alphabetical.
   - Dual Layout Toggle: Grid View and List View.
   - Direct Color Swatch Selector on each card to change color variants before opening the modal.

4. **Product Quick-View Modal**:
   - High-resolution gallery preview.
   - Color finish variant buttons.
   - Quantity stepper (`+` / `-`).
   - Technical specifications breakdown table.
   - Live low-stock countdown alert.

5. **Slide-Over Cart Drawer**:
   - Smooth transform slide-in with frosted dark backdrop.
   - Dynamic **Free Express Shipping Progress Meter** (progress bar that updates in real-time as items are added towards the $150 threshold).
   - Item quantity steppers and quick-remove button.
   - **Discount Coupon System**:
     - `AURA20` — 20% off entire order
     - `FREESHIP` — Unlocks free express shipping
     - `CYBER10` — 10% discount
   - Subtotal, discount deduction, shipping, and sales tax calculation.

6. **Interactive Multi-Step Checkout Modal**:
   - Multi-step visual tracker (1. Shipping -> 2. Payment -> 3. Order Confirmed).
   - **⚡ Demo Autofill Button**: Single click automatically populates realistic test buyer data for instantaneous testing!
   - Payment method selector: Credit Card, Apple Pay, Google Pay, and Crypto.
   - Animated Order Confirmation celebration receipt with generated order reference ID.

7. **Wishlist Modal**:
   - Persistent favorites saved to `localStorage`.
   - Single-click "Move to Bag" action.

8. **Toast Notification System**:
   - Non-intrusive bottom-right floating notifications with auto-dismiss progress timers.

9. **Authentication VIP Gateway (Sign In & Sign Up Portal)**:
   - Immersive full-screen holographic security gate protecting access to the storefront.
   - Dual-tab interface: **Sign In** and **Create Account**.
   - Real-time password security meter with visual grade bar.
   - Password visibility show/hide toggle.
   - **Guest Explorer Mode**: Instant visitor access option.
   - Persistent session storage in `localStorage` and Supabase Cloud Auth.
   - Dynamic user profile pill in the navigation header with interactive dropdown menu (User details, VIP tier, Bag shortcut, Wishlist shortcut, Concierge trigger, and **Sign Out & Lock Portal**).

10. **AURA AI Concierge & Shopping Assistant Chatbot**:
    - Floating launcher widget with pulsing aura ring and unread notification badge in the bottom-right corner.
    - Glassmorphic conversational window with Web Audio synthesizer chimes.
    - Dynamic suggested prompts carousel (Headphones specs, active promo codes, smartwatch details, delivery times, budget items, cart queries).
    - Natural language understanding for store policies, shipping schedules, returns, warranties, and all 8 flagship products.
    - Live introspection of the shopping bag (reads real-time cart contents and subtotal).
    - **Interactive In-Chat Embedded Product Cards**: Allows users to preview specs and add products to bag directly inside the chat interface.
    - **Interactive Promo Codes**: Direct 1-click button to apply codes (e.g., `AURA20`) directly to the cart.
    - Chat history persistence in `sessionStorage` with reset and mute controls.

11. **⚡ Supabase Cloud Database & Authentication Integration**:
    - **Authentication**: Native Supabase Auth supporting Email & Password signup/signin, as well as automatic username-to-email resolution.
    - **Database Tables**:
      - `profiles`: Synced user profiles with automatic creation via PostgreSQL triggers on signup.
      - `products`: Dynamic product catalog loaded straight from your Supabase PostgreSQL database.
      - `orders`: Checkout orders automatically recorded in Supabase in real-time.
    - **1-Click Seed Utility**: Built-in button to seed all flagship products to your Supabase `products` table in one click.
    - **Ready-to-Run SQL Migration**: Complete schema with Row Level Security (RLS) in `supabase-schema.sql`.
    - **Config Modal**: In-app modal to test ping, save URL & Anon Key, and verify database connectivity.

---

## ⚡ How to Connect Supabase (In 2 Minutes)

1. **Get your Supabase Credentials**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard) and create or select your project.
   - Go to **Project Settings** → **API**.
   - Copy your **Project URL** (e.g. `https://xyz.supabase.co`) and **anon public key**.

2. **Run the Database Schema**:
   - In your Supabase Dashboard, open **SQL Editor** on the left sidebar.
   - Click **New Query**, open [`supabase-schema.sql`](file:///c:/Users/kusha/OneDrive/Desktop/e-commerce_by_kushal/supabase-schema.sql), copy its contents, paste them into the SQL Editor, and click **RUN**.
   - This creates `profiles`, `products` (pre-seeded with all 8 luxury items), and `orders` tables with Row Level Security policies.

3. **Configure Your Website**:
   - **Option A (Via In-App UI)**: Open `index.html` in your browser, click the **⚡ Supabase** button in the navbar or auth screen, paste your Project URL and Anon Key, and click **Save & Connect**.
   - **Option B (Via File)**: Open [`supabase-config.js`](file:///c:/Users/kusha/OneDrive/Desktop/e-commerce_by_kushal/supabase-config.js) and paste your Project URL and Anon Key.

---

## 🖥️ How to Run Locally

You can open the website immediately in any modern browser:

### Option 1: Direct File Open
Simply double-click [`index.html`](file:///c:/Users/kusha/OneDrive/Desktop/e-commerce_by_kushal/index.html) or right-click and choose **Open with > Chrome / Edge / Firefox / Safari**.

### Option 2: Local Web Server (Optional)
If you have Python, Node, or VS Code Live Server:
```bash
# With Python 3 (if installed)
python -m http.server 3000

# With Node / NPX (if installed)
npx serve .
```
Then visit `http://localhost:3000` in your browser.
