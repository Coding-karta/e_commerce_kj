/**
 * AURA LUXE — Frontend Application State & Interactive Logic
 */

(function () {
  'use strict';

  // --- App State ---
  const state = {
    products: PRODUCTS_DATA || [],
    reviews: REVIEWS_DATA || [],
    cart: JSON.parse(localStorage.getItem('aura_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('aura_wishlist') || '[]'),
    theme: localStorage.getItem('aura_theme') || 'dark',
    currency: localStorage.getItem('aura_currency') || 'USD',
    rates: {
      USD: { symbol: '$', rate: 1 },
      EUR: { symbol: '€', rate: 0.92 },
      GBP: { symbol: '£', rate: 0.79 },
      INR: { symbol: '₹', rate: 83.2 }
    },
    filter: {
      category: 'all',
      searchQuery: '',
      maxPrice: 500,
      sortBy: 'featured',
      layout: 'grid' // 'grid' or 'list'
    },
    quickViewItem: null,
    quickViewQty: 1,
    quickViewColor: null,
    // --- User Authentication & Session State ---
    currentUser: JSON.parse(localStorage.getItem('aura_current_user') || 'null'),
    users: (function() {
      let list = [];
      try {
        const parsed = JSON.parse(localStorage.getItem('aura_users'));
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      } catch (e) {}
      const hasKushal = list.some(u => (u.username || '').toLowerCase() === 'kushal' || (u.email || '').toLowerCase() === 'kushal@auraluxe.com');
      if (!hasKushal) {
        list.unshift({ name: 'Kushal', email: 'kushal@auraluxe.com', username: 'kushal', password: 'password123', role: 'VIP Founder', avatar: 'K' });
      }
      return list;
    })(),
    // --- AI Concierge Chatbot State ---
    chat: {
      open: false,
      sound: localStorage.getItem('aura_chat_sound') !== 'false',
      messages: JSON.parse(sessionStorage.getItem('aura_chat_msgs') || 'null')
    }
  };

  // --- Utility: Format Currency ---
  function formatMoney(amountInUSD) {
    const cur = state.rates[state.currency] || state.rates.USD;
    const converted = amountInUSD * cur.rate;
    if (state.currency === 'INR') {
      return `${cur.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${cur.symbol}${converted.toFixed(2)}`;
  }

  // --- Save State Helpers ---
  function saveCart() {
    localStorage.setItem('aura_cart', JSON.stringify(state.cart));
    updateCartUI();
  }

  function saveWishlist() {
    localStorage.setItem('aura_wishlist', JSON.stringify(state.wishlist));
    updateWishlistUI();
  }

  // --- Toast Notifications ---
  function showToast(title, message, type = 'default') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <div class="toast-progress"></div>
    `;

    container.appendChild(toast);
    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // --- Render Product Grid ---
  function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const countEl = document.getElementById('productsCount');
    if (!grid) return;

    let filtered = [...state.products];

    // Filter by category
    if (state.filter.category !== 'all') {
      filtered = filtered.filter(p => p.category === state.filter.category);
    }

    // Filter by search query
    if (state.filter.searchQuery.trim()) {
      const q = state.filter.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Filter by max price
    filtered = filtered.filter(p => p.price <= state.filter.maxPrice);

    // Sorting
    switch (state.filter.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    if (countEl) {
      countEl.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${state.products.length}</strong> curated items`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-catalog">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin-bottom: 12px; color: var(--text-muted);">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <h3>No products match your filter</h3>
          <p>Try adjusting your search keywords, price limit, or category selection.</p>
          <button class="btn btn-primary" id="resetFiltersBtn">Reset All Filters</button>
        </div>
      `;
      document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters);
      return;
    }

    grid.className = `products-grid ${state.filter.layout === 'list' ? 'list-view' : ''}`;

    grid.innerHTML = filtered.map(product => {
      const isWishlisted = state.wishlist.includes(product.id);
      const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

      const colorSwatchesHtml = product.colors.map((c, i) => `
        <span class="swatch-pill ${i === 0 ? 'active' : ''}" 
              style="background-color: ${c.hex};" 
              title="${c.name}"
              data-product-id="${product.id}"
              data-color-name="${c.name}"></span>
      `).join('');

      return `
        <article class="product-card" data-product-id="${product.id}">
          <span class="card-badge badge-${product.badgeType}">${product.badge}</span>
          
          <div class="card-image-box">
            <img src="${product.image}" alt="${product.name}" class="product-thumb" loading="lazy">
            <div class="card-actions-overlay">
              <button class="card-action-btn ${isWishlisted ? 'wishlist-active' : ''}" 
                      title="Add to Wishlist" 
                      data-action="wishlist" 
                      data-id="${product.id}">
                <svg width="18" height="18" fill="${isWishlisted ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
              <button class="card-action-btn" 
                      title="Quick Preview" 
                      data-action="quickview" 
                      data-id="${product.id}">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="card-content">
            <div class="card-category">${product.categoryLabel}</div>
            <h3 class="card-title">${product.name}</h3>
            <p class="card-tagline">${product.tagline}</p>

            <div class="card-stock-pill ${product.stock <= 5 ? 'low-stock' : 'in-stock'}">
              <span class="${product.stock <= 5 ? 'stock-pulse' : 'stock-dot'}"></span>
              <span>${product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In Stock &amp; Ready to Ship'}</span>
            </div>
            
            <div class="card-swatches">
              ${colorSwatchesHtml}
            </div>

            <div class="card-rating">
              <div class="stars-row">
                ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span class="reviews-num">(${product.reviewsCount})</span>
            </div>

            <div class="card-footer">
              <div class="price-box">
                <span class="current-price">${formatMoney(product.price)}</span>
                ${product.originalPrice > product.price ? `<span class="original-price">${formatMoney(product.originalPrice)}</span>` : ''}
              </div>
              <button class="btn-add-cart" 
                      title="Add to Bag" 
                      data-action="add-cart" 
                      data-id="${product.id}">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <span>Add to Bag</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    attachCardEventListeners();
  }

  // --- Attach Product Card Event Listeners ---
  function attachCardEventListeners() {
    document.querySelectorAll('.card-action-btn[data-action="wishlist"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWishlist(btn.dataset.id);
      });
    });

    document.querySelectorAll('.card-action-btn[data-action="quickview"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openQuickView(btn.dataset.id);
      });
    });

    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(btn.dataset.id);
        
        // Instant visual confirmation
        btn.classList.add('added-success');
        btn.innerHTML = `<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg><span>Added!</span>`;
        setTimeout(() => {
          btn.classList.remove('added-success');
          btn.innerHTML = `<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg><span>Add to Bag</span>`;
        }, 1200);
      });
    });

    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button') && !e.target.closest('.swatch-pill')) {
          openQuickView(card.dataset.productId);
        }
      });
    });

    // Swatches click
    document.querySelectorAll('.swatch-pill').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        const parent = swatch.closest('.card-swatches');
        parent.querySelectorAll('.swatch-pill').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        showToast('Color Selected', `${swatch.getAttribute('data-color-name')} variant chosen`);
      });
    });
  }

  // --- Wishlist Management ---
  function toggleWishlist(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const index = state.wishlist.indexOf(productId);
    if (index > -1) {
      state.wishlist.splice(index, 1);
      showToast('Removed from Wishlist', `${product.name} was removed`);
    } else {
      state.wishlist.push(productId);
      showToast('Added to Wishlist', `${product.name} saved to your favorites`, 'success');
    }
    saveWishlist();
    renderProducts();
  }

  function updateWishlistUI() {
    const badge = document.getElementById('wishlistCountBadge');
    if (badge) {
      badge.textContent = state.wishlist.length;
      badge.style.display = state.wishlist.length > 0 ? 'flex' : 'none';
      badge.style.transform = 'scale(1.3)';
      setTimeout(() => badge.style.transform = 'scale(1)', 250);
    }
    renderWishlistModal();
  }

  function renderWishlistModal() {
    const list = document.getElementById('wishlistItemsList');
    if (!list) return;

    if (state.wishlist.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: var(--text-muted); margin-bottom: 12px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <h4>Your Wishlist is Empty</h4>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 6px;">Tap the heart icon on any product to save it for later.</p>
        </div>
      `;
      return;
    }

    const items = state.products.filter(p => state.wishlist.includes(p.id));
    list.innerHTML = items.map(p => `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-title">${p.name}</div>
          <div class="cart-item-price">${formatMoney(p.price)}</div>
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn btn-primary" style="padding: 6px 14px; font-size: 0.8rem;" onclick="window.auraApp.moveWishlistToCart('${p.id}')">
              Move to Bag
            </button>
            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;" onclick="window.auraApp.toggleWishlist('${p.id}')">
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- Cart Management ---
  function addToCart(productId, quantity = 1, selectedColor = null) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const color = selectedColor || product.colors[0].name;
    const existing = state.cart.find(item => item.productId === productId && item.color === color);

    if (existing) {
      existing.quantity += quantity;
    } else {
      state.cart.push({
        productId,
        quantity,
        color,
        addedAt: Date.now()
      });
    }

    saveCart();
    showToast('Added to Cart', `${product.name} (${color}) added to your shopping bag.`, 'success');
    openCartDrawer();
  }

  function updateCartQuantity(productId, color, delta) {
    const item = state.cart.find(i => i.productId === productId && i.color === color);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter(i => !(i.productId === productId && i.color === color));
      showToast('Item Removed', 'Product removed from shopping bag');
    }
    saveCart();
  }

  function removeCartItem(productId, color) {
    state.cart = state.cart.filter(i => !(i.productId === productId && i.color === color));
    saveCart();
    showToast('Item Removed', 'Product removed from shopping bag');
  }

  function updateCartUI() {
    const badge = document.getElementById('cartBadgeCount');
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    if (badge) {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'flex' : 'none';
      badge.style.transform = 'scale(1.3)';
      setTimeout(() => badge.style.transform = 'scale(1)', 250);
    }

    renderCartDrawer();
  }

  function renderCartDrawer() {
    const listEl = document.getElementById('cartItemsList');
    const emptyEl = document.getElementById('cartEmptyView');
    const footerEl = document.getElementById('cartFooter');
    const meterFill = document.getElementById('shippingMeterFill');
    const meterText = document.getElementById('shippingMeterText');

    if (!listEl) return;

    if (state.cart.length === 0) {
      listEl.style.display = 'none';
      if (footerEl) footerEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'flex';
      if (meterFill) meterFill.style.width = '0%';
      if (meterText) meterText.innerHTML = `Add <strong>${formatMoney(150)}</strong> more to unlock <strong>FREE Express Shipping</strong>!`;
      return;
    }

    listEl.style.display = 'flex';
    if (footerEl) footerEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';

    // Calculate subtotal
    let subtotalUSD = 0;
    const cartItemsHtml = state.cart.map(item => {
      const product = state.products.find(p => p.id === item.productId);
      if (!product) return '';
      const itemTotal = product.price * item.quantity;
      subtotalUSD += itemTotal;

      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}" class="cart-item-img">
          <div class="cart-item-details">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h4 class="cart-item-title">${product.name}</h4>
              <button class="cart-remove-btn" title="Remove" onclick="window.auraApp.removeCartItem('${product.id}', '${item.color}')">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="cart-item-variant">Variant: ${item.color}</div>
            <div class="cart-item-controls">
              <div class="qty-stepper">
                <button class="stepper-btn" onclick="window.auraApp.updateCartQuantity('${product.id}', '${item.color}', -1)">-</button>
                <span class="stepper-val">${item.quantity}</span>
                <button class="stepper-btn" onclick="window.auraApp.updateCartQuantity('${product.id}', '${item.color}', 1)">+</button>
              </div>
              <div class="cart-item-price">${formatMoney(itemTotal)}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    listEl.innerHTML = cartItemsHtml;

    // Shipping progress
    const freeShippingGoal = 150;
    const progressPercent = Math.min(100, Math.round((subtotalUSD / freeShippingGoal) * 100));
    if (meterFill) meterFill.style.width = `${progressPercent}%`;

    if (meterText) {
      if (subtotalUSD >= freeShippingGoal) {
        meterText.innerHTML = `🎉 <strong>Congratulations!</strong> You unlocked <strong>FREE Express Shipping</strong>!`;
      } else {
        const remaining = freeShippingGoal - subtotalUSD;
        meterText.innerHTML = `Add <strong>${formatMoney(remaining)}</strong> more to unlock <strong>FREE Express Shipping</strong>!`;
      }
    }

    // Calculations
    const discountUSD = state.coupon ? (subtotalUSD * (state.coupon.discountPercent / 100)) : 0;
    const shippingUSD = (subtotalUSD >= freeShippingGoal || state.coupon?.freeShipping) ? 0 : 15;
    const estimatedTaxUSD = (subtotalUSD - discountUSD) * 0.08;
    const totalUSD = subtotalUSD - discountUSD + shippingUSD + estimatedTaxUSD;

    document.getElementById('cartSubtotal').textContent = formatMoney(subtotalUSD);
    document.getElementById('cartDiscount').textContent = discountUSD > 0 ? `-${formatMoney(discountUSD)}` : '$0.00';
    document.getElementById('cartDiscountRow').style.display = discountUSD > 0 ? 'flex' : 'none';
    document.getElementById('cartShipping').textContent = shippingUSD === 0 ? 'FREE' : formatMoney(shippingUSD);
    document.getElementById('cartTax').textContent = formatMoney(estimatedTaxUSD);
    document.getElementById('cartTotal').textContent = formatMoney(totalUSD);
  }

  // --- Promo Code Application ---
  function applyCoupon() {
    const input = document.getElementById('promoCodeInput');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      showToast('Promo Code', 'Please enter a promo coupon code.');
      return;
    }

    if (code === 'AURA20') {
      state.coupon = { code: 'AURA20', discountPercent: 20 };
      showToast('Coupon Applied!', 'Enjoy 20% off your entire order!', 'success');
      renderCartDrawer();
      updateCartUI();
    } else if (code === 'FREESHIP') {
      state.coupon = { code: 'FREESHIP', discountPercent: 0, freeShipping: true };
      showToast('Coupon Applied!', 'Free Express Shipping unlocked!', 'success');
      renderCartDrawer();
      updateCartUI();
    } else if (code === 'CYBER10') {
      state.coupon = { code: 'CYBER10', discountPercent: 10 };
      showToast('Coupon Applied!', '10% Cyber Discount activated!', 'success');
      renderCartDrawer();
      updateCartUI();
    } else {
      showToast('Invalid Code', 'Try code "AURA20" for 20% off!');
    }
  }

  // Direct Coupon Apply Helper (Callable by Chatbot & UI)
  function applyCouponDirect(code) {
    const uppercaseCode = (code || '').trim().toUpperCase();
    if (uppercaseCode === 'AURA20') {
      state.coupon = { code: 'AURA20', discountPercent: 20 };
      showToast('AURA20 Applied!', '20% VIP Discount unlocked on your shopping bag!', 'success');
    } else if (uppercaseCode === 'FREESHIP') {
      state.coupon = { code: 'FREESHIP', discountPercent: 0, freeShipping: true };
      showToast('FREESHIP Applied!', 'Free Worldwide Express Delivery unlocked!', 'success');
    } else if (uppercaseCode === 'CYBER10') {
      state.coupon = { code: 'CYBER10', discountPercent: 10 };
      showToast('CYBER10 Applied!', '10% Cyber Discount applied to your bag!', 'success');
    }
    renderCartDrawer();
    updateCartUI();
  }

  // --- Cart Drawer Open/Close ---
  function openCartDrawer() {
    const overlay = document.getElementById('cartDrawerOverlay');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    const overlay = document.getElementById('cartDrawerOverlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- Quick View Modal ---
  function openQuickView(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    state.quickViewItem = product;
    state.quickViewQty = 1;
    state.quickViewColor = product.colors[0].name;

    const modal = document.getElementById('quickViewOverlay');
    if (!modal) return;

    document.getElementById('qvCategory').textContent = product.categoryLabel;
    document.getElementById('qvTitle').textContent = product.name;
    document.getElementById('qvPrice').textContent = formatMoney(product.price);
    document.getElementById('qvOriginalPrice').textContent = formatMoney(product.originalPrice);
    document.getElementById('qvStock').textContent = `Only ${product.stock} units left in stock — ships in 24h`;
    document.getElementById('qvDescription').textContent = product.description;
    document.getElementById('qvImage').src = product.image;
    document.getElementById('qvImage').alt = product.name;
    document.getElementById('qvQtyVal').textContent = '1';

    // Render colors
    const colorsList = document.getElementById('qvColorsList');
    colorsList.innerHTML = product.colors.map((c, i) => `
      <button class="quickview-color-btn ${i === 0 ? 'active' : ''}" data-color="${c.name}">
        <span class="swatch-pill" style="background-color: ${c.hex}; width: 12px; height: 12px; display: inline-block;"></span>
        ${c.name}
      </button>
    `).join('');

    colorsList.querySelectorAll('.quickview-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        colorsList.querySelectorAll('.quickview-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.quickViewColor = btn.dataset.color;
      });
    });

    // Render Specs
    const specsList = document.getElementById('qvSpecsList');
    if (specsList && product.specs) {
      specsList.innerHTML = Object.entries(product.specs).map(([k, v]) => `
        <div class="spec-row">
          <span class="spec-key">${k}</span>
          <span class="spec-val">${v}</span>
        </div>
      `).join('');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickView() {
    const modal = document.getElementById('quickViewOverlay');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- Wishlist Modal Open/Close ---
  function openWishlistModal() {
    renderWishlistModal();
    const modal = document.getElementById('wishlistOverlay');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeWishlistModal() {
    const modal = document.getElementById('wishlistOverlay');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- Checkout Modal Flow ---
  function openCheckoutModal() {
    if (state.cart.length === 0) {
      showToast('Empty Cart', 'Add at least one item to proceed to checkout.');
      return;
    }
    closeCartDrawer();
    const modal = document.getElementById('checkoutOverlay');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setCheckoutStep(1);
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('checkoutOverlay');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function setCheckoutStep(stepNumber) {
    document.querySelectorAll('.checkout-step').forEach((step, idx) => {
      step.classList.remove('active', 'completed');
      if (idx + 1 === stepNumber) {
        step.classList.add('active');
      } else if (idx + 1 < stepNumber) {
        step.classList.add('completed');
      }
    });

    document.getElementById('checkoutStep1').style.display = stepNumber === 1 ? 'block' : 'none';
    document.getElementById('checkoutStep2').style.display = stepNumber === 2 ? 'block' : 'none';
    document.getElementById('checkoutStep3').style.display = stepNumber === 3 ? 'block' : 'none';
  }


  function completeOrder() {
    // Generate Order ID
    const orderId = 'AURA-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const orderItems = [...state.cart];
    const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    document.getElementById('receiptOrderId').textContent = orderId;
    document.getElementById('receiptDate').textContent = dateStr;
    document.getElementById('receiptEmail').textContent = document.getElementById('chkEmail')?.value || 'kushal.tech@gmail.com';
    
    // Clear cart
    state.cart = [];
    saveCart();

    // Synchronize Order into Supabase Database
    if (window.AuraSupabase && window.AuraSupabase.isConfigured()) {
      window.AuraSupabase.db.createOrder({
        id: orderId,
        userId: state.currentUser?.id || null,
        customerName: `${document.getElementById('chkFirstName')?.value || ''} ${document.getElementById('chkLastName')?.value || ''}`.trim() || 'AURA Collector',
        customerEmail: document.getElementById('chkEmail')?.value || state.currentUser?.email || 'collector@auraluxe.com',
        items: orderItems,
        subtotal: subtotal,
        discount: 0,
        total: subtotal,
        shippingAddress: {
          address: document.getElementById('chkAddress')?.value || '',
          city: document.getElementById('chkCity')?.value || '',
          postal: document.getElementById('chkPostal')?.value || ''
        },
        paymentMethod: 'Credit Card'
      }).then(res => {
        if (res) console.log('⚡ [AURA] Order saved into Supabase database:', orderId);
      });
    }

    setCheckoutStep(3);
    showToast('Order Placed!', `Thank you for your order #${orderId}!`, 'success');
  }

  // --- Reset All Filters ---
  function resetFilters() {
    state.filter.category = 'all';
    state.filter.searchQuery = '';
    state.filter.maxPrice = 500;
    state.filter.sortBy = 'featured';

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    const priceSlider = document.getElementById('priceSlider');
    if (priceSlider) priceSlider.value = '500';
    document.getElementById('priceSliderVal').textContent = formatMoney(500);

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'featured';

    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.category === 'all');
    });

    renderProducts();
  }

  // --- Live Search Autocomplete ---
  function setupSearchAutocomplete() {
    const input = document.getElementById('searchInput');
    const dropdown = document.getElementById('searchResultsDropdown');
    const clearBtn = document.getElementById('searchClearBtn');

    if (!input || !dropdown) return;

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      state.filter.searchQuery = query;

      if (clearBtn) {
        clearBtn.classList.toggle('visible', query.length > 0);
      }

      if (query.length < 1) {
        dropdown.classList.remove('active');
        dropdown.innerHTML = '';
        renderProducts();
        return;
      }

      const matches = state.products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.tagline.toLowerCase().includes(query) ||
        p.categoryLabel.toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        dropdown.innerHTML = matches.slice(0, 5).map(p => `
          <div class="search-result-item" data-id="${p.id}">
            <img src="${p.image}" alt="${p.name}" class="search-result-img">
            <div class="search-result-info">
              <div class="search-result-title">${p.name}</div>
              <div class="search-result-price">${formatMoney(p.price)}</div>
            </div>
          </div>
        `).join('');
        dropdown.classList.add('active');

        dropdown.querySelectorAll('.search-result-item').forEach(item => {
          item.addEventListener('click', () => {
            openQuickView(item.dataset.id);
            dropdown.classList.remove('active');
          });
        });
      } else {
        dropdown.innerHTML = `<div style="padding: 14px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No products found for "${query}"</div>`;
        dropdown.classList.add('active');
      }

      renderProducts();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        state.filter.searchQuery = '';
        clearBtn.classList.remove('visible');
        dropdown.classList.remove('active');
        renderProducts();
      });
    }

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }

  // --- Currency Selector ---
  function setupCurrencySelector() {
    const select = document.getElementById('currencySelector');
    if (!select) return;

    select.value = state.currency;
    select.addEventListener('change', (e) => {
      state.currency = e.target.value;
      localStorage.setItem('aura_currency', state.currency);
      renderProducts();
      updateCartUI();
      document.getElementById('priceSliderVal').textContent = formatMoney(state.filter.maxPrice);
      showToast('Currency Updated', `Displaying prices in ${state.currency}`);
    });
  }

  // --- Theme Toggle ---
  function setupThemeToggle() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;

    document.documentElement.setAttribute('data-theme', state.theme);

    btn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', state.theme);
      localStorage.setItem('aura_theme', state.theme);
      showToast('Theme Switched', `${state.theme.charAt(0).toUpperCase() + state.theme.slice(1)} mode active`);
    });
  }

  // --- FAQ Accordion ---
  function setupFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-question');
      q?.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });
  }

  // --- Newsletter Form ---
  function setupNewsletter() {
    const form = document.getElementById('newsletterForm');
    const input = document.getElementById('newsletterEmail');
    if (!form || !input) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !email.includes('@')) {
        showToast('Invalid Email', 'Please enter a valid email address.');
        return;
      }
      showToast('VIP Access Granted', `Welcome to the Aura Society, ${email}! Check your inbox for your 15% welcome perk.`, 'success');
      input.value = '';
    });
  }

  // --- Setup 3D Tilt Effect on Hero Card ---
  function setupHero3DTilt() {
    const card = document.getElementById('heroShowcaseCard');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  }

  // ==========================================================================
  // WEB AUDIO SYNTHESIZER (Haptic Acoustic Audio Chimes)
  // ==========================================================================
  function playAudioChime(type = 'receive') {
    if (!state.chat.sound) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;

      if (type === 'send') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'receive') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'unlock') {
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // ==========================================================================
  // AUTHENTICATION GATEWAY & USER PROFILE MANAGEMENT
  // ==========================================================================
  function initAuthSystem() {
    const authOverlay = document.getElementById('authGateOverlay');
    const tabSignIn = document.getElementById('tabSignInBtn');
    const tabSignUp = document.getElementById('tabSignUpBtn');
    const signInPanel = document.getElementById('signInPanel');
    const signUpPanel = document.getElementById('signUpPanel');
    const authAlert = document.getElementById('authAlertBanner');
    const authAlertText = document.getElementById('authAlertText');

    // Update UI based on current auth session
    applyAuthStateUI();

    // Tab Switching: Sign In vs Create Account
    tabSignIn?.addEventListener('click', () => {
      tabSignIn.classList.add('active');
      tabSignIn.setAttribute('aria-selected', 'true');
      tabSignUp?.classList.remove('active');
      tabSignUp?.setAttribute('aria-selected', 'false');
      if (signInPanel) signInPanel.style.display = 'flex';
      if (signUpPanel) signUpPanel.style.display = 'none';
      const title = document.getElementById('authTitle');
      const subtitle = document.getElementById('authSubtitle');
      if (title) title.textContent = 'Sign In';
      if (subtitle) subtitle.textContent = 'Enter your username or email to continue.';
      if (authAlert) authAlert.style.display = 'none';
    });

    tabSignUp?.addEventListener('click', () => {
      tabSignUp.classList.add('active');
      tabSignUp.setAttribute('aria-selected', 'true');
      tabSignIn?.classList.remove('active');
      tabSignIn?.setAttribute('aria-selected', 'false');
      if (signUpPanel) signUpPanel.style.display = 'flex';
      if (signInPanel) signInPanel.style.display = 'none';
      const title = document.getElementById('authTitle');
      const subtitle = document.getElementById('authSubtitle');
      if (title) title.textContent = 'Create Account';
      if (subtitle) subtitle.textContent = 'Join AURA LUXE with your chosen username.';
      if (authAlert) authAlert.style.display = 'none';
    });

    // Password Visibility Eye Toggles
    const toggleLoginEye = document.getElementById('toggleLoginEyeBtn');
    const loginPassInput = document.getElementById('loginPasswordInput');
    toggleLoginEye?.addEventListener('click', () => {
      if (loginPassInput) {
        const isPass = loginPassInput.type === 'password';
        loginPassInput.type = isPass ? 'text' : 'password';
        toggleLoginEye.style.color = isPass ? 'var(--accent-cyan)' : 'var(--text-muted)';
      }
    });

    const toggleRegEye = document.getElementById('toggleRegEyeBtn');
    const regPassInput = document.getElementById('regPasswordInput');
    toggleRegEye?.addEventListener('click', () => {
      if (regPassInput) {
        const isPass = regPassInput.type === 'password';
        regPassInput.type = isPass ? 'text' : 'password';
        toggleRegEye.style.color = isPass ? 'var(--accent-cyan)' : 'var(--text-muted)';
      }
    });

    // Sign In Form Submission (Supabase Cloud Auth + Local Fallback)
    signInPanel?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = (document.getElementById('loginEmailInput')?.value || '').trim();
      const password = (document.getElementById('loginPasswordInput')?.value || '').trim();

      if (!identifier || !password) {
        showAuthAlert('Please enter your username/email and password.');
        return;
      }

      const submitBtn = document.getElementById('loginSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Verifying credentials...</span>';
      }

      // Check if Supabase Cloud Auth is configured
      if (window.AuraSupabase && window.AuraSupabase.isConfigured()) {
        try {
          const res = await window.AuraSupabase.auth.signIn(identifier, password);
          if (res && res.user) {
            const userObj = {
              id: res.user.id,
              name: res.profile?.full_name || res.user.user_metadata?.full_name || res.profile?.username || res.user.email.split('@')[0],
              username: res.profile?.username || res.user.user_metadata?.username || res.user.email.split('@')[0],
              email: res.user.email,
              role: res.profile?.role || 'AURA VIP Member',
              avatar: (res.profile?.username || res.user.email).charAt(0).toUpperCase(),
              isSupabase: true
            };
            state.currentUser = userObj;
            localStorage.setItem('aura_current_user', JSON.stringify(userObj));
            playAudioChime('unlock');
            if (authOverlay) authOverlay.classList.add('unlocked');
            showToast('Supabase Authenticated', `Welcome back, ${userObj.name}!`, 'success');
            applyAuthStateUI();
            return;
          }
        } catch (sbErr) {
          console.warn('Supabase authentication notice:', sbErr);
          showAuthAlert(sbErr.message || 'Incorrect credentials. Please check your username/email or password.');
          return;
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Sign In</span><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
          }
        }
      }

      // Local Fallback if Supabase credentials are not yet entered
      const idLower = identifier.toLowerCase();
      const match = state.users.find(u => {
        const uUsername = (u.username || '').toLowerCase().trim();
        const uEmail = (u.email || '').toLowerCase().trim();
        const uName = (u.name || '').toLowerCase().trim();
        const emailPrefix = uEmail.includes('@') ? uEmail.split('@')[0].toLowerCase().trim() : '';

        const isUserMatch = (
          idLower === uUsername || 
          idLower === uEmail || 
          idLower === uName || 
          idLower === emailPrefix
        );
        return isUserMatch && u.password === password;
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Sign In</span><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
      }

      if (match) {
        state.currentUser = match;
        localStorage.setItem('aura_current_user', JSON.stringify(match));
        playAudioChime('unlock');
        if (authOverlay) authOverlay.classList.add('unlocked');
        showToast('Signed In', `Welcome back, ${match.name}!`, 'success');
        applyAuthStateUI();
      } else {
        showAuthAlert('Incorrect username or password. Please try again.');
      }
    });

    // Guest Entry Option
    document.getElementById('guestEntryBtn')?.addEventListener('click', () => {
      const guestUser = {
        name: 'Guest Explorer',
        email: 'guest@auraluxe.com',
        username: 'guest',
        role: 'Guest VIP',
        avatar: 'G'
      };
      state.currentUser = guestUser;
      localStorage.setItem('aura_current_user', JSON.stringify(guestUser));
      playAudioChime('unlock');
      if (authOverlay) authOverlay.classList.add('unlocked');
      showToast('Guest Access', 'Welcome! You are exploring as a guest visitor.', 'success');
      applyAuthStateUI();
    });

    // Sign Up / Register Form Submission (Supabase Cloud + Local Fallback)
    signUpPanel?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = (document.getElementById('regUsernameInput')?.value || '').trim();
      const email = (document.getElementById('regEmailInput')?.value || '').trim();
      const password = (document.getElementById('regPasswordInput')?.value || '').trim();

      if (!username) {
        showAuthAlert('Please choose a username.');
        return;
      }
      if (!email || !email.includes('@')) {
        showAuthAlert('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        showAuthAlert('Password must be at least 6 characters long.');
        return;
      }

      const submitBtn = document.getElementById('signUpSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Creating Cloud Account...</span>';
      }

      // Check if Supabase Cloud Auth is configured
      if (window.AuraSupabase && window.AuraSupabase.isConfigured()) {
        try {
          const res = await window.AuraSupabase.auth.signUp(email, password, username, username);
          if (res?.session && res?.user) {
            const newUser = {
              id: res.user.id,
              name: username.charAt(0).toUpperCase() + username.slice(1),
              username: username.toLowerCase(),
              email: email.toLowerCase(),
              role: 'AURA VIP Member',
              avatar: username.charAt(0).toUpperCase(),
              isSupabase: true
            };
            state.currentUser = newUser;
            localStorage.setItem('aura_current_user', JSON.stringify(newUser));
            playAudioChime('unlock');
            if (authOverlay) authOverlay.classList.add('unlocked');
            showToast('Account Created', `Welcome to AURA LUXE, ${newUser.name}!`, 'success');
            applyAuthStateUI();
            return;
          } else if (res?.user) {
            showAuthAlert('Account created! A confirmation email has been sent. Please verify your email, then sign in.');
            if (tabSignIn) tabSignIn.click();
            return;
          }
        } catch (sbErr) {
          console.warn('Supabase sign-up error:', sbErr);
          showAuthAlert(sbErr.message || 'Registration failed. Please try again.');
          return;
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Create Account</span><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
          }
        }
      }

      // Local fallback
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Create Account</span><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
      }

      const usernameClean = username.toLowerCase();
      const existing = state.users.find(u => 
        (u.username && u.username.toLowerCase() === usernameClean) ||
        (u.email && u.email.toLowerCase() === email.toLowerCase())
      );
      if (existing) {
        showAuthAlert('Username or email is already registered. Please sign in or use another.');
        return;
      }

      // Register new user with their chosen username
      const newUser = {
        name: username.charAt(0).toUpperCase() + username.slice(1),
        username: usernameClean,
        email: email.toLowerCase(),
        password: password,
        role: 'AURA VIP Member',
        avatar: username.charAt(0).toUpperCase()
      };

      state.users.push(newUser);
      localStorage.setItem('aura_users', JSON.stringify(state.users));
      state.currentUser = newUser;
      localStorage.setItem('aura_current_user', JSON.stringify(newUser));

      playAudioChime('unlock');
      if (authOverlay) authOverlay.classList.add('unlocked');
      showToast('Account Created', `Welcome to AURA LUXE, ${newUser.name}!`, 'success');
      applyAuthStateUI();
    });

    // Navbar User Profile Button & Dropdown Interactions
    const navUserBtn = document.getElementById('navUserBtn');
    const userDropdown = document.getElementById('userDropdownPanel');

    navUserBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = navUserBtn.getAttribute('aria-expanded') === 'true';
      navUserBtn.setAttribute('aria-expanded', !isExpanded);
      userDropdown?.classList.toggle('active', !isExpanded);
    });

    // Close user dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#navUserContainer')) {
        userDropdown?.classList.remove('active');
        navUserBtn?.setAttribute('aria-expanded', 'false');
      }
    });

    // Dropdown Navigation Links
    document.getElementById('dropdownBagBtn')?.addEventListener('click', () => {
      userDropdown?.classList.remove('active');
      openCartDrawer();
    });

    document.getElementById('dropdownWishlistBtn')?.addEventListener('click', () => {
      userDropdown?.classList.remove('active');
      openWishlistModal();
    });

    document.getElementById('dropdownChatBtn')?.addEventListener('click', () => {
      userDropdown?.classList.remove('active');
      const chatPanel = document.getElementById('auraChatPanel');
      const launcher = document.getElementById('auraChatLauncher');
      if (chatPanel) chatPanel.classList.add('open');
      if (launcher) launcher.classList.add('active');
      state.chat.open = true;
    });

    // Logout Button
    document.getElementById('dropdownLogoutBtn')?.addEventListener('click', handleLogout);

    function showAuthAlert(msg) {
      if (authAlert && authAlertText) {
        authAlertText.textContent = msg;
        authAlert.style.display = 'flex';
        authAlert.classList.remove('success');
      }
    }
  }

  // --- Apply Auth State to Navigation Bar and Gate ---
  function applyAuthStateUI() {
    const authOverlay = document.getElementById('authGateOverlay');
    const navUserName = document.getElementById('navUserName');
    const navUserAvatar = document.getElementById('navUserAvatar');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const dropdownName = document.getElementById('dropdownName');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const dropdownTier = document.getElementById('dropdownTier');
    const dropdownBagCount = document.getElementById('dropdownBagCount');
    const dropdownWishlistCount = document.getElementById('dropdownWishlistCount');

    if (state.currentUser) {
      // User is logged in: unlock website gate
      if (authOverlay) authOverlay.classList.add('unlocked');

      const name = state.currentUser.name || 'Member';
      const initial = state.currentUser.avatar || name.charAt(0).toUpperCase();

      if (navUserName) navUserName.textContent = name;
      if (navUserAvatar) navUserAvatar.textContent = initial;
      if (dropdownAvatar) dropdownAvatar.textContent = initial;
      if (dropdownName) dropdownName.textContent = name;
      if (dropdownEmail) dropdownEmail.textContent = state.currentUser.email || 'member@auraluxe.com';
      if (dropdownTier) dropdownTier.textContent = state.currentUser.role || 'AURA VIP Member';
    } else {
      // User is NOT logged in: lock the website behind the auth gateway
      if (authOverlay) authOverlay.classList.remove('unlocked');

      if (navUserName) navUserName.textContent = 'Sign In';
      if (navUserAvatar) navUserAvatar.textContent = '?';
      if (dropdownName) dropdownName.textContent = 'Guest Visitor';
      if (dropdownEmail) dropdownEmail.textContent = 'Not authenticated';
      if (dropdownTier) dropdownTier.textContent = 'Portal Locked';
    }

    // Refresh counts in user dropdown
    const totalBagQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (dropdownBagCount) dropdownBagCount.textContent = totalBagQty;
    if (dropdownWishlistCount) dropdownWishlistCount.textContent = state.wishlist.length;
  }

  // --- Handle Logout ---
  function handleLogout() {
    if (window.AuraSupabase && window.AuraSupabase.isConfigured()) {
      try {
        window.AuraSupabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign-out notice:', e);
      }
    }
    state.currentUser = null;
    localStorage.removeItem('aura_current_user');
    const userDropdown = document.getElementById('userDropdownPanel');
    const navUserBtn = document.getElementById('navUserBtn');
    if (userDropdown) userDropdown.classList.remove('active');
    if (navUserBtn) navUserBtn.setAttribute('aria-expanded', 'false');

    applyAuthStateUI();
    showToast('Signed Out', 'You have been securely signed out. Portal locked.', 'default');
  }

  // ==========================================================================
  // AURA AI CONCIERGE & SHOPPING ASSISTANT CHATBOT SYSTEM
  // ==========================================================================
  function initChatbotSystem() {
    const launcher = document.getElementById('auraChatLauncher');
    const panel = document.getElementById('auraChatPanel');
    const closeBtn = document.getElementById('chatCloseBtn');
    const resetBtn = document.getElementById('chatResetBtn');
    const soundBtn = document.getElementById('chatSoundBtn');
    const inputForm = document.getElementById('chatInputForm');
    const textarea = document.getElementById('chatUserInput');
    const suggestionsStrip = document.getElementById('chatSuggestionsStrip');

    // Initialize messages array if empty
    if (!state.chat.messages || state.chat.messages.length === 0) {
      const userName = state.currentUser ? state.currentUser.name : 'Collector';
      state.chat.messages = [
        {
          sender: 'bot',
          text: `Greetings, **${userName}**! I am your **AURA AI Concierge** — an intelligent shopping advisor and acoustics specialist.\n\nI can recommend products, explain technical specifications, calculate express delivery times, share active coupon codes, or check your bag contents. What would you like to explore?`,
          time: getCurrentTimeFormatted()
        }
      ];
      sessionStorage.setItem('aura_chat_msgs', JSON.stringify(state.chat.messages));
    }

    // Render initial messages
    renderChatMessages();

    // Launcher Click: Toggle Chat Panel
    launcher?.addEventListener('click', () => {
      const isOpen = panel?.classList.contains('open');
      if (isOpen) {
        panel.classList.remove('open');
        launcher.classList.remove('active');
        state.chat.open = false;
      } else {
        panel.classList.add('open');
        launcher.classList.add('active');
        state.chat.open = true;
        // Hide unread dot
        const unreadDot = document.getElementById('chatUnreadDot');
        if (unreadDot) unreadDot.style.display = 'none';
        scrollToChatBottom();
        setTimeout(() => textarea?.focus(), 150);
      }
    });

    // Close Button
    closeBtn?.addEventListener('click', () => {
      panel?.classList.remove('open');
      launcher?.classList.remove('active');
      state.chat.open = false;
    });

    // Reset / Clear Chat Conversation
    resetBtn?.addEventListener('click', () => {
      const userName = state.currentUser ? state.currentUser.name : 'Collector';
      state.chat.messages = [
        {
          sender: 'bot',
          text: `Chat session refreshed. Hello, **${userName}**! How can I assist with your setup or acoustic choices today?`,
          time: getCurrentTimeFormatted()
        }
      ];
      sessionStorage.setItem('aura_chat_msgs', JSON.stringify(state.chat.messages));
      renderChatMessages();
      showToast('Chat Reset', 'Conversation history cleared.');
    });

    // Toggle Sound Chimes
    soundBtn?.addEventListener('click', () => {
      state.chat.sound = !state.chat.sound;
      localStorage.setItem('aura_chat_sound', state.chat.sound);
      soundBtn.style.opacity = state.chat.sound ? '1' : '0.4';
      showToast('Sound Effects', `Chat audio chimes ${state.chat.sound ? 'enabled' : 'muted'}.`);
    });

    // Quick Suggestion Chips Click
    suggestionsStrip?.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query') || chip.textContent;
        sendUserMessage(query);
      });
    });

    // Send Form Submission
    inputForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = textarea?.value.trim();
      if (!text) return;
      sendUserMessage(text);
      if (textarea) {
        textarea.value = '';
        textarea.style.height = 'auto';
      }
    });

    // Textarea: Enter to send (Shift+Enter for newline) & auto-resize
    textarea?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        inputForm?.dispatchEvent(new Event('submit'));
      }
    });

    textarea?.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
    });
  }

  // --- Format Current Time (e.g. 3:45 PM) ---
  function getCurrentTimeFormatted() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // --- Render Chat Messages into DOM ---
  function renderChatMessages() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    container.innerHTML = state.chat.messages.map(msg => {
      const isUser = msg.sender === 'user';
      const formattedText = formatChatMessageText(msg.text);

      // Embedded rich product card (if present)
      let richCardHtml = '';
      if (msg.richCard) {
        const p = msg.richCard;
        richCardHtml = `
          <div class="chat-product-card">
            <img src="${p.image}" alt="${p.name}" class="chat-product-thumb">
            <div class="chat-product-details">
              <span class="chat-product-title">${p.name}</span>
              <span class="chat-product-price">${formatMoney(p.price)}</span>
              <div class="chat-product-actions">
                <button class="chat-card-btn chat-card-btn-primary" onclick="window.auraApp.addToCart('${p.id}')">
                  + Add to Bag
                </button>
                <button class="chat-card-btn chat-card-btn-secondary" onclick="window.auraApp.openQuickView('${p.id}')">
                  View Specs
                </button>
              </div>
            </div>
          </div>
        `;
      }

      // Embedded direct coupon button (if present)
      let couponHtml = '';
      if (msg.coupon) {
        couponHtml = `
          <button class="chat-coupon-pill" onclick="window.auraApp.applyCouponDirect('${msg.coupon}')" title="Click to apply to bag">
            ⚡ Apply Code ${msg.coupon} to Bag
          </button>
        `;
      }

      return `
        <div class="chat-msg ${msg.sender}">
          <div class="chat-msg-avatar">
            ${isUser ? (state.currentUser ? (state.currentUser.avatar || 'U') : 'U') : '✦'}
          </div>
          <div>
            <div class="chat-msg-bubble">
              ${formattedText}
              ${richCardHtml}
              ${couponHtml}
            </div>
            <div class="chat-msg-time">${msg.time}</div>
          </div>
        </div>
      `;
    }).join('');

    scrollToChatBottom();
  }

  // --- Format Markdown-like features in Chat (bold, bullet lists, newlines) ---
  function formatChatMessageText(rawText) {
    if (!rawText) return '';
    let html = rawText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert bullet lists
    const lines = html.split('\n');
    let inList = false;
    let result = [];

    for (let line of lines) {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        result.push(`<li>${line.replace(/^[•\-]\s*/, '')}</li>`);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        if (line.trim()) {
          result.push(`<p>${line}</p>`);
        }
      }
    }
    if (inList) result.push('</ul>');

    return result.join('');
  }

  // --- Scroll Chat Container to Bottom ---
  function scrollToChatBottom() {
    const container = document.getElementById('chatMessagesContainer');
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }

  // --- Send User Message & Handle AI Reasoning ---
  function sendUserMessage(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    // 1. Add user message
    const userMsg = {
      sender: 'user',
      text: cleanText,
      time: getCurrentTimeFormatted()
    };
    state.chat.messages.push(userMsg);
    renderChatMessages();
    playAudioChime('send');

    // 2. Show Typing Indicator
    const typingIndicator = document.getElementById('chatTypingIndicator');
    if (typingIndicator) typingIndicator.style.display = 'flex';
    scrollToChatBottom();

    // 3. Process Intent & NLP Reasoning
    const botResponse = processBotQuery(cleanText);

    // Realistic Micro-Delay (450ms - 750ms) for natural conversational feel
    const delay = Math.floor(Math.random() * 300) + 450;
    setTimeout(() => {
      if (typingIndicator) typingIndicator.style.display = 'none';

      const botMsg = {
        sender: 'bot',
        text: botResponse.text,
        richCard: botResponse.richCard || null,
        coupon: botResponse.coupon || null,
        time: getCurrentTimeFormatted()
      };

      state.chat.messages.push(botMsg);
      sessionStorage.setItem('aura_chat_msgs', JSON.stringify(state.chat.messages));
      renderChatMessages();
      playAudioChime('receive');

      // If panel is minimized, light up the unread dot
      const panel = document.getElementById('auraChatPanel');
      if (!panel?.classList.contains('open')) {
        const dot = document.getElementById('chatUnreadDot');
        if (dot) dot.style.display = 'block';
      }
    }, delay);
  }

  // ==========================================================================
  // NATURAL LANGUAGE QUERY PROCESSING & STORE KNOWLEDGE ENGINE
  // ==========================================================================
  function processBotQuery(query) {
    const q = query.toLowerCase();

    // 1. Live Shopping Bag / Cart Query
    if (q.includes('cart') || q.includes('bag') || q.includes('what did i buy') || q.includes('my items') || q.includes('total price')) {
      const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQty === 0) {
        return {
          text: `Your **Shopping Bag** is currently empty. Tap the bag icon or "Add to Bag" on any artifact to reserve it for priority calibration.`
        };
      }
      const rawSubtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemsList = state.cart.map(item => `• **${item.quantity}x** ${item.name} (${formatMoney(item.price * item.quantity)})`).join('\n');
      return {
        text: `You have **${totalQty} artifact(s)** in your shopping bag:\n\n${itemsList}\n\n**Subtotal:** ${formatMoney(rawSubtotal)}\n\nYou can proceed to checkout by opening the bag drawer in the navigation bar.`
      };
    }

    // 2. Active Promotional Discounts & Coupons
    if (q.includes('coupon') || q.includes('promo') || q.includes('discount') || q.includes('code') || q.includes('voucher') || q.includes('sale') || q.includes('offer')) {
      return {
        text: `Here are our **active VIP promo codes** authorized for your session:\n\n• **AURA20** — 20% off all flagship acoustics & wearables\n• **FREESHIP** — Unlocks complimentary worldwide priority express shipping\n• **CYBER10** — 10% instant cyber discount on all accessories\n\nYou can click below to apply **AURA20** directly to your bag:`,
        coupon: 'AURA20'
      };
    }

    // 3. Shipping, Logistics & Delivery Times
    if (q.includes('shipping') || q.includes('deliver') || q.includes('how long') || q.includes('fast') || q.includes('dhl') || q.includes('carrier') || q.includes('international') || q.includes('courier')) {
      return {
        text: `Here is our **Global Express Logistics** schedule:\n\n• **Transit Duration:** 2–4 business days worldwide via **DHL Express Worldwide Air**.\n• **Calibration Time:** Every piece is calibrated in our Zurich acoustic laboratories prior to dispatch.\n• **Complimentary Threshold:** Orders over **$150.00** receive free worldwide express shipping automatically.\n• **Live Tracking:** Real-time tracking reference is provided immediately upon order authorization.`
      };
    }

    // 4. Warranty & Risk-Free Returns
    if (q.includes('warranty') || q.includes('return') || q.includes('refund') || q.includes('broken') || q.includes('trial') || q.includes('guarantee') || q.includes('replace')) {
      return {
        text: `All AURA LUXE artifacts are backed by our **Aura Care Assurance**:\n\n• **30-Day Risk-Free Trial:** Audition any artifact in your home setup. If not completely awed, return it in original packaging for a 100% full refund.\n• **Prepaid Return Labels:** We supply prepaid DHL Express air waybills for effortless returns.\n• **3-Year Comprehensive Warranty:** Covers transducer performance, battery degradation, titanium shell integrity, and unexpected internal circuit defects.`
      };
    }

    // 5. Accepted Payment Methods
    if (q.includes('pay') || q.includes('payment') || q.includes('apple pay') || q.includes('google pay') || q.includes('crypto') || q.includes('card') || q.includes('usdt')) {
      return {
        text: `We accept the following **secure payment channels**:\n\n• **Apple Pay & Google Pay:** Instant biometric 1-tap checkout\n• **Credit Cards:** Visa, Mastercard, American Express with 3D Secure 2.0\n• **Crypto:** USDT & USDC on zero-gas networks\n• **Security:** End-to-end 256-Bit Quantum TLS Encryption.`
      };
    }

    // 6. Creator / About AURA LUXE
    if (q.includes('kushal') || q.includes('who made') || q.includes('who built') || q.includes('who created') || q.includes('about') || q.includes('author') || q.includes('developer')) {
      return {
        text: `**AURA LUXE** is engineered and curated by **Kushal**.\n\nThe vision is to bridge aerospace-grade metallurgy, spatial acoustics, and high-performance minimalist desktop artifacts into an uncompromising, luxury experience.`
      };
    }

    // 7. User Account / Logout Inquiry
    if (q.includes('logout') || q.includes('sign out') || q.includes('my account') || q.includes('who am i') || q.includes('profile')) {
      const user = state.currentUser;
      if (user) {
        return {
          text: `You are currently authenticated as **${user.name}** (${user.email}) holding **${user.role || 'VIP'}** privileges.\n\nTo lock your portal or sign out, click your profile icon in the navigation header and select **Sign Out & Lock Portal**.`
        };
      } else {
        return {
          text: `You are currently browsing as a guest. You can sign in via the VIP Portal card to access saved order records and concierge perks.`
        };
      }
    }

    // 8. Specific Product: Aura Horizon ANC Headphones
    if (q.includes('headphone') || q.includes('horizon') || q.includes('anc') || q.includes('acoustic') || q.includes('earphone') || q.includes('noise cancel')) {
      const product = state.products.find(p => p.id === 'aura-hp-01');
      return {
        text: `The **Aura Horizon ANC Headphones** ($349) are our flagship acoustic achievement:\n\n• **Transducers:** Custom 45mm Diamond-coated Graphene Drivers with 5Hz–45,000Hz response\n• **Noise Cancellation:** Next-gen 48dB Hybrid Active Noise Cancellation with Transparency Mode\n• **Battery Life:** 55 Hours continuous playback (15-min fast charge = 8 hours playback)\n• **Build:** Aerospace Grade 5 Titanium, Italian vegan leather, and memory foam ear cushions.`,
        richCard: product
      };
    }

    // 9. Specific Product: Aura Chrono Cyber Smartwatch
    if (q.includes('watch') || q.includes('chrono') || q.includes('wearable') || q.includes('smartwatch')) {
      const product = state.products.find(p => p.id === 'aura-sw-02');
      return {
        text: `The **Aura Chrono Cyber Smartwatch** ($389) blends haute horlogerie with biometric precision:\n\n• **Chassis:** Grade 5 Titanium Monoblock Shell with Sapphire Crystal\n• **Display:** 1.43" Holographic AMOLED with 2,000 nits peak brightness\n• **Sensors:** Continuous ECG, HRV, SpO2, and VO2 Max biometrics engine\n• **Durability:** 100m (10 ATM) water resistance and 14-day continuous battery reserve.`,
        richCard: product
      };
    }

    // 10. Specific Product: Aura Genesis Mechanical Keyboard
    if (q.includes('keyboard') || q.includes('genesis') || q.includes('mechanical') || q.includes('typing') || q.includes('switch') || q.includes('keycap')) {
      const product = state.products.find(p => p.id === 'aura-kb-03');
      return {
        text: `The **Aura Genesis Custom Mechanical Keyboard** ($269) is built for pure tactile satisfaction:\n\n• **Acoustics:** Custom Frosted Acrylic Monolith with CNC Machined Brass Weight\n• **Switches:** Pre-lubed Gateron Oil King linear switches with hot-swappable PCB\n• **Mount:** Gasket mount with Poron foam dampeners for deep acoustic feedback\n• **Keycaps:** Double-shot PBT Cherry profile caps with per-key RGB.`,
        richCard: product
      };
    }

    // 11. Specific Product: Aura Levitate Magnetic Floating Speaker
    if (q.includes('speaker') || q.includes('levitate') || q.includes('float') || q.includes('magnetic') || q.includes('orb')) {
      const product = state.products.find(p => p.id === 'aura-sp-04');
      return {
        text: `The **Aura Levitate Floating Speaker** ($299) defies gravity while delivering spatial sound:\n\n• **Levitation:** Neodymium magnetic suspension base with active stabilization\n• **Sound:** 360° Omnidirectional acoustic waveguide with deep dual passive bass radiators\n• **Battery:** 18 Hours wireless playback with inductive charging from the magnetic base\n• **Connectivity:** Bluetooth 5.4 with stereo pairing support.`,
        richCard: product
      };
    }

    // 12. Specific Product: Aura Vision AR Smart Audio Glasses
    if (q.includes('glasses') || q.includes('vision') || q.includes('ar') || q.includes('eyewear') || q.includes('bone conduction')) {
      const product = state.products.find(p => p.id === 'aura-gl-05');
      return {
        text: `The **Aura Vision AR Audio Glasses** ($319) blend style with private acoustic immersion:\n\n• **Audio:** Open-ear micro directional acoustic beamforming speakers (zero sound leakage)\n• **Optics:** Electrochromic smart lenses that adjust tint automatically to ambient light\n• **Mics:** Quad beamforming microphones for crystal-clear calls and AI assistant voice commands\n• **Weight:** Only 38g with IP54 sweat and rain resistance.`,
        richCard: product
      };
    }

    // 13. Specific Product: Aura Nomad Carbon Tech Backpack
    if (q.includes('backpack') || q.includes('nomad') || q.includes('carbon') || q.includes('laptop bag') || q.includes('bag') || q.includes('carry')) {
      const product = state.products.find(p => p.id === 'aura-bp-06');
      return {
        text: `The **Aura Nomad Carbon Tech Backpack** ($189) is the ultimate everyday carry vault:\n\n• **Materials:** Real 3K Carbon Fiber weave with waterproof 1680D Ballistic Cordura nylon\n• **Hardware:** German Fidlock magnetic auto-snap buckles and YKK Aquaguard zips\n• **Protection:** Padded floating vault fits laptops up to 16" with shock dampening\n• **Capacity:** 22L expandable to 26L with ergonomic airflow back harness.`,
        richCard: product
      };
    }

    // 14. Specific Product: Aura Orbit 3-in-1 Magnetic Dock
    if (q.includes('dock') || q.includes('orbit') || q.includes('charger') || q.includes('wireless charger') || q.includes('magsafe') || q.includes('qi')) {
      const product = state.products.find(p => p.id === 'aura-dk-07');
      return {
        text: `The **Aura Orbit 3-in-1 Dock** ($149) is sculpted from volcanic obsidian:\n\n• **Charging:** 15W Qi2 MagSafe fast wireless charging for phone, smartwatch, and earbuds\n• **Materials:** Solid volcanic obsidian base and CNC anodized aerospace aluminum stem\n• **Cable Management:** Single hidden braided USB-C cable powers all 3 charging pads\n• **Weight:** Substantial 620g base that stays firmly in place when lifting devices.`,
        richCard: product
      };
    }

    // 15. Specific Product: Aura Lumos Desk Light Bar
    if (q.includes('light') || q.includes('lumos') || q.includes('lamp') || q.includes('desk light') || q.includes('bar') || q.includes('glare')) {
      const product = state.products.find(p => p.id === 'aura-lb-08');
      return {
        text: `The **Aura Lumos Dynamic Light Bar** ($129) eliminates eye strain and screen glare:\n\n• **Optics:** Asymmetric optical refraction directs illumination onto your desk, zero glare on screen\n• **Color Accuracy:** Ultra-high CRI > 97 Ra reveals true vivid colors\n• **Control:** Heavy aluminum wireless desktop rotary dial for smooth brightness & warmth adjustment\n• **Backlight:** Ambient RGB dynamic back-glow to soften contrast against your wall.`,
        richCard: product
      };
    }

    // 16. Budget & Price Filter Queries
    if (q.includes('under 200') || q.includes('under $200') || q.includes('under 150') || q.includes('under $150') || q.includes('budget') || q.includes('affordable') || q.includes('cheap')) {
      const affordable = state.products.filter(p => p.price <= 200);
      const list = affordable.map(p => `• **${p.name}** — ${formatMoney(p.price)}`).join('\n');
      return {
        text: `Here are our **artifacts under $200.00** offering extraordinary value:\n\n${list}\n\nOur top recommendation in this tier is the **Aura Nomad Carbon Backpack**:`,
        richCard: affordable[0]
      };
    }

    // 17. Category Inquiries (Audio, Wearables, Desk)
    if (q.includes('audio') || q.includes('sound') || q.includes('music')) {
      const audioItems = state.products.filter(p => p.category === 'audio');
      return {
        text: `We offer **2 flagship acoustic artifacts** in our collection:\n\n1. **Aura Horizon ANC Headphones** ($349) — 45mm Graphene Spatial Drivers\n2. **Aura Levitate Magnetic Floating Speaker** ($299) — 360° Omnidirectional Orb\n\nCheck out the flagship Horizon headphones below:`,
        richCard: audioItems[0]
      };
    }

    if (q.includes('desk') || q.includes('setup') || q.includes('workspace')) {
      const deskItems = state.products.filter(p => p.category === 'desk');
      return {
        text: `Elevate your workspace with these **minimalist desk artifacts**:\n\n• **Aura Genesis Mechanical Keyboard** ($269) — Gasket mount & Oil Kings\n• **Aura Orbit 3-in-1 Magnetic Dock** ($149) — Obsidian fast charging\n• **Aura Lumos Dynamic Light Bar** ($129) — Zero-glare optical light\n\nTake a look at the custom keyboard:`,
        richCard: deskItems[0]
      };
    }

    // 18. Greetings & Small Talk
    if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hello') || q.startsWith('hi ') || q.includes('good morning') || q.includes('good evening')) {
      const userName = state.currentUser ? state.currentUser.name : 'Collector';
      return {
        text: `Hello, **${userName}**! It is a pleasure to assist you. Are you looking to upgrade your audio gear, desktop workspace, or explore our active discount codes?`
      };
    }

    if (q.includes('how are you') || q.includes('what can you do') || q.includes('help')) {
      return {
        text: `I am performing at peak efficiency! As your **AURA Concierge**, you can ask me:\n\n• *"Recommend the best headphones"*\n• *"What coupons are active right now?"*\n• *"How long does delivery take to my city?"*\n• *"What are the keyboard specifications?"*\n• *"What is currently in my cart?"*\n• *"What products are under $200?"*`
      };
    }

    if (q.includes('thank') || q.includes('thanks') || q.includes('great') || q.includes('awesome') || q.includes('cool')) {
      return {
        text: `You are most welcome! Let me know if you need any further specifications or assistance securing your artifacts. Have an extraordinary session!`
      };
    }

    // 19. Smart Catalog Keyword Search Fallback
    const words = q.split(/\s+/).filter(w => w.length > 3);
    for (const word of words) {
      const match = state.products.find(p => 
        p.name.toLowerCase().includes(word) ||
        p.description.toLowerCase().includes(word) ||
        p.category.toLowerCase().includes(word) ||
        (p.features && p.features.some(f => f.toLowerCase().includes(word)))
      );
      if (match) {
        return {
          text: `Based on your mention of *"**${word}**"*, I recommend inspecting the **${match.name}** (${formatMoney(match.price)}):\n\n${match.tagline}`,
          richCard: match
        };
      }
    }

    // 20. General Fallback
    return {
      text: `I understand you are exploring our curated catalog. Our most sought-after acoustic artifact is the **Aura Horizon ANC Headphones** ($349.00).\n\nYou can also type **"coupons"** to unlock active VIP promo codes or **"shipping"** to view global delivery estimates.`,
      richCard: state.products[0]
    };
  }

  // ==========================================================================
  // SUPABASE CLOUD DATABASE & AUTHENTICATION INTEGRATION
  // ==========================================================================
  function setupSupabaseIntegration() {
    const modal = document.getElementById('supabaseModalOverlay');
    const closeBtn = document.getElementById('closeSupabaseModalBtn');
    const form = document.getElementById('supabaseConfigForm');
    const urlInput = document.getElementById('sbProjectUrlInput');
    const keyInput = document.getElementById('sbAnonKeyInput');
    const pingBtn = document.getElementById('testSupabasePingBtn');
    const seedBtn = document.getElementById('seedProductsToSupabaseBtn');
    const copySqlBtn = document.getElementById('copyMigrationSqlBtn');
    const toggleEyeBtn = document.getElementById('toggleSbKeyEyeBtn');

    // Trigger buttons
    const navBtn = document.getElementById('supabaseNavBtn');
    const dropdownBtn = document.getElementById('dropdownSupabaseBtn');
    const authTriggerBtn = document.getElementById('authSupabaseTriggerBtn');

    function openModal() {
      if (modal) modal.style.display = 'flex';
      const creds = window.AuraSupabase ? window.AuraSupabase.getCredentials() : { url: '', key: '' };
      if (urlInput) urlInput.value = creds.url;
      if (keyInput) keyInput.value = creds.key;
      updateStatusUI();
    }

    function closeModal() {
      if (modal) modal.style.display = 'none';
    }

    function updateStatusUI() {
      const isConnected = window.AuraSupabase && window.AuraSupabase.isConfigured();
      
      // Update Auth gateway badge
      const authDot = document.getElementById('authSupabaseDot');
      const authStatus = document.getElementById('authSupabaseStatus');
      if (authDot) authDot.classList.toggle('connected', isConnected);
      if (authStatus) authStatus.textContent = isConnected ? 'Connected' : 'Connect';

      // Update Nav button
      const navDot = document.getElementById('supabaseNavDot');
      if (navDot) navDot.classList.toggle('connected', isConnected);

      // Update dropdown pill
      const dropdownStatus = document.getElementById('dropdownSupabaseStatus');
      if (dropdownStatus) {
        dropdownStatus.classList.toggle('connected', isConnected);
        dropdownStatus.textContent = isConnected ? 'Active' : 'Connect';
      }

      // Update Modal Status Banner
      const modalBanner = document.getElementById('supabaseModalStatusBanner');
      const modalDot = document.getElementById('supabaseModalLiveDot');
      const modalTitle = document.getElementById('supabaseModalStatusTitle');
      const modalDesc = document.getElementById('supabaseModalStatusDesc');

      if (modalBanner) modalBanner.classList.toggle('connected', isConnected);
      if (modalDot) modalDot.classList.toggle('connected', isConnected);
      if (modalTitle) modalTitle.textContent = isConnected ? '🟢 Connected to Supabase Cloud' : '⚡ Supabase Awaiting Setup';
      if (modalDesc) {
        modalDesc.textContent = isConnected 
          ? 'Live connection active. PostgreSQL database tables and Supabase Auth are synchronized.'
          : 'Enter your project credentials to enable real-time PostgreSQL database & secure authentication.';
      }
    }

    navBtn?.addEventListener('click', openModal);
    dropdownBtn?.addEventListener('click', () => {
      document.getElementById('userDropdownPanel')?.classList.remove('active');
      openModal();
    });
    authTriggerBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target.id === 'supabaseModalOverlay') closeModal();
    });

    // Toggle API Key eye
    toggleEyeBtn?.addEventListener('click', () => {
      if (keyInput) {
        const isPass = keyInput.type === 'password';
        keyInput.type = isPass ? 'text' : 'password';
        toggleEyeBtn.style.color = isPass ? 'var(--accent-cyan)' : 'var(--text-muted)';
      }
    });

    // Ping test
    pingBtn?.addEventListener('click', async () => {
      if (!window.AuraSupabase) return;
      pingBtn.disabled = true;
      pingBtn.textContent = 'Pinging...';
      const url = urlInput?.value.trim();
      const key = keyInput?.value.trim();

      const res = await window.AuraSupabase.testConnection(url, key);
      pingBtn.disabled = false;
      pingBtn.textContent = 'Ping Server';

      if (res.success) {
        showToast('Supabase Connection OK', res.message, 'success');
      } else {
        showToast('Connection Warning', res.message, 'error');
      }
    });

    // Save credentials
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = urlInput?.value.trim();
      const key = keyInput?.value.trim();

      if (!url || !key) {
        showToast('Missing Credentials', 'Please enter both Supabase URL and Anon Key.', 'error');
        return;
      }

      const saveBtn = document.getElementById('saveSupabaseConfigBtn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>Connecting...</span>';
      }

      window.AuraSupabase.saveCredentials(url, key);
      const test = await window.AuraSupabase.testConnection(url, key);

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<span>Save &amp; Connect</span>';
      }

      if (test.success) {
        updateStatusUI();
        showToast('Connected to Supabase', 'Database tables and Authentication are now active!', 'success');
        
        // Fetch products from Supabase
        const remoteProducts = await window.AuraSupabase.db.fetchProducts();
        if (remoteProducts && remoteProducts.length > 0) {
          state.products = remoteProducts;
          renderProducts();
          showToast('Products Synced', `Loaded ${remoteProducts.length} live products from Supabase database.`, 'success');
        }
        closeModal();
      } else {
        updateStatusUI();
        showToast('Connection Notice', test.message, 'error');
      }
    });

    // Seed products to Supabase
    seedBtn?.addEventListener('click', async () => {
      if (!window.AuraSupabase || !window.AuraSupabase.isConfigured()) {
        showToast('Setup Required', 'Please connect Supabase first with your URL and Key.', 'error');
        return;
      }

      seedBtn.disabled = true;
      seedBtn.innerHTML = '<span>Seeding...</span>';

      try {
        await window.AuraSupabase.db.seedProducts(state.products);
        showToast('Database Seeded', `Successfully uploaded ${state.products.length} products to Supabase PostgreSQL table!`, 'success');
      } catch (err) {
        showToast('Seed Failed', err.message || 'Make sure the products table exists via supabase-schema.sql', 'error');
      } finally {
        seedBtn.disabled = false;
        seedBtn.innerHTML = '<span>⚡ Seed Products to DB</span>';
      }
    });

    // Copy SQL Schema
    copySqlBtn?.addEventListener('click', () => {
      const sqlHelp = `-- See supabase-schema.sql in the project root to copy all tables, RLS, and triggers.`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(sqlHelp).then(() => {
          showToast('File Ready', 'See supabase-schema.sql in the project root to run in your Supabase SQL Editor.', 'success');
        });
      } else {
        showToast('File Ready', 'See supabase-schema.sql in the project root.', 'default');
      }
    });

    // Initial status update
    updateStatusUI();

    // Check existing Supabase session and load remote products if configured
    if (window.AuraSupabase && window.AuraSupabase.isConfigured()) {
      // Restore Supabase user if session exists
      window.AuraSupabase.auth.getSession().then(async (session) => {
        if (session && session.user) {
          const profile = await window.AuraSupabase.db.fetchProfile(session.user.id);
          const activeUser = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            username: profile?.username || session.user.user_metadata?.username || session.user.email.split('@')[0],
            email: session.user.email,
            role: profile?.role || 'AURA VIP Member',
            avatar: (profile?.username || session.user.email).charAt(0).toUpperCase(),
            isSupabase: true
          };
          state.currentUser = activeUser;
          localStorage.setItem('aura_current_user', JSON.stringify(activeUser));
          applyAuthStateUI();
        }
      });

      // Fetch live products
      window.AuraSupabase.db.fetchProducts().then(remoteProducts => {
        if (remoteProducts && remoteProducts.length > 0) {
          state.products = remoteProducts;
          renderProducts();
          console.log(`⚡ [AURA] Loaded ${remoteProducts.length} live products from Supabase.`);
        }
      });
    }
  }

  // --- Initialize App ---
  function init() {
    renderProducts();
    updateCartUI();
    updateWishlistUI();
    setupSearchAutocomplete();
    setupCurrencySelector();
    setupThemeToggle();
    setupFAQ();
    setupNewsletter();
    setupHero3DTilt();
    initAuthSystem();
    initChatbotSystem();
    setupSupabaseIntegration();

    // Category pills click
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filter.category = pill.dataset.category;
        renderProducts();
      });
    });

    // Price slider
    const priceSlider = document.getElementById('priceSlider');
    const priceVal = document.getElementById('priceSliderVal');
    if (priceSlider && priceVal) {
      priceSlider.addEventListener('input', (e) => {
        state.filter.maxPrice = Number(e.target.value);
        priceVal.textContent = formatMoney(state.filter.maxPrice);
        renderProducts();
      });
    }

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.filter.sortBy = e.target.value;
        renderProducts();
      });
    }

    // View layout buttons
    document.getElementById('viewGridBtn')?.addEventListener('click', () => {
      state.filter.layout = 'grid';
      document.getElementById('viewGridBtn').classList.add('active');
      document.getElementById('viewListBtn').classList.remove('active');
      renderProducts();
    });

    document.getElementById('viewListBtn')?.addEventListener('click', () => {
      state.filter.layout = 'list';
      document.getElementById('viewListBtn').classList.add('active');
      document.getElementById('viewGridBtn').classList.remove('active');
      renderProducts();
    });

    // Header Cart & Wishlist Triggers
    document.getElementById('cartToggleBtn')?.addEventListener('click', openCartDrawer);
    document.getElementById('closeCartBtn')?.addEventListener('click', closeCartDrawer);
    document.getElementById('cartDrawerOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'cartDrawerOverlay') closeCartDrawer();
    });

    document.getElementById('wishlistToggleBtn')?.addEventListener('click', openWishlistModal);
    document.getElementById('closeWishlistBtn')?.addEventListener('click', closeWishlistModal);
    document.getElementById('wishlistOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'wishlistOverlay') closeWishlistModal();
    });

    // Quick View Modal Triggers
    document.getElementById('closeQuickViewBtn')?.addEventListener('click', closeQuickView);
    document.getElementById('quickViewOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'quickViewOverlay') closeQuickView();
    });

    // Quick view quantity steppers
    document.getElementById('qvMinusBtn')?.addEventListener('click', () => {
      if (state.quickViewQty > 1) {
        state.quickViewQty--;
        document.getElementById('qvQtyVal').textContent = state.quickViewQty;
      }
    });

    document.getElementById('qvPlusBtn')?.addEventListener('click', () => {
      state.quickViewQty++;
      document.getElementById('qvQtyVal').textContent = state.quickViewQty;
    });

    document.getElementById('qvAddToCartBtn')?.addEventListener('click', () => {
      if (state.quickViewItem) {
        addToCart(state.quickViewItem.id, state.quickViewQty, state.quickViewColor);
        closeQuickView();
      }
    });

    // Promo code apply
    document.getElementById('applyPromoBtn')?.addEventListener('click', applyCoupon);

    // Checkout Flow buttons
    document.getElementById('proceedToCheckoutBtn')?.addEventListener('click', openCheckoutModal);
    document.getElementById('closeCheckoutBtn')?.addEventListener('click', closeCheckoutModal);
    document.getElementById('checkoutOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'checkoutOverlay') closeCheckoutModal();
    });

    document.getElementById('toPaymentStepBtn')?.addEventListener('click', () => setCheckoutStep(2));
    document.getElementById('backToShippingBtn')?.addEventListener('click', () => setCheckoutStep(1));
    document.getElementById('confirmOrderBtn')?.addEventListener('click', completeOrder);
    document.getElementById('continueShoppingSuccessBtn')?.addEventListener('click', closeCheckoutModal);

    // Payment method selector
    document.querySelectorAll('.payment-method-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });

    // Hero quick CTA
    document.getElementById('heroExploreBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('heroAddFeaturedBtn')?.addEventListener('click', () => {
      addToCart('aura-hp-01', 1, 'Obsidian Black');
    });

    // 1-Click Quick Coupon Chips in Cart Drawer
    document.querySelectorAll('.cart-coupon-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const code = chip.dataset.coupon;
        const promoInput = document.getElementById('promoCodeInput');
        if (promoInput) promoInput.value = code;
        applyCoupon();
      });
    });

    // Floating Back to Top Button
    const backToTopBtn = document.getElementById('backToTopBtn');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        backToTopBtn?.classList.add('visible');
      } else {
        backToTopBtn?.classList.remove('visible');
      }
    });

    backToTopBtn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Global exposure for inline HTML event bindings & programmatic interaction
  window.auraApp = {
    addToCart,
    updateCartQuantity,
    removeCartItem,
    toggleWishlist,
    moveWishlistToCart: (id) => {
      addToCart(id);
      toggleWishlist(id);
    },
    openQuickView,
    openCartDrawer,
    openWishlistModal,
    applyCouponDirect,
    openChatbot: () => {
      const panel = document.getElementById('auraChatPanel');
      const launcher = document.getElementById('auraChatLauncher');
      if (panel) panel.classList.add('open');
      if (launcher) launcher.classList.add('active');
      state.chat.open = true;
    },
    sendChatbotMessage: (text) => sendUserMessage(text),
    logoutUser: () => handleLogout()
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
