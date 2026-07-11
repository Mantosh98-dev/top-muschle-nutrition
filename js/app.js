import { router } from './router.js';
import * as db from './db.js';
import { isSupabaseConfigured, saveSupabaseConfig, clientReady } from './supabase-client.js';

export const DEFAULT_SLIDER_SETTINGS = {
  enabled: true,
  auto_slide: true,
  interval: 6,
  transition_speed: 0.5,
  infinite_loop: true,
  show_arrows: true,
  show_dots: true,
  aspect_ratio_desktop: "16:9",
  aspect_ratio_mobile: "1:1",
  auth_banner_show: false,
  auth_banner_image_url: "",
  auth_banner_link: "",
  cards: [
    {
      id: "card-1",
      image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920&auto=format&fit=crop",
      mobile_image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=720&auto=format&fit=crop",
      hidden: false
    },
    {
      id: "card-2",
      image_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1920&auto=format&fit=crop",
      mobile_image_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=720&auto=format&fit=crop",
      hidden: false
    },
    {
      id: "card-3",
      image_url: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1920&auto=format&fit=crop",
      mobile_image_url: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=720&auto=format&fit=crop",
      hidden: false
    }
  ]
};

export const DEFAULT_SETTINGS = {
  brand_name: "Top Muscle Nutrition",
  brand_logo_url: "https://hblbnsgwrjmpgjmmhpoy.supabase.co/storage/v1/object/public/images/brand/BrandLogo.png",
  footer_logo_url: "https://hblbnsgwrjmpgjmmhpoy.supabase.co/storage/v1/object/public/images/brand/BrandLogo.png",
  primary_color: "#d32f2f",
  secondary_color: "#ffffff",
  seo_title: "Top Muscle Nutrition - Premium Supplements",
  seo_description: "Shop premium protein, glucose, and energy drinks. Verify product and order via WhatsApp.",
  og_image_url: "",
  hero_title: "Fuel Your Performance",
  hero_description: "Premium quality supplements designed to power your workouts and speed up recovery. Order directly via WhatsApp.",
  hero_bg_type: "gradient",
  hero_bg_gradient: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
  hero_product_image_url: "/hero_product.png",
  hero_product_images: [],
  hero_badge_1_text: "100% Genuine",
  hero_badge_1_icon: "fas fa-shield-halved",
  hero_badge_2_text: "FSSAI Certified",
  hero_badge_2_icon: "fas fa-certificate",
  whatsapp_number: "+1234567890",
  contact_email: "info@topmusclenutrition.com",
  contact_phone: "+1234567890",
  contact_address: "123 Muscle Street, Fitness City",
  footer_copyright: "© 2026 Top Muscle Nutrition. All rights reserved.",
  show_top_products: true,
  show_best_sellers: true,
  show_trending_products: true,
  video1_show: false,
  video1_title: "About Our Brand",
  video1_desc: "Watch our introduction video to learn how we make our supplements.",
  video1_type: "youtube",
  video1_mp4_url: "",
  video1_youtube_url: "",
  video2_show: false,
  video2_title: "Authentic Verification Guide",
  video2_desc: "See how to use our unique authentication codes to verify your product.",
  video2_type: "youtube",
  video2_mp4_url: "",
  video2_youtube_url: "",
  // Announcement Bar Defaults
  announcement_show: false,
  announcement_text: "Welcome to Top Muscle Nutrition! Shop premium supplements directly via WhatsApp.",
  announcement_bg_color: "#d32f2f",
  announcement_text_color: "#ffffff",
  // Promotional Banners Defaults
  promo_banner_show: false,
  promo_banner_image_url: "",
  promo_banner_link: "",
  // CTA Banners Defaults
  cta_banner_show: false,
  cta_banner_title: "Ready to Level Up Your Workouts?",
  cta_banner_desc: "Chat with our experts on WhatsApp for personalized supplement guidance.",
  cta_banner_btn_text: "Chat on WhatsApp",
  cta_banner_bg_color: "#1a1a1a",
  slider_settings: DEFAULT_SLIDER_SETTINGS
};

export function mergeSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS };
  if (settings) {
    for (const key in settings) {
      if (settings[key] !== null && settings[key] !== undefined) {
        merged[key] = settings[key];
      }
    }
  }
  
  // Robust check for slider_settings parsing
  if (typeof merged.slider_settings === 'string') {
    try {
      merged.slider_settings = JSON.parse(merged.slider_settings);
    } catch (e) {
      console.warn("Failed to parse slider_settings, using defaults", e);
      merged.slider_settings = { ...DEFAULT_SLIDER_SETTINGS };
    }
  }
  
  // If it's missing or null, set defaults
  if (!merged.slider_settings) {
    merged.slider_settings = { ...DEFAULT_SLIDER_SETTINGS };
  } else {
    // Merge cards to make sure all sub-fields exist
    merged.slider_settings = {
      ...DEFAULT_SLIDER_SETTINGS,
      ...merged.slider_settings,
      cards: Array.isArray(merged.slider_settings.cards) ? merged.slider_settings.cards : DEFAULT_SLIDER_SETTINGS.cards
    };
  }

  return merged;
}

// Escapes HTML special characters to prevent XSS vulnerabilities
export function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Wishlist helper functions
export function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
  } catch (e) {
    return [];
  }
}

export function toggleWishlist(productId) {
  let wishlist = getWishlist();
  const index = wishlist.indexOf(productId);
  let added = false;
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
    added = true;
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  return added;
}

export function isWishlisted(productId) {
  return getWishlist().includes(productId);
}

// Expose toggleWishlist to the global scope for use in HTML onclick handlers
window.toggleWishlist = toggleWishlist;

export function handleWishlistToggleClick(buttonEl, productId) {
  const added = toggleWishlist(productId);
  const heartIcon = buttonEl.querySelector('i');
  if (heartIcon) {
    heartIcon.className = added ? 'fas fa-heart' : 'far fa-heart';
  }
  buttonEl.classList.toggle('active', added);
  showToast(added ? 'Added to wishlist' : 'Removed from wishlist', 'success');
}
window.handleWishlistToggleClick = handleWishlistToggleClick;

// Global variables
export let globalSettings = null;
let activeCategoryFilter = null;
let activeBrandFilter = null;
let productSearchQuery = '';

// DOM Elements
const appContent = document.getElementById('app-content');
const loaderOverlay = document.getElementById('loader-overlay');
const mobileMenuBtn = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

// Show toast notification
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  else if (type === 'error') icon = 'exclamation-circle';
  
  toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global loader controllers
export function showLoader() {
  loaderOverlay.classList.add('active');
}
export function hideLoader() {
  loaderOverlay.classList.remove('active');
}

// Scroll Animation Observer — reusable initializer
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate-on-scroll, .animate-scale, .animate-slide-left, .animate-slide-right').forEach(el => {
    observer.observe(el);
  });
}

// Initialise App
async function init() {
  setupGlobalListeners();
  
  try {
    // 1. Check if Supabase keys exist
    if (!isSupabaseConfigured()) {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      if (isAdminPath) {
        renderWelcomeSetup();
      } else {
        renderConnectionError(new Error('Store is temporarily under maintenance. Please check back later.'));
      }
      return;
    }
    
    // Wait for Supabase SDK to load and client to initialize (with a 4-second timeout)
    showLoader();
    try {
      await Promise.race([
        clientReady,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase client failed to load (timeout)')), 4000))
      ]);
    } catch (timeoutErr) {
      throw new Error('Supabase SDK timeout. Please check your internet connection.');
    }
    
    // 2. Fetch and apply branding settings
    const fetchedSettings = await db.fetchSettings();
    globalSettings = mergeSettings(fetchedSettings);
    applyBranding(globalSettings);

    // 2b. Fetch and render categories in dropdown
    let categoriesList = [];
    try {
      categoriesList = await db.fetchCategories();
    } catch (e) {
      console.warn("Failed to fetch categories for navigation dropdown", e);
    }

    const navDropdown = document.getElementById('nav-products-dropdown');
    if (navDropdown && categoriesList && categoriesList.length > 0) {
      // Clear any dynamic elements except the first one ("All Products")
      const firstItem = navDropdown.firstElementChild;
      navDropdown.innerHTML = '';
      if (firstItem) {
        navDropdown.appendChild(firstItem);
      }

      categoriesList.forEach(cat => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `/products?category=${cat.id}`;
        a.className = 'dropdown-sublink';
        a.textContent = cat.name;

        a.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          activeCategoryFilter = cat.id;
          activeBrandFilter = null;
          router.navigate(`/products`);

          mobileMenuBtn.classList.remove('active');
          navMenu.classList.remove('active');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');

          const submenu = document.getElementById('nav-products-dropdown');
          const toggleIcon = document.querySelector('.dropdown-toggle-btn i');
          if (submenu) submenu.classList.remove('active');
          if (toggleIcon) {
            toggleIcon.className = 'fas fa-chevron-down';
            document.querySelector('.dropdown-toggle-btn').setAttribute('aria-expanded', 'false');
          }
        });

        li.appendChild(a);
        navDropdown.appendChild(li);
      });

      // Bind "All Products" sublink click handler
      const allProdSublink = navDropdown.querySelector('.dropdown-sublink');
      if (allProdSublink) {
        allProdSublink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          activeCategoryFilter = null;
          activeBrandFilter = null;
          router.navigate('/products');

          mobileMenuBtn.classList.remove('active');
          navMenu.classList.remove('active');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');

          const submenu = document.getElementById('nav-products-dropdown');
          const toggleIcon = document.querySelector('.dropdown-toggle-btn i');
          if (submenu) submenu.classList.remove('active');
          if (toggleIcon) {
            toggleIcon.className = 'fas fa-chevron-down';
            document.querySelector('.dropdown-toggle-btn').setAttribute('aria-expanded', 'false');
          }
        });
      }
    }
    
    // 3. Register routes
    router.addRoute('/', renderHome);
    router.addRoute('/products', renderProducts);
    router.addRoute('/product/:slug', renderProductDetails);
    router.addRoute('/verify', renderProductVerification);
    router.addRoute('/categories', renderCategories);
    router.addRoute('/about', renderAbout);
    router.addRoute('/privacy-policy', renderPrivacyPolicy);
    router.addRoute('/terms-and-conditions', renderTerms);
    router.addRoute('/cart', renderCart);
    router.addRoute('/account', renderAccount);
    router.addRoute('/404', render404);
    
    // Section scroll router helper for Contact
    router.addRoute('/contact', () => {
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        renderHome().then(() => {
          const contactSec = document.getElementById('contact-section');
          if (contactSec) {
            contactSec.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    });
    
    // Lazy-load Admin routes so visitors don't download admin code (110KB+)
    router.addRoute('/admin', async () => {
      showLoader();
      try {
        const adminModule = await import('./admin.js');
        await adminModule.renderAdminPage();
      } catch (err) {
        console.error('Failed to load admin module:', err);
        showToast('Error loading admin page', 'error');
      } finally {
        hideLoader();
      }
    });
    router.addRoute('/admin/:tab', async (params) => {
      showLoader();
      try {
        const adminModule = await import('./admin.js');
        await adminModule.renderAdminPage(params);
      } catch (err) {
        console.error('Failed to load admin module:', err);
        showToast('Error loading admin page', 'error');
      } finally {
        hideLoader();
      }
    });
    
    // Initial route check
    router.handleRoute();
    
  } catch (error) {
    console.error('App init failed:', error);
    showToast('Failed to connect to database.', 'error');
    if (isSupabaseConfigured()) {
      renderConnectionError(error);
    } else {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      if (isAdminPath) {
        renderWelcomeSetup();
      } else {
        renderConnectionError(new Error('Store is temporarily under maintenance. Please check back later.'));
      }
    }
  } finally {
    hideLoader();
  }
}

// Set up UI event listeners
function setupGlobalListeners() {
  // Header Search Form submission
  const headerSearchForm = document.getElementById('header-search-form');
  const headerSearchInput = document.getElementById('header-search-input');
  const headerSearchSuggestions = document.getElementById('header-search-suggestions');
  let allSearchProducts = [];

  const loadSearchProducts = async () => {
    if (allSearchProducts.length === 0) {
      try {
        allSearchProducts = await db.fetchProducts();
      } catch (err) {
        console.error('Failed to pre-fetch search products:', err);
      }
    }
  };

  const renderSuggestions = () => {
    const query = headerSearchInput.value.trim().toLowerCase();
    if (!query) {
      headerSearchSuggestions.innerHTML = '';
      headerSearchSuggestions.style.display = 'none';
      return;
    }

    const filtered = allSearchProducts.filter(prod => {
      return (prod.title || '').toLowerCase().includes(query) ||
             (prod.brand || '').toLowerCase().includes(query) ||
             (prod.categories && prod.categories.name || '').toLowerCase().includes(query);
    }).slice(0, 5);

    if (filtered.length === 0) {
      headerSearchSuggestions.innerHTML = `
        <div style="padding:16px; text-align:center; color:var(--text-sub); font-size:0.85rem;">
          <i class="fas fa-search-minus" style="font-size:1.2rem; margin-bottom:8px; display:block; color:var(--gray-400);"></i>
          No products matched your search
        </div>
      `;
      headerSearchSuggestions.style.display = 'block';
      return;
    }

    const listHTML = filtered.map(prod => {
      const mainImage = prod.product_images && prod.product_images.length > 0
        ? prod.product_images[0].image_url
        : 'https://via.placeholder.com/80?text=No+Image';

      const hasVariants = Array.isArray(prod.variants) && prod.variants.length > 1;
      let priceHTML = '';
      let offerPrice = prod.offer_price;
      let price = prod.price;

      if (hasVariants) {
        const minPrice = prod.variants.reduce((min, v) => {
          const currentVal = v.offer_price || v.price || Infinity;
          return currentVal < min ? currentVal : min;
        }, Infinity);
        if (minPrice !== Infinity) {
          priceHTML = `<span class="suggestion-price-offer">₹${minPrice.toLocaleString('en-IN')}</span>`;
        }
      } else if (price) {
        if (offerPrice && offerPrice < price) {
          const discount = Math.round(((price - offerPrice) / price) * 100);
          priceHTML = `
            <span class="suggestion-price-offer">₹${offerPrice.toLocaleString('en-IN')}</span>
            <span class="suggestion-price-original">₹${price.toLocaleString('en-IN')}</span>
            <span class="suggestion-price-discount">${discount}% off</span>
          `;
        } else {
          priceHTML = `<span class="suggestion-price-offer">₹${price.toLocaleString('en-IN')}</span>`;
        }
      }

      return `
        <div class="suggestion-item" data-slug="${prod.slug}" style="display:flex; gap:12px; padding:10px 14px; cursor:pointer; align-items:center; transition:background var(--t) var(--ease); border-bottom:1px solid var(--border-color);">
          <div class="suggestion-img-wrap" style="width:48px; height:48px; border-radius:var(--r-xs); overflow:hidden; border:1px solid var(--border-color); background:var(--gray-50); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <img src="${mainImage}" alt="${escapeHTML(prod.title)}" style="max-width:100%; max-height:100%; object-fit:contain;">
          </div>
          <div class="suggestion-info" style="flex:1; min-width:0;">
            <h4 class="suggestion-title" style="font-family:var(--font-heading); font-size:0.88rem; font-weight:700; color:var(--text); margin:0 0 2px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(prod.title)}</h4>
            <span class="suggestion-brand" style="font-size:0.72rem; color:var(--text-sub); display:block; font-weight:600; text-transform:uppercase; letter-spacing:0.02em;">${escapeHTML(prod.brand || 'Top Muscle Nutrition')}</span>
            <div class="suggestion-price-row" style="display:flex; align-items:center; gap:6px; margin-top:2px;">${priceHTML}</div>
          </div>
        </div>
      `;
    }).join('');

    headerSearchSuggestions.innerHTML = `
      <div class="suggestions-header" style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; border-bottom:1px solid var(--border-color); background:var(--gray-25);">
        <span class="suggestions-title-text" style="font-family:var(--font-heading); font-size:0.8rem; font-weight:700; color:var(--text); text-transform:uppercase; letter-spacing:0.04em;">Suggested Products</span>
        <a href="/products" class="suggestions-view-all-link" style="font-size:0.75rem; font-weight:700; color:var(--primary); text-decoration:none; display:flex; align-items:center; gap:4px;">View all <i class="fas fa-chevron-right" style="font-size:0.6rem;"></i></a>
      </div>
      <div class="suggestions-list" style="max-height:360px; overflow-y:auto;">${listHTML}</div>
    `;

    headerSearchSuggestions.style.display = 'block';

    // Bind item clicks
    headerSearchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const slug = item.dataset.slug;
        headerSearchSuggestions.style.display = 'none';
        headerSearchInput.value = '';
        router.navigate(`/product/${slug}`);
      });
    });

    // Bind view all click
    const viewAllLink = headerSearchSuggestions.querySelector('.suggestions-view-all-link');
    if (viewAllLink) {
      viewAllLink.addEventListener('click', (e) => {
        e.preventDefault();
        headerSearchSuggestions.style.display = 'none';
        productSearchQuery = headerSearchInput.value.trim();
        activeCategoryFilter = null;
        activeBrandFilter = null;
        router.navigate('/products');
      });
    }
  };

  if (headerSearchForm && headerSearchInput && headerSearchSuggestions) {
    headerSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = headerSearchInput.value.trim();
      productSearchQuery = query;
      activeCategoryFilter = null;
      activeBrandFilter = null;
      headerSearchSuggestions.style.display = 'none';
      router.navigate('/products');
    });

    headerSearchInput.addEventListener('focus', async () => {
      await loadSearchProducts();
      renderSuggestions();
    });

    headerSearchInput.addEventListener('input', async () => {
      await loadSearchProducts();
      renderSuggestions();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search-container')) {
        headerSearchSuggestions.style.display = 'none';
      }
    });
  }

  // Mobile Burger Menu Toggle
  mobileMenuBtn.addEventListener('click', () => {
    const isActive = mobileMenuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    mobileMenuBtn.setAttribute('aria-expanded', isActive);
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close mobile menu when links are clicked
  const closeMobileMenu = () => {
    mobileMenuBtn.classList.remove('active');
    navMenu.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.logo-link, .nav-link, .dropdown-sublink').forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && (href === '/' || href.startsWith('/products') || href === '/verify' || href === '/contact')) {
        // If navigating to products but it's not a search submit, reset search query
        // Note: category dropdown items are handled separately in renderProducts
        if (!link.classList.contains('dropdown-sublink') || href === '/products') {
          productSearchQuery = '';
          const headerSearchInput = document.getElementById('header-search-input');
          if (headerSearchInput) headerSearchInput.value = '';
        }
      }
      setTimeout(closeMobileMenu, 0);
    });
  });

  // Shrink and toggle sticky header on scroll direction with requestAnimationFrame
  window.lastScrollY = window.scrollY;
  let accumulatedScrollDown = 0;
  const HIDE_THRESHOLD = 60; // 50-80px threshold to hide
  let isTicking = false;

  const scrollTopBtn = document.getElementById('scroll-to-top');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const handleScroll = () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) {
      isTicking = false;
      return;
    }

    // Do not hide the navbar if the mobile menu is active/open
    if (navMenu && navMenu.classList.contains('active')) {
      navbar.classList.remove('navbar-hidden');
      isTicking = false;
      return;
    }

    const currentScrollY = window.scrollY;

    // Reset trackers when at the very top
    if (currentScrollY <= 0) {
      window.lastScrollY = 0;
      accumulatedScrollDown = 0;
      navbar.classList.remove('navbar-hidden');
      navbar.classList.remove('scrolled');
    } else {
      if (currentScrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      const delta = currentScrollY - window.lastScrollY;

      if (delta > 0) {
        // Scrolling down
        accumulatedScrollDown += delta;
        if (accumulatedScrollDown >= HIDE_THRESHOLD && currentScrollY > 100) {
          navbar.classList.add('navbar-hidden');
        }
      } else if (delta < 0) {
        // Scrolling up - immediately show
        accumulatedScrollDown = 0;
        navbar.classList.remove('navbar-hidden');
      }
    }

    // Scroll to Top visibility
    if (scrollTopBtn) {
      if (currentScrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

    window.lastScrollY = currentScrollY;
    isTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(handleScroll);
      isTicking = true;
    }
  }, { passive: true });

  window.onScrollUpdateTrackers = (scrollY) => {
    window.lastScrollY = scrollY;
    accumulatedScrollDown = 0;
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      navbar.classList.remove('navbar-hidden');
    }
    if (scrollTopBtn) {
      if (scrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  };

  // Mobile Navigation Submenu Toggle
  const dropdownToggle = document.querySelector('.dropdown-toggle-btn');
  const dropdownSubmenu = document.getElementById('nav-products-dropdown');
  if (dropdownToggle && dropdownSubmenu) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isActive = dropdownSubmenu.classList.toggle('active');
      dropdownToggle.setAttribute('aria-expanded', isActive);
      const icon = dropdownToggle.querySelector('i');
      if (icon) {
        icon.className = isActive ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
      }
    });
  }
}

// Welcome setup view if database settings are not configured yet
function renderWelcomeSetup() {
  appContent.innerHTML = `
    <section class="section">
      <div class="container verify-wrapper">
        <div class="verify-card">
          <div class="category-icon-box" style="margin: 0 auto; color: var(--primary);">
            <i class="fas fa-plug"></i>
          </div>
          <h2>Configure Supabase Connection</h2>
          <p>Welcome! Before starting, connect your database by adding your credentials in <code>js/config.js</code> or entering them below:</p>
          
          <div class="verify-input-group" style="text-align: left;">
            <div class="form-group">
              <label class="form-label" for="setup-url">Supabase Project URL</label>
              <input type="text" id="setup-url" class="form-input" placeholder="https://xxxx.supabase.co" value="${localStorage.getItem('SUPABASE_URL') || ''}">
            </div>
            <div class="form-group" style="margin-top: 12px;">
              <label class="form-label" for="setup-key">Supabase Anon Public API Key</label>
              <input type="text" id="setup-key" class="form-input" placeholder="eyJhbGciOiJIUzI1Ni..." value="${localStorage.getItem('SUPABASE_ANON_KEY') || ''}">
            </div>
            <button id="save-setup-btn" class="btn btn-primary" style="margin-top: 20px;">Save and Initialize</button>
          </div>
          
          <div style="margin-top: 16px; font-size: 0.85rem; color: var(--text-sub);">
            <p><strong>Note:</strong> Executed SQL script <code>schema.sql</code> inside Supabase SQL Editor first?</p>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById('save-setup-btn').addEventListener('click', () => {
    const url = document.getElementById('setup-url').value.trim();
    const key = document.getElementById('setup-key').value.trim();
    if (!url || !key) {
      showToast('Please fill in both fields', 'error');
      return;
    }
    saveSupabaseConfig(url, key);
    showToast('Credentials saved successfully. Reloading...', 'success');
    setTimeout(() => window.location.reload(), 1000);
  });
}

// Connection error screen if database query fails but credentials exist
function renderConnectionError(error) {
  appContent.innerHTML = `
    <section class="section">
      <div class="container verify-wrapper">
        <div class="verify-card" style="border-top: 4px solid var(--primary-color);">
          <div class="category-icon-box" style="margin: 0 auto; color: var(--primary-color);">
            <i class="fas fa-wifi"></i>
          </div>
          <h2>Connection Error</h2>
          <p>We are having trouble connecting to our servers. Please check your internet connection or try again later.</p>
          
          <!-- Collapsible technical details for clients/developers -->
          <details style="margin-top: 20px; text-align: left; cursor: pointer; font-size: 0.8rem; color: var(--text-sub);">
            <summary style="font-weight: 600; outline: none; margin-bottom: 8px; user-select: none; color: var(--primary-color);">
              <i class="fas fa-bug" style="margin-right: 4px;"></i> Show Technical Details
            </summary>
            <div style="background: rgba(0,0,0,0.03); padding: 12px; border-radius: var(--r-sm); font-family: monospace; word-break: break-all; margin-top: 6px; line-height: 1.4;">
              ${escapeHTML(error.message || 'Unknown connection issue')}
            </div>
          </details>

          <button id="retry-connection-btn" class="btn btn-primary" style="margin-top: 24px; width: 100%;">
            <i class="fas fa-sync"></i> Retry Connection
          </button>
        </div>
      </div>
    </section>
  `;

  document.getElementById('retry-connection-btn').addEventListener('click', () => {
    window.location.reload();
  });
}

// Dynamically inject settings (Branding, Logo, Favicon, Title, Colors)
export function applyBranding(settings) {
  if (!settings) return;

  // Announcement Bar Configuration
  const annBar = document.getElementById('announcement-bar');
  const annText = document.getElementById('announcement-text');
  if (annBar && annText) {
    const isClosed = localStorage.getItem('announcement-closed') === 'true' &&
                     localStorage.getItem('announcement-closed-text') === settings.announcement_text;
    if (settings.announcement_show && settings.announcement_text && !isClosed) {
      annText.textContent = settings.announcement_text;
      annBar.style.backgroundColor = settings.announcement_bg_color || settings.primary_color;
      annBar.style.color = settings.announcement_text_color || '#ffffff';
      annBar.style.display = 'block';
    } else {
      annBar.style.display = 'none';
    }

    const closeBtn = document.getElementById('announcement-close-btn');
    if (closeBtn) {
      // Recreate event listener to avoid duplicates if applyBranding runs multiple times
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      newCloseBtn.addEventListener('click', () => {
        annBar.style.display = 'none';
        localStorage.setItem('announcement-closed', 'true');
        localStorage.setItem('announcement-closed-text', settings.announcement_text || '');
      });
    }
  }

  // Document Properties
  document.title = settings.seo_title;
  
  let metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', settings.seo_description);

  let favicon = document.querySelector('link[rel="icon"]');
  if (favicon && settings.favicon_url) favicon.setAttribute('href', settings.favicon_url);

  // Update Open Graph and Twitter Metadata
  const ogTitle = document.getElementById('og-title');
  if (ogTitle) ogTitle.setAttribute('content', settings.seo_title);
  
  const ogDesc = document.getElementById('og-desc');
  if (ogDesc) ogDesc.setAttribute('content', settings.seo_description);
  
  const ogImage = document.getElementById('og-image');
  if (ogImage) {
    const defaultOgUrl = window.location.origin + '/og-image.jpg';
    ogImage.setAttribute('content', settings.og_image_url || defaultOgUrl);
  }
  
  const twitterTitle = document.getElementById('twitter-title');
  if (twitterTitle) twitterTitle.setAttribute('content', settings.seo_title);
  
  const twitterDesc = document.getElementById('twitter-desc');
  if (twitterDesc) twitterDesc.setAttribute('content', settings.seo_description);
  
  const twitterImage = document.getElementById('twitter-image');
  if (twitterImage) {
    const defaultOgUrl = window.location.origin + '/og-image.jpg';
    twitterImage.setAttribute('content', settings.og_image_url || defaultOgUrl);
  }

  // Update JSON-LD Structured Data
  const structuredDataEl = document.getElementById('structured-data');
  if (structuredDataEl) {
    try {
      const data = {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": settings.brand_name,
        "description": settings.seo_description,
        "url": window.location.origin + window.location.pathname,
        "image": settings.og_image_url || (window.location.origin + "/og-image.jpg"),
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": settings.contact_phone,
          "contactType": "customer service"
        }
      };
      structuredDataEl.textContent = JSON.stringify(data, null, 2);
    } catch (e) {
      console.warn("Failed to update structured data", e);
    }
  }

  // Dynamic Theme Colors
  document.documentElement.style.setProperty('--primary-color', settings.primary_color);
  document.documentElement.style.setProperty('--primary', settings.primary_color);
  // Derive primary hover/dark/deeper from hex color
  const darkColor = adjustColorBrightness(settings.primary_color, -15);
  const deeperColor = adjustColorBrightness(settings.primary_color, -30);
  document.documentElement.style.setProperty('--primary-dark', darkColor);
  document.documentElement.style.setProperty('--primary-hover', darkColor);
  document.documentElement.style.setProperty('--primary-deeper', deeperColor);
  document.documentElement.style.setProperty('--secondary-color', settings.secondary_color);

  // Derive light/glow colors and shadow properties for Redesign v3
  const primaryRgb = hexToRgb(settings.primary_color);
  if (primaryRgb) {
    document.documentElement.style.setProperty('--primary-light', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.07)`);
    document.documentElement.style.setProperty('--primary-glow', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.18)`);
    document.documentElement.style.setProperty('--shadow-red', `0 8px 24px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.20)`);
    document.documentElement.style.setProperty('--shadow-red-lg', `0 12px 36px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.28)`);
    document.documentElement.style.setProperty('--shadow-card-hover', `0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.06)`);
  }

  // Navbar Brand Logo and Name
  const navBrandLogo = document.getElementById('nav-logo');
  const navBrandName = document.getElementById('nav-brand-name');
  
  if (settings.brand_logo_url) {
    navBrandLogo.src = settings.brand_logo_url;
    navBrandLogo.style.display = 'block';
    navBrandName.style.display = 'none';
  } else {
    navBrandLogo.style.display = 'none';
    navBrandName.textContent = settings.brand_name;
    navBrandName.style.display = 'block';
    navBrandName.style.fontSize = '1.3rem';
    navBrandName.style.fontWeight = '800';
    navBrandName.style.color = 'var(--text)';
  }

  // Footer Config
  const footerLogoImg = document.getElementById('footer-logo-img');
  const footerBrandText = document.getElementById('footer-brand-text');
  const footerCopyright = document.getElementById('footer-copyright');
  const footerDesc = document.getElementById('footer-desc');

  const footerLogoUrl = settings.footer_logo_url || settings.brand_logo_url;
  if (footerLogoUrl) {
    footerLogoImg.src = footerLogoUrl;
    footerLogoImg.style.display = 'block';
    footerBrandText.style.display = 'none';
  } else {
    footerLogoImg.style.display = 'none';
    footerBrandText.textContent = settings.brand_name;
    footerBrandText.style.display = 'block';
    footerBrandText.style.fontSize = '1.4rem';
    footerBrandText.style.fontWeight = '800';
    footerBrandText.style.color = '#fff';
  }
  footerCopyright.textContent = settings.footer_copyright;
  footerDesc.textContent = settings.seo_description;

  // Footer Social Media Links
  const footerSocials = document.getElementById('footer-socials');
  footerSocials.innerHTML = '';
  const socials = [
    { key: 'social_facebook', icon: 'facebook-f' },
    { key: 'social_instagram', icon: 'instagram' },
    { key: 'social_twitter', icon: 'twitter' },
    { key: 'social_linkedin', icon: 'linkedin-in' }
  ];
  socials.forEach(s => {
    if (settings[s.key]) {
      footerSocials.innerHTML += `
        <a href="${settings[s.key]}" target="_blank" rel="noopener" class="social-icon" aria-label="${s.icon}">
          <i class="fab fa-${s.icon}"></i>
        </a>
      `;
    }
  });

  // Footer Contacts
  document.getElementById('footer-contact-list').innerHTML = `
    <div class="footer-contact-item">
      <i class="fas fa-map-marker-alt"></i>
      <span>${settings.contact_address}</span>
    </div>
    <div class="footer-contact-item">
      <i class="fas fa-phone"></i>
      <span>${settings.contact_phone}</span>
    </div>
    <div class="footer-contact-item">
      <i class="fas fa-envelope"></i>
      <span>${settings.contact_email}</span>
    </div>
  `;
}

// Lighten/Darken Hex colors programmatically
function adjustColorBrightness(hex, percent) {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  R = (R > 0) ? R : 0;
  G = (G > 0) ? G : 0;
  B = (B > 0) ? B : 0;

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

// Convert hex to rgb helper
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


/* ==========================================
   VIEW RENDERERS
   ========================================== */

// 1. HOME VIEW
// Helper to render new Hero Slider
function renderHeroSlider(settings) {
  const sliderSettings = settings.slider_settings || DEFAULT_SLIDER_SETTINGS;
  if (!sliderSettings.enabled) return '';

  const activeCards = (sliderSettings.cards || []).filter(card => !card.hidden);
  if (activeCards.length === 0) return '';

  const aspectRatioDesktop = (sliderSettings.aspect_ratio_desktop || '16:9').replace(':', '/');
  const aspectRatioMobile = (sliderSettings.aspect_ratio_mobile || '1:1').replace(':', '/');

  // Dynamically add a link preload tag for the first banner to speed up LCP
  const firstCard = activeCards[0];
  if (firstCard) {
    const isMobile = window.innerWidth <= 768;
    const preloadUrl = (isMobile && firstCard.mobile_image_url) ? firstCard.mobile_image_url : firstCard.image_url;
    let preloadLink = document.getElementById('hero-preload');
    if (!preloadLink) {
      preloadLink = document.createElement('link');
      preloadLink.id = 'hero-preload';
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      document.head.appendChild(preloadLink);
    }
    preloadLink.href = preloadUrl;
  }

  const showArrows = sliderSettings.show_arrows !== false;
  const showDots = sliderSettings.show_dots !== false;

  return `
    <section class="hero-slider-section" id="hero-slider-section" style="--slider-aspect-ratio-desktop: ${aspectRatioDesktop}; --slider-aspect-ratio-mobile: ${aspectRatioMobile};">
      <div class="slider-viewport">
        <div class="slider-track">
          ${activeCards.map((card, idx) => {
            const desktopImg = card.image_url;
            const mobileImg = card.mobile_image_url || card.image_url;
            const pictureHtml = `
              <picture style="width:100%; height:100%; display:block;">
                <source media="(max-width: 768px)" srcset="${mobileImg}">
                <img src="${desktopImg}" alt="Hero Banner ${idx + 1}" class="slider-card-img" ${idx === 0 ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async">
              </picture>
            `;
            const innerHtml = card.link_url ? `<a href="${escapeHTML(card.link_url)}" style="display:block; width:100%; height:100%; cursor:pointer;">${pictureHtml}</a>` : pictureHtml;

            return `
              <div class="hero-slider-card ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                ${innerHtml}
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- Navigation Arrows -->
        ${showArrows ? `
          <button class="slider-arrow prev-btn" aria-label="Previous slide"><i class="fas fa-chevron-left"></i></button>
          <button class="slider-arrow next-btn" aria-label="Next slide"><i class="fas fa-chevron-right"></i></button>
        ` : ''}
        
        <!-- Pagination Dots -->
        ${showDots && activeCards.length > 1 ? `
          <div class="slider-dots">
            ${activeCards.map((_, idx) => `<span class="slider-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
          </div>
        ` : ''}
      </div>
    </section>
  `;
}

// Helper to initialize new Hero Slider logic
function initHeroSlider(settings) {
  const section = document.getElementById('hero-slider-section');
  if (!section) return;

  const sliderSettings = settings.slider_settings || DEFAULT_SLIDER_SETTINGS;
  const autoSlide = sliderSettings.auto_slide !== false;
  const intervalTime = (sliderSettings.interval || 6) * 1000;
  const transitionSpeed = sliderSettings.transition_speed !== undefined ? parseFloat(sliderSettings.transition_speed) : 0.5;
  const infiniteLoop = sliderSettings.infinite_loop !== false;

  const viewport = section.querySelector('.slider-viewport');
  const track = section.querySelector('.slider-track');
  const cards = section.querySelectorAll('.hero-slider-card');
  const dots = section.querySelectorAll('.slider-dot');
  const prevBtn = section.querySelector('.prev-btn');
  const nextBtn = section.querySelector('.next-btn');

  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  let slideInterval = null;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let dragStartTime = 0;
  let dragMoveDistance = 0;

  const getCardWidth = () => viewport.offsetWidth;

  const updateSliderPosition = (useTransition = true) => {
    if (useTransition) {
      track.style.transition = `transform ${transitionSpeed}s cubic-bezier(0.25, 1, 0.5, 1)`;
    } else {
      track.style.transition = 'none';
    }

    const cardWidth = getCardWidth();
    const offset = -currentIndex * cardWidth;
    track.style.transform = `translateX(${offset}px)`;

    // Update active class on cards
    cards.forEach((card, idx) => {
      if (idx === currentIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Update active dots
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Disable buttons if not infinite
    if (!infiniteLoop) {
      if (prevBtn) {
        prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
      }
      if (nextBtn) {
        nextBtn.style.opacity = currentIndex === cards.length - 1 ? '0.3' : '1';
        nextBtn.style.pointerEvents = currentIndex === cards.length - 1 ? 'none' : 'auto';
      }
    } else {
      if (prevBtn) {
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'auto';
      }
      if (nextBtn) {
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
      }
    }

    prevTranslate = offset;
  };

  const goToSlide = (index) => {
    if (index < 0) {
      if (infiniteLoop) {
        currentIndex = cards.length - 1;
      } else {
        currentIndex = 0;
      }
    } else if (index >= cards.length) {
      if (infiniteLoop) {
        currentIndex = 0;
      } else {
        currentIndex = cards.length - 1;
      }
    } else {
      currentIndex = index;
    }
    updateSliderPosition();
  };

  const startAutoSlide = () => {
    if (!autoSlide) return;
    stopAutoSlide();
    slideInterval = setInterval(() => {
      if (!isDragging) {
        goToSlide(currentIndex + 1);
      }
    }, intervalTime);
  };

  const stopAutoSlide = () => {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  };

  // Event Listeners for Nav Arrows
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex - 1);
      startAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex + 1);
      startAutoSlide();
    });
  }

  // Event Listeners for Dots
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(dot.dataset.index);
      goToSlide(index);
      startAutoSlide();
    });
  });

  // Pause on Hover
  viewport.addEventListener('mouseenter', () => {
    stopAutoSlide();
  });
  viewport.addEventListener('mouseleave', () => {
    startAutoSlide();
  });

  // Drag / Swipe Gestures using pointer events
  const dragStart = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging = true;
    dragStartTime = Date.now();
    startX = e.clientX;
    dragMoveDistance = 0;
    stopAutoSlide();
    track.style.transition = 'none';
    viewport.style.cursor = 'grabbing';
  };

  const dragMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diffX = currentX - startX;
    dragMoveDistance = Math.abs(diffX);
    currentTranslate = prevTranslate + diffX;
    track.style.transform = `translateX(${currentTranslate}px)`;
  };

  const dragEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    viewport.style.cursor = 'grab';

    const endX = e.clientX;
    const diffX = endX - startX;
    const dragDuration = Date.now() - dragStartTime;

    const cardWidth = getCardWidth();
    const threshold = cardWidth * 0.2;
    const fastSwipeThreshold = 30;

    if (diffX < -threshold || (diffX < -fastSwipeThreshold && dragDuration < 300)) {
      goToSlide(currentIndex + 1);
    } else if (diffX > threshold || (diffX > fastSwipeThreshold && dragDuration < 300)) {
      goToSlide(currentIndex - 1);
    } else {
      updateSliderPosition();
    }

    startAutoSlide();
  };

  track.addEventListener('pointerdown', dragStart);
  track.addEventListener('pointermove', dragMove);
  track.addEventListener('pointerup', dragEnd);
  track.addEventListener('pointercancel', dragEnd);

  // Prevent link click redirection when dragging slider
  track.addEventListener('click', (e) => {
    if (dragMoveDistance > 25) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Prevent image drag defaults
  track.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });

  // Resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateSliderPosition(false);
    }, 100);
  });

  // Initial layout
  setTimeout(() => {
    updateSliderPosition(false);
    startAutoSlide();
  }, 150);
}

// 1. HOME VIEW
async function renderHome() {
  showLoader();
  try {
    const [allProducts, categories] = await Promise.all([
      db.fetchProducts(),
      db.fetchCategories()
    ]);

    const featuredProducts = allProducts.filter(p => p.featured);
    const topProducts = allProducts.filter(p => p.top_product);
    const bestSellers = allProducts.filter(p => p.best_seller);
    const trendingProducts = allProducts.filter(p => p.trending);
    


    // Reusable video section builder function
    function renderVideoSection(sectionNum, show, title, desc, type, mp4Url, youtubeUrl) {
      if (!show) return '';
      
      let mediaHTML = '';
      if (type === 'youtube' && youtubeUrl) {
        let embedUrl = youtubeUrl;
        if (youtubeUrl.includes('youtube.com/watch?v=')) {
          const videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (youtubeUrl.includes('youtu.be/')) {
          const videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (youtubeUrl.includes('youtube.com/shorts/')) {
          const videoId = youtubeUrl.split('/shorts/')[1]?.split('?')[0]?.split('&')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (youtubeUrl.includes('youtube.com/embed/')) {
          embedUrl = youtubeUrl;
        } else {
          const trimmed = youtubeUrl.trim();
          if (trimmed && !trimmed.includes('/') && trimmed.length > 5) {
            embedUrl = `https://www.youtube.com/embed/${trimmed}`;
          }
        }
        
        mediaHTML = `
          <div class="video-embed-container" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:var(--r-lg); box-shadow:var(--shadow-md); border:1px solid var(--border);">
            <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen title="${escapeHTML(title)}"></iframe>
          </div>
        `;
      } else if (type === 'upload' && mp4Url) {
        mediaHTML = `
          <div class="video-upload-container" style="border-radius:var(--r-lg); overflow:hidden; box-shadow:var(--shadow-md); border:1px solid var(--border); background:#000;">
            <video src="${mp4Url}" controls style="width:100%; display:block; aspect-ratio:16/9; object-fit:cover;" aria-label="${escapeHTML(title)}"></video>
          </div>
        `;
      }
      
      if (!mediaHTML) return ''; // Automatically hide section if no valid video URL
      
      return `
        <section class="section video-section-home-${sectionNum}" style="border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:var(--gray-50);">
          <div class="container" style="max-width:960px;">
            <div class="section-header animate-on-scroll" style="text-align:center; margin-bottom:32px;">
              ${title ? `<h2 class="section-title" style="font-size:1.75rem; margin-bottom:8px;">${escapeHTML(title)}</h2>` : ''}
              ${desc ? `<p class="section-subtitle" style="font-size:0.95rem; color:var(--text-sub); max-width:600px; margin:0 auto;">${escapeHTML(desc)}</p>` : ''}
            </div>
            <div class="video-media-wrapper animate-scale" style="margin-top:12px;">
              ${mediaHTML}
            </div>
          </div>
        </section>
      `;
    }

    let html = '';

    // 1. Hero Slider
    html += renderHeroSlider(globalSettings);

    // 2. Features Section (NEW)
    html += `
      <section class="features-section animate-on-scroll">
        <div class="container">
          <div class="features-grid">
            <div class="feature-item">
              <span class="feature-icon"><i class="fas fa-truck-fast"></i></span>
              <div class="feature-info">
                <h4>Fast Delivery</h4>
                <p>Quick dispatch nationwide</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon"><i class="fas fa-shield-halved"></i></span>
              <div class="feature-info">
                <h4>Authentic Products</h4>
                <p>100% genuine supplements</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon"><i class="fas fa-credit-card"></i></span>
              <div class="feature-info">
                <h4>Secure Payment</h4>
                <p>Safe checkout & COD</p>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon"><i class="fas fa-headset"></i></span>
              <div class="feature-info">
                <h4>Customer Support</h4>
                <p>Dedicated assistance</p>
              </div>
            </div>
          </div>
          <div class="features-cta">
            <a href="/products" class="btn btn-primary">Shop Products</a>
            <a href="/verify" class="btn btn-outline">Authenticate Product</a>
          </div>
        </div>
      </section>
    `;

    // Promotional Banner (if enabled)
    if (globalSettings.promo_banner_show && globalSettings.promo_banner_image_url) {
      html += `
        <section class="section promo-banner-section" style="padding: 30px 0; background: var(--gray-50); border-bottom: 1px solid var(--border-color);">
          <div class="container">
            <a href="${globalSettings.promo_banner_link || '/products'}" style="display:block; overflow:hidden; border-radius:var(--r-lg); box-shadow:var(--shadow-sm); transition:transform 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
              <img src="${globalSettings.promo_banner_image_url}" alt="Promotional Banner" style="width:100%; height:auto; object-fit:cover; display:block;" loading="lazy" decoding="async">
            </a>
          </div>
        </section>
      `;
    }

    // Video Section 1 (if enabled)
    html += renderVideoSection(
      1, 
      globalSettings.video1_show, 
      globalSettings.video1_title, 
      globalSettings.video1_desc, 
      globalSettings.video1_type, 
      globalSettings.video1_mp4_url, 
      globalSettings.video1_youtube_url
    );

    // 3. Shop by Category (Goal)
    if (categories.length > 0) {
      const getCategoryIcon = (name) => {
        const n = (name || '').toLowerCase();
        if (n.includes('whey') || n.includes('protein')) return 'flask';
        if (n.includes('gainer') || n.includes('mass')) return 'dumbbell';
        if (n.includes('creatine')) return 'bolt';
        if (n.includes('pre') || n.includes('workout')) return 'fire';
        if (n.includes('bcaa') || n.includes('amino')) return 'glass-water';
        if (n.includes('vitamin') || n.includes('mineral') || n.includes('multivitamin') || n.includes('capsule')) return 'capsules';
        if (n.includes('fat') || n.includes('burner') || n.includes('loss')) return 'fire';
        if (n.includes('bar')) return 'cookie-bite';
        if (n.includes('accessory') || n.includes('accessories') || n.includes('shaker')) return 'award';
        return 'dumbbell';
      };

      const categoriesTitle = (globalSettings.slider_settings && globalSettings.slider_settings.categories_title) || 'CATEGORIES';

      html += `
        <section class="section section-categories">
          <div class="container">
            <div class="section-header-row animate-on-scroll">
              <h2 class="section-title-row">${escapeHTML(categoriesTitle)}</h2>
              <a href="/categories" class="section-view-all-link">View all <i class="fas fa-chevron-right"></i></a>
            </div>
            
            <div class="category-preview-grid">
              ${categories.map((cat, i) => {
                const iconName = getCategoryIcon(cat.name);
                const hasImage = !!cat.image_url;
                return `
                  <div class="category-card animate-on-scroll delay-${(i % 8) + 1}" data-category-id="${cat.id}">
                    <div class="category-icon-box">
                      ${hasImage ? `
                        <img src="${escapeHTML(cat.image_url)}" alt="${escapeHTML(cat.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                      ` : `
                        <i class="fas fa-${iconName}"></i>
                      `}
                    </div>
                    <h3 class="category-name">${escapeHTML(cat.name)}</h3>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </section>
      `;
    }

    // 4. Featured Products
    const featuredTitle = (globalSettings.slider_settings && globalSettings.slider_settings.featured_products_title) || 'FEATURED PRODUCTS';

    html += `
      <section class="section section-featured section-bg">
        <div class="container">
          <div class="section-header-row animate-on-scroll">
            <h2 class="section-title-row">${escapeHTML(featuredTitle)}</h2>
            <a href="/products" class="section-view-all-link">View all <i class="fas fa-chevron-right"></i></a>
          </div>
          
          ${featuredProducts.length > 0 ? `
            <div class="slider-container animate-on-scroll">
              <button class="slider-btn btn-prev" aria-label="Previous Products"><i class="fas fa-chevron-left"></i></button>
              <div class="products-slider-track">
                ${featuredProducts.map((prod, i) => renderProductCard(prod, i)).join('')}
              </div>
              <button class="slider-btn btn-next" aria-label="Next Products"><i class="fas fa-chevron-right"></i></button>
            </div>
          ` : `
            <div class="no-products">
              <i class="fas fa-box-open"></i>
              <h3>No Featured Products</h3>
              <p>Check back later or browse our full catalogue.</p>
              <a href="/products" class="btn btn-primary" style="margin-top: 16px;">View All Products</a>
            </div>
          `}
        </div>
      </section>
    `;

    // Bottom Trust Bar Section
    html += `
      <section class="bottom-trust-bar-section animate-on-scroll">
        <div class="container">
          <div class="bottom-trust-bar">
            <div class="trust-bar-item">
              <span class="trust-bar-icon"><i class="fas fa-shield-alt"></i></span>
              <span class="trust-bar-text">100% Genuine Products</span>
            </div>
            <div class="trust-bar-item">
              <span class="trust-bar-icon"><i class="fas fa-tags"></i></span>
              <span class="trust-bar-text">Best Prices Guaranteed</span>
            </div>
            <div class="trust-bar-item">
              <span class="trust-bar-icon"><i class="fas fa-shipping-fast"></i></span>
              <span class="trust-bar-text">On Time Delivery</span>
            </div>
            <div class="trust-bar-item">
              <span class="trust-bar-icon"><i class="fas fa-rotate-left"></i></span>
              <span class="trust-bar-text">Easy Returns Policy</span>
            </div>
          </div>
        </div>
      </section>
    `;

    // Video Section 2 (if enabled)
    html += renderVideoSection(
      2, 
      globalSettings.video2_show, 
      globalSettings.video2_title, 
      globalSettings.video2_desc, 
      globalSettings.video2_type, 
      globalSettings.video2_mp4_url, 
      globalSettings.video2_youtube_url
    );

    // Top Products (if enabled)
    if (globalSettings.show_top_products) {
      html += `
        <section class="section">
          <div class="container">
            <div class="section-header-row animate-on-scroll">
              <h2 class="section-title-row">Top Products</h2>
              <a href="/products" class="section-view-all-link">View all <i class="fas fa-chevron-right"></i></a>
            </div>
            
            ${topProducts.length > 0 ? `
              <div class="slider-container animate-on-scroll">
                <button class="slider-btn btn-prev" aria-label="Previous Products"><i class="fas fa-chevron-left"></i></button>
                <div class="products-slider-track">
                  ${topProducts.map((prod, i) => renderProductCard(prod, i)).join('')}
                </div>
                <button class="slider-btn btn-next" aria-label="Next Products"><i class="fas fa-chevron-right"></i></button>
              </div>
            ` : `
              <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>No Top Products Listed</h3>
                <p>Check back later or browse our full catalogue.</p>
                <a href="/products" class="btn btn-primary" style="margin-top: 16px;">View All Products</a>
              </div>
            `}
          </div>
        </section>
      `;
    }

    // 5. Best Sellers
    if (globalSettings.show_best_sellers) {
      html += `
        <section class="section section-bg">
          <div class="container">
            <div class="section-header-row animate-on-scroll">
              <h2 class="section-title-row">Best Sellers</h2>
              <a href="/products" class="section-view-all-link">View all <i class="fas fa-chevron-right"></i></a>
            </div>
            
            ${bestSellers.length > 0 ? `
              <div class="slider-container animate-on-scroll">
                <button class="slider-btn btn-prev" aria-label="Previous Products"><i class="fas fa-chevron-left"></i></button>
                <div class="products-slider-track">
                  ${bestSellers.map((prod, i) => renderProductCard(prod, i)).join('')}
                </div>
                <button class="slider-btn btn-next" aria-label="Next Products"><i class="fas fa-chevron-right"></i></button>
              </div>
            ` : `
              <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>No Best Sellers Listed</h3>
                <p>Check back later or browse our full catalogue.</p>
                <a href="/products" class="btn btn-primary" style="margin-top: 16px;">View All Products</a>
              </div>
            `}
          </div>
        </section>
      `;
    }

    // Trending Products (if enabled)
    if (globalSettings.show_trending_products) {
      html += `
        <section class="section">
          <div class="container">
            <div class="section-header-row animate-on-scroll">
              <h2 class="section-title-row">Trending Products</h2>
              <a href="/products" class="section-view-all-link">View all <i class="fas fa-chevron-right"></i></a>
            </div>
            
            ${trendingProducts.length > 0 ? `
              <div class="slider-container animate-on-scroll">
                <button class="slider-btn btn-prev" aria-label="Previous Products"><i class="fas fa-chevron-left"></i></button>
                <div class="products-slider-track">
                  ${trendingProducts.map((prod, i) => renderProductCard(prod, i)).join('')}
                </div>
                <button class="slider-btn btn-next" aria-label="Next Products"><i class="fas fa-chevron-right"></i></button>
              </div>
            ` : `
              <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>No Trending Products Listed</h3>
                <p>Check back later or browse our full catalogue.</p>
                <a href="/products" class="btn btn-primary" style="margin-top: 16px;">View All Products</a>
              </div>
            `}
          </div>
        </section>
      `;
    }

    // 6. Shop by Brand (disabled by default, hidden/shown via Admin toggle)
    const showShopByBrand = globalSettings.slider_settings?.show_shop_by_brand || false;
    if (showShopByBrand) {
      const uniqueBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
      if (uniqueBrands.length > 0) {
        html += `
          <section class="section">
            <div class="container">
              <div class="section-header animate-on-scroll">
                <span class="section-badge">Trusted Partners</span>
                <h2 class="section-title">Shop by Brand</h2>
                <p class="section-subtitle">Browse supplements from leading sports nutrition brands.</p>
              </div>
              
              <div class="brands-grid">
                ${uniqueBrands.map(brand => `
                  <div class="brand-card animate-on-scroll" data-brand="${escapeHTML(brand)}">
                    <div class="brand-card-inner">
                      <div class="brand-icon-wrap">
                        <i class="fas fa-award"></i>
                      </div>
                      <h3>${escapeHTML(brand)}</h3>
                      <span class="brand-link">View Products <i class="fas fa-arrow-right"></i></span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        `;
      }
    }

    // 7. Why Choose Us Banner (full-width dark gradient banner section)
    html += `
      <section class="why-choose-us-banner animate-on-scroll">
        <div class="container">
          <div class="banner-content">
            <span class="section-badge">Why Choose Us</span>
            <h2>Your Trusted Partner in Fitness & Health</h2>
            <p>We are committed to delivering the highest quality, 100% authentic sports supplements directly to you.</p>
            
            <div class="banner-features">
              <div class="bf-item">
                <i class="fas fa-check-double"></i>
                <h3>Authentic Products</h3>
                <p>100% genuine supplements with direct code verification</p>
              </div>
              <div class="bf-item">
                <i class="fas fa-award"></i>
                <h3>Trusted Brands</h3>
                <p>Only top-tier certified sports nutrition brands</p>
              </div>
              <div class="bf-item">
                <i class="fas fa-shipping-fast"></i>
                <h3>Fast Delivery</h3>
                <p>Secure packaging and quick shipping across the region</p>
              </div>
              <div class="bf-item">
                <i class="fas fa-headset"></i>
                <h3>Customer Support</h3>
                <p>Dedicated order placement and advice directly on WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    // 8. Customer Reviews (disabled by default, hidden/shown via Admin toggle)
    const showCustomerReviews = globalSettings.slider_settings?.show_customer_reviews || false;
    if (showCustomerReviews) {
      let homepageReviews = [];
      try {
        homepageReviews = await db.fetchApprovedReviews().catch(() => []);
      } catch (err) {
        console.error(err);
      }

      if (homepageReviews.length === 0) {
        homepageReviews = [
          {
            reviewer_name: "Amit Sharma",
            rating: 5,
            comment: "Absolutely genuine supplements! Verified the unique code on the site and it checked out. Will definitely buy again.",
            products: { title: "100% Whey Protein" }
          },
          {
            reviewer_name: "Vikram Malhotra",
            rating: 5,
            comment: "Super fast delivery and excellent support on WhatsApp. Guided me well on which creatine fits my budget and goals.",
            products: { title: "Micronized Creatine" }
          },
          {
            reviewer_name: "Rohit Verma",
            rating: 5,
            comment: "Top Muscle Nutrition has been my go-to store. Genuine products, great prices, and direct verification gives absolute peace of mind.",
            products: { title: "Essential BCAAs" }
          }
        ];
      }

      html += `
        <section class="section">
          <div class="container">
            <div class="section-header animate-on-scroll">
              <span class="section-badge">Testimonials</span>
              <h2 class="section-title">Customer Reviews</h2>
              <p class="section-subtitle">Read feedback from fitness enthusiasts who trust our supplements.</p>
            </div>
            
            <div class="reviews-grid">
              ${homepageReviews.slice(0, 3).map(rev => `
                <div class="review-card animate-on-scroll">
                  <div class="review-stars">
                    ${Array.from({ length: 5 }).map((_, i) => `<i class="${i < rev.rating ? 'fas' : 'far'} fa-star" style="color:#f59e0b; font-size:0.85rem; margin-right:2px;"></i>`).join('')}
                  </div>
                  <p class="review-comment">"${escapeHTML(rev.comment)}"</p>
                  <div class="review-author">
                    <h4>${escapeHTML(rev.reviewer_name)}</h4>
                    ${rev.products ? `<span class="review-product">Verified Buyer of ${escapeHTML(rev.products.title)}</span>` : '<span class="review-product">Verified Buyer</span>'}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    }

    // CTA Banner (if enabled)
    if (globalSettings.cta_banner_show) {
      html += `
        <section class="section cta-banner-section" style="padding: 70px 0; background: ${globalSettings.cta_banner_bg_color || '#161618'}; color: #ffffff; text-align: center; position: relative; overflow: hidden; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
          <div style="position:absolute; inset:0; background:radial-gradient(circle at center, rgba(var(--primary-rgb, 211, 47, 47), 0.15) 0%, transparent 65%); pointer-events:none;"></div>
          <div class="container" style="position:relative; z-index:2; max-width: 680px; display:flex; flex-direction:column; gap:20px; align-items:center; margin: 0 auto;">
            <h2 style="color:#ffffff; font-size:clamp(1.7rem, 3.5vw, 2.4rem); font-weight:800; font-family:var(--font-heading); margin: 0;">${escapeHTML(globalSettings.cta_banner_title || 'Ready to Level Up Your Workouts?')}</h2>
            <p style="color:rgba(255,255,255,0.75); font-size:1.02rem; line-height:1.6; margin: 0;">${escapeHTML(globalSettings.cta_banner_desc || 'Chat with our experts on WhatsApp for personalized supplement guidance.')}</p>
            <a href="https://wa.me/${(globalSettings.whatsapp_number || '').replace(/[^0-9]/g, '')}" target="_blank" rel="noopener" class="btn btn-primary" style="margin-top:8px; display:inline-flex; align-items:center; gap:8px;">
              <i class="fab fa-whatsapp" style="font-size:1.15rem;"></i> ${escapeHTML(globalSettings.cta_banner_btn_text || 'Chat on WhatsApp')}
            </a>
          </div>
        </section>
      `;
    }

    // 9. Contact Section
    html += `
      <section class="section section-bg" id="contact-section">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-badge">Reach Out</span>
            <h2 class="section-title">Contact & Support</h2>
            <p class="section-subtitle">Have questions or need assistance placing an order? Let's connect.</p>
          </div>
          
          <div class="contact-grid">
            <div class="contact-card animate-slide-left">
              <div class="contact-header">
                <h3>Get In Touch</h3>
                <p>Our sales team is available directly on WhatsApp.</p>
              </div>
              <div class="contact-info-list">
                <div class="contact-item">
                  <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
                  <div class="contact-text">
                    <h4>Address</h4>
                    <p>${globalSettings.contact_address}</p>
                  </div>
                </div>
                <div class="contact-item">
                  <div class="contact-icon"><i class="fas fa-phone"></i></div>
                  <div class="contact-text">
                    <h4>Phone Support</h4>
                    <p>${globalSettings.contact_phone}</p>
                  </div>
                </div>
                <div class="contact-item">
                  <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                  <div class="contact-text">
                    <h4>Email Support</h4>
                    <p>${globalSettings.contact_email}</p>
                  </div>
                </div>
              </div>
              <a href="https://wa.me/${(globalSettings.whatsapp_number || '').replace(/[^0-9]/g, '')}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="margin-top: 12px;">
                <i class="fab fa-whatsapp"></i> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    `;

    appContent.innerHTML = html;

    // Bind Category Clicks
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        activeCategoryFilter = card.dataset.categoryId;
        activeBrandFilter = null;
        router.navigate('/products');
      });
    });

    // Bind Brand Card Clicks
    document.querySelectorAll('.brand-card').forEach(card => {
      card.addEventListener('click', () => {
        activeBrandFilter = card.dataset.brand;
        activeCategoryFilter = null;
        router.navigate('/products');
      });
    });

    // Initialize scroll animations
    initScrollAnimations();

    // Start Hero Image Rotation if multiple images exist
    const heroImageElements = document.querySelectorAll('.hero-product-images-container .hero-product-image');
    if (heroImageElements.length > 1) {
      let currentIdx = 0;
      const intervalId = setInterval(() => {
        // Double check if the elements are still in the DOM
        if (!document.body.contains(heroImageElements[0])) {
          clearInterval(intervalId);
          return;
        }
        heroImageElements[currentIdx].classList.remove('active');
        currentIdx = (currentIdx + 1) % heroImageElements.length;
        heroImageElements[currentIdx].classList.add('active');
      }, 4000);
    }

    // Initialize New Hero Slider
    initHeroSlider(globalSettings);

    // Initialize Product Sliders
    initProductSliders();

  } catch (error) {
    console.error('Home render failed:', error);
    showToast('Failed to render Home page', 'error');
  } finally {
    hideLoader();
  }
}

// Product Slider Navigation Controller
function initProductSliders() {
  document.querySelectorAll('.slider-container').forEach(container => {
    const track = container.querySelector('.products-slider-track');
    const prevBtn = container.querySelector('.btn-prev');
    const nextBtn = container.querySelector('.btn-next');
    if (!track || !prevBtn || !nextBtn) return;

    const getScrollAmount = () => {
      const card = track.querySelector('.product-card');
      return card ? card.offsetWidth + 20 : 300;
    };

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    const toggleButtons = () => {
      const scrollLeft = track.scrollLeft;
      const maxScroll = track.scrollWidth - track.clientWidth;
      prevBtn.style.opacity = scrollLeft <= 5 ? '0' : '1';
      prevBtn.style.pointerEvents = scrollLeft <= 5 ? 'none' : 'auto';
      nextBtn.style.opacity = scrollLeft >= maxScroll - 5 ? '0' : '1';
      nextBtn.style.pointerEvents = scrollLeft >= maxScroll - 5 ? 'none' : 'auto';
    };

    track.addEventListener('scroll', toggleButtons);
    setTimeout(toggleButtons, 200);
    window.addEventListener('resize', toggleButtons);
  });
}


// 2. PRODUCTS VIEW (Catalogue)
async function renderProducts() {
  showLoader();
  try {
    const [products, categories] = await Promise.all([
      db.fetchProducts(),
      db.fetchCategories()
    ]);

    const activeCategory = activeCategoryFilter ? categories.find(c => c.id === activeCategoryFilter) : null;
    const activeCategoryName = activeCategory ? activeCategory.name : (activeBrandFilter ? `Brand: ${activeBrandFilter}` : 'All Categories');

    appContent.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-badge">Catalogue</span>
            <h2 class="section-title">Our Supplements</h2>
            <p class="section-subtitle">Premium grade products designed for peak performance.</p>
          </div>
          
          <div class="products-filter-bar animate-on-scroll">
            <div class="search-input-wrap">
              <i class="fas fa-search"></i>
              <input type="text" id="product-search" class="search-input" placeholder="Search products..." value="${productSearchQuery}">
            </div>
            
            <div class="custom-dropdown" id="category-dropdown">
              <button class="dropdown-trigger" id="category-dropdown-trigger" aria-haspopup="listbox" aria-expanded="false">
                <span id="category-dropdown-label">${activeCategoryName}</span>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
              </button>
              <ul class="dropdown-menu" id="category-dropdown-menu" role="listbox">
                <li class="dropdown-item ${!activeCategoryFilter ? 'active' : ''}" data-value="all" role="option">All Categories</li>
                ${categories.map(cat => `
                  <li class="dropdown-item ${activeCategoryFilter === cat.id ? 'active' : ''}" data-value="${cat.id}" role="option">${cat.name}</li>
                `).join('')}
              </ul>
            </div>
          </div>
          
          <div class="products-grid" id="catalogue-grid">
            <!-- Product Cards injected dynamically -->
          </div>
        </div>
      </section>
    `;

    // Render list
    filterAndRenderProducts(products);

    // Bind Search Input
    const searchInput = document.getElementById('product-search');
    searchInput.addEventListener('input', (e) => {
      productSearchQuery = e.target.value;
      filterAndRenderProducts(products);
    });

    // Bind Custom Category Dropdown
    const dropdownEl = document.getElementById('category-dropdown');
    const triggerBtn = document.getElementById('category-dropdown-trigger');
    const labelEl = document.getElementById('category-dropdown-label');
    const menuEl = document.getElementById('category-dropdown-menu');

    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownEl.classList.toggle('open');
      triggerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Handle Option Selection
    menuEl.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;

      const value = item.dataset.value;
      const text = item.textContent;

      // Update active filter and label
      activeCategoryFilter = value === 'all' ? null : value;
      activeBrandFilter = null;
      labelEl.textContent = text;

      // Update active styling
      menuEl.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');

      // Close dropdown
      dropdownEl.classList.remove('open');
      triggerBtn.setAttribute('aria-expanded', 'false');

      // Filter and render
      filterAndRenderProducts(products);
    });

    // Close dropdown on click outside
    document.addEventListener('click', () => {
      if (dropdownEl.classList.contains('open')) {
        dropdownEl.classList.remove('open');
        triggerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Initialize scroll animations
    initScrollAnimations();

  } catch (error) {
    console.error('Products page failed:', error);
    showToast('Failed to load catalogue', 'error');
  } finally {
    hideLoader();
  }
}

// Client filter and render function
function filterAndRenderProducts(allProducts) {
  const grid = document.getElementById('catalogue-grid');
  if (!grid) return;

  const filtered = allProducts.filter(prod => {
    const matchesCategory = !activeCategoryFilter || prod.category_id === activeCategoryFilter;
    const matchesBrand = !activeBrandFilter || prod.brand === activeBrandFilter;
    const matchesSearch = !productSearchQuery || prod.title.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                          (prod.short_description && prod.short_description.toLowerCase().includes(productSearchQuery.toLowerCase()));
    return matchesCategory && matchesBrand && matchesSearch;
  });

  if (filtered.length > 0) {
    grid.innerHTML = filtered.map((prod, i) => renderProductCard(prod, i)).join('');
    // Re-init scroll animations for newly rendered cards
    initScrollAnimations();
  } else {
    grid.innerHTML = `
      <div class="no-products">
        <i class="fas fa-search-minus"></i>
        <h3>No Products Found</h3>
        <p>Try modifying your search queries or category filters.</p>
      </div>
    `;
  }
}

// Single Card HTML compiler
function renderProductCard(prod, index = 0) {
  const mainImage = prod.product_images && prod.product_images.length > 0 
    ? prod.product_images[0].image_url 
    : 'https://via.placeholder.com/300?text=No+Image';

  const delayClass = `delay-${(index % 6) + 1}`;

  // Build price display HTML
  let priceHTML = '';
  const price = prod.price;
  const offerPrice = prod.offer_price;
  const hasVariants = Array.isArray(prod.variants) && prod.variants.length > 1;

  if (hasVariants) {
    // Find the minimum price among all variants
    const minPrice = prod.variants.reduce((min, v) => {
      const currentVal = v.offer_price || v.price || Infinity;
      return currentVal < min ? currentVal : min;
    }, Infinity);
    
    if (minPrice !== Infinity) {
      priceHTML = `
        <div class="product-price-row">
          <span class="price-from" style="font-size: 0.78rem; font-weight:600; color:var(--text-sub); text-transform:uppercase; letter-spacing:0.02em;">From</span>
          <span class="price-offer">₹${minPrice.toLocaleString('en-IN')}</span>
        </div>
      `;
    }
  } else if (price) {
    if (offerPrice && offerPrice < price) {
      const discount = Math.round(((price - offerPrice) / price) * 100);
      priceHTML = `
        <div class="product-price-row">
          <span class="price-offer">₹${offerPrice.toLocaleString('en-IN')}</span>
          <span class="price-original">₹${price.toLocaleString('en-IN')}</span>
          <span class="price-discount-badge">${discount}% OFF</span>
        </div>
      `;
    } else {
      priceHTML = `
        <div class="product-price-row">
          <span class="price-offer">₹${price.toLocaleString('en-IN')}</span>
        </div>
      `;
    }
  }

  const sizeStr = prod.weight ? ` (Size: ${prod.weight})` : '';
  const minPrice = hasVariants ? prod.variants.reduce((min, v) => {
    const currentVal = v.offer_price || v.price || Infinity;
    return currentVal < min ? currentVal : min;
  }, Infinity) : (prod.offer_price || prod.price);
  const priceStr = minPrice && minPrice !== Infinity ? ` for *₹${minPrice.toLocaleString('en-IN')}*` : '';
  const cardWaMessage = `Hello! I'm interested in ordering:\n\n*${prod.title}*${sizeStr}${priceStr}\n\nPlease confirm availability. Thank you!`;
  const cardCleanedNumber = (globalSettings ? (globalSettings.whatsapp_number || '') : '').replace(/[^0-9]/g, '');
  const cardWaUrl = `https://wa.me/${cardCleanedNumber}?text=${encodeURIComponent(cardWaMessage)}`;

  // Calculate product ratings based on reviews
  const approvedReviews = prod.reviews ? prod.reviews.filter(r => r.approved) : [];
  const totalReviews = approvedReviews.length;
  const avgRating = totalReviews > 0 ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '5.0';
  const avgStars = Math.round(parseFloat(avgRating));
  const starsHTML = Array.from({ length: 5 }).map((_, i) => `<i class="${i < avgStars ? 'fas' : 'far'} fa-star" style="color:#f59e0b; font-size:0.75rem; margin-right:1px;"></i>`).join('');
  const ratingHTML = `
    <div class="product-card-rating" style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
      <div style="display:flex;">${starsHTML}</div>
      <span style="font-size:0.75rem; color:var(--text-sub); font-weight:600;">${avgRating} (${totalReviews})</span>
    </div>
  `;

  const wishlisted = isWishlisted(prod.id);
  const heartClass = wishlisted ? 'fas' : 'far';
  const activeClass = wishlisted ? 'active' : '';

  return `
    <div class="product-card animate-on-scroll ${delayClass}" onclick="if(!event.target.closest('.wishlist-btn, .btn-card-view')) router.navigate('/product/${prod.slug}');">
      <button class="wishlist-btn ${activeClass}" aria-label="Add to Wishlist" onclick="event.stopPropagation(); window.handleWishlistToggleClick(this, '${prod.id}');">
        <i class="${heartClass} fa-heart"></i>
      </button>
      ${prod.featured ? '<span class="product-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
      <div class="product-img-wrap">
        <img src="${mainImage}" alt="${prod.title}" loading="lazy" decoding="async" width="300" height="300">
        <div class="veg-badge"><span class="veg-dot"></span></div>
      </div>
      <div class="product-info">
        <h3 class="product-title">${prod.title}</h3>
        ${ratingHTML}
        ${priceHTML}
        <div class="product-actions-row-single">
          <a href="/product/${prod.slug}" class="btn btn-card-view">View Product</a>
        </div>
      </div>
    </div>
  `;
}

// Helper parser for FDA-style Nutrition Facts Card
function parseNutritionInfo(nutritionStr) {
  if (!nutritionStr) return '';
  
  // Try parsing lines like "Label: Value" or "Label - Value"
  const lines = nutritionStr.split('\n').map(l => l.trim()).filter(Boolean);
  const items = [];
  let servingSize = '1 scoop (approx. 33g)';
  let servingsPerContainer = 'Approx. 30';
  let calories = '120';
  
  const cleanLines = [];
  lines.forEach(line => {
    // Try matching Label: Value or Label - Value
    const match = line.match(/^([^:-]+)[::-]\s*(.+)$/);
    if (match) {
      const label = match[1].trim();
      const val = match[2].trim();
      if (label.toLowerCase().includes('serving size')) {
        servingSize = val;
      } else if (label.toLowerCase().includes('servings per container') || label.toLowerCase().includes('servings')) {
        servingsPerContainer = val;
      } else if (label.toLowerCase().includes('calories')) {
        calories = val;
      } else {
        items.push({ label, val });
      }
    } else {
      cleanLines.push(line);
    }
  });
  
  // If no items were parsed, just treat it as free-form HTML lines
  if (items.length === 0 && cleanLines.length > 0) {
    return `
      <div style="font-size: 0.9rem; color: var(--text-sub); line-height: 1.75; white-space: pre-line;">
        ${nutritionStr}
      </div>
    `;
  }
  
  return `
    <div class="nutrition-facts-card">
      <div class="nutrition-facts-header">
        <h4 class="nutrition-facts-title">Nutrition Facts</h4>
        <div class="nutrition-facts-subtitle">Standard Supplement Facts</div>
      </div>
      <div class="nutrition-serving-info">
        <div>Serving Size: ${servingSize}</div>
        <div>Servings: ${servingsPerContainer}</div>
      </div>
      <div class="nutrition-calories-row">
        <div class="nutrition-calories-title">Calories</div>
        <div class="nutrition-calories-val">${calories}</div>
      </div>
      <div class="nutrition-dv-header">% Daily Value *</div>
      <div class="nutrition-grid">
        ${items.map(item => `
          <div class="nutrition-row">
            <strong>${item.label}</strong>
            <span>${item.val}</span>
          </div>
        `).join('')}
      </div>
      <div style="font-size: 0.72rem; color: #555; margin-top: 12px; border-top: 1px solid #000; padding-top: 8px; line-height: 1.35; font-weight: 500;">
        * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
      </div>
    </div>
  `;
}

// Helper functions for Product Share Feature
function openShareModal(product) {
  const url = window.location.href;
  const text = `Check out ${product.title} - Premium quality supplement from Top Muscle Nutrition!`;
  
  if (navigator.share) {
    navigator.share({
      title: product.title,
      text: text,
      url: url
    }).catch(err => {
      if (err.name !== 'AbortError') {
        showShareFallbackModal(product, url, text);
      }
    });
  } else {
    showShareFallbackModal(product, url, text);
  }
}

function showShareFallbackModal(product, url, text) {
  let modal = document.getElementById('share-fallback-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'share-fallback-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 480px; padding: 28px;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
        <h3 style="margin:0; font-family:var(--font-heading); font-size:1.25rem;"><i class="fas fa-share-nodes" style="color:var(--primary); margin-right:8px;"></i>Share Product</h3>
        <button class="modal-close" id="close-share-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer; line-height:1;">&times;</button>
      </div>
      
      <p style="font-size:0.9rem; color:var(--text-sub); margin-bottom: 20px;">Share <strong>${escapeHTML(product.title)}</strong> with your friends:</p>
      
      <div class="share-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
        
        <button class="share-option-btn" id="share-copy-link" style="display:flex; flex-direction:column; align-items:center; gap:8px; background:var(--gray-50); border:1px solid var(--border); border-radius:var(--r-md); padding:16px 8px; cursor:pointer; transition:all 0.2s ease;">
          <div style="width:40px; height:40px; border-radius:50%; background:rgba(0,0,0,0.06); display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:var(--text);"><i class="fas fa-link"></i></div>
          <span style="font-size:0.75rem; font-weight:600;">Copy Link</span>
        </button>

        <a href="https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}" target="_blank" rel="noopener" class="share-option-btn" style="display:flex; flex-direction:column; align-items:center; gap:8px; background:var(--gray-50); border:1px solid var(--border); border-radius:var(--r-md); padding:16px 8px; text-decoration:none; color:var(--text); transition:all 0.2s ease;">
          <div style="width:40px; height:40px; border-radius:50%; background:rgba(37,211,102,0.15); display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:#25D366;"><i class="fab fa-whatsapp"></i></div>
          <span style="font-size:0.75rem; font-weight:600;">WhatsApp</span>
        </a>

        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener" class="share-option-btn" style="display:flex; flex-direction:column; align-items:center; gap:8px; background:var(--gray-50); border:1px solid var(--border); border-radius:var(--r-md); padding:16px 8px; text-decoration:none; color:var(--text); transition:all 0.2s ease;">
          <div style="width:40px; height:40px; border-radius:50%; background:rgba(24,119,242,0.15); display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:#1877F2;"><i class="fab fa-facebook-f"></i></div>
          <span style="font-size:0.75rem; font-weight:600;">Facebook</span>
        </a>

        <a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" target="_blank" rel="noopener" class="share-option-btn" style="display:flex; flex-direction:column; align-items:center; gap:8px; background:var(--gray-50); border:1px solid var(--border); border-radius:var(--r-md); padding:16px 8px; text-decoration:none; color:var(--text); transition:all 0.2s ease;">
          <div style="width:40px; height:40px; border-radius:50%; background:rgba(0,0,0,0.06); display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:#000000;"><i class="fab fa-x-twitter"></i></div>
          <span style="font-size:0.75rem; font-weight:600;">X (Twitter)</span>
        </a>

        <a href="https://t.me/share/url?url=${encodedUrl}&text=${encodedText}" target="_blank" rel="noopener" class="share-option-btn" style="display:flex; flex-direction:column; align-items:center; gap:8px; background:var(--gray-50); border:1px solid var(--border); border-radius:var(--r-md); padding:16px 8px; text-decoration:none; color:var(--text); transition:all 0.2s ease;">
          <div style="width:40px; height:40px; border-radius:50%; background:rgba(0,136,204,0.15); display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:#0088cc;"><i class="fab fa-telegram-plane"></i></div>
          <span style="font-size:0.75rem; font-weight:600;">Telegram</span>
        </a>

        <a href="mailto:?subject=${encodeURIComponent('Check out ' + product.title)}&body=${encodedText}%0A%0A${encodedUrl}" class="share-option-btn" style="display:flex; flex-direction:column; align-items:center; gap:8px; background:var(--gray-50); border:1px solid var(--border); border-radius:var(--r-md); padding:16px 8px; text-decoration:none; color:var(--text); transition:all 0.2s ease;">
          <div style="width:40px; height:40px; border-radius:50%; background:rgba(220,38,38,0.1); display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:#DC2626;"><i class="fas fa-envelope"></i></div>
          <span style="font-size:0.75rem; font-weight:600;">Email</span>
        </a>
        
      </div>

      <div style="display:flex; align-items:center; gap:8px; background:var(--gray-100); border-radius:var(--r-md); padding:10px 12px; border:1px solid var(--border);">
        <input type="text" value="${escapeHTML(url)}" readonly style="flex:1; background:none; border:none; outline:none; font-size:0.8rem; color:var(--text-sub); pointer-events:all;" id="share-link-input">
        <button id="share-copy-inline-btn" style="background:var(--primary); color:#fff; border:none; padding:6px 12px; border-radius:var(--r-sm); font-size:0.75rem; font-weight:600; cursor:pointer; transition:background 0.2s ease;">Copy</button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeModal = () => {
    modal.classList.remove('active');
  };
  
  modal.querySelector('#close-share-modal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const copyAction = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Product link copied to clipboard!', 'success');
      const copyBtn = modal.querySelector('#share-copy-inline-btn');
      if (copyBtn) {
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = 'var(--success)';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.style.background = 'var(--primary)';
        }, 2000);
      }
    } catch (err) {
      showToast('Failed to copy link', 'error');
    }
  };

  modal.querySelector('#share-copy-link').addEventListener('click', copyAction);
  modal.querySelector('#share-copy-inline-btn').addEventListener('click', copyAction);

  modal.querySelectorAll('.share-option-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.borderColor = 'var(--primary)';
      btn.style.background = 'var(--white)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'none';
      btn.style.borderColor = 'var(--border)';
      btn.style.background = 'var(--gray-50)';
    });
  });
}

// Helper parser for flavors
function getFlavorsForProduct(product) {
  if (product.flavors) {
    return product.flavors.split(',').map(f => f.trim()).filter(Boolean);
  }
  
  // If flavor is specified inside variants
  if (Array.isArray(product.variants)) {
    const variantFlavors = product.variants.map(v => v.flavor).filter(Boolean).map(f => f.trim());
    if (variantFlavors.length > 0) {
      return [...new Set(variantFlavors)];
    }
  }

  const title = product.title.toLowerCase();
  const flavors = [];
  
  // Check if title has a flavour keyword
  const flavorMatch = product.title.match(/([a-zA-Z0-9\s]+)(?:Flavour|Flavor)/i);
  if (flavorMatch) {
    const extractedFlavor = flavorMatch[1].trim();
    let cleaned = extractedFlavor
      .replace(/gold whey protein/i, '')
      .replace(/why protein/i, '')
      .replace(/micronized creatine/i, '')
      .replace(/premium/i, '')
      .trim();
    if (cleaned) {
      flavors.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
    }
  }
  
  if (title.includes('protein')) {
    if (flavors.length === 0) {
      flavors.push('Belgian Chocolate');
    }
    const standardProteinFlavors = ['Cafe Latte', 'Pista Kulfi', 'Mango', 'Vanilla Cream', 'Strawberry'];
    standardProteinFlavors.forEach(f => {
      if (!flavors.some(existing => existing.toLowerCase() === f.toLowerCase()) && flavors.length < 3) {
        flavors.push(f);
      }
    });
  } else if (title.includes('creatine')) {
    if (flavors.length === 0) {
      flavors.push('Unflavored');
    }
    const standardCreatineFlavors = ['Fruit Punch', 'Blue Raspberry', 'Orange'];
    standardCreatineFlavors.forEach(f => {
      if (!flavors.some(existing => existing.toLowerCase() === f.toLowerCase()) && flavors.length < 3) {
        flavors.push(f);
      }
    });
  } else {
    if (flavors.length === 0) {
      flavors.push('Standard');
    }
  }
  
  return flavors;
}

// 3. PRODUCT DETAILS VIEW
async function renderProductDetails(params) {
  showLoader();
  try {
    let product = null;
    try {
      product = await db.fetchProductBySlug(params.slug);
    } catch (dbErr) {
      console.warn('Product fetch failed:', dbErr);
    }

    if (!product) {
      appContent.innerHTML = `
        <section class="section">
          <div class="container verify-wrapper">
            <div class="verify-card">
              <i class="fas fa-exclamation-triangle" style="font-size:3rem; color:var(--primary);"></i>
              <h2>Product Not Found</h2>
              <p>The product you are looking for does not exist or has been removed.</p>
              <a href="/products" class="btn btn-primary" style="margin-top:16px;"><i class="fas fa-arrow-left"></i> Back to Products</a>
            </div>
          </div>
        </section>
      `;
      return;
    }

    // Fetch reviews and related products in parallel
    let reviews = [];
    let relatedProducts = [];
    try {
      const [fetchedReviews, allCatProducts] = await Promise.all([
        db.fetchReviews(product.id).catch(err => { console.error('Failed to load reviews:', err); return []; }),
        product.category_id 
          ? db.fetchProducts({ category_id: product.category_id }).catch(err => { console.error('Failed to load related products:', err); return []; })
          : Promise.resolve([])
      ]);
      reviews = fetchedReviews;
      relatedProducts = allCatProducts.filter(p => p.id !== product.id).slice(0, 4);
    } catch (err) {
      console.error('Failed to load dynamic details:', err);
    }

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '0.0';
    const avgStars = Math.round(parseFloat(avgRating));

    const images = product.product_images || [];
    const mainImage = images.length > 0 ? images[0].image_url : 'https://placehold.co/600x600/f5f5f7/86868b?text=No+Image';

    // Build about sections
    const aboutSections = [
      { key: 'long_description', title: 'About this Product', icon: 'info-circle' },
      { key: 'benefits', title: 'Key Benefits', icon: 'star' },
      { key: 'ingredients', title: 'Ingredients', icon: 'leaf' },
      { key: 'nutrition', title: 'Nutrition Information', icon: 'chart-bar' },
      { key: 'usage', title: 'Usage Instructions', icon: 'directions' },
      { key: 'warnings', title: 'Safety & Warnings', icon: 'shield-alt' }
    ].filter(s => product[s.key]);

    // Check if variants exist
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 1;
    const flavorsList = getFlavorsForProduct(product);

    let sizeOptionsHTML = '';
    if (hasVariants) {
      sizeOptionsHTML = product.variants.map((v, i) => `
        <option value="${i}">${escapeHTML(v.weight)}</option>
      `).join('');
    } else {
      sizeOptionsHTML = `
        <option value="0">${escapeHTML(product.weight || 'Standard')}</option>
      `;
    }

    const flavorOptionsHTML = flavorsList.map(f => `
      <option value="${escapeHTML(f)}">${escapeHTML(f)}</option>
    `).join('');

    // PRE-COMPUTE HTML SEGMENTS to avoid complex nested backticks which cause syntax errors
    // 1. Gallery Thumbnails
    const thumbsHTML = images.map((img, i) => `
      <div class="pd-thumb ${i === 0 ? 'active' : ''}" data-url="${img.image_url}">
        <img src="${img.image_url}" alt="${escapeHTML(product.title)} gallery image ${i+1}" loading="lazy">
      </div>
    `).join('');

    // 2. Average Reviews Stars in header
    let reviewsStarsHTML = '';
    if (totalReviews > 0) {
      const starsHTML = Array.from({ length: 5 }).map((_, i) => `<i class="${i < avgStars ? 'fas' : 'far'} fa-star"></i>`).join('');
      reviewsStarsHTML = `
        <div style="display:flex; align-items:center; gap:6px; font-size:0.8rem;">
          <div class="rating-stars">${starsHTML}</div>
          <span style="color:var(--text-sub); font-weight:600;">${avgRating}</span>
        </div>
      `;
    }

    // 3. Weight/Size Variants selector
    let variantsHTML = '';
    if (hasVariants) {
      const chipsHTML = product.variants.map((v, i) => `
        <button class="pd-size-chip ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Select size ${escapeHTML(v.weight)}">
          ${escapeHTML(v.weight)}
        </button>
      `).join('');
      variantsHTML = `
        <div class="pd-variants-section" style="margin-top: 4px;">
          <span class="pd-variants-label" style="font-size:0.8rem; font-weight:700; color:var(--text-sub); display:block; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.04em;">Select Size / Weight:</span>
          <div class="pd-size-chips" id="pd-size-chips-list" style="display:flex; flex-wrap:wrap; gap:10px;">
            ${chipsHTML}
          </div>
        </div>
      `;
    } else if (product.weight) {
      variantsHTML = `
        <div class="pd-variants-section" style="margin-top: 4px;">
          <span class="pd-variants-label" style="font-size:0.8rem; font-weight:700; color:var(--text-sub); display:block; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.04em;">Size / Weight:</span>
          <span style="font-size:0.88rem; font-weight:700; color:var(--text); background:var(--gray-50); border:1px solid var(--border); padding:6px 14px; border-radius:var(--r-sm); display:inline-block;">${escapeHTML(product.weight)}</span>
        </div>
      `;
    }

    // 4. About Sections details
    let aboutHTML = '';
    if (aboutSections.length > 0) {
      const leftBlocksHTML = aboutSections.filter(s => ['long_description', 'benefits'].includes(s.key)).map(s => `
        <div class="pd-about-block">
          <h3 class="pd-about-block-title">
            <i class="fas fa-${s.icon}"></i> ${s.title}
          </h3>
          <div class="pd-about-body">${product[s.key].replace(/\n/g, '<br>')}</div>
        </div>
      `).join('');

      const rightBlocksHTML = aboutSections.filter(s => !['long_description', 'benefits'].includes(s.key)).map(s => {
        const bodyContent = s.key === 'nutrition' ? parseNutritionInfo(product[s.key]) : `<div class="pd-about-body">${product[s.key].replace(/\n/g, '<br>')}</div>`;
        return `
          <div class="pd-about-block">
            <h3 class="pd-about-block-title">
              <i class="fas fa-${s.icon}"></i> ${s.title}
            </h3>
            ${bodyContent}
          </div>
        `;
      }).join('');

      aboutHTML = `
        <div class="pd-about-section" id="pd-about">
          <h2 class="pd-about-title">Product Details</h2>
          <div class="pd-about-cols">
            <!-- LEFT: description + benefits -->
            <div class="pd-about-main">
              ${leftBlocksHTML}
            </div>
            <!-- RIGHT: ingredients, nutrition, usage, warnings -->
            <div class="pd-about-side">
              ${rightBlocksHTML}
            </div>
          </div>
        </div>
      `;
    }

    // 5. Related Products
    let relatedHTML = '';
    if (relatedProducts.length > 0) {
      const cardsHTML = relatedProducts.map((p, idx) => renderProductCard(p, idx)).join('');
      relatedHTML = `
        <div class="pd-related-section animate-on-scroll">
          <h3 class="pd-related-title">You May Also Like</h3>
          <div class="products-grid">
            ${cardsHTML}
          </div>
        </div>
      `;
    }

    // 6. Reviews list
    let reviewsListHTML = '';
    if (reviews.length > 0) {
      reviewsListHTML = reviews.map(r => {
        const dateStr = new Date(r.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
        const starIcons = Array.from({ length: 5 }).map((_, i) => `<i class="${i < r.rating ? 'fas' : 'far'} fa-star"></i>`).join('');
        const commentHTML = r.comment ? `<p class="review-comment">${escapeHTML(r.comment)}</p>` : '';
        return `
          <div class="review-card">
            <div class="review-card-meta">
              <span class="review-author">${escapeHTML(r.reviewer_name)}</span>
              <span class="review-date">${dateStr}</span>
            </div>
            <div class="rating-stars" style="margin-bottom:8px; font-size:0.82rem;">
              ${starIcons}
            </div>
            ${commentHTML}
          </div>
        `;
      }).join('');
    } else {
      reviewsListHTML = `
        <div style="text-align:center; padding: 24px 0; color:var(--text-muted);">
          <i class="far fa-comments" style="font-size:2rem; margin-bottom:12px; display:block;"></i>
          No feedback reviews written yet
        </div>
      `;
    }

    // 7. Reviews header
    let reviewsHeaderHTML = '';
    if (totalReviews > 0) {
      const headerStarIcons = Array.from({ length: 5 }).map((_, i) => `<i class="${i < avgStars ? 'fas' : 'far'} fa-star"></i>`).join('');
      reviewsHeaderHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="rating-stars" style="font-size:1.15rem;">
            ${headerStarIcons}
          </div>
          <span style="font-weight:700; font-size:1.1rem; color:var(--text);">${avgRating} out of 5</span>
          <span style="color:var(--text-sub); font-size:0.88rem;">(${totalReviews} reviews)</span>
        </div>
      `;
    } else {
      reviewsHeaderHTML = `<span style="color:var(--text-sub); font-size:0.88rem;">No reviews yet. Be the first to share!</span>`;
    }

    let html = `
      <!-- Back Navigation Bar -->
      <div class="pd-back-bar">
        <div class="container">
          <button class="pd-back-btn" id="pd-back-btn">
            <i class="fas fa-chevron-left"></i>
            <span>Back</span>
          </button>
          <nav class="pd-breadcrumb">
            <a href="/">Home</a>
            <i class="fas fa-chevron-right"></i>
            <a href="/products">Products</a>
            <i class="fas fa-chevron-right"></i>
            <span>${escapeHTML(product.title)}</span>
          </nav>
        </div>
      </div>

      <!-- Main Product Layout -->
      <div class="pd-page">
        <div class="container">
          <div class="pd-main-grid">

            <!-- LEFT: Image Gallery -->
            <div class="pd-gallery-col">
              <div class="pd-gallery animate-slide-left">
                <!-- Vertical Thumbnails -->
                <div class="pd-thumbs-col">
                  ${thumbsHTML}
                </div>

                <!-- Main Image -->
                <div class="pd-main-img-box">
                  <img id="pd-main-img" src="${mainImage}" alt="${product.title}">
                </div>
              </div>
            </div>

            <!-- RIGHT: Product Info Panel -->
            <div class="pd-info-col">
              <div class="pd-info-sticky animate-slide-right">
                <!-- Category -->
                <span class="pd-category">${product.categories ? product.categories.name : 'Supplement'}</span>

                <!-- Title -->
                <h1 class="pd-title">${product.title}</h1>

                <!-- Brand Sold by -->
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <p class="pd-brand">Brand: <strong>${escapeHTML(product.brand || (globalSettings ? globalSettings.brand_name : 'Top Muscle Nutrition'))}</strong></p>
                  ${reviewsStarsHTML}
                </div>

                <!-- Divider -->
                <div class="pd-divider"></div>

                <!-- Price display panel -->
                <div class="pd-price-wrap" id="pd-price-display">
                  <!-- Injected dynamically -->
                </div>

                <!-- Size / Weight Selection Chips -->
                ${variantsHTML}

                <!-- Divider -->
                <div class="pd-divider" style="margin-top: 8px;"></div>

                <!-- Short Description -->
                ${product.short_description ? `
                  <p class="pd-short-desc">${product.short_description}</p>
                ` : ''}

                <!-- Availability badge -->
                <div class="pd-availability">
                  <i class="fas fa-check-circle"></i>
                  <span>In Stock</span>
                </div>

                <!-- Trust badges -->
                <div class="pd-trust-badges">
                  <div class="pd-trust-badge">
                    <i class="fas fa-shield-alt"></i>
                    <span>100% Genuine</span>
                  </div>
                  <div class="pd-trust-badge">
                    <i class="fas fa-leaf"></i>
                    <span>FSSAI Certified</span>
                  </div>
                  <div class="pd-trust-badge">
                    <i class="fas fa-truck"></i>
                    <span>Fast Delivery</span>
                  </div>
                </div>

                <!-- Divider -->
                <div class="pd-divider"></div>

                <!-- WhatsApp Order Button & Share Button -->
                ${product.whatsapp_enabled ? `
                  <div class="pd-action-buttons-group" style="display: flex; gap: 12px; margin-top: 16px; margin-bottom: 8px;">
                    <a href="#" target="_blank" rel="noopener" class="pd-wa-btn" id="pd-whatsapp-order-btn" style="flex: 1; margin: 0; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                      <i class="fab fa-whatsapp"></i>
                      Order via WhatsApp
                    </a>
                    <button class="pd-share-icon-btn" id="pd-share-btn" type="button" aria-label="Share product">
                      <i class="fas fa-share-nodes"></i>
                    </button>
                  </div>
                  <p class="pd-wa-note">Chat with us to confirm price & availability</p>
                ` : `
                  <div class="pd-disabled-order">
                    <i class="fas fa-clock"></i>
                    <span>Ordering temporarily unavailable for this product</span>
                  </div>
                `}

                <!-- Verify authenticity link -->
                <a href="/verify" class="pd-verify-link">
                  <i class="fas fa-qrcode"></i> Authenticate product
                </a>
              </div>
            </div>
          </div>

          <!-- ABOUT SECTION -->
          ${aboutHTML}

          <!-- FAQ ACCORDION -->
          <div class="pd-about-block animate-on-scroll" style="margin-top: 28px;">
            <h3 class="pd-about-block-title">
              <i class="fas fa-question-circle"></i> Frequently Asked Questions
            </h3>
            <div class="faq-accordion">
              <div class="faq-item">
                <button class="faq-trigger">
                  <span>How do I verify if my product is 100% authentic?</span>
                  <span class="faq-icon-toggle"></span>
                </button>
                <div class="faq-content">
                  <div class="faq-body">
                    Every Top Muscle Nutrition product comes with a unique security verification code printed on the packaging. Simply navigate to the "Authenticate Product" tab on our website, enter your code, and click "Authenticate Product" to check its legitimacy instantly.
                  </div>
                </div>
              </div>
              <div class="faq-item">
                <button class="faq-trigger">
                  <span>How does ordering via WhatsApp work?</span>
                  <span class="faq-icon-toggle"></span>
                </button>
                <div class="faq-content">
                  <div class="faq-body">
                    When you click "Order via WhatsApp", a pre-filled chat message is automatically created specifying the product you are interested in. Once you send this message, our team will get in touch with you immediately to confirm the final price, shipping costs, and payment options.
                  </div>
                </div>
              </div>
              <div class="faq-item">
                <button class="faq-trigger">
                  <span>Are your products FSSAI certified and safe to consume?</span>
                  <span class="faq-icon-toggle"></span>
                </button>
                <div class="faq-content">
                  <div class="faq-body">
                    Yes! All our products are FSSAI certified and sourced from certified manufacturers. We guarantee that every supplement is completely free of banned substances and safe for standard athletic consumption.
                  </div>
                </div>
              </div>
              <div class="faq-item">
                <button class="faq-trigger">
                  <span>What is your return and exchange policy?</span>
                  <span class="faq-icon-toggle"></span>
                </button>
                <div class="faq-content">
                  <div class="faq-body">
                    We offer a 100% money-back guarantee or exchange on any unopened, sealed supplement jar within 7 days of purchase. Please contact support via email or WhatsApp if you wish to initiate a return.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RELATED PRODUCTS -->
          ${relatedHTML}

          <!-- REVIEWS CONTAINER -->
          <div class="pd-reviews-container animate-on-scroll">
            <div class="pd-reviews-header">
              <h3 class="pd-reviews-title">Customer Reviews</h3>
              ${reviewsHeaderHTML}
            </div>

            <div class="pd-reviews-grid">
              <!-- Reviews List -->
              <div class="reviews-list">
                ${reviewsListHTML}
              </div>

              <!-- Write a Review Form -->
              <div class="review-form-card">
                <h4 class="review-form-title">Write a Customer Review</h4>
                <div class="verify-input-group" style="text-align: left;">
                  <div class="rating-selector-wrap">
                    <span class="rating-label">Overall Rating:</span>
                    <div class="rating-stars clickable" id="rating-star-select" style="font-size:1.3rem;">
                      <i class="fas fa-star" data-value="1"></i>
                      <i class="fas fa-star" data-value="2"></i>
                      <i class="fas fa-star" data-value="3"></i>
                      <i class="fas fa-star" data-value="4"></i>
                      <i class="fas fa-star" data-value="5"></i>
                    </div>
                    <input type="hidden" id="review-rating-val" value="5">
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="review-name">Your Full Name</label>
                    <input type="text" id="review-name" class="form-input" placeholder="e.g. John Doe">
                  </div>

                  <div class="form-group" style="margin-top: 12px;">
                    <label class="form-label" for="review-comment">Written Review Feedback</label>
                    <textarea id="review-comment" class="form-input" style="height:100px; resize:none;" placeholder="Tell others about your recovery experience with this product..."></textarea>
                  </div>

                  <button class="btn btn-primary" id="submit-review-btn" style="margin-top: 20px; width: 100%;">
                    Submit Feedback Review
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>


    `;

    appContent.innerHTML = html;

    // Update WhatsApp link text globally based on selected variant and flavor
    function updateWhatsAppLinks(variant, flavor) {
      const sizeStr = variant && variant.weight ? ` (Size: ${variant.weight})` : '';
      const flavorStr = flavor ? ` (Flavor: ${flavor})` : '';
      const priceVal = variant ? (variant.offer_price || variant.price) : null;
      const priceStr = priceVal ? ` for *₹${priceVal.toLocaleString('en-IN')}*` : '';
      const waMessage = `Hello! I'm interested in ordering:\n\n*${product.title}*${sizeStr}${flavorStr}${priceStr}\n\nPlease confirm availability. Thank you!`;
      const cleanedNumber = (globalSettings.whatsapp_number || '').replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(waMessage)}`;
      
      const waButtons = document.querySelectorAll('.pd-wa-btn');
      waButtons.forEach(btn => btn.href = waUrl);
    }

    // Pricing and size variants dynamic update
    function updateProductPricing(variant) {
      const displayEl = document.getElementById('pd-price-display');
      if (!displayEl) return;

      let priceHTML = '';
      if (variant && variant.price) {
        const price = variant.price;
        const offerPrice = variant.offer_price;
        if (offerPrice && offerPrice < price) {
          const discount = Math.round(((price - offerPrice) / price) * 100);
          priceHTML = `
            <div style="display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; margin-bottom: 8px;">
              <span class="price-offer" style="font-size:1.85rem; font-weight:900; color:var(--primary); font-family:var(--font-heading);">₹${offerPrice.toLocaleString('en-IN')}</span>
              <span class="price-original" style="font-size:1.15rem; font-weight:500; text-decoration:line-through; color:var(--text-muted); font-family:var(--font-heading);">₹${price.toLocaleString('en-IN')}</span>
              <span class="price-discount-badge" style="font-size:0.75rem; font-weight:700; background:var(--success-bg); color:var(--success); padding:3px 8px; border-radius:var(--r-xs); font-family:var(--font-heading); text-transform:uppercase;">Save ${discount}%</span>
            </div>
          `;
        } else {
          priceHTML = `
            <div style="display:flex; align-items:baseline; margin-bottom: 8px;">
              <span class="price-offer" style="font-size:1.85rem; font-weight:900; color:var(--text); font-family:var(--font-heading);">₹${price.toLocaleString('en-IN')}</span>
            </div>
          `;
        }
      } else {
        priceHTML = `<span style="font-size:1.1rem; font-weight:700; color:var(--text-sub); display:block; margin-bottom: 8px;">Price on Request</span>`;
      }

      displayEl.style.opacity = '0';
      setTimeout(() => {
        displayEl.innerHTML = priceHTML;
        displayEl.style.opacity = '1';
        displayEl.style.transition = 'opacity 0.2s ease';
      }, 50);

      updateWhatsAppLinks(variant, null);
    }

    // Initialize display values
    const initialVariant = hasVariants ? product.variants[0] : {
      weight: product.weight || 'Standard',
      price: product.price,
      offer_price: product.offer_price
    };
    updateProductPricing(initialVariant);

    // Bind size selector chips clicks
    if (hasVariants) {
      const chips = document.querySelectorAll('.pd-size-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const index = parseInt(chip.dataset.index);
          const variant = product.variants[index];
          if (variant) {
            updateProductPricing(variant);
          }
        });
      });
    }


    // Bind Back Navigation click
    document.getElementById('pd-back-btn').addEventListener('click', () => {
      window.history.back();
    });

    // Bind Share buttons
    const desktopShareBtn = document.getElementById('pd-share-btn');
    if (desktopShareBtn) {
      desktopShareBtn.addEventListener('click', () => {
        openShareModal(product);
      });
    }

    // Image Gallery Thumbnail Click handler & Lightbox Modal Setup
    const mainImgEl = document.getElementById('pd-main-img');
    document.querySelectorAll('.pd-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        mainImgEl.style.opacity = '0';
        setTimeout(() => {
          mainImgEl.src = thumb.dataset.url;
          mainImgEl.style.opacity = '1';
        }, 150);
      });
    });

    // Lightbox modal HTML definition
    const lightboxHTML = `
      <div class="pd-lightbox" id="pd-lightbox-modal">
        <button class="pd-lightbox-close" aria-label="Close Lightbox">&times;</button>
        ${images.length > 1 ? `
          <button class="pd-lightbox-arrow prev" aria-label="Previous Image"><i class="fas fa-chevron-left"></i></button>
          <button class="pd-lightbox-arrow next" aria-label="Next Image"><i class="fas fa-chevron-right"></i></button>
        ` : ''}
        <div class="pd-lightbox-content">
          <img class="pd-lightbox-img" id="pd-lightbox-img" src="" alt="Expanded product view">
        </div>
      </div>
    `;
    
    let lightboxEl = document.getElementById('pd-lightbox-modal');
    if (lightboxEl) lightboxEl.remove();
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    lightboxEl = document.getElementById('pd-lightbox-modal');
    
    let currentImgIndex = 0;

    const openLightbox = (index) => {
      currentImgIndex = index;
      const lightboxImg = document.getElementById('pd-lightbox-img');
      if (lightboxImg && images[currentImgIndex]) {
        lightboxImg.src = images[currentImgIndex].image_url;
      }
      lightboxEl.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightboxEl.classList.remove('active');
      document.body.style.overflow = '';
    };

    const navigateLightbox = (direction) => {
      if (images.length <= 1) return;
      currentImgIndex = (currentImgIndex + direction + images.length) % images.length;
      const lightboxImg = document.getElementById('pd-lightbox-img');
      if (lightboxImg) {
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
          lightboxImg.src = images[currentImgIndex].image_url;
          lightboxImg.style.opacity = '1';
        }, 100);
      }
      syncGalleryThumbnail(currentImgIndex);
    };

    const syncGalleryThumbnail = (index) => {
      const thumbs = document.querySelectorAll('.pd-thumb');
      if (thumbs[index]) {
        thumbs.forEach(t => t.classList.remove('active'));
        thumbs[index].classList.add('active');
        if (mainImgEl) mainImgEl.src = thumbs[index].dataset.url;
      }
    };

    if (mainImgEl) {
      mainImgEl.style.cursor = 'zoom-in';
      mainImgEl.addEventListener('click', () => {
        const activeThumb = document.querySelector('.pd-thumb.active');
        let index = 0;
        if (activeThumb) {
          const thumbs = Array.from(document.querySelectorAll('.pd-thumb'));
          index = thumbs.indexOf(activeThumb);
          if (index === -1) index = 0;
        }
        openLightbox(index);
      });
    }

    lightboxEl.querySelector('.pd-lightbox-close').addEventListener('click', closeLightbox);
    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl || e.target.classList.contains('pd-lightbox-content')) {
        closeLightbox();
      }
    });

    const prevBtn = lightboxEl.querySelector('.pd-lightbox-arrow.prev');
    const nextBtn = lightboxEl.querySelector('.pd-lightbox-arrow.next');
    if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));

    const handleLightboxKeys = (e) => {
      if (!lightboxEl.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') navigateLightbox(-1);
      else if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    
    if (window.currentLightboxKeyHandler) {
      window.removeEventListener('keydown', window.currentLightboxKeyHandler);
    }
    window.currentLightboxKeyHandler = handleLightboxKeys;
    window.addEventListener('keydown', handleLightboxKeys);

    // FAQ Accordion interaction
    document.querySelectorAll('.faq-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.faq-item');
        const content = item.querySelector('.faq-content');
        const isActive = item.classList.contains('active');
        
        // Collapse all items
        document.querySelectorAll('.faq-item').forEach(i => {
          i.classList.remove('active');
          const c = i.querySelector('.faq-content');
          if (c) c.style.maxHeight = '0';
        });
        
        if (!isActive) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });

    // Star rating selection logic in submission form
    let selectedRating = 5;
    const starContainer = document.getElementById('rating-star-select');
    const ratingInput = document.getElementById('review-rating-val');
    
    if (starContainer) {
      const stars = starContainer.querySelectorAll('i');
      
      const updateStars = (val) => {
        stars.forEach((star, index) => {
          if (index < val) {
            star.className = 'fas fa-star';
          } else {
            star.className = 'far fa-star';
          }
        });
        ratingInput.value = val;
        selectedRating = val;
      };

      stars.forEach(star => {
        star.addEventListener('click', () => {
          const val = parseInt(star.dataset.value);
          updateStars(val);
        });
      });
    }

    // Submit review logic
    const submitReviewBtn = document.getElementById('submit-review-btn');
    if (submitReviewBtn) {
      submitReviewBtn.addEventListener('click', async () => {
        const nameInput = document.getElementById('review-name');
        const commentInput = document.getElementById('review-comment');
        
        const reviewer_name = nameInput.value.trim();
        const comment = commentInput.value.trim();
        const rating = parseInt(ratingInput.value);

        if (!reviewer_name) {
          showToast('Please enter your name', 'error');
          return;
        }

        showLoader();
        try {
          await db.saveReview({
            product_id: product.id,
            reviewer_name,
            rating,
            comment: comment || null,
            approved: false
          });

          showToast('Review submitted successfully! It will be visible once approved by the administrator.', 'success');
          renderProductDetails(params);
        } catch (err) {
          console.error('Failed to submit review:', err);
          showToast('Failed to submit review', 'error');
        } finally {
          hideLoader();
        }
      });
    }

    // Animate About section on scroll using IntersectionObserver
    const aboutSection = document.getElementById('pd-about');
    if (aboutSection) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(aboutSection);

      document.querySelectorAll('.pd-about-block').forEach((block, i) => {
        block.style.transitionDelay = `${i * 0.08}s`;
        const blockObserver = new IntersectionObserver(entries => {
          entries.forEach(e => { if (e.isIntersecting) { block.classList.add('visible'); blockObserver.unobserve(block); } });
        }, { threshold: 0.1 });
        blockObserver.observe(block);
      });
    }


    // Initialize scroll animations for other animated elements
    initScrollAnimations();

  } catch (error) {
    console.error('Product details load failed:', error);
    showToast('Failed to load product details', 'error');
  } finally {
    hideLoader();
  }
}


// 4. VERIFICATION VIEW (Verify Authentic Product)
function renderProductVerification() {
  const sliderSettings = globalSettings.slider_settings || {};
  let bannerHTML = '';
  if (sliderSettings.auth_banner_show && sliderSettings.auth_banner_image_url) {
    bannerHTML = `
      <div class="auth-banner-container" style="width: 100%; margin-bottom: 32px;">
        <a href="${sliderSettings.auth_banner_link || '#'}" style="display:block; overflow:hidden; border-radius:var(--r-md); box-shadow:var(--shadow-sm); transition:transform 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <img src="${sliderSettings.auth_banner_image_url}" alt="Authenticate Product Banner" style="width:100%; height:auto; object-fit:cover; display:block; border-radius:var(--r-md);" loading="lazy" decoding="async">
        </a>
      </div>
    `;
  }

  appContent.innerHTML = `
    <section class="section">
      <div class="container verify-wrapper" style="max-width: 720px; margin: 40px auto; padding: 0 var(--pad-mobile);">
        ${bannerHTML}
        <div class="verify-card animate-scale" style="max-width: 560px; margin: 0 auto;">
          <div class="category-icon-box" style="margin: 0 auto; color: var(--primary);">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h2>Authenticate Product</h2>
          <p>Protect your health. Verify if your product is genuine by entering the unique security code found on the packaging.</p>
          
          <div class="verify-input-group">
            <input type="text" id="verification-code" class="verify-input" maxlength="20" placeholder="ENTER CODE HERE" aria-label="Product verification code">
            <button id="verify-code-btn" class="btn btn-primary">
              <i class="fas fa-check-circle"></i> Authenticate Product
            </button>
          </div>
          
          <!-- Results Container -->
          <div id="verification-result-box" class="result-box">
            <!-- Results populated here -->
          </div>
        </div>
      </div>
    </section>
  `;

  // Initialize scroll animations
  initScrollAnimations();

  const inputEl = document.getElementById('verification-code');
  const verifyBtn = document.getElementById('verify-code-btn');
  const resultBox = document.getElementById('verification-result-box');

  verifyBtn.addEventListener('click', async () => {
    const code = inputEl.value.trim();
    if (!code) {
      showToast('Please enter a product code', 'error');
      return;
    }

    showLoader();
    resultBox.style.display = 'none';

    try {
      const result = await db.verifyProductCode(code);
      
      if (result.verified) {
        // Formatting dates
        const mfgDate = result.manufacturing_date ? new Date(result.manufacturing_date).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'}) : 'N/A';
        const expDate = result.expiry_date ? new Date(result.expiry_date).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'}) : 'N/A';
        
        resultBox.className = 'result-box success';
        resultBox.innerHTML = `
          <div class="result-success-header">
            <i class="fas fa-check-circle"></i>
            <span>Verified Genuine Product</span>
          </div>
          <div class="result-details-grid">
            <img class="result-prod-img" src="${result.product_image || 'https://via.placeholder.com/100?text=No+Image'}" alt="${result.product_name}">
            <div class="result-info">
              <div class="result-name">${result.product_name}</div>
              <div class="result-meta-row">
                <span class="result-label">MFG Date:</span>
                <span class="result-val">${mfgDate}</span>
              </div>
              <div class="result-meta-row">
                <span class="result-label">Expiry Date:</span>
                <span class="result-val">${expDate}</span>
              </div>
              <div class="result-meta-row">
                <span class="result-label">Status:</span>
                <span class="result-status-badge">${(result.status || 'active').toUpperCase()}</span>
              </div>
            </div>
          </div>
        `;
      } else {
        resultBox.className = 'result-box error';
        resultBox.innerHTML = `
          <i class="fas fa-times-circle" style="font-size:1.5rem; margin-bottom:8px;"></i>
          <div><strong>Verification Failed</strong></div>
          <div style="font-size:0.9rem; margin-top:4px;">The code entered is invalid or does not exist in our systems. Please check the digits and try again or contact support.</div>
        `;
      }
      
      resultBox.style.display = 'block';

    } catch (err) {
      console.error('Verification error:', err);
      showToast('Error verifying product code', 'error');
    } finally {
      hideLoader();
    }
  });

  // Support pressing enter inside input
  inputEl.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      verifyBtn.click();
    }
  });
}

// 5. CUSTOM 404 VIEW
async function render404() {
  appContent.innerHTML = `
    <section class="section" style="padding: 100px 0; text-align: center;">
      <div class="container verify-wrapper" style="max-width: 500px; margin: 0 auto;">
        <div class="verify-card" style="background: var(--white); border: 1px solid var(--border-color); border-radius: var(--r-lg); padding: 48px 32px; box-shadow: var(--shadow-sm);">
          <div class="category-icon-box" style="margin: 0 auto 24px auto; width: 80px; height: 80px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h2 style="font-family: var(--font-heading); font-weight: 800; font-size: 2rem; color: var(--text); margin-bottom: 12px;">404 - Page Not Found</h2>
          <p style="color: var(--text-sub); font-size: 0.95rem; line-height: 1.6; margin-bottom: 32px;">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
          <div style="display: flex; gap: 16px; justify-content: center;">
            <a href="/" class="btn btn-primary" style="margin: 0;"><i class="fas fa-home"></i> Back to Home</a>
            <a href="/products" class="btn btn-outline" style="margin: 0;"><i class="fas fa-boxes"></i> Browse Products</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

// 6. CATEGORIES VIEW
async function renderCategories() {
  showLoader();
  try {
    const categories = await db.fetchCategories();
    let categoriesHTML = '';
    
    const getCategoryIcon = (name) => {
      const n = (name || '').toLowerCase();
      if (n.includes('whey') || n.includes('protein')) return 'flask';
      if (n.includes('gainer') || n.includes('mass')) return 'dumbbell';
      if (n.includes('creatine')) return 'bolt';
      if (n.includes('pre') || n.includes('workout')) return 'fire';
      if (n.includes('bcaa') || n.includes('amino')) return 'glass-water';
      if (n.includes('vitamin') || n.includes('mineral') || n.includes('multivitamin') || n.includes('capsule')) return 'capsules';
      if (n.includes('fat') || n.includes('burner') || n.includes('loss')) return 'fire';
      if (n.includes('bar')) return 'cookie-bite';
      if (n.includes('accessory') || n.includes('accessories') || n.includes('shaker')) return 'award';
      return 'dumbbell';
    };

    if (categories && categories.length > 0) {
      categoriesHTML = categories.map((cat, i) => {
        const iconName = getCategoryIcon(cat.name);
        const hasImage = !!cat.image_url;
        return `
          <div class="category-card animate-on-scroll delay-${(i % 4) + 1}" data-category-id="${cat.id}" style="cursor: pointer; background: var(--white); border: 1px solid var(--border-color); border-radius: var(--r-md); padding: 32px 24px; text-align: center; transition: all var(--t) var(--ease); box-shadow: var(--shadow-xs);">
            <div class="category-icon-box" style="margin: 0 auto 16px auto; width: 64px; height: 64px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; transition: all var(--t) var(--ease); overflow: hidden;">
              ${hasImage ? `
                <img src="${escapeHTML(cat.image_url)}" alt="${escapeHTML(cat.name)}" style="width: 100%; height: 100%; object-fit: cover;">
              ` : `
                <i class="fas fa-${iconName}"></i>
              `}
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">${escapeHTML(cat.name)}</h3>
            <p style="font-size: 0.82rem; color: var(--text-sub); margin-bottom: 0;">Explore premium quality ${escapeHTML(cat.name).toLowerCase()} supplements</p>
          </div>
        `;
      }).join('');
    } else {
      categoriesHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-sub);">No categories found.</div>';
    }

    appContent.innerHTML = `
      <section class="section">
        <div class="container">
          <div style="margin-bottom: 24px;" class="animate-on-scroll">
            <button class="pd-back-btn" onclick="window.history.back();"><i class="fas fa-arrow-left"></i> Back</button>
          </div>
          
          <div class="section-header animate-on-scroll">
            <span class="section-badge">Categories</span>
            <h2 class="section-title">Shop by Category</h2>
            <p class="section-subtitle">Find the right supplements tailored to your workouts and recovery goals.</p>
          </div>
          
          <div class="categories-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; margin-top: 32px;">
            ${categoriesHTML}
          </div>
        </div>
      </section>
    `;

    // Bind category click handlers
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        activeCategoryFilter = card.dataset.categoryId;
        activeBrandFilter = null;
        router.navigate('/products');
      });
    });

    initScrollAnimations();
  } catch (error) {
    console.error('Failed to render categories:', error);
    showToast('Failed to load categories', 'error');
  } finally {
    hideLoader();
  }
}

// 7. ABOUT VIEW
async function renderAbout() {
  appContent.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-header animate-on-scroll">
          <span class="section-badge">About Us</span>
          <h2 class="section-title">Top Muscle Nutrition</h2>
          <p class="section-subtitle">Empowering your fitness journey with authentic, high-quality supplements.</p>
        </div>

        <div class="responsive-grid-2 animate-on-scroll" style="margin-top: 48px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; margin-bottom: 16px; color: var(--text);">Our Quality Promise</h3>
            <p style="color: var(--text-sub); line-height: 1.6; margin-bottom: 16px;">
              At Top Muscle Nutrition, we believe that fitness is a lifetime commitment. That's why we source our products only from FSSAI-certified, trusted global brands to guarantee 100% authenticity.
            </p>
            <p style="color: var(--text-sub); line-height: 1.6; margin-bottom: 24px;">
              Each product sold via our platform comes with a unique, tamper-proof security authentication code that you can verify instantly online.
            </p>
            <div style="display: flex; gap: 16px;">
              <a href="/verify" class="btn btn-primary"><i class="fas fa-qrcode"></i> Authenticate a Product</a>
              <a href="/products" class="btn btn-outline">Browse Catalogue</a>
            </div>
          </div>
          <div style="border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--shadow-md);">
            <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop" alt="Gym training" style="width:100%; display:block; object-fit:cover;">
          </div>
        </div>
      </div>
    </section>
  `;
  initScrollAnimations();
}

// 7b. PRIVACY POLICY VIEW
async function renderPrivacyPolicy() {
  appContent.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 800px;">
        <div class="section-header animate-on-scroll" style="text-align:center;">
          <span class="section-badge">Privacy</span>
          <h2 class="section-title">Privacy Policy</h2>
          <p class="section-subtitle">Your privacy is important to us. Learn how we handle your data.</p>
        </div>
        <div class="animate-on-scroll" style="color: var(--text-sub); line-height: 1.6; display: flex; flex-direction: column; gap: 20px; margin-top: 32px;">
          <p>This Privacy Policy outlines how Top Muscle Nutrition collects, uses, and protects your information when you browse our catalog or place orders via WhatsApp.</p>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: var(--text); margin-top: 10px;">1. Information We Collect</h3>
          <p>We do not run direct checkouts on our site. When you contact us or place an order via WhatsApp, we receive your phone number and any delivery address or payment details you provide to fulfill the purchase.</p>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: var(--text); margin-top: 10px;">2. How We Use Your Information</h3>
          <p>Your details are solely used to coordinate shipments, process payments, and verify product authenticity. We never sell your personal information or share it with third parties, except logistics partners for delivery.</p>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: var(--text); margin-top: 10px;">3. Data Security</h3>
          <p>We use industry-standard measures to safeguard your communications and transaction records. If you have any concerns about your personal data, feel free to contact us anytime.</p>
        </div>
      </div>
    </section>
  `;
  initScrollAnimations();
}

// 7c. TERMS & CONDITIONS VIEW
async function renderTerms() {
  appContent.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 800px;">
        <div class="section-header animate-on-scroll" style="text-align:center;">
          <span class="section-badge">Terms</span>
          <h2 class="section-title">Terms & Conditions</h2>
          <p class="section-subtitle">Read the rules and guidelines governing our store and catalog.</p>
        </div>
        <div class="animate-on-scroll" style="color: var(--text-sub); line-height: 1.6; display: flex; flex-direction: column; gap: 20px; margin-top: 32px;">
          <p>Welcome to Top Muscle Nutrition. By accessing our catalog or utilizing our authentication system, you agree to these Terms & Conditions.</p>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: var(--text); margin-top: 10px;">1. Catalog & Availability</h3>
          <p>All products listed in our catalog are subject to availability. Prices and details are indicative and can be confirmed prior to shipment via WhatsApp communication.</p>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: var(--text); margin-top: 10px;">2. Authenticity Codes</h3>
          <p>Our unique authentication verification system is designed to check the genuineness of our products. Tampers, modifications, or reuse of unique codes are strictly prohibited and will invalidate product verification checks.</p>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: var(--text); margin-top: 10px;">3. Order Finalization</h3>
          <p>Orders are verified, calculated, and finalized directly with our agents over WhatsApp. Payments are handled via secure payment channels or Cash on Delivery (COD) as confirmed during chat.</p>
        </div>
      </div>
    </section>
  `;
  initScrollAnimations();
}


// 8. CART VIEW
async function renderCart() {
  showLoader();
  try {
    const allProducts = await db.fetchProducts();
    const wishlistIds = getWishlist();
    const wishlistedProducts = allProducts.filter(p => wishlistIds.includes(p.id));

    let wishlistHTML = '';
    if (wishlistedProducts.length > 0) {
      wishlistHTML = `
        <div class="products-grid" style="margin-top: 24px;">
          ${wishlistedProducts.map((prod, i) => renderProductCard(prod, i)).join('')}
        </div>
      `;
    } else {
      wishlistHTML = `
        <div style="text-align: center; padding: 48px 24px; background: var(--gray-50); border-radius: var(--r-md); border: 1px dashed var(--border-color); margin-top: 24px;">
          <i class="far fa-heart" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
          <h4>Your wishlist is currently empty</h4>
          <p style="color: var(--text-sub); margin-bottom: 24px;">Add items to your wishlist to keep track of products you want to buy.</p>
          <a href="/products" class="btn btn-primary"><i class="fas fa-shopping-bag"></i> Browse Products</a>
        </div>
      `;
    }

    appContent.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-badge">My Cart</span>
            <h2 class="section-title">WhatsApp Shopping Cart</h2>
            <p class="section-subtitle">How it works: Add products to your wishlist, and click "Order via WhatsApp" on the product detail page to buy.</p>
          </div>
          
          <div style="margin-top: 32px;">
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700;">My Wishlisted Items</h3>
            ${wishlistHTML}
          </div>
        </div>
      </section>
    `;

    initScrollAnimations();
  } catch (error) {
    console.error('Failed to render cart:', error);
    showToast('Failed to load cart items', 'error');
  } finally {
    hideLoader();
  }
}

// 9. ACCOUNT VIEW
async function renderAccount() {
  showLoader();
  try {
    const allProducts = await db.fetchProducts();
    const wishlistIds = getWishlist();
    const wishlistedProducts = allProducts.filter(p => wishlistIds.includes(p.id));

    let wishlistHTML = '';
    if (wishlistedProducts.length > 0) {
      wishlistHTML = `
        <div class="products-grid" style="margin-top: 24px;">
          ${wishlistedProducts.map((prod, i) => renderProductCard(prod, i)).join('')}
        </div>
      `;
    } else {
      wishlistHTML = `
        <div style="text-align: center; padding: 32px 24px; background: var(--gray-50); border-radius: var(--r-md); border: 1px dashed var(--border-color); margin-top: 24px;">
          <i class="far fa-heart" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 12px;"></i>
          <h5 style="margin-bottom:8px;">No wishlisted products yet</h5>
          <a href="/products" class="btn btn-primary btn-sm"><i class="fas fa-shopping-bag"></i> Browse Products</a>
        </div>
      `;
    }

    appContent.innerHTML = `
      <section class="section">
        <div class="container" style="max-width: 960px;">
          <div class="section-header animate-on-scroll">
            <span class="section-badge">My Account</span>
            <h2 class="section-title">Customer Dashboard</h2>
            <p class="section-subtitle">Manage your profile, wishlist, and product authentications.</p>
          </div>

          <div class="account-layout-grid animate-on-scroll">
            <!-- Left Profile Card -->
            <div style="background: var(--white); border: 1px solid var(--border-color); border-radius: var(--r-md); padding: 32px 24px; text-align: center; height: fit-content;">
              <div style="width: 96px; height: 96px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 16px auto;">
                <i class="fas fa-user"></i>
              </div>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; margin-bottom: 4px;">Fitness Enthusiast</h3>
              <p style="color: var(--text-sub); font-size: 0.85rem; margin-bottom: 24px;">Welcome back to Top Muscle Nutrition</p>
              
              <div style="text-align: left; border-top: 1px solid var(--border-color); padding-top: 20px; display: flex; flex-direction: column; gap: 12px;">
                <a href="/cart" class="nav-link" style="display: flex; align-items: center; gap: 10px; color: var(--text); text-decoration: none; font-size: 0.9rem; font-weight: 600;"><i class="fas fa-shopping-cart" style="color: var(--primary); width: 20px;"></i> My Cart & Wishlist</a>
                <a href="/verify" class="nav-link" style="display: flex; align-items: center; gap: 10px; color: var(--text); text-decoration: none; font-size: 0.9rem; font-weight: 600;"><i class="fas fa-qrcode" style="color: var(--primary); width: 20px;"></i> Verify Product Code</a>
                <a href="/admin" class="nav-link" style="display: flex; align-items: center; gap: 10px; color: var(--text); text-decoration: none; font-size: 0.9rem; font-weight: 600;"><i class="fas fa-lock" style="color: var(--primary); width: 20px;"></i> Admin Dashboard</a>
              </div>
            </div>

            <!-- Right Content -->
            <div>
              <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; margin-bottom: 8px;">My Wishlist</h3>
              <p style="color: var(--text-sub); font-size: 0.9rem; margin-bottom: 24px;">Quickly browse and order items you've saved.</p>
              ${wishlistHTML}
            </div>
          </div>
        </div>
      </section>
    `;

    initScrollAnimations();
  } catch (error) {
    console.error('Failed to render account:', error);
    showToast('Failed to load profile details', 'error');
  } finally {
    hideLoader();
  }
}

// Start app
init();
