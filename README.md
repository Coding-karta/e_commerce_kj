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
