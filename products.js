// AURA LUXE — Curated Flagship Product Catalog
const PRODUCTS_DATA = [
  {
    id: "aura-hp-01",
    name: "Aura Horizon ANC Headphones",
    tagline: "Lossless Spatial Acoustics with Adaptive Active Noise Cancellation",
    category: "audio",
    categoryLabel: "Audio & Sound",
    price: 349,
    originalPrice: 429,
    rating: 4.9,
    reviewsCount: 384,
    image: "assets/aura_headphones.jpg",
    badge: "Flagship",
    badgeType: "hot",
    isFeatured: true,
    stock: 6,
    colors: [
      { name: "Obsidian Black", hex: "#15161b", active: true },
      { name: "Cyan Pulse", hex: "#00d2ff", active: false },
      { name: "Titanium Gold", hex: "#d4af37", active: false }
    ],
    features: [
      "Custom 45mm Graphene Acoustic Transducers",
      "Next-Gen 48dB Hybrid ANC with Transparency",
      "55-Hour Continuous Battery Life",
      "Ultra-Low Latency Lossless Bluetooth 5.4"
    ],
    description: "Engineered from aerospace-grade titanium and handcrafted memory foam, the Aura Horizon delivers sound so immersive that boundaries dissolve. Features real-time spatial head tracking and customizable EQ profiles via our companion suite.",
    specs: {
      "Driver Size": "45mm Diamond-coated Graphene",
      "Frequency Response": "5Hz - 45,000Hz",
      "Battery Life": "55 Hours (ANC off) / 42 Hours (ANC on)",
      "Charging": "15 min charge = 8 hours playback",
      "Weight": "248g Ultra-lightweight",
      "Materials": "Titanium, Italian Vegan Leather, Aluminum"
    }
  },
  {
    id: "aura-sw-02",
    name: "Aura Chrono Cyber Smartwatch",
    tagline: "Titanium Chassis with Holographic AMOLED Display & Health Engine",
    category: "wearables",
    categoryLabel: "Smart Wearables",
    price: 389,
    originalPrice: 459,
    rating: 4.8,
    reviewsCount: 295,
    image: "assets/aura_smartwatch.jpg",
    badge: "Bestseller",
    badgeType: "popular",
    isFeatured: true,
    stock: 9,
    colors: [
      { name: "Space Titanium", hex: "#8a8f98", active: true },
      { name: "Stealth Noir", hex: "#1b1c20", active: false },
      { name: "Cyber Purple", hex: "#9b51e0", active: false }
    ],
    features: [
      "Grade 5 Titanium Monoblock Shell",
      "1.96-inch Sapphire Glass Curved AMOLED (2000 nits)",
      "Continuous ECG, SpO2, HRV & VO2 Max Bio-Sensors",
      "14-Day Power Reserve Battery Architecture"
    ],
    description: "The apex of biometric intelligence and haute horlogerie aesthetics. Machined from solid aerospace titanium with a sapphire crystal touch surface, the Chrono monitors cardiovascular vitals, sleep cycles, and daily performance metrics with clinical accuracy.",
    specs: {
      "Display": "1.96\" Sapphire Glass Always-On AMOLED",
      "Water Resistance": "10 ATM / 100 Meters Submersible",
      "Battery Life": "Up to 14 Days Normal Usage",
      "Sensors": "Dual-channel ECG, Optical Heart Sensor, Skin Temp",
      "Connectivity": "Dual-Band GPS, LTE eSIM Ready, Bluetooth 5.3",
      "Weight": "52g (chassis only)"
    }
  },
  {
    id: "aura-sp-03",
    name: "Aura Levitate Levitating Speaker",
    tagline: "360° Omnidirectional Acoustic Orb Floating on Magnetic Obsidian Base",
    category: "audio",
    categoryLabel: "Audio & Sound",
    price: 279,
    originalPrice: 329,
    rating: 4.9,
    reviewsCount: 182,
    image: "assets/aura_speaker.jpg",
    badge: "Innovation",
    badgeType: "innovative",
    isFeatured: true,
    stock: 4,
    colors: [
      { name: "Obsidian & Violet", hex: "#2b1055", active: true },
      { name: "Cyber Silver", hex: "#c0c0c0", active: false },
      { name: "Matte Carbon", hex: "#1f222e", active: false }
    ],
    features: [
      "Patented Active Magnetic Levitation Cradle",
      "360-Degree Spatial Sound Dispersion",
      "Dynamic Neon Audio-Reactive Ambient Ring",
      "Wirelessly Recharges Directly While Levitating"
    ],
    description: "Suspended mid-air by magnetic levitation, the Aura Levitate eliminates acoustic surface resonance entirely, producing zero-distortion audio. Its audio-reactive neon ring pulses in harmony with your music.",
    specs: {
      "Acoustic Output": "60W Peak Omnidirectional Power",
      "Levitation Height": "18mm Magnetic Air Gap",
      "Battery Life": "24 Hours Floating Playback",
      "Base Connectivity": "Lossless AirPlay 2, Spotify Connect, BT 5.3",
      "Materials": "Brushed Aircraft Aluminum & Polished Obsidian",
      "Weight": "1.2kg (Base + Orb)"
    }
  },
  {
    id: "aura-kb-04",
    name: "Aura Genesis Custom Keyboard",
    tagline: "Frosted Acrylic Mechanical Masterpiece with Hot-Swap Lubed Switches",
    category: "desk",
    categoryLabel: "Desk & Tech",
    price: 219,
    originalPrice: 269,
    rating: 4.9,
    reviewsCount: 421,
    image: "assets/aura_keyboard.jpg",
    badge: "Staff Pick",
    badgeType: "popular",
    isFeatured: false,
    stock: 12,
    colors: [
      { name: "Frosted Smoke", hex: "#2d3139", active: true },
      { name: "Deep Space Black", hex: "#0f1115", active: false },
      { name: "Cosmic Amber", hex: "#d97706", active: false }
    ],
    features: [
      "CNC Machined Frosted Polycarbonate Chassis",
      "Pre-lubed Factory Custom Linear Switches (45g)",
      "Gasket Mounted with 5-Layer Acoustic Poron Dampening",
      "Custom Artisan Galaxy Escape and Enter Keycaps"
    ],
    description: "Experience typing bliss with our tuned acoustic gasket-mount system. Each keypress delivers a deep, satisfying 'thock' with zero ping or rattling, crowned with custom hand-poured artisan resin keycaps and a heavy coiled aviator cable.",
    specs: {
      "Layout": "75% Compact Layout with CNC Volume Knob",
      "Switches": "Aura Cream Linear (Pre-lubed Krytox 205g0)",
      "Keycaps": "Thick PBT Dye-Sub + Handcrafted Resin Artisans",
      "Polling Rate": "1000Hz (Wired) / 2.4GHz Wireless / BT 5.2",
      "Backlighting": "Per-key South-Facing ARGB with Underglow",
      "Weight": "1.45kg Solid Desk Anchoring"
    }
  },
  {
    id: "aura-gl-05",
    name: "Aura Vision AR Smart Audio Glasses",
    tagline: "Electrochromic Smart Lenses with Directional Bone Conduction Audio",
    category: "wearables",
    categoryLabel: "Smart Wearables",
    price: 299,
    originalPrice: 379,
    rating: 4.7,
    reviewsCount: 167,
    image: "assets/aura_glasses.jpg",
    badge: "New Release",
    badgeType: "new",
    isFeatured: false,
    stock: 5,
    colors: [
      { name: "Stealth Titanium", hex: "#22252a", active: true },
      { name: "Night Sunset", hex: "#7c2d12", active: false },
      { name: "Cyber Silver", hex: "#94a3b8", active: false }
    ],
    features: [
      "Ultra-Light 38g Titanium Micro-Chassis",
      "Instant 0.1s Electrochromic Lens Tint Control",
      "Private Directional Acoustic Audio Beams",
      "AI Voice Assistant Integration with Dual Beam-Forming Mics"
    ],
    description: "Look into the future. Aura Vision combines discreet micro-speakers that beam private sound directly into your ears with intelligent electrochromic lenses that tint automatically based on ambient UV levels or touch gestures.",
    specs: {
      "Frame Material": "Beta-Titanium & Swiss TR90 Grilamid",
      "Lens": "Zeiss UV400 Electrochromic Variable Tint",
      "Battery Life": "8 Hours Audio & AI Calling / 48hr Standby",
      "Microphones": "Dual AI Noise-Cancelling Microphones",
      "Weight": "38g Featherlight All-Day Comfort",
      "Water Resistance": "IPX5 Splash & Rain Resistance"
    }
  },
  {
    id: "aura-bp-06",
    name: "Aura Nomad Carbon Tech Backpack",
    tagline: "Waterproof Carbon Fiber Weave with Magnetic Fidlock & Charging Port",
    category: "gear",
    categoryLabel: "Everyday Carry",
    price: 189,
    originalPrice: 229,
    rating: 4.9,
    reviewsCount: 512,
    image: "assets/aura_backpack.jpg",
    badge: "Travel Choice",
    badgeType: "popular",
    isFeatured: false,
    stock: 14,
    colors: [
      { name: "Carbon Fiber Noir", hex: "#1a1d24", active: true },
      { name: "Slate Matte", hex: "#334155", active: false },
      { name: "Amber Accent", hex: "#b45309", active: false }
    ],
    features: [
      "Ballistic Carbon Fiber Weave Composite Shell",
      "German Engineered Fidlock® Magnetic Quick-Release Buckles",
      "TSA 180° Lay-Flat 16\" Suspended Laptop Chamber",
      "Integrated 100W USB-C Fast-Charging Pass-through"
    ],
    description: "Built for modern digital architects and globetrotters. The Aura Nomad shields your high-value tech gear with armor-like carbon fiber weave, weatherproof AquaGuard zippers, and an ergonomic breathable airflow harness.",
    specs: {
      "Capacity": "24 Liters expandable to 30L",
      "Laptop Sleeve": "Suspended protection up to 16.2\" MacBook Pro",
      "Weatherproofing": "IPX6 Impermeable Shell with YKK AquaGuard",
      "Weight": "1.1kg Optimized Ergonomics",
      "Security": "Hidden RFID Blocking Passport & AirTag Pocket",
      "Warranty": "Lifetime Craftsmanship Guarantee"
    }
  },
  {
    id: "aura-dk-07",
    name: "Aura Orbit 3-in-1 Magnetic Dock",
    tagline: "Sculptural Obsidian Stone & Titanium Fast Wireless Charging Station",
    category: "desk",
    categoryLabel: "Desk & Tech",
    price: 149,
    originalPrice: 189,
    rating: 4.8,
    reviewsCount: 340,
    image: "assets/aura_dock.jpg",
    badge: "Sale -21%",
    badgeType: "sale",
    isFeatured: false,
    stock: 8,
    colors: [
      { name: "Obsidian Stone", hex: "#1e2229", active: true },
      { name: "Champagne Metal", hex: "#bfa378", active: false },
      { name: "Pure Marble", hex: "#e2e8f0", active: false }
    ],
    features: [
      "Carved from Solid Natural Heavy Volcanic Obsidian",
      "Simultaneous 15W Qi2 Fast Wireless Charging for 3 Devices",
      "Ultra-Strong N52 Neodymium Magnetic Snap Alignment",
      "Intelligent Thermal Cryo-Cooling Heat Dissipation"
    ],
    description: "Transform your nightstand or workspace into a museum gallery piece. The Aura Orbit securely floats your phone at the ideal viewing angle while simultaneously topping up your smartwatch and wireless earbuds with maximum 15W Qi2 fast charging.",
    specs: {
      "Compatibility": "MagSafe & Qi2 Compatible (iPhone, Android, Apple Watch, Pods)",
      "Output": "Phone: 15W | Watch: 5W | Earbuds: 5W (25W Total)",
      "Input": "USB-C PD 45W Included with Braided Cable",
      "Materials": "Natural Volcanic Obsidian, CNC Aluminum, Soft Silicone",
      "Base Weight": "850g Anti-Slip Counterweight (No lifting with phone)",
      "Safety": "Over-voltage, Thermal Throttling, FOD Protection"
    }
  },
  {
    id: "aura-lb-08",
    name: "Aura Lumos Dynamic Desk Light Bar",
    tagline: "Asymmetric Optical Glare-Free Bar with Dual-Sided RGB Backlight",
    category: "desk",
    categoryLabel: "Desk & Tech",
    price: 129,
    originalPrice: 159,
    rating: 4.9,
    reviewsCount: 228,
    image: "assets/aura_lightbar.jpg",
    badge: "Top Rated",
    badgeType: "hot",
    isFeatured: false,
    stock: 11,
    colors: [
      { name: "Anodized Black", hex: "#181a1f", active: true },
      { name: "Silver Frost", hex: "#cbd5e1", active: false }
    ],
    features: [
      "Patented Asymmetric Optical Beam (Zero Screen Glare)",
      "Dual-Zone Illumination: Natural Task Light + Ambient RGB",
      "Wireless Touch Dial Controller with Smooth Stepless Dimming",
      "Ra98 Ultra-High Color Rendering Index (True Color Fidelity)"
    ],
    description: "Protect your eyesight and elevate desk ambience during late-night coding or design sprints. The Aura Lumos projects soft, glare-free light precisely onto your keyboard surface while washing your back wall with subtle ambient color that syncs to your screen.",
    specs: {
      "Color Temperature": "2700K (Warm Candle) to 6500K (Daylight)",
      "CRI (Color Accuracy)": "Ra98 Museum-Grade Color Fidelity",
      "Illuminance": "Up to 1000 Lux on Desk Surface",
      "Mounting": "Counterweighted Gravity Hinge fits curved & flat monitors",
      "Control": "Wireless 2.4G Rotary Controller + Capacitive Touch",
      "Power": "USB-C 5V/2A Direct Monitor Powered"
    }
  }
];

// Curated Customer Reviews for Social Proof
const REVIEWS_DATA = [
  {
    author: "Elena Rostova",
    role: "Industrial Designer, Berlin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    rating: 5,
    title: "The acoustic precision is unmatched",
    content: "The Aura Horizon headphones completely redefined how I listen to music while designing. The build quality feels like a luxury timepiece, and the spatial stage feels practically infinite.",
    verified: true,
    product: "Aura Horizon ANC Headphones"
  },
  {
    author: "Marcus Chen",
    role: "Senior Software Architect, SF",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    rating: 5,
    title: "Best desk upgrade I've made in 5 years",
    content: "Between the Genesis custom keyboard and the Lumos light bar, my coding workstation feels like a futuristic spacecraft. Typing sound is perfection, zero eye fatigue.",
    verified: true,
    product: "Aura Genesis Custom Keyboard"
  },
  {
    author: "Sophia Sterling",
    role: "Creative Director, London",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80",
    rating: 5,
    title: "A true statement piece",
    content: "The floating speaker is the first thing every guest talks about when they enter my living room. Crisp, spatial acoustic clarity and hypnotic ambient lighting.",
    verified: true,
    product: "Aura Levitate Levitating Speaker"
  }
];
