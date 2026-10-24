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
    coupon: null, // { code: 'AURA20', discountPercent: 20 }
    quickViewItem: null,
    quickViewQty: 1,
    quickViewColor: null
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
                <span class="original-price">${formatMoney(product.originalPrice)}</span>
              </div>
              <button class="btn-add-cart" 
                      title="Add to Bag" 
                      data-action="add-cart" 
                      data-id="${product.id}">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
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
    } else if (code === 'FREESHIP') {
      state.coupon = { code: 'FREESHIP', discountPercent: 0, freeShipping: true };
      showToast('Coupon Applied!', 'Free Express Shipping unlocked!', 'success');
      renderCartDrawer();
    } else if (code === 'CYBER10') {
      state.coupon = { code: 'CYBER10', discountPercent: 10 };
      showToast('Coupon Applied!', '10% Cyber Discount activated!', 'success');
      renderCartDrawer();
    } else {
      showToast('Invalid Code', 'Try code "AURA20" for 20% off!');
    }
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

  // Demo Autofill Button for instant testing
  function autofillDemoCheckout() {
    const fields = {
      chkFirstName: 'Kushal',
      chkLastName: 'Sharma',
      chkEmail: 'kushal.tech@gmail.com',
      chkAddress: '404 Silicon Boulevard, Suite 800',
      chkCity: 'Bengaluru',
      chkPostal: '560001',
      chkCardNumber: '4532 •••• •••• 8829',
      chkCardExp: '08/29',
      chkCardCvv: '921'
    };

    for (const [id, val] of Object.entries(fields)) {
      const el = document.getElementById(id);
      if (el) el.value = val;
    }
    showToast('Demo Details Filled', 'Shipping and payment details autofilled!', 'success');
  }

  function completeOrder() {
    // Generate Order ID
    const orderId = 'AURA-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    document.getElementById('receiptOrderId').textContent = orderId;
    document.getElementById('receiptDate').textContent = dateStr;
    document.getElementById('receiptEmail').textContent = document.getElementById('chkEmail')?.value || 'kushal.tech@gmail.com';
    
    // Clear cart
    state.cart = [];
    saveCart();

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

    document.getElementById('demoAutofillBtn')?.addEventListener('click', autofillDemoCheckout);
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
  }

  // Global exposure for inline HTML event bindings
  window.auraApp = {
    addToCart,
    updateCartQuantity,
    removeCartItem,
    toggleWishlist,
    moveWishlistToCart: (id) => {
      addToCart(id);
      toggleWishlist(id);
    },
    openQuickView
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
