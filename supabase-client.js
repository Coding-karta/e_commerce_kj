/**
 * AURA LUXE — Supabase Integration Client
 * Handles Supabase Authentication & Real-time PostgreSQL Database Operations
 */

(function (window) {
  'use strict';

  let client = null;
  let isConfigured = false;

  // Retrieve current active credentials
  function getCredentials() {
    const savedUrl = localStorage.getItem('aura_supabase_url');
    const savedKey = localStorage.getItem('aura_supabase_key');
    const config = window.AURA_SUPABASE_CONFIG || {};

    const url = (savedUrl || config.url || '').trim();
    const key = (savedKey || config.anonKey || '').trim();

    const isPlaceholder = !url || !key || 
      url.includes('your-project-id') || 
      key.includes('your-anon-public-key');

    return {
      url: isPlaceholder ? '' : url,
      key: isPlaceholder ? '' : key,
      isPlaceholder
    };
  }

  // Initialize Supabase Client
  function init() {
    const { url, key, isPlaceholder } = getCredentials();

    if (isPlaceholder || !url || !key) {
      isConfigured = false;
      client = null;
      return null;
    }

    try {
      if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        client = window.supabase.createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        isConfigured = true;
        console.log('⚡ [AURA] Supabase client initialized successfully.');
      } else {
        console.warn('⚠️ [AURA] Supabase SDK script not loaded.');
      }
    } catch (err) {
      console.error('❌ [AURA] Failed to initialize Supabase client:', err);
      client = null;
      isConfigured = false;
    }

    return client;
  }

  // Test Connection
  async function testConnection(testUrl, testKey) {
    const url = testUrl || getCredentials().url;
    const key = testKey || getCredentials().key;

    if (!url || !key) {
      return { success: false, message: 'URL and Anon Key are required.' };
    }

    try {
      if (typeof window.supabase === 'undefined') {
        return { success: false, message: 'Supabase JS library not loaded.' };
      }
      const testClient = window.supabase.createClient(url, key);
      // Attempt a light ping by querying session or products
      const { data, error } = await testClient.from('products').select('count', { count: 'exact', head: true });
      
      // Check for table not yet existing vs actual auth or connectivity failure
      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('Invalid API key')) {
          return { success: false, message: 'Invalid API key or unauthorized: ' + error.message };
        }
        if (error.code === 'PGRST205' || error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
          return {
            success: true,
            needsSchema: true,
            message: 'Successfully connected to Supabase! Run supabase-schema.sql in your SQL Editor to create tables.'
          };
        }
      }

      return {
        success: true,
        message: 'Successfully connected to your Supabase project!'
      };
    } catch (e) {
      return { success: false, message: e.message || 'Connection failed' };
    }
  }

  // Save Credentials from UI
  function saveCredentials(url, key) {
    if (url) localStorage.setItem('aura_supabase_url', url.trim());
    if (key) localStorage.setItem('aura_supabase_key', key.trim());
    return init();
  }

  // Clear Credentials
  function clearCredentials() {
    localStorage.removeItem('aura_supabase_url');
    localStorage.removeItem('aura_supabase_key');
    client = null;
    isConfigured = false;
  }

  // ==========================================
  // AUTHENTICATION WRAPPERS
  // ==========================================
  const auth = {
    // Sign Up new user
    async signUp(email, password, username, fullName) {
      if (!client) throw new Error('Supabase is not configured.');

      const cleanUsername = (username || '').toLowerCase().trim();
      const cleanEmail = (email || '').toLowerCase().trim();
      const name = fullName || cleanUsername;

      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            username: cleanUsername,
            full_name: name,
            role: 'AURA VIP Member',
            avatar: cleanUsername.charAt(0).toUpperCase()
          }
        }
      });

      if (error) throw error;

      // Also upsert into public.profiles table if user was created
      if (data?.user) {
        try {
          await client.from('profiles').upsert({
            id: data.user.id,
            username: cleanUsername,
            full_name: name,
            email: cleanEmail,
            role: 'AURA VIP Member',
            avatar_url: cleanUsername.charAt(0).toUpperCase(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        } catch (profileErr) {
          console.warn('Profile sync note:', profileErr);
        }
      }

      return data;
    },

    // Sign In (supports both Email or Username)
    async signIn(identifier, password) {
      if (!client) throw new Error('Supabase is not configured.');

      let email = identifier.trim();

      // If user provided a username rather than an email, look up their email from public.profiles
      if (!email.includes('@')) {
        try {
          const { data: profile, error: profileErr } = await client
            .from('profiles')
            .select('email')
            .ilike('username', email)
            .maybeSingle();

          if (profile && profile.email) {
            email = profile.email;
          } else {
            // Alternatively attempt auth metadata query if table not yet configured
            console.log('Username lookup did not yield email, attempting direct lookup.');
          }
        } catch (e) {
          console.warn('Could not lookup username in profiles table:', e);
        }
      }

      const { data, error } = await client.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      // Enrich user profile info
      let profileData = null;
      if (data?.user) {
        try {
          const { data: prof } = await client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          profileData = prof;
        } catch (e) {}
      }

      return {
        session: data.session,
        user: data.user,
        profile: profileData
      };
    },

    // Sign Out
    async signOut() {
      if (!client) return;
      return await client.auth.signOut();
    },

    // Get Active Session
    async getSession() {
      if (!client) return null;
      const { data } = await client.auth.getSession();
      return data?.session || null;
    },

    // Get Current User
    async getUser() {
      if (!client) return null;
      const { data } = await client.auth.getUser();
      return data?.user || null;
    },

    // Subscribe to Auth state changes
    onAuthStateChange(callback) {
      if (!client) return { data: { subscription: { unsubscribe: () => {} } } };
      return client.auth.onAuthStateChange(callback);
    }
  };

  // ==========================================
  // DATABASE WRAPPERS (PRODUCTS, ORDERS, PROFILES)
  // ==========================================
  const db = {
    // Fetch Products from Supabase
    async fetchProducts() {
      if (!client) return null;

      try {
        const { data, error } = await client
          .from('products')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          console.warn('⚠️ [AURA] Error fetching products from Supabase:', error.message);
          return null;
        }

        if (data && data.length > 0) {
          // Normalize columns into frontend camelCase format
          return data.map(item => ({
            id: item.id,
            name: item.name,
            tagline: item.tagline || '',
            category: item.category,
            categoryLabel: item.category_label || item.category,
            price: Number(item.price),
            originalPrice: item.original_price ? Number(item.original_price) : Number(item.price),
            rating: item.rating ? Number(item.rating) : 5.0,
            reviewsCount: item.reviews_count || 100,
            image: item.image,
            badge: item.badge || '',
            badgeType: item.badge_type || '',
            isFeatured: !!item.is_featured,
            stock: item.stock !== undefined ? Number(item.stock) : 10,
            colors: Array.isArray(item.colors) ? item.colors : (typeof item.colors === 'string' ? JSON.parse(item.colors) : []),
            features: Array.isArray(item.features) ? item.features : (typeof item.features === 'string' ? JSON.parse(item.features) : []),
            description: item.description || '',
            specs: item.specs && typeof item.specs === 'object' ? item.specs : (typeof item.specs === 'string' ? JSON.parse(item.specs) : {})
          }));
        }

        return [];
      } catch (e) {
        console.error('Error fetching Supabase products:', e);
        return null;
      }
    },

    // Seed/Upload default products to Supabase
    async seedProducts(productsList) {
      if (!client) throw new Error('Supabase is not configured.');

      const list = productsList || window.PRODUCTS_DATA || [];
      if (list.length === 0) throw new Error('No product data available to seed.');

      const rows = list.map(p => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline || '',
        category: p.category,
        category_label: p.categoryLabel,
        price: p.price,
        original_price: p.originalPrice,
        rating: p.rating,
        reviews_count: p.reviewsCount,
        image: p.image,
        badge: p.badge,
        badge_type: p.badgeType,
        is_featured: p.isFeatured,
        stock: p.stock,
        colors: p.colors,
        features: p.features,
        description: p.description,
        specs: p.specs
      }));

      const { data, error } = await client
        .from('products')
        .upsert(rows, { onConflict: 'id' })
        .select();

      if (error) throw error;
      return data;
    },

    // Save Order into Supabase
    async createOrder(order) {
      if (!client) return null;

      try {
        const row = {
          id: order.id,
          user_id: order.userId || null,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          items: order.items,
          subtotal: order.subtotal,
          discount: order.discount || 0,
          total: order.total,
          shipping_address: order.shippingAddress,
          payment_method: order.paymentMethod || 'Credit Card',
          status: 'confirmed',
          created_at: new Date().toISOString()
        };

        const { data, error } = await client
          .from('orders')
          .insert([row])
          .select();

        if (error) {
          console.warn('⚠️ [AURA] Error saving order to Supabase:', error.message);
          return null;
        }

        return data;
      } catch (e) {
        console.error('Failed to create order in Supabase:', e);
        return null;
      }
    },

    // Fetch user orders
    async fetchOrders(userId) {
      if (!client || !userId) return [];
      try {
        const { data, error } = await client
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (e) {
        console.warn('Error fetching orders:', e);
        return [];
      }
    },

    // Fetch user profile
    async fetchProfile(userId) {
      if (!client || !userId) return null;
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('Error fetching profile:', e);
        return null;
      }
    }
  };

  // Initialize on script execution
  init();

  // Export to global window namespace
  window.AuraSupabase = {
    init,
    getClient: () => client,
    isConfigured: () => isConfigured && client !== null,
    getCredentials,
    saveCredentials,
    clearCredentials,
    testConnection,
    auth,
    db
  };

})(window);
