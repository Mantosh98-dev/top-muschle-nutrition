import { router } from './router.js';
import * as db from './db.js';
import { isSupabaseConfigured, saveSupabaseConfig, clientReady } from './supabase-client.js';

export const DEFAULT_SLIDER_SETTINGS = {
  enabled: true,
  auto_slide: true,
  interval: 5,
  pause_on_hover: true,
  pause_on_click: true,
  infinite_loop: true,
  layout: {
    card_width: "100%",
    card_height: "580px",
    border_radius: "16px",
    gap: "0px",
    content_alignment: "left",
    overlay_opacity: 0.3
  },
  cards: [
    {
      id: "card-1",
      image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
      title: "Pure Whey Protein",
      subtitle: "Fast Recovery & Muscle Growth",
      description: "Fuel your muscles with 25g of high-quality whey protein isolate per serving.",
      btn_text: "Shop Protein",
      btn_url: "/products",
      bg_overlay: "#000000",
      text_color: "#ffffff",
      cta_visible: true,
      hidden: false
    },
    {
      id: "card-2",
      image_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
      title: "Micronized Creatine",
      subtitle: "Explosive Power & Strength",
      description: "Increase high-intensity exercise performance and build explosive muscle strength.",
      btn_text: "Shop Creatine",
      btn_url: "/products",
      bg_overlay: "#000000",
      text_color: "#ffffff",
      cta_visible: true,
      hidden: false
    },
    {
      id: "card-3",
      image_url: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=600&auto=format&fit=crop",
      title: "Essential BCAAs",
      subtitle: "Intra-Workout Recovery",
      description: "Reduce muscle soreness, speed up recovery, and prevent workout fatigue.",
      btn_text: "Shop BCAAs",
      btn_url: "/products",
      bg_overlay: "#000000",
      text_color: "#ffffff",
      cta_visible: true,
      hidden: false
    },
    {
      id: "card-4",
      image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
      title: "Premium Pre-Workout",
      subtitle: "High Energy & Intense Focus",
      description: "Elevate your training with skin-splitting pumps, clean energy, and laser focus.",
      btn_text: "Shop Pre-Workout",
      btn_url: "/products",
      bg_overlay: "#000000",
      text_color: "#ffffff",
      cta_visible: true,
      hidden: false
    },
    {
      id: "card-5",
      image_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
      title: "Daily Multi-Vitamins",
      subtitle: "Active Health & Immunity",
      description: "Complete spectrum of essential vitamins and minerals for active health.",
      btn_text: "Shop Health",
      btn_url: "/products",
      bg_overlay: "#000000",
      text_color: "#ffffff",
      cta_visible: true,
      hidden: false
    },
    {
      id: "card-6",
      image_url: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=600&auto=format&fit=crop",
      title: "Isotonic Hydration Drink",
      subtitle: "Rehydrate & Replenish",
      description: "Instant energy and electrolyte replenishment to keep you performing at your peak.",
      btn_text: "Shop Energy",
      btn_url: "/products",
      bg_overlay: "#000000",
      text_color: "#ffffff",
      cta_visible: true,
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
    // Merge layout and cards to make sure all sub-fields exist
    merged.slider_settings = {
      ...DEFAULT_SLIDER_SETTINGS,
      ...merged.slider_settings,
      layout: {
        ...DEFAULT_SLIDER_SETTINGS.layout,
        ...(merged.slider_settings.layout || {})
      },
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
          activeCategoryFilter = cat.id;
          router.navigate(`/products`);

          mobileMenuBtn.classList.remove('active');
          navMenu.classList.remove('active');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');

          const submenu = document.getElementById('nav-products-dropdown');
          const toggleIcon = document.querySelector('.dropdown-toggle-btn i');
          if (submenu) submenu.classList.remove('active');
          if (toggleIcon) {
            toggleIcon.className = 'fas fa-plus';
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
          activeCategoryFilter = null;
          router.navigate('/products');

          mobileMenuBtn.classList.remove('active');
          navMenu.classList.remove('active');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');

          const submenu = document.getElementById('nav-products-dropdown');
          const toggleIcon = document.querySelector('.dropdown-toggle-btn i');
          if (submenu) submenu.classList.remove('active');
          if (toggleIcon) {
            toggleIcon.className = 'fas fa-plus';
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
  // Mobile Burger Menu Toggle
  mobileMenuBtn.addEventListener('click', () => {
    const isActive = mobileMenuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    mobileMenuBtn.setAttribute('aria-expanded', isActive);
  });

  // Close mobile menu when links are clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      navMenu.classList.remove('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Shrink header on scroll
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

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
        icon.className = isActive ? 'fas fa-minus' : 'fas fa-plus';
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
    if (settings.announcement_show && settings.announcement_text) {
      annText.textContent = settings.announcement_text;
      annBar.style.backgroundColor = settings.announcement_bg_color || settings.primary_color;
      annBar.style.color = settings.announcement_text_color || '#ffffff';
      annBar.style.display = 'block';
    } else {
      annBar.style.display = 'none';
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

  const layout = sliderSettings.layout || {};
  const gap = layout.gap || '24px';
  const width = layout.card_width || '340px';
  const height = layout.card_height || '460px';
  const borderRadius = layout.border_radius || '16px';
  const alignment = layout.content_alignment || 'center';
  const opacity = layout.overlay_opacity !== undefined ? layout.overlay_opacity : 0.4;

  const flexAlignmentMap = {
    'left': 'flex-start',
    'center': 'center',
    'right': 'flex-end'
  };
  const textAlignmentMap = {
    'left': 'left',
    'center': 'center',
    'right': 'right'
  };

  const flexAlign = flexAlignmentMap[alignment] || 'center';
  const textAlign = textAlignmentMap[alignment] || 'center';

  return `
    <section class="hero-slider-section" id="hero-slider-section" style="--slider-card-width: ${width}; --slider-card-height: ${height}; --slider-card-gap: ${gap}; --slider-card-radius: ${borderRadius};">
      <div class="slider-viewport">
        <div class="slider-track">
          ${activeCards.map((card, idx) => {
            const overlayColor = card.bg_overlay || '#000000';
            const textColor = card.text_color || '#ffffff';
            const showCTA = card.cta_visible !== false;

            return `
              <div class="hero-slider-card ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                <!-- Background Image -->
                <img src="${card.image_url}" alt="${escapeHTML(card.title)}" class="slider-card-img" loading="${idx < 3 ? 'eager' : 'lazy'}">
                <!-- Overlay -->
                <div class="card-overlay" style="background:${overlayColor}; opacity:${opacity};"></div>
                
                <!-- Card Content -->
                <div class="card-content" style="align-items:${flexAlign}; text-align:${textAlign}; color:${textColor};">
                  ${card.subtitle ? `<span class="card-subtitle">${escapeHTML(card.subtitle)}</span>` : ''}
                  <h2 class="card-title">${escapeHTML(card.title)}</h2>
                  ${card.description ? `<p class="card-desc">${escapeHTML(card.description)}</p>` : ''}
                  ${showCTA && card.btn_text ? `
                    <div style="margin-top:8px;">
                      <a href="${card.btn_url || '#'}" class="btn btn-primary slider-card-cta-btn">${escapeHTML(card.btn_text)} <i class="fas fa-arrow-right"></i></a>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- Navigation Arrows -->
        <button class="slider-arrow prev-btn" aria-label="Previous slide"><i class="fas fa-chevron-left"></i></button>
        <button class="slider-arrow next-btn" aria-label="Next slide"><i class="fas fa-chevron-right"></i></button>
        
        <!-- Pagination Dots -->
        <div class="slider-dots">
          ${activeCards.map((_, idx) => `<span class="slider-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('')}
        </div>
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
  const intervalTime = (sliderSettings.interval || 5) * 1000;
  const pauseOnHover = sliderSettings.pause_on_hover !== false;
  const pauseOnClick = sliderSettings.pause_on_click !== false;
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
  let isHovered = false;
  let isClicked = false;
  let clickTimeout = null;

  // Pointer dragging variables
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;
  let dragStartTime = 0;

  // Parse card width & gap dynamically
  const getCardWidth = () => cards[0].offsetWidth;
  const getGap = () => {
    const gapStyle = window.getComputedStyle(track).gap;
    return parseInt(gapStyle) || 0;
  };

  // Center active card calculation
  const updateSliderPosition = (useTransition = true) => {
    if (useTransition) {
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    } else {
      track.style.transition = 'none';
    }

    const cardWidth = getCardWidth();
    const gap = getGap();
    const viewportWidth = viewport.offsetWidth;
    const centerOffset = (viewportWidth - cardWidth) / 2;

    const offset = -currentIndex * (cardWidth + gap) + centerOffset;
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

  // Auto slide management
  const startAutoSlide = () => {
    if (!autoSlide) return;
    stopAutoSlide();
    slideInterval = setInterval(() => {
      if (!isHovered && !isClicked && !isDragging) {
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

  // Pause on Click helper
  const triggerClickPause = () => {
    if (!pauseOnClick) return;
    isClicked = true;
    if (clickTimeout) clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      isClicked = false;
      startAutoSlide();
    }, 5000); // Resume auto-slide after 5s idle period
  };

  // Event Listeners for Nav Arrows
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex - 1);
      triggerClickPause();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex + 1);
      triggerClickPause();
    });
  }

  // Event Listeners for Dots
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(dot.dataset.index);
      goToSlide(index);
      triggerClickPause();
    });
  });

  // Pause on Hover
  if (pauseOnHover) {
    viewport.addEventListener('mouseenter', () => {
      isHovered = true;
    });
    viewport.addEventListener('mouseleave', () => {
      isHovered = false;
    });
  }

  // Click card to focus
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If clicked the CTA button inside the card, allow it to route/go to URL
      if (e.target.closest('.slider-card-cta-btn')) {
        return;
      }
      const index = parseInt(card.dataset.index);
      goToSlide(index);
      triggerClickPause();
    });
  });

  // Drag / Swipe Gestures using pointer events
  const dragStart = (e) => {
    isDragging = true;
    dragStartTime = Date.now();
    startX = e.clientX;
    stopAutoSlide();
    track.style.transition = 'none';
    viewport.style.cursor = 'grabbing';
  };

  const dragMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diffX = currentX - startX;
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

    // Thresholds: scroll if swiped > 80px or swiped fast (> 40px in < 300ms)
    const threshold = 80;
    const fastSwipeThreshold = 40;

    if (diffX < -threshold || (diffX < -fastSwipeThreshold && dragDuration < 300)) {
      goToSlide(currentIndex + 1);
    } else if (diffX > threshold || (diffX > fastSwipeThreshold && dragDuration < 300)) {
      goToSlide(currentIndex - 1);
    } else {
      updateSliderPosition(); // Snap back
    }

    triggerClickPause();
  };

  track.addEventListener('pointerdown', dragStart);
  track.addEventListener('pointermove', dragMove);
  track.addEventListener('pointerup', dragEnd);
  track.addEventListener('pointercancel', dragEnd);

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
    
    // Set up Hero Background
    let heroBgStyle = '';
    if (globalSettings.hero_bg_type === 'image' && globalSettings.hero_bg_image_url) {
      heroBgStyle = `background: linear-gradient(135deg, rgba(20, 20, 22, 0.75), rgba(20, 20, 22, 0.9)), url('${globalSettings.hero_bg_image_url}') center/cover no-repeat;`;
    } else {
      heroBgStyle = `background: ${globalSettings.hero_bg_gradient};`;
    }

    const showBadge1 = globalSettings.hero_badge_1_text !== null && globalSettings.hero_badge_1_text !== '';
    const showBadge2 = globalSettings.hero_badge_2_text !== null && globalSettings.hero_badge_2_text !== '';

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

    const heroImages = Array.isArray(globalSettings.hero_product_images) && globalSettings.hero_product_images.length > 0
      ? globalSettings.hero_product_images
      : [globalSettings.hero_product_image_url || '/hero_product.png'];

    let html = '';

    // 1. New Hero Slider at the top
    html += renderHeroSlider(globalSettings);

    // Promotional Banner Section
    if (globalSettings.promo_banner_show && globalSettings.promo_banner_image_url) {
      html += `
        <section class="section promo-banner-section" style="padding: 30px 0; background: var(--gray-50); border-bottom: 1px solid var(--border-color);">
          <div class="container">
            <a href="${globalSettings.promo_banner_link || '/products'}" style="display:block; overflow:hidden; border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); transition:transform 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
              <img src="${globalSettings.promo_banner_image_url}" alt="Promotional Banner" style="width:100%; height:auto; object-fit:cover; display:block;">
            </a>
          </div>
        </section>
      `;
    }

    // Video Section 1 (after Hero)
    html += renderVideoSection(
      1, 
      globalSettings.video1_show, 
      globalSettings.video1_title, 
      globalSettings.video1_desc, 
      globalSettings.video1_type, 
      globalSettings.video1_mp4_url, 
      globalSettings.video1_youtube_url
    );

    // Categories Preview
    if (categories.length > 0) {
      const categoryIcons = ['capsules', 'dumbbell', 'bolt', 'glass-water', 'apple-alt', 'flask', 'fire', 'heartbeat'];
      html += `
        <section class="section">
          <div class="container">
            <div class="section-header animate-on-scroll">
              <span class="section-badge">Categories</span>
              <h2 class="section-title">Explore by Goal</h2>
              <p class="section-subtitle">Find premium supplements tailored to your health and workout milestones.</p>
            </div>
            
            <div class="category-preview-grid">
              ${categories.map((cat, i) => `
                <div class="category-card animate-on-scroll delay-${i + 1}" data-category-id="${cat.id}">
                  <div class="category-icon-box">
                    ${cat.image_url ? `
                      <img src="${cat.image_url}" alt="${cat.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--r-lg);">
                    ` : `
                      <i class="fas fa-${categoryIcons[i % categoryIcons.length]}"></i>
                    `}
                  </div>
                  <h3 class="category-name">${cat.name}</h3>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    }

    // Featured Products
    html += `
      <section class="section section-bg">
        <div class="container">
          <div class="section-header animate-on-scroll">
            <span class="section-badge">Premium Pick</span>
            <h2 class="section-title">Featured Products</h2>
            <p class="section-subtitle">Discover our highly-rated, gold-standard nutrition products.</p>
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
          ${featuredProducts.length > 0 ? `
            <div style="text-align: center; margin-top: 48px;" class="animate-on-scroll">
              <a href="/products" class="btn btn-outline">View All Products <i class="fas fa-arrow-right" style="font-size: 0.8rem; margin-left: 4px;"></i></a>
            </div>
          ` : ''}
        </div>
      </section>
    `;

    // Video Section 2 (after Featured Products)
    html += renderVideoSection(
      2, 
      globalSettings.video2_show, 
      globalSettings.video2_title, 
      globalSettings.video2_desc, 
      globalSettings.video2_type, 
      globalSettings.video2_mp4_url, 
      globalSettings.video2_youtube_url
    );

    // Top Products
    if (globalSettings.show_top_products) {
      html += `
        <section class="section">
          <div class="container">
            <div class="section-header animate-on-scroll">
              <span class="section-badge">Top Quality</span>
              <h2 class="section-title">Our Top Products</h2>
              <p class="section-subtitle">Handpicked highest quality recovery supplements.</p>
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

    // Best Sellers
    if (globalSettings.show_best_sellers) {
      html += `
        <section class="section section-bg">
          <div class="container">
            <div class="section-header animate-on-scroll">
              <span class="section-badge">Best Demand</span>
              <h2 class="section-title">Best Sellers</h2>
              <p class="section-subtitle">Our most popular and highly recommended recovery products.</p>
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

    // Trending Products
    if (globalSettings.show_trending_products) {
      html += `
        <section class="section">
          <div class="container">
            <div class="section-header animate-on-scroll">
              <span class="section-badge">On Fire</span>
              <h2 class="section-title">Trending Products</h2>
              <p class="section-subtitle">What athletes are currently talking about and buying.</p>
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

    // CTA Banner Section
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

    // 11. Relocated old Hero Section (moved above Contact & Support)
    html += `
      <section class="hero semi-footer" style="${heroBgStyle}">
        <div class="hero-overlay"></div>
        <div class="container">
          <div class="hero-content">
            <span class="hero-eyebrow">Premium Nutrition · Trusted Quality</span>
            <h1 class="hero-title">${globalSettings.hero_title}</h1>
            <p class="hero-description">${globalSettings.hero_description}</p>
            <div class="hero-buttons">
              <a href="/products" class="btn btn-primary">Shop Products <i class="fas fa-arrow-right" style="font-size:0.8rem;"></i></a>
              <a href="/verify" class="btn btn-secondary">Verify Product</a>
            </div>
            <div class="hero-stats">
              <div class="hero-stat">
                <span class="hero-stat-value">100%</span>
                <span class="hero-stat-label">Genuine Products</span>
              </div>
              <div class="hero-stat">
                <span class="hero-stat-value">FSSAI</span>
                <span class="hero-stat-label">Certified</span>
              </div>
              <div class="hero-stat">
                <span class="hero-stat-value">24/7</span>
                <span class="hero-stat-label">WhatsApp Support</span>
              </div>
            </div>
          </div>
          <div class="hero-graphic animate-scale">
            <div class="hero-glow-sphere"></div>
            <div class="hero-product-images-container">
              ${heroImages.map((imgUrl, idx) => `
                <img src="${imgUrl}" alt="Premium Supplement Jar ${idx + 1}" class="hero-product-image ${idx === 0 ? 'active' : ''}" ${idx === 0 ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async">
              `).join('')}
            </div>
            <div class="floating-badge badge-1" style="${showBadge1 ? '' : 'display: none;'}">
              <i class="${globalSettings.hero_badge_1_icon || 'fas fa-shield-halved'}"></i>
              <span>${globalSettings.hero_badge_1_text || '100% Genuine'}</span>
            </div>
            <div class="floating-badge badge-2" style="${showBadge2 ? '' : 'display: none;'}">
              <i class="${globalSettings.hero_badge_2_icon || 'fas fa-certificate'}"></i>
              <span>${globalSettings.hero_badge_2_text || 'FSSAI Certified'}</span>
            </div>
          </div>
        </div>
      </section>
    `;

    // Contact Section
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
            
            <div class="contact-map animate-slide-right">
              ${globalSettings.google_map_iframe ? globalSettings.google_map_iframe : `
                <div style="width:100%; height:100%; background:var(--gray-50); display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center; padding: 24px;">
                  <i class="fas fa-map-marked-alt" style="font-size:3rem; color:var(--text-muted); margin-bottom:12px;"></i>
                  <h4>Map Location</h4>
                  <p style="color:var(--text-sub);">Configure Google Maps iframe in the Admin Panel to show location map.</p>
                </div>
              `}
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
    const activeCategoryName = activeCategory ? activeCategory.name : 'All Categories';

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
    const matchesSearch = !productSearchQuery || prod.title.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
                          (prod.short_description && prod.short_description.toLowerCase().includes(productSearchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
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
    <div class="product-card animate-on-scroll ${delayClass}" onclick="if(!event.target.closest('.btn-card-buy, .wishlist-btn')) router.navigate('/product/${prod.slug}');">
      <button class="wishlist-btn ${activeClass}" aria-label="Add to Wishlist" onclick="event.stopPropagation(); window.handleWishlistToggleClick(this, '${prod.id}');">
        <i class="${heartClass} fa-heart"></i>
      </button>
      ${prod.featured ? '<span class="product-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
      <div class="product-img-wrap">
        <img src="${mainImage}" alt="${prod.title}" loading="lazy" decoding="async" width="300" height="300">
        <div class="veg-badge"><span class="veg-dot"></span></div>
      </div>
      <div class="product-info">
        <span class="product-category">${prod.categories ? prod.categories.name : 'Uncategorized'}</span>
        <h3 class="product-title">${prod.title}</h3>
        <span class="product-brand" style="font-size:0.75rem; color:var(--text-sub); display:block; font-weight:600; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.02em;">Brand: ${escapeHTML(prod.brand || (globalSettings ? globalSettings.brand_name : 'Top Muscle Nutrition'))}</span>
        ${ratingHTML}
        <p class="product-desc-weight">${prod.weight ? escapeHTML(prod.weight) : (hasVariants && prod.variants[0].weight ? escapeHTML(prod.variants[0].weight) : 'Standard Size')}</p>
        ${priceHTML}
        <div class="product-actions-row">
          <a href="/product/${prod.slug}" class="btn btn-card-details">VIEW DETAILS</a>
          <a href="${cardWaUrl}" target="_blank" rel="noopener" class="btn btn-card-buy" onclick="event.stopPropagation();">BUY NOW</a>
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

                <!-- WhatsApp Order Button -->
                ${product.whatsapp_enabled ? `
                  <a href="#" target="_blank" rel="noopener" class="pd-wa-btn" id="pd-whatsapp-order-btn">
                    <i class="fab fa-whatsapp"></i>
                    Order via WhatsApp
                  </a>
                  <p class="pd-wa-note">Chat with us to confirm price & availability</p>
                ` : `
                  <div class="pd-disabled-order">
                    <i class="fas fa-clock"></i>
                    <span>Ordering temporarily unavailable for this product</span>
                  </div>
                `}

                <!-- Verify authenticity link -->
                <a href="/verify" class="pd-verify-link">
                  <i class="fas fa-qrcode"></i> Verify product
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
                    Every Top Muscle Nutrition product comes with a unique security verification code printed on the packaging. Simply navigate to the "Verify Product" tab on our website, enter your code, and click "Verify Product" to check its legitimacy instantly.
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

      <!-- Mobile Floating Buy Bar -->
      ${product.whatsapp_enabled ? `
        <div class="pd-mobile-buy-bar">
          <a href="#" target="_blank" rel="noopener" class="pd-wa-btn">
            <i class="fab fa-whatsapp"></i>
            Order via WhatsApp
          </a>
        </div>
      ` : ''}
    `;

    appContent.innerHTML = html;

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

      // Update WhatsApp link text
      const waButtons = document.querySelectorAll('.pd-wa-btn');
      if (waButtons.length > 0) {
        const sizeStr = variant && variant.weight ? ` (Size: ${variant.weight})` : '';
        const priceStr = variant && variant.price ? ` for *₹${(variant.offer_price || variant.price).toLocaleString('en-IN')}*` : '';
        const waMessage = `Hello, I would like to order: ${product.title} (Code: ${product.slug})${sizeStr}${priceStr}`;
        const cleanedNumber = (globalSettings.whatsapp_number || '').replace(/[^0-9]/g, '');
        const waUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(waMessage)}`;
        waButtons.forEach(btn => btn.href = waUrl);
      }
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

    // Image Gallery Thumbnail Click handler
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
  appContent.innerHTML = `
    <section class="section">
      <div class="container verify-wrapper">
        <div class="verify-card animate-scale">
          <div class="category-icon-box" style="margin: 0 auto; color: var(--primary);">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h2>Verify Product</h2>
          <p>Protect your health. Verify if your product is genuine by entering the unique security code found on the packaging.</p>
          
          <div class="verify-input-group">
            <input type="text" id="verification-code" class="verify-input" maxlength="20" placeholder="ENTER CODE HERE" aria-label="Product verification code">
            <button id="verify-code-btn" class="btn btn-primary">
              <i class="fas fa-check-circle"></i> Verify Product
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

// Start app
init();
