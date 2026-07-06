import { supabaseClient, clearSupabaseConfig } from './supabase-client.js';
import * as db from './db.js';
import { showToast, showLoader, hideLoader, applyBranding, globalSettings, mergeSettings, escapeHTML, DEFAULT_SLIDER_SETTINGS } from './app.js';
import { router } from './router.js';

let activeTab = 'dashboard';
let currentSession = null;
let currentModal = null;

// Track product form state (especially uploaded/added images list)
let tempProductImages = [];

// Entry point for admin rendering
export async function renderAdminPage(params) {
  if (!supabaseClient) {
    showToast('Supabase is not configured yet.', 'error');
    router.navigate('/');
    return;
  }

  showLoader();
  try {
    // 1. Get current auth session
    try {
      const { data } = await supabaseClient.auth.getSession();
      currentSession = data ? data.session : null;
    } catch (authError) {
      console.warn('Supabase auth session fetch failed, falling back to null session:', authError);
      currentSession = null;
    }

    if (params && params.tab) {
      activeTab = params.tab;
    }

    if (!currentSession) {
      renderLogin();
    } else {
      renderDashboard();
    }
  } catch (error) {
    console.error('Admin page failed to render:', error);
    showToast('Failed to render admin portal', 'error');
    renderLogin(); // Fallback to login form if rendering fails
  } finally {
    hideLoader();
  }
}

// 1. RENDER LOGIN FORM
function renderLogin() {
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = `
    <section class="section">
      <div class="container admin-login-wrapper">
        <div class="admin-login-card">
          <div style="text-align: center;">
            <i class="fas fa-lock" style="font-size: 2.5rem; color: var(--primary-color); margin-bottom:16px;"></i>
            <h2>Admin Portal</h2>
            <p style="color:var(--text-secondary); font-size:0.9rem;">Sign in to access dashboard controls</p>
          </div>
          
          <div class="verify-input-group" style="text-align: left;">
            <div class="form-group">
              <label class="form-label" for="admin-email">Email Address</label>
              <input type="email" id="admin-email" class="form-input" placeholder="admin@example.com">
            </div>
            
            <div class="form-group" style="margin-top: 16px;">
              <label class="form-label" for="admin-password">Password</label>
              <input type="password" id="admin-password" class="form-input" placeholder="••••••••">
            </div>
            
            <button id="admin-login-btn" class="btn btn-primary" style="margin-top: 24px; width: 100%;">
              <i class="fas fa-sign-in-alt"></i> Access Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  // Bind login actions
  const loginBtn = document.getElementById('admin-login-btn');
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');

  const executeLogin = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
      showToast('Please fill in email and password', 'error');
      return;
    }

    showLoader();
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      currentSession = data.session;
      showToast('Welcome back, Admin!', 'success');
      router.navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      hideLoader();
    }
  };

  loginBtn.addEventListener('click', executeLogin);
  passwordInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') executeLogin();
  });
}

// 2. RENDER ADMIN DASHBOARD SHELL
async function renderDashboard() {
  const appContent = document.getElementById('app-content');
  
  // Get active theme preference
  const isDarkMode = localStorage.getItem('admin-theme') === 'dark';

  // Render Sidebar and Workspace
  appContent.innerHTML = `
    <div class="admin-dashboard ${isDarkMode ? 'admin-dark-mode' : ''}">
      <!-- Sidebar Panel -->
      <aside class="admin-sidebar">
        <div class="admin-sidebar-header">
          <span class="admin-sidebar-title">Admin Portal</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="admin-theme-toggle" class="theme-toggle-btn" aria-label="Toggle Theme">
              <i class="fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}"></i>
            </button>
            <button id="admin-menu-toggle" class="admin-menu-toggle-btn" aria-label="Toggle Menu">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>
        <ul class="admin-nav-list">
          <li class="admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}">
            <button data-tab="dashboard"><i class="fas fa-chart-line"></i> Dashboard</button>
          </li>
          <li class="admin-nav-item ${activeTab === 'products' ? 'active' : ''}">
            <button data-tab="products"><i class="fas fa-boxes"></i> Products</button>
          </li>
          <li class="admin-nav-item ${activeTab === 'categories' || activeTab === 'preferences' ? 'active' : ''}">
            <button data-tab="preferences"><i class="fas fa-sliders-h"></i> Preferences</button>
          </li>
          <li class="admin-nav-item ${activeTab === 'customization' ? 'active' : ''}">
            <button data-tab="customization"><i class="fas fa-palette"></i> Website Customization</button>
          </li>
          <li class="admin-nav-item ${activeTab === 'codes' ? 'active' : ''}">
            <button data-tab="codes"><i class="fas fa-shield-halved"></i> Verification Codes</button>
          </li>
          <li class="admin-nav-item ${activeTab === 'reviews' ? 'active' : ''}">
            <button data-tab="reviews"><i class="fas fa-star"></i> Reviews</button>
          </li>
          <li class="admin-nav-item ${activeTab === 'settings' ? 'active' : ''}">
            <button data-tab="settings"><i class="fas fa-cog"></i> Settings</button>
          </li>
          <li class="admin-nav-item logout">
            <button id="admin-logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
          </li>
        </ul>
      </aside>

      <!-- Main Workspace -->
      <main class="admin-main-panel" id="admin-workspace">
        <!-- Render Active Tab content dynamically -->
      </main>
    </div>
    
    <!-- Shared Modal Container -->
    <div id="admin-modal" class="modal"></div>
  `;

  // Bind Sidebar navigation buttons
  const sidebarEl = document.querySelector('.admin-sidebar');
  document.querySelectorAll('.admin-nav-item button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab) {
        if (sidebarEl) sidebarEl.classList.remove('menu-open');
        router.navigate(`/admin/${tab}`);
      }
    });
  });

  // Bind Sidebar Menu Toggle for Mobile
  const menuToggleBtn = document.getElementById('admin-menu-toggle');
  if (menuToggleBtn && sidebarEl) {
    menuToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebarEl.classList.toggle('menu-open');
    });
  }

  // Theme Toggle Button
  const themeToggleBtn = document.getElementById('admin-theme-toggle');
  const dashboardEl = document.querySelector('.admin-dashboard');

  themeToggleBtn.addEventListener('click', () => {
    const isCurrentlyDark = dashboardEl.classList.toggle('admin-dark-mode');
    localStorage.setItem('admin-theme', isCurrentlyDark ? 'dark' : 'light');
    
    // Update button icon
    const iconEl = themeToggleBtn.querySelector('i');
    if (isCurrentlyDark) {
      iconEl.className = 'fas fa-sun';
    } else {
      iconEl.className = 'fas fa-moon';
    }
  });

  // Logout button
  document.getElementById('admin-logout-btn').addEventListener('click', async () => {
    showLoader();
    try {
      try {
        await supabaseClient.auth.signOut();
      } catch (signOutError) {
        console.warn('Supabase signOut call failed/ignored:', signOutError);
      }
      
      // Clear manual tokens as well to be absolutely sure the session is wiped out
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      }
      
      currentSession = null;
      activeTab = 'dashboard';
      showToast('Logged out successfully', 'success');
      
      if (window.location.pathname === '/admin') {
        await renderAdminPage();
      } else {
        router.navigate('/admin');
      }
    } catch (err) {
      console.error('Logout handler crash:', err);
      showToast('Logout failed', 'error');
    } finally {
      hideLoader();
    }
  });

  // Render workspace content based on the active tab
  renderActiveWorkspaceTab();
}

// 3. WORKSPACE TAB CONTROLLER
async function renderActiveWorkspaceTab() {
  const workspace = document.getElementById('admin-workspace');
  if (!workspace) return;

  // Renders a banner if Supabase keys are in local storage instead of config.js file
  const credentialsBanner = !localStorage.getItem('SUPABASE_URL') ? '' : `
    <div class="admin-credentials-banner">
      <div>
        <i class="fas fa-exclamation-triangle"></i>
        <span><strong>Development Mode:</strong> Supabase credentials are loaded from browser local storage. Copy them into <code>js/config.js</code> for production deployments.</span>
      </div>
      <button id="clear-local-keys-btn" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; border-color: #d97706; color: #d97706;">Clear Local Storage Keys</button>
    </div>
  `;

  showLoader();
  try {
    switch (activeTab) {
      case 'dashboard':
        await renderTabDashboard(workspace, credentialsBanner);
        break;
      case 'products':
        await renderTabProducts(workspace);
        break;
      case 'categories':
      case 'preferences':
        await renderTabPreferences(workspace);
        break;
      case 'codes':
        await renderTabCodes(workspace);
        break;
      case 'reviews':
        await renderTabReviews(workspace);
        break;
      case 'settings':
        await renderTabSettings(workspace);
        break;
      case 'customization':
        await renderTabCustomization(workspace);
        break;

      default:
        workspace.innerHTML = '<h3>View Not Found</h3>';
    }

    // Bind local storage clear helper
    const clearKeysBtn = document.getElementById('clear-local-keys-btn');
    if (clearKeysBtn) {
      clearKeysBtn.addEventListener('click', () => {
        clearSupabaseConfig();
        showToast('Credentials cleared. Reloading...', 'info');
        setTimeout(() => window.location.reload(), 1000);
      });
    }

  } catch (error) {
    console.error(`Render tab ${activeTab} failed:`, error);
    showToast(`Failed to load tab data`, 'error');
    if (workspace) {
      workspace.innerHTML = `
        <div style="padding: 24px; color: #dc2626; background: #fef2f2; border: 1px solid #fee2e2; border-radius: var(--radius-md); margin-top: 20px;">
          <h3 style="margin-top: 0; font-size: 1.1rem; font-weight: 700;"><i class="fas fa-exclamation-circle"></i> Error Loading Tab: ${escapeHTML(error.message)}</h3>
          <pre style="margin: 12px 0 0 0; padding: 12px; background: rgba(0,0,0,0.04); border-radius: var(--radius-sm); font-family: monospace; font-size: 0.85rem; overflow-x: auto; white-space: pre-wrap; word-break: break-all;">${escapeHTML(error.stack)}</pre>
        </div>
      `;
    }
  } finally {
    hideLoader();
  }
}

// ==========================================
// TAB 1: DASHBOARD STATS
// ==========================================
async function renderTabDashboard(workspace, banner) {
  const [products, categories, codes] = await Promise.all([
    db.fetchProducts(),
    db.fetchCategories(),
    db.fetchAuthCodes()
  ]);

  const featuredCount = products.filter(p => p.featured).length;

  workspace.innerHTML = `
    ${banner}
    
    <div class="admin-header-row">
      <div class="admin-title-desc">
        <h2 class="admin-title">Dashboard Overview</h2>
        <span class="admin-subtitle">Current metrics and status summary</span>
      </div>
    </div>
    
    <div class="admin-stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-boxes"></i></div>
        <div class="stat-info">
          <span class="stat-val">${products.length}</span>
          <span class="stat-lbl">Total Products</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-tags"></i></div>
        <div class="stat-info">
          <span class="stat-val">${categories.length}</span>
          <span class="stat-lbl">Categories</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-star"></i></div>
        <div class="stat-info">
          <span class="stat-val">${featuredCount}</span>
          <span class="stat-lbl">Featured Products</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-shield-alt"></i></div>
        <div class="stat-info">
          <span class="stat-val">${codes.length}</span>
          <span class="stat-lbl">Auth Codes</span>
        </div>
      </div>
    </div>
    
    <div style="background:var(--card-bg); border:1px solid var(--border-color); padding:32px; border-radius:var(--radius-md);">
      <h3 style="margin-bottom:12px;">Quick Operations Panel</h3>
      <p style="color:var(--text-secondary); margin-bottom:20px; font-size:0.95rem;">Select tabs on the sidebar or click buttons below to quickly create new assets or update branding.</p>
      
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <button class="btn btn-primary" id="dash-add-product-btn"><i class="fas fa-plus"></i> Add Product</button>
        <button class="btn btn-secondary" id="dash-gen-code-btn"><i class="fas fa-plus-shield"></i> Generate Product Codes</button>
        <button class="btn btn-dark" id="dash-edit-settings-btn"><i class="fas fa-sliders-h"></i> Customise Branding</button>
      </div>
    </div>
  `;

  document.getElementById('dash-add-product-btn').addEventListener('click', () => {
    activeTab = 'products';
    router.navigate('/admin/products');
    setTimeout(() => openProductModal(), 100);
  });
  document.getElementById('dash-gen-code-btn').addEventListener('click', () => {
    activeTab = 'codes';
    router.navigate('/admin/codes');
    setTimeout(() => openCodeModal(), 100);
  });
  document.getElementById('dash-edit-settings-btn').addEventListener('click', () => {
    activeTab = 'settings';
    router.navigate('/admin/settings');
  });
}

// ==========================================
// TAB 2: PRODUCTS MANAGEMENT
// ==========================================
async function renderTabProducts(workspace) {
  const products = await db.fetchProducts();

  // Helper to build tbody HTML
  function buildTableRows(filteredProducts) {
    if (filteredProducts.length === 0) {
      return `
        <tr>
          <td colspan="6" style="text-align:center; padding: 48px 0; color:var(--text-secondary);">
            <i class="fas fa-box-open" style="font-size:2.5rem; margin-bottom:12px; color:var(--text-muted);"></i>
            <p>No products listing matches your search query.</p>
          </td>
        </tr>
      `;
    }
    return filteredProducts.map(prod => {
      const firstImg = prod.product_images && prod.product_images.length > 0
        ? prod.product_images[0].image_url
        : 'https://via.placeholder.com/50?text=No+Img';
      
      let badges = [];
      if (prod.featured) badges.push('<span style="color:#d97706; font-size:0.75rem; font-weight:700; white-space:nowrap;"><i class="fas fa-star"></i> Featured</span>');
      if (prod.top_product) badges.push('<span style="color:#3b82f6; font-size:0.75rem; font-weight:700; white-space:nowrap;"><i class="fas fa-trophy"></i> Top</span>');
      if (prod.best_seller) badges.push('<span style="color:#ec4899; font-size:0.75rem; font-weight:700; white-space:nowrap;"><i class="fas fa-crown"></i> Best Seller</span>');
      if (prod.trending) badges.push('<span style="color:#ef4444; font-size:0.75rem; font-weight:700; white-space:nowrap;"><i class="fas fa-fire"></i> Trending</span>');
      const badgesHTML = badges.length > 0 ? badges.join('<br>') : '<span style="color:var(--text-muted); font-size:0.75rem;">None</span>';

      return `
        <tr>
          <td><img src="${firstImg}" style="width:40px; height:40px; object-fit:contain; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff;"></td>
          <td>
            <strong>${escapeHTML(prod.title)}</strong>
            ${prod.brand ? `<br><small style="color:var(--text-muted); font-weight:600;">Brand: ${escapeHTML(prod.brand)}</small>` : ''}
            <br><small style="color:var(--text-muted);">${escapeHTML(prod.slug)}</small>
          </td>
          <td>${prod.categories ? escapeHTML(prod.categories.name) : '<span style="color:var(--text-muted);">Uncategorized</span>'}</td>
          <td>${badgesHTML}</td>
          <td>${prod.whatsapp_enabled ? '<span style="color:#10b981;"><i class="fab fa-whatsapp"></i> Enabled</span>' : '<span style="color:var(--text-muted);">Disabled</span>'}</td>
          <td>
            <div class="cell-actions">
              <button class="btn-icon btn-edit edit-product-btn" data-id="${prod.id}" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="btn-icon btn-delete delete-product-btn" data-id="${prod.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Bind the container HTML
  workspace.innerHTML = `
    <div class="admin-header-row">
      <div class="admin-title-desc">
        <h2 class="admin-title">Manage Products</h2>
        <span class="admin-subtitle">Create, edit, delete, and manage product listings.</span>
      </div>
      <button class="btn btn-primary" id="admin-add-product-btn">
        <i class="fas fa-plus"></i> Add Product
      </button>
    </div>
    
    <!-- Search Bar -->
    <div style="margin-bottom: 18px; display: flex; gap: 12px; max-width: 450px; width: 100%;">
      <div style="position: relative; flex: 1;">
        <input type="text" id="admin-product-search" class="form-input" placeholder="Search by name, brand, slug, or category..." style="padding-left: 36px; margin: 0; width: 100%;">
        <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.95rem;"></i>
      </div>
    </div>
    
    <div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Badges / Visibility</th>
            <th>WhatsApp</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="admin-products-tbody">
          ${buildTableRows(products)}
        </tbody>
      </table>
    </div>
  `;

  // Helper to bind action listeners to dynamically rendered table rows
  function bindRowListeners() {
    // Bind edit buttons
    workspace.querySelectorAll('.edit-product-btn').forEach(btn => {
      btn.addEventListener('click', () => openProductModal(btn.dataset.id));
    });

    // Bind delete buttons
    workspace.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const confirmDelete = confirm('Are you sure you want to delete this product? All image and verification links associated will be removed.');
        if (confirmDelete) {
          showLoader();
          try {
            await db.deleteProduct(btn.dataset.id);
            showToast('Product deleted successfully', 'success');
            renderActiveWorkspaceTab();
          } catch (err) {
            showToast('Failed to delete product', 'error');
          } finally {
            hideLoader();
          }
        }
      });
    });
  }

  // Bind add button
  document.getElementById('admin-add-product-btn').addEventListener('click', () => openProductModal());

  // Initial bindings
  bindRowListeners();

  // Search input change handler
  const searchInput = document.getElementById('admin-product-search');
  const tbody = document.getElementById('admin-products-tbody');
  
  if (searchInput && tbody) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = products.filter(prod => {
        const titleMatch = prod.title && prod.title.toLowerCase().includes(query);
        const brandMatch = prod.brand && prod.brand.toLowerCase().includes(query);
        const slugMatch = prod.slug && prod.slug.toLowerCase().includes(query);
        const catName = prod.categories && prod.categories.name;
        const catMatch = catName && catName.toLowerCase().includes(query);
        return titleMatch || brandMatch || slugMatch || catMatch;
      });
      tbody.innerHTML = buildTableRows(filtered);
      bindRowListeners();
    });
  }
}

// 2a. PRODUCT ADD/EDIT MODAL
async function openProductModal(productId = null) {
  const modal = document.getElementById('admin-modal');
  
  showLoader();
  let categories = [];
  let weightSizes = [];
  let product = {
    title: '', slug: '', category_id: '',
    short_description: '', long_description: '',
    benefits: '', ingredients: '', nutrition: '',
    usage: '', warnings: '',
    featured: false, whatsapp_enabled: true,
    top_product: false, best_seller: false, trending: false,
    price: '', offer_price: '', weight: '', variants: [],
    product_type: 'gym', brand: ''
  };
  
  tempProductImages = [];
  let tempProductVariants = [];
  
  try {
    const [fetchedCats, fetchedSettings] = await Promise.all([
      db.fetchCategories(),
      db.fetchSettings()
    ]);
    categories = fetchedCats;
    const settings = mergeSettings(fetchedSettings);
    const rawWeightSizes = settings.weight_sizes || '500 g, 1 kg, 2 kg, 5 kg';
    weightSizes = rawWeightSizes.split(',').map(s => s.trim()).filter(Boolean);
    
    if (productId) {
      product = await db.fetchProductById(productId);
      if (!product.product_type) product.product_type = 'gym';
      tempProductImages = (product.product_images || []).map(img => img.image_url);
      tempProductVariants = (Array.isArray(product.variants) && product.variants.length > 1) ? [...product.variants] : [];
    }
  } catch (err) {
    showToast('Failed to initialize product editor', 'error');
    hideLoader();
    return;
  } finally {
    hideLoader();
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 800px;">
      <div class="modal-header">
        <h3 class="modal-title">${productId ? 'Modify Product Details' : 'Add New Product'}</h3>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <!-- Two Column Form -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
          
          <!-- Column Left: General Settings -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div class="form-group">
              <label class="form-label" for="prod-title">Product Title *</label>
              <input type="text" id="prod-title" class="form-input" required value="${escapeHTML(product.title)}">
            </div>
            
            <div class="form-group">
              <label class="form-label" for="prod-slug">Url Slug (Auto-generated if empty)</label>
              <input type="text" id="prod-slug" class="form-input" placeholder="e.g. gold-whey-protein" value="${escapeHTML(product.slug)}">
            </div>
            
            <div class="form-group">
              <label class="form-label" for="prod-category">Category</label>
              <select id="prod-category" class="form-input">
                <option value="">-- Choose Category --</option>
                ${categories.map(cat => `
                  <option value="${cat.id}" ${product.category_id === cat.id ? 'selected' : ''}>${escapeHTML(cat.name)}</option>
                `).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="prod-brand">Product Brand Name</label>
              <input type="text" id="prod-brand" class="form-input" placeholder="e.g. Optimum Nutrition (Defaults if empty)" value="${escapeHTML(product.brand || '')}">
            </div>
            
            <div class="form-group">
              <label class="form-label" for="prod-short-desc">Short Summary Description</label>
              <textarea id="prod-short-desc" class="form-input" style="height:80px; resize:none;">${escapeHTML(product.short_description || '')}</textarea>
            </div>

            <div class="form-group" style="margin-top: 4px;">
              <label class="form-label" style="display:block; margin-bottom:8px; font-weight:600;">Product Type & Unit System</label>
              <div style="display:flex; gap:20px; align-items:center;">
                <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-size:0.88rem; font-weight:500;">
                  <input type="radio" name="prod-type" value="gym" ${product.product_type !== 'medicine' ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
                  <span>Gym/Supplement (kg, g)</span>
                </label>
                <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-size:0.88rem; font-weight:500;">
                  <input type="radio" name="prod-type" value="medicine" ${product.product_type === 'medicine' ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
                  <span>Medicine (mg, mmg, tablets)</span>
                </label>
              </div>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:12px; margin-top: 10px;">
              <div style="display:flex; gap:24px; flex-wrap:wrap;">
                <label class="switch-label" for="prod-featured">
                  <input type="checkbox" id="prod-featured" class="switch-input" ${product.featured ? 'checked' : ''}>
                  <span class="switch-slider"></span>
                  <span>Featured Product</span>
                </label>
                
                <label class="switch-label" for="prod-whatsapp">
                  <input type="checkbox" id="prod-whatsapp" class="switch-input" ${product.whatsapp_enabled ? 'checked' : ''}>
                  <span class="switch-slider"></span>
                  <span>WhatsApp Order Button</span>
                </label>
              </div>
              <div style="display:flex; gap:24px; flex-wrap:wrap;">
                <label class="switch-label" for="prod-top">
                  <input type="checkbox" id="prod-top" class="switch-input" ${product.top_product ? 'checked' : ''}>
                  <span class="switch-slider"></span>
                  <span>Top Product</span>
                </label>
                
                <label class="switch-label" for="prod-best-seller">
                  <input type="checkbox" id="prod-best-seller" class="switch-input" ${product.best_seller ? 'checked' : ''}>
                  <span class="switch-slider"></span>
                  <span>Best Seller</span>
                </label>
                
                <label class="switch-label" for="prod-trending">
                  <input type="checkbox" id="prod-trending" class="switch-input" ${product.trending ? 'checked' : ''}>
                  <span class="switch-slider"></span>
                  <span>Trending Product</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Column Right: Technical Attributes -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div class="form-group">
              <label class="form-label" for="prod-long-desc">Detailed Long Description</label>
              <textarea id="prod-long-desc" class="form-input" style="height:60px;">${escapeHTML(product.long_description || '')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="prod-benefits">Key Benefits</label>
              <textarea id="prod-benefits" class="form-input" style="height:60px;" placeholder="List key advantages...">${escapeHTML(product.benefits || '')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="prod-ingredients">Ingredients</label>
              <textarea id="prod-ingredients" class="form-input" style="height:60px;">${escapeHTML(product.ingredients || '')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="prod-nutrition">Nutrition Facts</label>
              <textarea id="prod-nutrition" class="form-input" style="height:60px;">${escapeHTML(product.nutrition || '')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="prod-usage">Usage Instructions</label>
              <textarea id="prod-usage" class="form-input" style="height:60px;">${escapeHTML(product.usage || '')}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="prod-warnings">Safety & Warnings</label>
              <textarea id="prod-warnings" class="form-input" style="height:60px;">${escapeHTML(product.warnings || '')}</textarea>
            </div>
          </div>

        </div>
        
        <hr style="border:0; border-top:1px solid var(--border-color); margin: 16px 0;">

        <!-- Pricing & Weight Variants Section -->
        <div>
          <h4 style="font-family: var(--font-heading); font-weight:700; margin-bottom:12px; font-size:1rem; color:var(--text); border-bottom:1px solid var(--border-color); padding-bottom:6px;">Pricing & Size Options (INR)</h4>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label" for="prod-price">Base Original Price (INR ₹) *</label>
              <input type="number" id="prod-price" class="form-input" placeholder="e.g. 2999" value="${product.price || ''}">
            </div>
            <div class="form-group">
              <label class="form-label" for="prod-offer-price">Base Offer Price (INR ₹)</label>
              <input type="number" id="prod-offer-price" class="form-input" placeholder="e.g. 2499" value="${product.offer_price || ''}">
            </div>
            <div class="form-group">
              <label class="form-label" for="prod-weight">Base Weight/Size</label>
              <input type="text" id="prod-weight" class="form-input" placeholder="e.g. 1 kg" value="${product.weight || ''}">
            </div>
          </div>

          <div style="background:var(--gray-50); padding:18px; border-radius:var(--r-md); border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
              <span style="font-size:0.85rem; font-weight:700; color:var(--text-sub);">Multiple Price Variants (If product has multiple weights)</span>
              <button class="btn btn-secondary" id="prod-add-variant-btn" style="padding:6px 12px; font-size:0.8rem; background:var(--white); border:1px solid var(--border); color:var(--text);"><i class="fas fa-plus"></i> Add Variant</button>
            </div>
            
            <div id="prod-variants-list" style="display:flex; flex-direction:column; gap:10px;">
              <!-- Injected variant rows -->
            </div>
          </div>
        </div>

        <hr style="border:0; border-top:1px solid var(--border-color); margin: 16px 0;">
        
        <!-- Image Gallery Management Section -->
        <div>
          <label class="form-label" style="display:block; margin-bottom:8px;">Product Image Gallery (Max 10 Images)</label>
          <div style="display:grid; grid-template-columns: 2fr 3fr; gap:20px;">
            <div>
              <div class="image-uploader-area" id="prod-image-uploader" role="button" tabindex="0" aria-label="Upload Image file">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Click to Upload File</span>
                <input type="file" id="prod-image-file-input" style="display:none;" accept="image/*">
              </div>
              <div style="margin-top:12px; text-align:center; color:var(--text-muted); font-size:0.8rem;">OR enter URL manually:</div>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <input type="text" id="prod-image-url-input" class="form-input" placeholder="https://image-link.com" aria-label="Manual Image URL">
                <button class="btn btn-dark" id="prod-image-add-url-btn" style="padding:10px 16px;" aria-label="Add URL to Gallery"><i class="fas fa-plus"></i></button>
              </div>
            </div>
            
            <div style="background:var(--gray-50); border-radius:var(--r-sm); padding:16px; border:1px solid var(--border);">
              <span style="font-size:0.85rem; font-weight:600; color:var(--text-sub); display:block; margin-bottom:12px;">Active Gallery Preview</span>
              <div class="uploaded-thumbs-grid" id="modal-gallery-preview">
                <!-- Injected thumbnails -->
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn-primary" id="modal-save-btn">Save Product</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  currentModal = modal;

  // Render variant rows and gallery previews
  renderModalGalleryPreview();
  renderModalVariants();

  // Bind product type change to refresh variants unit dropdown options
  const prodTypeRadios = modal.querySelectorAll('input[name="prod-type"]');
  prodTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      renderModalVariants();
    });
  });

  // Close bindings
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const closeModal = () => {
    modal.classList.remove('active');
    currentModal = null;
  };
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Auto-slug utility
  const titleInput = document.getElementById('prod-title');
  const slugInput = document.getElementById('prod-slug');
  titleInput.addEventListener('blur', () => {
    if (!slugInput.value.trim() && titleInput.value.trim()) {
      slugInput.value = titleInput.value.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  });

  // Variants editor row compiler
  function renderModalVariants() {
    const container = document.getElementById('prod-variants-list');
    if (!container) return;

    container.innerHTML = '';
    
    const basePriceInput = document.getElementById('prod-price');
    const baseOfferPriceInput = document.getElementById('prod-offer-price');
    const baseWeightInput = document.getElementById('prod-weight');

    // Get current product type selected in modal radio buttons
    const typeRadio = modal.querySelector('input[name="prod-type"]:checked');
    const isMedicine = typeRadio ? typeRadio.value === 'medicine' : (product.product_type === 'medicine');
    
    if (baseWeightInput) {
      baseWeightInput.placeholder = isMedicine ? 'e.g. 100 mg or 30 Tablets' : 'e.g. 1 kg';
    }

    const activeSizes = isMedicine 
      ? ['10 mg', '50 mg', '100 mg', '250 mg', '500 mg', '10 Tablets', '30 Tablets', '60 Tablets', '30 Capsules', '60 Capsules', '100 mmg']
      : weightSizes;

    if (tempProductVariants.length === 0) {
      container.innerHTML = `<span style="font-size:0.8rem; color:var(--text-muted); text-align:center; display:block; padding:8px 0; font-weight:500;">No size variants added. Base price settings will be used.</span>`;
      if (basePriceInput) basePriceInput.disabled = false;
      if (baseOfferPriceInput) baseOfferPriceInput.disabled = false;
      if (baseWeightInput) baseWeightInput.disabled = false;
      return;
    }

    // Disable base pricing inputs as they are managed via variants
    if (basePriceInput) basePriceInput.disabled = true;
    if (baseOfferPriceInput) baseOfferPriceInput.disabled = true;
    if (baseWeightInput) baseWeightInput.disabled = true;

    // Sync base inputs with the first variant
    const first = tempProductVariants[0];
    if (basePriceInput) basePriceInput.value = first.price || '';
    if (baseOfferPriceInput) baseOfferPriceInput.value = (first.offer_price !== null && first.offer_price !== undefined) ? first.offer_price : '';
    if (baseWeightInput) baseWeightInput.value = first.weight || '';

    tempProductVariants.forEach((variant, index) => {
      const row = document.createElement('div');
      row.className = 'variant-row';
      row.style = 'display:grid; grid-template-columns: 2fr 1.5fr 1.5fr 40px; gap:12px; align-items:flex-start; margin-bottom:4px;';
      
      const isStandard = activeSizes.includes(variant.weight);
      const selectValue = isStandard ? variant.weight : (variant.weight ? 'custom' : '');

      row.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:4px;">
          <select class="form-input variant-weight-select" data-index="${index}" style="padding:8px 12px; height:40px;">
            <option value="">-- Choose Size --</option>
            ${activeSizes.map(s => `
              <option value="${escapeHTML(s)}" ${selectValue === s ? 'selected' : ''}>${escapeHTML(s)}</option>
            `).join('')}
            <option value="custom" ${selectValue === 'custom' ? 'selected' : ''}>Custom size...</option>
          </select>
          <input type="text" class="form-input variant-custom-weight" data-index="${index}" placeholder="e.g. 100 mg" 
                 style="display: ${selectValue === 'custom' ? 'block' : 'none'}; margin-top: 4px; padding:6px 10px; font-size:0.82rem; height:32px;" 
                 value="${!isStandard ? escapeHTML(variant.weight || '') : ''}">
        </div>
        <div>
          <input type="number" class="form-input variant-price" data-index="${index}" placeholder="Price (INR)" style="padding:8px 12px; height:40px;" value="${variant.price || ''}">
        </div>
        <div>
          <input type="number" class="form-input variant-offer-price" data-index="${index}" placeholder="Offer Price" style="padding:8px 12px; height:40px;" value="${variant.offer_price !== null && variant.offer_price !== undefined ? variant.offer_price : ''}">
        </div>
        <div>
          <button class="btn-icon btn-delete remove-variant-btn" data-index="${index}" style="padding:8px; height:40px; display:flex; align-items:center; justify-content:center;" aria-label="Remove variant"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
      container.appendChild(row);
    });

    // Bind change events
    container.querySelectorAll('.variant-weight-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const idx = parseInt(select.dataset.index);
        const val = select.value;
        const customInput = select.nextElementSibling;
        
        let finalVal = '';
        if (val === 'custom') {
          customInput.style.display = 'block';
          finalVal = customInput.value.trim();
        } else {
          customInput.style.display = 'none';
          finalVal = val;
        }
        tempProductVariants[idx].weight = finalVal;
        if (idx === 0 && baseWeightInput) {
          baseWeightInput.value = finalVal;
        }
      });
    });

    container.querySelectorAll('.variant-custom-weight').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(input.dataset.index);
        const val = e.target.value.trim();
        tempProductVariants[idx].weight = val;
        if (idx === 0 && baseWeightInput) {
          baseWeightInput.value = val;
        }
      });
    });

    container.querySelectorAll('.variant-price').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(input.dataset.index);
        const val = e.target.value ? parseFloat(e.target.value) : '';
        tempProductVariants[idx].price = val;
        if (idx === 0 && basePriceInput) {
          basePriceInput.value = val;
        }
      });
    });

    container.querySelectorAll('.variant-offer-price').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(input.dataset.index);
        const val = e.target.value ? parseFloat(e.target.value) : null;
        tempProductVariants[idx].offer_price = val;
        if (idx === 0 && baseOfferPriceInput) {
          baseOfferPriceInput.value = val !== null ? val : '';
        }
      });
    });

    // Bind remove button
    container.querySelectorAll('.remove-variant-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        tempProductVariants.splice(idx, 1);
        renderModalVariants();
      });
    });
  }

  // Bind Add Variant Button
  document.getElementById('prod-add-variant-btn').addEventListener('click', () => {
    if (tempProductVariants.length === 0) {
      const priceVal = document.getElementById('prod-price').value.trim();
      const offerPriceVal = document.getElementById('prod-offer-price').value.trim();
      const weightVal = document.getElementById('prod-weight').value.trim();
      
      tempProductVariants.push({
        weight: weightVal || 'Standard',
        price: priceVal ? parseFloat(priceVal) : '',
        offer_price: offerPriceVal ? parseFloat(offerPriceVal) : null
      });
    }
    tempProductVariants.push({ weight: '', price: '', offer_price: null });
    renderModalVariants();
  });

  // Image Upload handler
  const fileArea = document.getElementById('prod-image-uploader');
  const fileInput = document.getElementById('prod-image-file-input');
  fileArea.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (tempProductImages.length >= 10) {
      showToast('Maximum of 10 gallery images allowed', 'error');
      return;
    }

    showLoader();
    try {
      const publicUrl = await db.uploadImage(file, 'product-images');
      tempProductImages.push(publicUrl);
      renderModalGalleryPreview();
      showToast('Image uploaded successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload image', 'error');
    } finally {
      hideLoader();
    }
  });

  // Add Image URL Manual handler
  const manualUrlInput = document.getElementById('prod-image-url-input');
  const addUrlBtn = document.getElementById('prod-image-add-url-btn');
  
  addUrlBtn.addEventListener('click', () => {
    const url = manualUrlInput.value.trim();
    if (!url) return;
    
    if (tempProductImages.length >= 10) {
      showToast('Maximum of 10 gallery images allowed', 'error');
      return;
    }

    tempProductImages.push(url);
    manualUrlInput.value = '';
    renderModalGalleryPreview();
  });

  // Save Product trigger
  const saveBtn = document.getElementById('modal-save-btn');
  saveBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    let slug = slugInput.value.trim();
    
    if (!title) {
      showToast('Product title is required', 'error');
      return;
    }
    
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Pricing & Variants Validation
    let priceVal = document.getElementById('prod-price').value.trim();
    let offerPriceVal = document.getElementById('prod-offer-price').value.trim();
    let weightVal = document.getElementById('prod-weight').value.trim();

    // Validate multiple variants if configured
    if (tempProductVariants.length > 0) {
      for (let i = 0; i < tempProductVariants.length; i++) {
        const v = tempProductVariants[i];
        if (!v.weight) {
          showToast(`Variant #${i+1} must have a weight size.`, 'error');
          return;
        }
        if (!v.price || isNaN(v.price) || parseFloat(v.price) <= 0) {
          showToast(`Variant #${i+1} must have a valid original price.`, 'error');
          return;
        }
        if (v.offer_price !== null && v.offer_price !== '' && v.offer_price !== undefined) {
          if (isNaN(v.offer_price) || parseFloat(v.offer_price) <= 0) {
            showToast(`Variant #${i+1} has an invalid offer price.`, 'error');
            return;
          }
          if (parseFloat(v.offer_price) >= parseFloat(v.price)) {
            showToast(`Variant #${i+1} offer price must be less than original price.`, 'error');
            return;
          }
        }
      }
    } else {
      // Validate simple pricing fields
      if (!priceVal || isNaN(priceVal) || parseFloat(priceVal) <= 0) {
        showToast('Base original price is required and must be greater than zero.', 'error');
        return;
      }
      if (offerPriceVal) {
        if (isNaN(offerPriceVal) || parseFloat(offerPriceVal) <= 0) {
          showToast('Base offer price must be a valid positive number.', 'error');
          return;
        }
        if (parseFloat(offerPriceVal) >= parseFloat(priceVal)) {
          showToast('Base offer price must be less than original price.', 'error');
          return;
        }
      }
    }

    // Process pricing fields
    let finalVariants = [];
    let finalPrice = null;
    let finalOfferPrice = null;
    let finalWeight = '';

    if (tempProductVariants.length > 0) {
      finalVariants = tempProductVariants.map(v => ({
        weight: v.weight,
        price: parseFloat(v.price),
        offer_price: (v.offer_price !== null && v.offer_price !== '') ? parseFloat(v.offer_price) : null
      }));
      // Sync base values from first variant
      const first = finalVariants[0];
      finalWeight = first.weight;
      finalPrice = first.price;
      finalOfferPrice = first.offer_price;
    } else {
      finalPrice = parseFloat(priceVal);
      finalOfferPrice = offerPriceVal ? parseFloat(offerPriceVal) : null;
      finalWeight = weightVal || '';
      
      // Auto populate single variant JSON
      finalVariants = [{
        weight: finalWeight || 'Standard',
        price: finalPrice,
        offer_price: finalOfferPrice
      }];
    }

    const payload = {
      title,
      slug,
      product_type: modal.querySelector('input[name="prod-type"]:checked')?.value || 'gym',
      brand: document.getElementById('prod-brand').value.trim() || 'Top Muscle Nutrition',
      category_id: document.getElementById('prod-category').value || null,
      short_description: document.getElementById('prod-short-desc').value.trim() || null,
      long_description: document.getElementById('prod-long-desc').value.trim() || null,
      benefits: document.getElementById('prod-benefits').value.trim() || null,
      ingredients: document.getElementById('prod-ingredients').value.trim() || null,
      nutrition: document.getElementById('prod-nutrition').value.trim() || null,
      usage: document.getElementById('prod-usage').value.trim() || null,
      warnings: document.getElementById('prod-warnings').value.trim() || null,
      featured: document.getElementById('prod-featured').checked,
      whatsapp_enabled: document.getElementById('prod-whatsapp').checked,
      top_product: document.getElementById('prod-top').checked,
      best_seller: document.getElementById('prod-best-seller').checked,
      trending: document.getElementById('prod-trending').checked,
      price: finalPrice,
      offer_price: finalOfferPrice,
      weight: finalWeight,
      variants: finalVariants
    };

    if (productId) {
      payload.id = productId;
    }

    showLoader();
    try {
      await db.saveProduct(payload, tempProductImages);
      showToast(productId ? 'Product updated successfully' : 'Product created successfully', 'success');
      closeModal();
      renderActiveWorkspaceTab();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save product details', 'error');
    } finally {
      hideLoader();
    }
  });
}

// Utility to render thumbnail list inside modal
function renderModalGalleryPreview() {
  const preview = document.getElementById('modal-gallery-preview');
  if (!preview) return;

  preview.innerHTML = '';
  
  if (tempProductImages.length === 0) {
    preview.innerHTML = `<span style="font-size:0.8rem; color:var(--text-muted); grid-column:1/-1;">No images in gallery yet</span>`;
    return;
  }

  tempProductImages.forEach((url, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'uploaded-thumb-box';
    thumb.innerHTML = `
      <img src="${url}" alt="Preview ${index + 1}">
      <button class="uploaded-thumb-remove" data-index="${index}">&times;</button>
    `;
    preview.appendChild(thumb);
  });

  // Bind remove events
  document.querySelectorAll('.uploaded-thumb-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      tempProductImages.splice(index, 1);
      renderModalGalleryPreview();
    });
  });
}

// ==========================================
// TAB 3: CATEGORIES MANAGEMENT
// ==========================================
// ==========================================
// TAB 3: PREFERENCES & CATEGORIES MANAGEMENT
// ==========================================
async function renderTabPreferences(workspace) {
  const [categories, fetchedSettings] = await Promise.all([
    db.fetchCategories(),
    db.fetchSettings()
  ]);
  const settings = mergeSettings(fetchedSettings);
  
  // Parse weight sizes
  const rawWeightSizes = settings.weight_sizes || '500 g, 1 kg, 2 kg, 5 kg';
  const weightSizes = rawWeightSizes.split(',').map(s => s.trim()).filter(Boolean);

  workspace.innerHTML = `
    <div class="admin-header-row">
      <div class="admin-title-desc">
        <h2 class="admin-title">Global Preferences</h2>
        <span class="admin-subtitle">Manage product categories, standard weight sizes, and currency configurations.</span>
      </div>
    </div>
    
    <div class="admin-settings-grid">
      <!-- COLUMN 1: Categories Management -->
      <div class="settings-card">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom:12px; margin-bottom:12px;">
          <h3 class="settings-section-title" style="border:none; padding:0; margin:0;">Product Categories</h3>
          <button class="btn btn-primary" id="admin-add-cat-btn" style="padding:6px 14px; font-size:0.8rem;">
            <i class="fas fa-plus"></i> Add Category
          </button>
        </div>
        
        <div class="admin-table-container" style="border:none; box-shadow:none;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${categories.length > 0 ? categories.map(cat => `
                <tr>
                  <td>
                    ${cat.image_url ? `
                      <img src="${escapeHTML(cat.image_url)}" alt="${escapeHTML(cat.name)}" style="width: 32px; height: 32px; object-fit: cover; border-radius: var(--r-xs); border: 1px solid var(--border);">
                    ` : `
                      <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--gray-50); border: 1px solid var(--border); border-radius: var(--r-xs); color: var(--text-muted); font-size: 0.75rem;">
                        <i class="fas fa-tag"></i>
                      </div>
                    `}
                  </td>
                  <td><strong>${escapeHTML(cat.name)}</strong><br><code style="font-size:0.75rem; color:var(--text-muted);">${escapeHTML(cat.slug)}</code></td>
                  <td>
                    <div class="cell-actions">
                      <button class="btn-icon btn-edit edit-cat-btn" data-id="${cat.id}" data-name="${escapeHTML(cat.name)}" data-slug="${escapeHTML(cat.slug)}" data-image-url="${escapeHTML(cat.image_url || '')}" title="Edit" style="padding:4px 6px; font-size:0.85rem;"><i class="fas fa-edit"></i></button>
                      <button class="btn-icon btn-delete delete-cat-btn" data-id="${cat.id}" title="Delete" style="padding:4px 6px; font-size:0.85rem;"><i class="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="3" style="text-align:center; padding: 24px 0; color:var(--text-secondary);">No categories found.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- COLUMN 2: Sizes / Weights & Currency -->
      <div style="display:flex; flex-direction:column; gap:24px;">
        <!-- Standard Weights Preferences Card -->
        <div class="settings-card">
          <h3 class="settings-section-title" style="padding-bottom:12px; margin-bottom:4px;">Product Sizes / Weights</h3>
          <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:16px;">
            Define standard weight/size variants (in kg/g) available when cataloging supplements.
          </p>

          <div class="pref-tags-container" id="pref-weight-tags-list" style="display:flex; flex-wrap:wrap; gap:8px; margin: 8px 0;">
            ${weightSizes.map(size => `
              <span class="pref-tag" style="display:inline-flex; align-items:center; gap:8px; background:var(--gray-50); border:1px solid var(--border); padding:6px 12px; border-radius:var(--r-full); font-size:0.85rem; font-weight:600; color:var(--text);">
                <span>${size}</span>
                <button class="remove-weight-size-btn" data-size="${size}" style="background:none; border:none; color:var(--error); cursor:pointer; font-weight:bold; font-size:1rem; padding: 0; line-height: 1; display: flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-left: 4px;" aria-label="Remove weight option">&times;</button>
              </span>
            `).join('')}
            ${weightSizes.length === 0 ? '<span style="font-size:0.85rem; color:var(--text-muted);">No sizes configured.</span>' : ''}
          </div>

          <div style="display:flex; gap:12px; align-items:center; margin-top:16px;">
            <input type="text" id="add-weight-size-input" class="form-input" style="flex:1;" placeholder="e.g. 1 kg or 500 g">
            <button class="btn btn-dark" id="add-weight-size-btn" style="padding:11px 20px;"><i class="fas fa-plus"></i> Add Size</button>
          </div>
        </div>

        <!-- Currency & Pricing Configuration Card -->
        <div class="settings-card">
          <h3 class="settings-section-title" style="padding-bottom:12px; margin-bottom:4px;">Currency Settings</h3>
          <div style="display:flex; align-items:center; gap:16px; margin-top: 8px;">
            <div style="width: 48px; height: 48px; border-radius: var(--r-md); background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: bold; flex-shrink:0;">
              ₹
            </div>
            <div>
              <h4 style="font-size:0.95rem; font-weight:700;">Indian Rupee (INR)</h4>
              <p style="color:var(--text-secondary); font-size:0.82rem; line-height: 1.4;">All catalog prices are in Indian Rupees (INR) and formatted with the ₹ currency symbol across the shop views.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Category Clicks
  document.getElementById('admin-add-cat-btn').addEventListener('click', () => openCategoryModal());

  document.querySelectorAll('.edit-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => openCategoryModal(btn.dataset.id, btn.dataset.name, btn.dataset.slug, btn.dataset.imageUrl));
  });

  document.querySelectorAll('.delete-cat-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmDelete = confirm('Are you sure you want to delete this category? Products in this category will become Uncategorized.');
      if (confirmDelete) {
        showLoader();
        try {
          await db.deleteCategory(btn.dataset.id);
          showToast('Category deleted successfully', 'success');
          renderActiveWorkspaceTab();
        } catch (err) {
          showToast('Failed to delete category', 'error');
        } finally {
          hideLoader();
        }
      }
    });
  });

  // Bind Add Weight Size Button
  const sizeInput = document.getElementById('add-weight-size-input');
  const addSizeBtn = document.getElementById('add-weight-size-btn');

  const executeAddSize = async () => {
    const newSize = sizeInput.value.trim();
    if (!newSize) {
      showToast('Please enter a weight size value (e.g. 1 kg)', 'error');
      return;
    }

    if (weightSizes.includes(newSize)) {
      showToast('This size already exists', 'error');
      return;
    }

    showLoader();
    try {
      weightSizes.push(newSize);
      const updatedSizes = weightSizes.join(', ');
      await db.updateSettings({ weight_sizes: updatedSizes });
      showToast('Weight size added successfully', 'success');
      sizeInput.value = '';
      renderActiveWorkspaceTab();
    } catch (err) {
      showToast('Failed to save size preference', 'error');
    } finally {
      hideLoader();
    }
  };

  addSizeBtn.addEventListener('click', executeAddSize);
  sizeInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') executeAddSize();
  });

  // Bind Delete Weight Size Tags
  document.querySelectorAll('.remove-weight-size-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetSize = btn.dataset.size;
      const index = weightSizes.indexOf(targetSize);
      if (index === -1) return;

      const confirmRemove = confirm(`Are you sure you want to delete weight size "${targetSize}"?`);
      if (confirmRemove) {
        showLoader();
        try {
          weightSizes.splice(index, 1);
          const updatedSizes = weightSizes.join(', ');
          await db.updateSettings({ weight_sizes: updatedSizes });
          showToast('Weight size deleted', 'success');
          renderActiveWorkspaceTab();
        } catch (err) {
          showToast('Failed to delete size preference', 'error');
        } finally {
          hideLoader();
        }
      }
    });
  });
}

// 3a. CATEGORY MODAL
function openCategoryModal(id = null, name = '', slug = '', imageUrl = '') {
  const modal = document.getElementById('admin-modal');
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 460px;">
      <div class="modal-header">
        <h3 class="modal-title">${id ? 'Edit Category' : 'Add Category'}</h3>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="cat-name">Category Name</label>
          <input type="text" id="cat-name" class="form-input" required value="${name}">
        </div>
        <div class="form-group">
          <label class="form-label" for="cat-slug">Category URL Slug</label>
          <input type="text" id="cat-slug" class="form-input" placeholder="e.g. protein-shakes" value="${slug}">
        </div>
        
        <div class="form-group" style="margin-top: 10px;">
          <label class="form-label" for="cat-image-file-input">Category Image</label>
          <div class="image-uploader-area" id="cat-image-uploader" style="padding: 16px;" role="button" tabindex="0" aria-label="Upload Category Image">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Click to Upload Image</span>
            <input type="file" id="cat-image-file-input" style="display:none;" accept="image/*">
          </div>
          <div style="margin-top:8px; text-align:center; color:var(--text-muted); font-size:0.75rem;">OR enter URL manually:</div>
          <input type="text" id="cat-image-url" class="form-input" style="margin-top: 6px;" placeholder="https://image-link.com" value="${imageUrl}" aria-label="Category Image URL URL manually">
        </div>
        
        <div id="cat-preview-container" style="margin-top: 12px; text-align: center; display: ${imageUrl ? 'block' : 'none'};">
          <span style="font-size:0.8rem; font-weight:600; color:var(--text-secondary); display:block; margin-bottom:6px;">Image Preview</span>
          <img id="cat-img-preview" src="${imageUrl}" style="max-height: 120px; max-width: 100%; border-radius: var(--r-sm); border: 1px solid var(--border); object-fit: cover;">
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn-primary" id="modal-save-btn">Save Category</button>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
  currentModal = modal;

  // Bind Close
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const closeModal = () => {
    modal.classList.remove('active');
    currentModal = null;
  };
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Auto slug trigger
  const nameInput = document.getElementById('cat-name');
  const slugInput = document.getElementById('cat-slug');
  const imageUrlInput = document.getElementById('cat-image-url');
  const previewContainer = document.getElementById('cat-preview-container');
  const previewImg = document.getElementById('cat-img-preview');

  nameInput.addEventListener('blur', () => {
    if (!slugInput.value.trim() && nameInput.value.trim()) {
      slugInput.value = nameInput.value.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  });

  // Image Upload handler
  const fileArea = document.getElementById('cat-image-uploader');
  const fileInput = document.getElementById('cat-image-file-input');
  fileArea.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showLoader();
    try {
      const publicUrl = await db.uploadImage(file, 'product-images');
      imageUrlInput.value = publicUrl;
      previewImg.src = publicUrl;
      previewContainer.style.display = 'block';
      showToast('Category image uploaded successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload image', 'error');
    } finally {
      hideLoader();
    }
  });

  // Manual URL Preview update
  imageUrlInput.addEventListener('input', () => {
    const url = imageUrlInput.value.trim();
    if (url) {
      previewImg.src = url;
      previewContainer.style.display = 'block';
    } else {
      previewContainer.style.display = 'none';
    }
  });

  // Save Trigger
  const saveBtn = document.getElementById('modal-save-btn');
  saveBtn.addEventListener('click', async () => {
    const valName = nameInput.value.trim();
    let valSlug = slugInput.value.trim();
    const valImage = imageUrlInput.value.trim();

    if (!valName) {
      showToast('Category name is required', 'error');
      return;
    }
    
    if (!valSlug) {
      valSlug = valName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const payload = { name: valName, slug: valSlug, image_url: valImage || null };
    if (id) payload.id = id;

    showLoader();
    try {
      await db.saveCategory(payload);
      showToast(id ? 'Category updated' : 'Category created', 'success');
      closeModal();
      renderActiveWorkspaceTab();
    } catch (err) {
      showToast(err.message || 'Failed to save category', 'error');
    } finally {
      hideLoader();
    }
  });
}


// ==========================================
// TAB 4: UNIQUE CODES AUTHENTICATION
// ==========================================
async function renderTabCodes(workspace) {
  const codes = await db.fetchAuthCodes();

  workspace.innerHTML = `
    <div class="admin-header-row">
      <div class="admin-title-desc">
        <h2 class="admin-title">Product Verification Codes</h2>
        <span class="admin-subtitle">Generate security codes to let customers verify product authenticity.</span>
      </div>
      <button class="btn btn-primary" id="admin-add-code-btn">
        <i class="fas fa-shield-alt"></i> Generate Codes
      </button>
    </div>
    
    <div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Security Code</th>
            <th>Assigned Product</th>
            <th>Manufacturing Date</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${codes.length > 0 ? codes.map(c => `
            <tr>
              <td><code style="font-size:1.1rem; font-weight:700; color:var(--primary-color);">${escapeHTML(c.unique_code)}</code></td>
              <td>${c.products ? escapeHTML(c.products.title) : '<span style="color:var(--error-color);">No Product Link</span>'}</td>
              <td>${escapeHTML(c.manufacturing_date || 'N/A')}</td>
              <td>${escapeHTML(c.expiry_date || 'N/A')}</td>
              <td><span style="font-weight:600; text-transform:uppercase; font-size:0.85rem; color:${c.status === 'active' ? 'var(--success-color)' : 'var(--text-muted)'}">${escapeHTML(c.status)}</span></td>
              <td>
                <div class="cell-actions">
                  <button class="btn-icon btn-edit edit-code-btn" data-id="${c.id}" title="Edit"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon btn-delete delete-code-btn" data-id="${c.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="6" style="text-align:center; padding:32px 0; color:var(--text-secondary);">No security verification codes generated yet.</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  // Bind generate
  document.getElementById('admin-add-code-btn').addEventListener('click', () => openCodeModal());

  // Bind edit
  document.querySelectorAll('.edit-code-btn').forEach(btn => {
    btn.addEventListener('click', () => openCodeModal(btn.dataset.id));
  });

  // Bind delete
  document.querySelectorAll('.delete-code-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmDelete = confirm('Are you sure you want to delete this verification code? Customers will no longer be able to verify this packaging.');
      if (confirmDelete) {
        showLoader();
        try {
          await db.deleteAuthCode(btn.dataset.id);
          showToast('Verification code deleted', 'success');
          renderActiveWorkspaceTab();
        } catch (err) {
          showToast('Failed to delete code', 'error');
        } finally {
          hideLoader();
        }
      }
    });
  });
}

// 4a. CODE MODAL
async function openCodeModal(codeId = null) {
  const modal = document.getElementById('admin-modal');
  const products = await db.fetchProducts();

  let codeData = {
    unique_code: '',
    product_id: '',
    manufacturing_date: '',
    expiry_date: '',
    status: 'active'
  };

  if (codeId) {
    showLoader();
    try {
      const codes = await db.fetchAuthCodes();
      codeData = codes.find(c => c.id === codeId) || codeData;
    } catch (err) {
      showToast('Error loading code info', 'error');
      return;
    } finally {
      hideLoader();
    }
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <h3 class="modal-title">${codeId ? 'Edit Security Code' : 'Generate Authentication Code'}</h3>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="code-val">Unique Verification Code *</label>
          <div class="code-generator-box">
            <input type="text" id="code-val" class="form-input" style="text-transform:uppercase; font-weight:700;" placeholder="E.G. A1B2C3D4" value="${codeData.unique_code}">
            ${!codeId ? `<button class="btn btn-dark" id="code-gen-random-btn" style="padding:12px;" aria-label="Generate Random Code"><i class="fas fa-random"></i> Gen</button>` : ''}
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="code-product">Link to Product *</label>
          <select id="code-product" class="form-input" required>
            <option value="">-- Choose Product --</option>
            ${products.map(p => `
              <option value="${p.id}" ${codeData.product_id === p.id ? 'selected' : ''}>${escapeHTML(p.title)}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="code-mfg">Manufacturing Date</label>
          <input type="date" id="code-mfg" class="form-input" value="${codeData.manufacturing_date || ''}">
        </div>
        
        <div class="form-group">
          <label class="form-label" for="code-exp">Expiry Date</label>
          <input type="date" id="code-exp" class="form-input" value="${codeData.expiry_date || ''}">
        </div>
        
        <div class="form-group">
          <label class="form-label" for="code-status">Status</label>
          <select id="code-status" class="form-input">
            <option value="active" ${codeData.status === 'active' ? 'selected' : ''}>Active / Valid</option>
            <option value="inactive" ${codeData.status === 'inactive' ? 'selected' : ''}>Inactive / Revoked</option>
          </select>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn-primary" id="modal-save-btn">Save Code</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  currentModal = modal;

  // Bind close
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const closeModal = () => {
    modal.classList.remove('active');
    currentModal = null;
  };
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Generate random code utility (e.g. 10 chars uppercase alphanumeric)
  const genBtn = document.getElementById('code-gen-random-btn');
  const codeValEl = document.getElementById('code-val');
  if (genBtn) {
    genBtn.addEventListener('click', () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codeValEl.value = code;
    });
  }

  // Save triggers
  const saveBtn = document.getElementById('modal-save-btn');
  saveBtn.addEventListener('click', async () => {
    const code = codeValEl.value.trim().toUpperCase();
    const productId = document.getElementById('code-product').value;
    
    if (!code || !productId) {
      showToast('Verification code and Product link are required', 'error');
      return;
    }

    const payload = {
      unique_code: code,
      product_id: productId,
      manufacturing_date: document.getElementById('code-mfg').value || null,
      expiry_date: document.getElementById('code-exp').value || null,
      status: document.getElementById('code-status').value
    };

    if (codeId) payload.id = codeId;

    showLoader();
    try {
      await db.saveAuthCode(payload);
      showToast(codeId ? 'Code details updated' : 'Code generated successfully', 'success');
      closeModal();
      renderActiveWorkspaceTab();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error saving code', 'error');
    } finally {
      hideLoader();
    }
  });
}

// ==========================================
// TAB 5: WEBSITE SETTINGS & BRANDING
// ==========================================
async function renderTabSettings(workspace) {
  const fetchedSettings = await db.fetchSettings();
  const settings = mergeSettings(fetchedSettings);

  workspace.innerHTML = `
    <div class="admin-header-row" style="margin-bottom:20px;">
      <div class="admin-title-desc">
        <h2 class="admin-title">Branding & Store Settings</h2>
        <span class="admin-subtitle">Configure brand names, core logo assets, theme colors, support links, and SEO metadata.</span>
      </div>
    </div>
    
    <!-- Sub tabs navigation -->
    <div class="admin-sub-tabs" style="display:flex; gap:8px; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:24px;">
      <button class="btn btn-ghost settings-sub-tab-btn active" data-subtab="identity" style="border-radius:20px; padding: 8px 16px; font-weight:600;"><i class="fas fa-id-card"></i> Brand Identity</button>
      <button class="btn btn-ghost settings-sub-tab-btn" data-subtab="contacts" style="border-radius:20px; padding: 8px 16px; font-weight:600;"><i class="fas fa-address-book"></i> Contacts & Support</button>
      <button class="btn btn-ghost settings-sub-tab-btn" data-subtab="seo" style="border-radius:20px; padding: 8px 16px; font-weight:600;"><i class="fas fa-search"></i> SEO Metadata</button>
    </div>
    
    <div class="settings-content-area" style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:24px; box-shadow:var(--shadow-sm);">
      
      <!-- Subtab 1: Identity & Colors -->
      <div id="settings-subtab-identity" class="settings-subtab-panel" style="display:block;">
        <h3 class="settings-section-title" style="margin-top:0;">Brand Identity Assets</h3>
        
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-brand-name">Brand Name</label>
          <input type="text" id="settings-brand-name" class="form-input" value="${escapeHTML(settings.brand_name)}">
        </div>
        
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-brand-logo">Navbar Brand Logo URL</label>
          <div style="display:flex; gap:12px;">
            <input type="text" id="settings-brand-logo" class="form-input" placeholder="https://image-link.com" value="${escapeHTML(settings.brand_logo_url || '')}">
            <button class="btn btn-dark" id="settings-logo-upload-btn" style="padding:12px;" type="button" aria-label="Upload brand logo file"><i class="fas fa-upload"></i></button>
            <input type="file" id="settings-logo-file-input" style="display:none;" accept="image/*">
          </div>
          <div id="settings-brand-logo-preview-wrap">
            ${settings.brand_logo_url ? `<img src="${escapeHTML(settings.brand_logo_url)}" style="max-height: 50px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">` : ''}
          </div>
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-favicon">Favicon Image URL</label>
          <input type="text" id="settings-favicon" class="form-input" placeholder="https://image-link.com/favicon.png" value="${escapeHTML(settings.favicon_url || '')}">
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-footer-logo">Footer Logo URL</label>
          <div style="display:flex; gap:12px;">
            <input type="text" id="settings-footer-logo" class="form-input" placeholder="https://image-link.com" value="${escapeHTML(settings.footer_logo_url || '')}">
            <button class="btn btn-dark" id="settings-footer-logo-upload-btn" style="padding:12px;" type="button" aria-label="Upload footer logo file"><i class="fas fa-upload"></i></button>
            <input type="file" id="settings-footer-logo-file-input" style="display:none;" accept="image/*">
          </div>
          <div id="settings-footer-logo-preview-wrap">
            ${settings.footer_logo_url ? `<img src="${escapeHTML(settings.footer_logo_url)}" style="max-height: 50px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">` : ''}
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-group">
            <label class="form-label" for="settings-color-primary">Primary Theme Color</label>
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="color" id="settings-color-primary" value="${escapeHTML(settings.primary_color)}" style="width:40px; height:40px; border:none; cursor:pointer;">
              <input type="text" id="settings-color-primary-text" class="form-input" style="flex:1;" value="${escapeHTML(settings.primary_color)}">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="settings-color-secondary">Secondary Theme Color</label>
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="color" id="settings-color-secondary" value="${escapeHTML(settings.secondary_color)}" style="width:40px; height:40px; border:none; cursor:pointer;">
              <input type="text" id="settings-color-secondary-text" class="form-input" style="flex:1;" value="${escapeHTML(settings.secondary_color)}">
            </div>
          </div>
        </div>
      </div>
      
      <!-- Subtab 2: Contacts & Map -->
      <div id="settings-subtab-contacts" class="settings-subtab-panel" style="display:none;">
        <h3 class="settings-section-title" style="margin-top:0;">Support & Contact Details</h3>
        
        <div style="display:grid; grid-template-columns:1.2fr 0.8fr; gap:16px; margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label" for="settings-whatsapp">WhatsApp Contact Number *</label>
            <input type="text" id="settings-whatsapp" class="form-input" placeholder="e.g. +447123456789" value="${escapeHTML(settings.whatsapp_number || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="settings-phone">Office Phone</label>
            <input type="text" id="settings-phone" class="form-input" value="${escapeHTML(settings.contact_phone || '')}">
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-email">Contact Email Address</label>
          <input type="email" id="settings-email" class="form-input" value="${escapeHTML(settings.contact_email || '')}">
        </div>
        
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-address">Physical Office Address</label>
          <input type="text" id="settings-address" class="form-input" value="${escapeHTML(settings.contact_address || '')}">
        </div>
        
        <div class="form-group">
          <label class="form-label" for="settings-map">Google Maps Embed HTML / Source URL</label>
          <input type="text" id="settings-map" class="form-input" placeholder="Insert google maps iframe HTML src url" value="${escapeHTML(settings.google_map_iframe || '')}">
        </div>
      </div>
      
      <!-- Subtab 3: SEO -->
      <div id="settings-subtab-seo" class="settings-subtab-panel" style="display:none;">
        <h3 class="settings-section-title" style="margin-top:0;">SEO Metadata Configurations</h3>
        
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-seo-title">Meta Website Title (SEO)</label>
          <input type="text" id="settings-seo-title" class="form-input" value="${escapeHTML(settings.seo_title)}">
        </div>
        
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-seo-desc">Meta Description (SEO)</label>
          <textarea id="settings-seo-desc" class="form-input" style="height:80px; resize:none;">${escapeHTML(settings.seo_description)}</textarea>
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-og-image">Open Graph Share Image URL (SEO)</label>
          <div style="display:flex; gap:12px;">
            <input type="text" id="settings-og-image" class="form-input" placeholder="https://image-link.com/og-image.jpg" value="${escapeHTML(settings.og_image_url || '')}" ${'og_image_url' in settings ? '' : 'disabled'}>
            <button class="btn btn-dark" id="settings-og-image-upload-btn" style="padding:12px;" type="button" aria-label="Upload OG image file" ${'og_image_url' in settings ? '' : 'disabled'}><i class="fas fa-upload"></i></button>
            <input type="file" id="settings-og-image-file-input" style="display:none;" accept="image/*">
          </div>
          <div id="settings-og-image-preview-wrap">
            ${settings.og_image_url ? `<img src="${escapeHTML(settings.og_image_url)}" style="max-height: 80px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">` : ''}
          </div>
          ${'og_image_url' in settings ? `
            <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; display: block;">
              Recommended size: 1200x630px. Keep file size under 300KB for WhatsApp previews. Falls back to default <code>/og-image.jpg</code>.
            </span>
          ` : `
            <span style="font-size: 0.8rem; color: #e53935; margin-top: 4px; display: block;">
              <i class="fas fa-exclamation-triangle"></i> To customize this from the admin panel, please add the <code>og_image_url</code> column to your Supabase <code>settings</code> table. (Falls back to default <code>/og-image.jpg</code>)
            </span>
          `}
        </div>
      </div>
      
      <!-- Shared Save Button Row -->
      <div style="display:flex; justify-content:flex-end; margin-top:24px; border-top:1px solid var(--border-color); padding-top:20px;">
        <button class="btn btn-primary" id="settings-save-btn" style="padding:14px 40px; font-size:1rem; font-weight:600;">
          <i class="fas fa-save"></i> Save Global Configurations
        </button>
      </div>
      
    </div>
  `;

  // Bind sub-tabs toggle
  const subTabBtns = workspace.querySelectorAll('.settings-sub-tab-btn');
  const subTabPanels = workspace.querySelectorAll('.settings-subtab-panel');
  subTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.subtab;
      subTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      subTabPanels.forEach(panel => {
        panel.style.display = panel.id === `settings-subtab-${tabId}` ? 'block' : 'none';
      });
    });
  });

  // Bind color input syncing
  const cPrimInput = document.getElementById('settings-color-primary');
  const cPrimText = document.getElementById('settings-color-primary-text');
  if (cPrimInput && cPrimText) {
    cPrimInput.addEventListener('input', (e) => cPrimText.value = e.target.value);
    cPrimText.addEventListener('input', (e) => {
      if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) cPrimInput.value = e.target.value;
    });
  }

  const cSecInput = document.getElementById('settings-color-secondary');
  const cSecText = document.getElementById('settings-color-secondary-text');
  if (cSecInput && cSecText) {
    cSecInput.addEventListener('input', (e) => cSecText.value = e.target.value);
    cSecText.addEventListener('input', (e) => {
      if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) cSecInput.value = e.target.value;
    });
  }

  // Logo file upload handler
  const logoFileBtn = document.getElementById('settings-logo-upload-btn');
  const logoFileInput = document.getElementById('settings-logo-file-input');
  if (logoFileBtn && logoFileInput) {
    logoFileBtn.addEventListener('click', () => logoFileInput.click());
    logoFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      showLoader();
      try {
        const publicUrl = await db.uploadImage(file, 'brand-assets');
        document.getElementById('settings-brand-logo').value = publicUrl;
        const previewWrap = document.getElementById('settings-brand-logo-preview-wrap');
        if (previewWrap) {
          previewWrap.innerHTML = `<img src="${escapeHTML(publicUrl)}" style="max-height: 50px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">`;
        }
        showToast('Brand logo uploaded successfully', 'success');
      } catch (err) {
        showToast('Logo upload failed', 'error');
      } finally {
        hideLoader();
      }
    });
  }

  // Brand Logo manual input preview syncing
  const brandLogoInput = document.getElementById('settings-brand-logo');
  if (brandLogoInput) {
    brandLogoInput.addEventListener('input', () => {
      const url = brandLogoInput.value.trim();
      const previewWrap = document.getElementById('settings-brand-logo-preview-wrap');
      if (previewWrap) {
        previewWrap.innerHTML = url ? `<img src="${escapeHTML(url)}" style="max-height: 50px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">` : '';
      }
    });
  }

  // Footer Logo file upload handler
  const footerLogoFileBtn = document.getElementById('settings-footer-logo-upload-btn');
  const footerLogoFileInput = document.getElementById('settings-footer-logo-file-input');
  if (footerLogoFileBtn && footerLogoFileInput) {
    footerLogoFileBtn.addEventListener('click', () => footerLogoFileInput.click());
    footerLogoFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      showLoader();
      try {
        const publicUrl = await db.uploadImage(file, 'brand-assets');
        document.getElementById('settings-footer-logo').value = publicUrl;
        const previewWrap = document.getElementById('settings-footer-logo-preview-wrap');
        if (previewWrap) {
          previewWrap.innerHTML = `<img src="${escapeHTML(publicUrl)}" style="max-height: 50px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">`;
        }
        showToast('Footer logo uploaded successfully', 'success');
      } catch (err) {
        showToast('Footer logo upload failed', 'error');
      } finally {
        hideLoader();
      }
    });
  }

  // Footer Logo manual input preview syncing
  const footerLogoInput = document.getElementById('settings-footer-logo');
  if (footerLogoInput) {
    footerLogoInput.addEventListener('input', () => {
      const url = footerLogoInput.value.trim();
      const previewWrap = document.getElementById('settings-footer-logo-preview-wrap');
      if (previewWrap) {
        previewWrap.innerHTML = url ? `<img src="${escapeHTML(url)}" style="max-height: 50px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">` : '';
      }
    });
  }

  // OG Image file upload handler
  const ogFileBtn = document.getElementById('settings-og-image-upload-btn');
  const ogFileInput = document.getElementById('settings-og-image-file-input');
  if (ogFileBtn && ogFileInput) {
    ogFileBtn.addEventListener('click', () => ogFileInput.click());
    ogFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      showLoader();
      try {
        const publicUrl = await db.uploadImage(file, 'brand-assets');
        document.getElementById('settings-og-image').value = publicUrl;
        const previewWrap = document.getElementById('settings-og-image-preview-wrap');
        if (previewWrap) {
          previewWrap.innerHTML = `<img src="${escapeHTML(publicUrl)}" style="max-height: 80px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">`;
        }
        showToast('Open Graph image uploaded successfully', 'success');
      } catch (err) {
        showToast('Open Graph image upload failed', 'error');
      } finally {
        hideLoader();
      }
    });
  }

  // OG Image manual input preview syncing
  const ogImageInput = document.getElementById('settings-og-image');
  if (ogImageInput) {
    ogImageInput.addEventListener('input', () => {
      const url = ogImageInput.value.trim();
      const previewWrap = document.getElementById('settings-og-image-preview-wrap');
      if (previewWrap) {
        previewWrap.innerHTML = url ? `<img src="${escapeHTML(url)}" style="max-height: 80px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">` : '';
      }
    });
  }

  // Save Settings Click
  const saveBtn = document.getElementById('settings-save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const primaryColor = cPrimText.value.trim();
      const secondaryColor = cSecText.value.trim();
      
      if (!primaryColor.match(/^#[0-9A-Fa-f]{6}$/)) {
        showToast('Primary color theme must be a valid 6-character hex code (e.g. #D32F2F)', 'error');
        return;
      }
      if (!secondaryColor.match(/^#[0-9A-Fa-f]{6}$/)) {
        showToast('Secondary color theme must be a valid 6-character hex code (e.g. #FFFFFF)', 'error');
        return;
      }

      const waInput = document.getElementById('settings-whatsapp').value.trim();
      
      const payload = {
        brand_name: document.getElementById('settings-brand-name').value.trim(),
        brand_logo_url: document.getElementById('settings-brand-logo').value.trim() || null,
        footer_logo_url: document.getElementById('settings-footer-logo').value.trim() || null,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        favicon_url: document.getElementById('settings-favicon').value.trim() || null,
        whatsapp_number: waInput,
        contact_phone: document.getElementById('settings-phone').value.trim(),
        contact_email: document.getElementById('settings-email').value.trim(),
        contact_address: document.getElementById('settings-address').value.trim(),
        google_map_iframe: document.getElementById('settings-map').value.trim() || null,
        seo_title: document.getElementById('settings-seo-title').value.trim(),
        seo_description: document.getElementById('settings-seo-desc').value.trim()
      };

      if ('og_image_url' in settings) {
        payload.og_image_url = document.getElementById('settings-og-image').value.trim() || null;
      }

      showLoader();
      try {
        const newSettings = await db.updateSettings(payload);
        showToast('Global settings updated successfully', 'success');
        applyBranding(newSettings);
        setTimeout(() => renderActiveWorkspaceTab(), 1000);
      } catch (err) {
        console.error(err);
        showToast('Failed to save settings configurations', 'error');
      } finally {
        hideLoader();
      }
    });
  }
}

// ==========================================
// NEW TAB: WEBSITE CUSTOMIZATION BUILDER
// ==========================================
async function renderTabCustomization(workspace) {
  const fetchedSettings = await db.fetchSettings();
  const settings = mergeSettings(fetchedSettings);

  // Local store of slider settings to modify in memory before saving
  let localSliderSettings = JSON.parse(JSON.stringify(settings.slider_settings || DEFAULT_SLIDER_SETTINGS));

  workspace.innerHTML = `
    <div class="admin-header-row" style="margin-bottom:20px;">
      <div class="admin-title-desc">
        <h2 class="admin-title">Website Customization</h2>
        <span class="admin-subtitle">Refine page layouts, announcement tickers, banner slots, and visual hero properties.</span>
      </div>
    </div>
    
    <!-- Sub tabs navigation -->
    <div class="admin-sub-tabs" style="display:flex; gap:8px; border-bottom:1px solid var(--border-color); padding-bottom:12px; margin-bottom:24px;">
      <button class="btn btn-ghost customization-sub-tab-btn active" data-subtab="hero" style="border-radius:20px; padding: 8px 16px; font-weight:600;"><i class="fas fa-image"></i> Hero Slide Section</button>
      <button class="btn btn-ghost customization-sub-tab-btn" data-subtab="slider" style="border-radius:20px; padding: 8px 16px; font-weight:600;"><i class="fas fa-sliders-h"></i> Hero Slider</button>
      <button class="btn btn-ghost customization-sub-tab-btn" data-subtab="banners" style="border-radius:20px; padding: 8px 16px; font-weight:600;"><i class="fas fa-bullhorn"></i> Announcements & Banners</button>
      <button class="btn btn-ghost customization-sub-tab-btn" data-subtab="homepage" style="border-radius:20px; padding: 8px 16px; font-weight:600;"><i class="fas fa-home"></i> Section Feeds & Videos</button>
      <button class="btn btn-ghost customization-sub-tab-btn" data-subtab="footer" style="border-radius:20px; padding: 8px 16px; font-weight:600;"><i class="fas fa-shoe-prints"></i> Footer Socials & Copyright</button>
    </div>
    
    <div class="customization-content-area" style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:24px; box-shadow:var(--shadow-sm);">
      
      <!-- Subtab 1: Hero Settings -->
      <div id="customization-subtab-hero" class="customization-subtab-panel" style="display:block;">
        <h3 class="settings-section-title" style="margin-top:0;">Homepage Hero Section</h3>
        
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-hero-title">Hero Title Heading</label>
          <input type="text" id="settings-hero-title" class="form-input" value="${escapeHTML(settings.hero_title)}">
        </div>
        
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-hero-desc">Hero Subtitle / Description</label>
          <textarea id="settings-hero-desc" class="form-input" style="height:80px; resize:none;">${escapeHTML(settings.hero_description)}</textarea>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1.5fr; gap:12px; margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label" for="settings-hero-bg-type">Hero Background Type</label>
            <select id="settings-hero-bg-type" class="form-input">
              <option value="gradient" ${settings.hero_bg_type === 'gradient' ? 'selected' : ''}>CSS Gradient</option>
              <option value="image" ${settings.hero_bg_type === 'image' ? 'selected' : ''}>Background Image</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="settings-hero-bg-gradient">Background Details</label>
            <input type="text" id="settings-hero-bg-gradient" class="form-input" style="display:${settings.hero_bg_type === 'gradient' ? 'block' : 'none'};" placeholder="e.g. linear-gradient(...)" value="${escapeHTML(settings.hero_bg_gradient)}">
            
            <div id="settings-hero-image-wrap" style="display:${settings.hero_bg_type === 'image' ? 'flex' : 'none'}; gap:8px;">
              <input type="text" id="settings-hero-bg-image" class="form-input" placeholder="https://image-link.com" value="${escapeHTML(settings.hero_bg_image_url || '')}">
              <button class="btn btn-dark" id="settings-hero-bg-upload-btn" style="padding:12px;" type="button" aria-label="Upload hero background image"><i class="fas fa-upload"></i></button>
              <input type="file" id="settings-hero-bg-file-input" style="display:none;" accept="image/*">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" style="font-weight:700; margin-bottom:12px; display:block;">Hero Product Image Carousel Slots (up to 6 images)</label>
          <div style="display:grid; grid-template-columns: 1fr; gap:12px;">
            ${Array.from({ length: 6 }).map((_, index) => {
              const url = (settings.hero_product_images && settings.hero_product_images[index]) || (index === 0 ? settings.hero_product_image_url : '') || '';
              return `
                <div class="hero-img-slot" style="display:flex; flex-direction:column; gap:6px; border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.01);">
                  <span style="font-size:0.8rem; font-weight:600; color:var(--text-secondary);">Image Slot ${index + 1} ${index === 0 ? '(Primary / Fallback)' : ''}</span>
                  <div style="display:flex; gap:8px; align-items:center;">
                    <div class="hero-thumb-preview" id="hero-thumb-preview-${index}" style="width:40px; height:40px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;">
                      ${url ? `<img src="${escapeHTML(url)}" style="max-width:100%; max-height:100%; object-fit:contain;">` : `<i class="fas fa-image" style="color:var(--text-muted);"></i>`}
                    </div>
                    <input type="text" id="settings-hero-image-${index}" class="form-input hero-image-input" placeholder="Paste image URL here" value="${escapeHTML(url)}" style="flex:1;">
                    <button class="btn btn-dark settings-hero-upload-btn" data-slot="${index}" style="padding:12px;" type="button" aria-label="Upload hero image slot ${index + 1}"><i class="fas fa-upload"></i></button>
                    <button class="btn btn-ghost settings-hero-clear-btn" data-slot="${index}" style="padding:12px; color:var(--error-color); border-color:var(--error-color);" type="button" aria-label="Clear slot ${index + 1}"><i class="fas fa-times"></i></button>
                    <input type="file" id="settings-hero-file-input-${index}" style="display:none;" accept="image/*">
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
          <div class="form-group">
            <label class="form-label" for="settings-hero-badge-1-text">Hero Tag 1 (Genuine Tag Text)</label>
            <input type="text" id="settings-hero-badge-1-text" class="form-input" value="${settings.hero_badge_1_text !== undefined ? escapeHTML(settings.hero_badge_1_text || '') : '100% Genuine'}" placeholder="Leave empty to hide badge">
          </div>
          <div class="form-group">
            <label class="form-label" for="settings-hero-badge-1-icon">Hero Tag 1 Icon Class (FontAwesome)</label>
            <input type="text" id="settings-hero-badge-1-icon" class="form-input" value="${settings.hero_badge_1_icon !== undefined ? escapeHTML(settings.hero_badge_1_icon || '') : 'fas fa-shield-halved'}" placeholder="e.g. fas fa-shield-halved">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label" for="settings-hero-badge-2-text">Hero Tag 2 (Certified Tag Text)</label>
            <input type="text" id="settings-hero-badge-2-text" class="form-input" value="${settings.hero_badge_2_text !== undefined ? escapeHTML(settings.hero_badge_2_text || '') : 'FSSAI Certified'}" placeholder="Leave empty to hide badge">
          </div>
          <div class="form-group">
            <label class="form-label" for="settings-hero-badge-2-icon">Hero Tag 2 Icon Class (FontAwesome)</label>
            <input type="text" id="settings-hero-badge-2-icon" class="form-input" value="${settings.hero_badge_2_icon !== undefined ? escapeHTML(settings.hero_badge_2_icon || '') : 'fas fa-certificate'}" placeholder="e.g. fas fa-certificate">
          </div>
        </div>
      </div>
      
      <!-- Subtab 1b: Hero Slider Settings -->
      <div id="customization-subtab-slider" class="customization-subtab-panel" style="display:none;">
        <h3 class="settings-section-title" style="margin-top:0;">Hero Slider Settings</h3>
        
        <div style="display:grid; grid-template-columns: 1fr 1.2fr; gap: 24px;">
          <!-- Left side: General & Layout -->
          <div>
            <div class="settings-card" style="padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-md); margin-bottom:16px; background:rgba(0,0,0,0.01);">
              <h4 style="margin-top:0; margin-bottom:12px; font-weight:700;"><i class="fas fa-toggle-on"></i> General & Navigation Controls</h4>
              <div style="display:flex; flex-direction:column; gap:12px;">
                <label class="switch-label" for="settings-slider-enabled" style="margin:0;">
                  <input type="checkbox" id="settings-slider-enabled" class="switch-input">
                  <span class="switch-slider"></span>
                  <span>Enable Hero Slider</span>
                </label>
                <label class="switch-label" for="settings-slider-auto-slide" style="margin:0;">
                  <input type="checkbox" id="settings-slider-auto-slide" class="switch-input">
                  <span class="switch-slider"></span>
                  <span>Enable Auto-Sliding</span>
                </label>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                  <div class="form-group">
                    <label class="form-label" for="settings-slider-interval">Slide Duration (sec)</label>
                    <input type="number" id="settings-slider-interval" class="form-input" min="1" max="20">
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="settings-slider-transition-speed">Transition Speed (sec)</label>
                    <input type="number" id="settings-slider-transition-speed" class="form-input" min="0.1" max="5" step="0.1">
                  </div>
                </div>
                <label class="switch-label" for="settings-slider-infinite" style="margin:0;">
                  <input type="checkbox" id="settings-slider-infinite" class="switch-input">
                  <span class="switch-slider"></span>
                  <span>Infinite Loop Navigation</span>
                </label>
                <label class="switch-label" for="settings-slider-show-arrows" style="margin:0;">
                  <input type="checkbox" id="settings-slider-show-arrows" class="switch-input">
                  <span class="switch-slider"></span>
                  <span>Show Nav Arrows</span>
                </label>
                <label class="switch-label" for="settings-slider-show-dots" style="margin:0;">
                  <input type="checkbox" id="settings-slider-show-dots" class="switch-input">
                  <span class="switch-slider"></span>
                  <span>Show Pagination Dots</span>
                </label>
              </div>
            </div>
            
            <div class="settings-card" style="padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:rgba(0,0,0,0.01);">
              <h4 style="margin-top:0; margin-bottom:12px; font-weight:700;"><i class="fas fa-crop-simple"></i> Banner Aspect Ratios</h4>
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div class="form-group">
                  <label class="form-label" for="settings-slider-aspect-desktop">Desktop Aspect Ratio</label>
                  <select id="settings-slider-aspect-desktop" class="form-input">
                    <option value="16:9">16:9 (Standard Wide)</option>
                    <option value="21:9">21:9 (Ultra Wide)</option>
                    <option value="3:1">3:1 (Super Panoramic)</option>
                    <option value="4:3">4:3 (Traditional)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="settings-slider-aspect-mobile">Mobile Aspect Ratio</label>
                  <select id="settings-slider-aspect-mobile" class="form-input">
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Vertical/Portrait)</option>
                    <option value="16:9">16:9 (Landscape Mobile)</option>
                    <option value="9:16">9:16 (Tall Portrait)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right side: Card management -->
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h4 style="margin:0; font-weight:700;"><i class="fas fa-images"></i> Manage Slide Cards</h4>
              <button class="btn btn-dark btn-sm" id="slider-add-card-btn" style="padding: 6px 12px; font-size: 0.8rem;" type="button">
                <i class="fas fa-plus"></i> Add Card
              </button>
            </div>
            
            <div id="slider-cards-list-container" style="display:flex; flex-direction:column; gap:10px; max-height: 600px; overflow-y: auto; padding: 4px; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); background: rgba(0,0,0,0.01);">
              <!-- Cards dynamically rendered here -->
            </div>
          </div>
        </div>
      </div>
      
      <!-- Subtab 2: Announcements & Banners -->
      <div id="customization-subtab-banners" class="customization-subtab-panel" style="display:none;">
        
        <!-- Announcement Bar Panel -->
        <h3 class="settings-section-title" style="margin-top:0;">Global Announcement Ticker Bar</h3>
        <div style="margin-bottom:12px;">
          <label class="switch-label" for="settings-announcement-show" style="margin:0;">
            <input type="checkbox" id="settings-announcement-show" class="switch-input" ${settings.announcement_show ? 'checked' : ''}>
            <span class="switch-slider"></span>
            <span>Enable Top Announcement Bar</span>
          </label>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-announcement-text">Announcement Bar Text</label>
          <input type="text" id="settings-announcement-text" class="form-input" placeholder="e.g. Welcome to Top Muscle Nutrition! Chat with us directly on WhatsApp." value="${escapeHTML(settings.announcement_text || '')}">
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
          <div class="form-group">
            <label class="form-label" for="settings-announcement-bg-color">Announcement Background Color</label>
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="color" id="settings-announcement-bg-color" value="${escapeHTML(settings.announcement_bg_color || '#d32f2f')}" style="width:40px; height:40px; border:none; cursor:pointer;">
              <input type="text" id="settings-announcement-bg-color-text" class="form-input" style="flex:1;" value="${escapeHTML(settings.announcement_bg_color || '#d32f2f')}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="settings-announcement-text-color">Announcement Text Color</label>
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="color" id="settings-announcement-text-color" value="${escapeHTML(settings.announcement_text_color || '#ffffff')}" style="width:40px; height:40px; border:none; cursor:pointer;">
              <input type="text" id="settings-announcement-text-color-text" class="form-input" style="flex:1;" value="${escapeHTML(settings.announcement_text_color || '#ffffff')}">
            </div>
          </div>
        </div>

        <hr style="border:0; border-top:1px solid var(--border-color); margin:24px 0;">

        <!-- Promotional Banner Panel -->
        <h3 class="settings-section-title">Promotional Banners</h3>
        <div style="margin-bottom:12px;">
          <label class="switch-label" for="settings-promo-banner-show" style="margin:0;">
            <input type="checkbox" id="settings-promo-banner-show" class="switch-input" ${settings.promo_banner_show ? 'checked' : ''}>
            <span class="switch-slider"></span>
            <span>Enable Promotional Hero Banner</span>
          </label>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-promo-banner-image-url">Banner Image URL</label>
          <div style="display:flex; gap:12px;">
            <input type="text" id="settings-promo-banner-image-url" class="form-input" placeholder="https://image-link.com/promo.jpg" value="${escapeHTML(settings.promo_banner_image_url || '')}">
            <button class="btn btn-dark" id="settings-promo-banner-upload-btn" style="padding:12px;" type="button" aria-label="Upload promo banner"><i class="fas fa-upload"></i></button>
            <input type="file" id="settings-promo-banner-file-input" style="display:none;" accept="image/*">
          </div>
          <div id="settings-promo-banner-preview-wrap">
            ${settings.promo_banner_image_url ? `<img src="${escapeHTML(settings.promo_banner_image_url)}" style="max-height: 80px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">` : ''}
          </div>
        </div>
        <div class="form-group" style="margin-bottom:24px;">
          <label class="form-label" for="settings-promo-banner-link">Banner Click Destination Link</label>
          <input type="text" id="settings-promo-banner-link" class="form-input" placeholder="e.g. /products or category link" value="${escapeHTML(settings.promo_banner_link || '')}">
        </div>

        <hr style="border:0; border-top:1px solid var(--border-color); margin:24px 0;">

        <!-- Call-To-Action (CTA) Banner Panel -->
        <h3 class="settings-section-title">Call-To-Action Banner (Pre-footer)</h3>
        <div style="margin-bottom:12px;">
          <label class="switch-label" for="settings-cta-banner-show" style="margin:0;">
            <input type="checkbox" id="settings-cta-banner-show" class="switch-input" ${settings.cta_banner_show ? 'checked' : ''}>
            <span class="switch-slider"></span>
            <span>Enable CTA Section</span>
          </label>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-cta-banner-title">CTA Banner Title Heading</label>
          <input type="text" id="settings-cta-banner-title" class="form-input" value="${escapeHTML(settings.cta_banner_title || 'Ready to Level Up Your Workouts?')}">
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-cta-banner-desc">CTA Subtitle Description</label>
          <textarea id="settings-cta-banner-desc" class="form-input" style="height:60px; resize:none;">${escapeHTML(settings.cta_banner_desc || 'Chat with our experts on WhatsApp for personalized supplement guidance.')}</textarea>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-group">
            <label class="form-label" for="settings-cta-banner-btn-text">Button Text</label>
            <input type="text" id="settings-cta-banner-btn-text" class="form-input" value="${escapeHTML(settings.cta_banner_btn_text || 'Chat on WhatsApp')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="settings-cta-banner-bg-color">CTA Background Color</label>
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="color" id="settings-cta-banner-bg-color" value="${escapeHTML(settings.cta_banner_bg_color || '#161618')}" style="width:40px; height:40px; border:none; cursor:pointer;">
              <input type="text" id="settings-cta-banner-bg-color-text" class="form-input" style="flex:1;" value="${escapeHTML(settings.cta_banner_bg_color || '#161618')}">
            </div>
          </div>
        </div>
      </div>
      
      <!-- Subtab 3: Homepage Sections & Videos -->
      <div id="customization-subtab-homepage" class="customization-subtab-panel" style="display:none;">
        <h3 class="settings-section-title" style="margin-top:0;">Homepage Section Visibility</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:24px;">
          <label class="switch-label" for="settings-show-top-products" style="margin:0;">
            <input type="checkbox" id="settings-show-top-products" class="switch-input" ${settings.show_top_products ? 'checked' : ''}>
            <span class="switch-slider"></span>
            <span>Show Top Products</span>
          </label>
          <label class="switch-label" for="settings-show-best-sellers" style="margin:0;">
            <input type="checkbox" id="settings-show-best-sellers" class="switch-input" ${settings.show_best_sellers ? 'checked' : ''}>
            <span class="switch-slider"></span>
            <span>Show Best Sellers</span>
          </label>
          <label class="switch-label" for="settings-show-trending-products" style="margin:0;">
            <input type="checkbox" id="settings-show-trending-products" class="switch-input" ${settings.show_trending_products ? 'checked' : ''}>
            <span class="switch-slider"></span>
            <span>Show Trending</span>
          </label>
        </div>

        <hr style="border:0; border-top:1px solid var(--border-color); margin:24px 0;">

        <!-- Video Section 1 -->
        <h3 class="settings-section-title">Homepage Video Section 1 (After Hero)</h3>
        <div style="margin-bottom:12px;">
          <label class="switch-label" for="settings-video1-show" style="margin:0;">
            <input type="checkbox" id="settings-video1-show" class="switch-input" ${settings.video1_show ? 'checked' : ''}>
            <span class="switch-slider"></span>
            <span>Enable Video Section 1</span>
          </label>
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label" for="settings-video1-title">Section 1 Title</label>
          <input type="text" id="settings-video1-title" class="form-input" value="${escapeHTML(settings.video1_title || '')}">
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label" for="settings-video1-desc">Section 1 Description</label>
          <textarea id="settings-video1-desc" class="form-input" style="height:60px; resize:none;">${escapeHTML(settings.video1_desc || '')}</textarea>
        </div>
        <div style="display:grid; grid-template-columns:1fr 2fr; gap:12px; margin-bottom:24px;">
          <div class="form-group">
            <label class="form-label" for="settings-video1-type">Video Type</label>
            <select id="settings-video1-type" class="form-input">
              <option value="upload" ${settings.video1_type === 'upload' ? 'selected' : ''}>Upload MP4</option>
              <option value="youtube" ${settings.video1_type === 'youtube' ? 'selected' : ''}>YouTube Embed</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Video Source Details</label>
            <div id="settings-video1-upload-wrap" style="display:${settings.video1_type === 'upload' ? 'flex' : 'none'}; gap:8px;">
              <input type="text" id="settings-video1-mp4" class="form-input" placeholder="https://url-to-mp4.mp4" value="${escapeHTML(settings.video1_mp4_url || '')}">
              <button class="btn btn-dark" id="settings-video1-upload-btn" style="padding:12px;" type="button" aria-label="Upload Section 1 MP4"><i class="fas fa-upload"></i></button>
              <input type="file" id="settings-video1-file-input" style="display:none;" accept="video/mp4">
            </div>
            <input type="text" id="settings-video1-youtube" class="form-input" style="display:${settings.video1_type === 'youtube' ? 'block' : 'none'};" placeholder="e.g. https://www.youtube.com/watch?v=..." value="${escapeHTML(settings.video1_youtube_url || '')}">
          </div>
        </div>

        <hr style="border:0; border-top:1px solid var(--border-color); margin:24px 0;">

        <!-- Video Section 2 -->
        <h3 class="settings-section-title">Homepage Video Section 2 (After Featured)</h3>
        <div style="margin-bottom:12px;">
          <label class="switch-label" for="settings-video2-show" style="margin:0;">
            <input type="checkbox" id="settings-video2-show" class="switch-input" ${settings.video2_show ? 'checked' : ''}>
            <span class="switch-slider"></span>
            <span>Enable Video Section 2</span>
          </label>
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label" for="settings-video2-title">Section 2 Title</label>
          <input type="text" id="settings-video2-title" class="form-input" value="${escapeHTML(settings.video2_title || '')}">
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label" for="settings-video2-desc">Section 2 Description</label>
          <textarea id="settings-video2-desc" class="form-input" style="height:60px; resize:none;">${escapeHTML(settings.video2_desc || '')}</textarea>
        </div>
        <div style="display:grid; grid-template-columns:1fr 2fr; gap:12px;">
          <div class="form-group">
            <label class="form-label" for="settings-video2-type">Video Type</label>
            <select id="settings-video2-type" class="form-input">
              <option value="upload" ${settings.video2_type === 'upload' ? 'selected' : ''}>Upload MP4</option>
              <option value="youtube" ${settings.video2_type === 'youtube' ? 'selected' : ''}>YouTube Embed</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Video Source Details</label>
            <div id="settings-video2-upload-wrap" style="display:${settings.video2_type === 'upload' ? 'flex' : 'none'}; gap:8px;">
              <input type="text" id="settings-video2-mp4" class="form-input" placeholder="https://url-to-mp4.mp4" value="${escapeHTML(settings.video2_mp4_url || '')}">
              <button class="btn btn-dark" id="settings-video2-upload-btn" style="padding:12px;" type="button" aria-label="Upload Section 2 MP4"><i class="fas fa-upload"></i></button>
              <input type="file" id="settings-video2-file-input" style="display:none;" accept="video/mp4">
            </div>
            <input type="text" id="settings-video2-youtube" class="form-input" style="display:${settings.video2_type === 'youtube' ? 'block' : 'none'};" placeholder="e.g. https://www.youtube.com/watch?v=..." value="${escapeHTML(settings.video2_youtube_url || '')}">
          </div>
        </div>
      </div>
      
      <!-- Subtab 4: Footer & Socials -->
      <div id="customization-subtab-footer" class="customization-subtab-panel" style="display:none;">
        <h3 class="settings-section-title" style="margin-top:0;">Footer Specifications</h3>
        
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="settings-copyright">Copyright Text</label>
          <input type="text" id="settings-copyright" class="form-input" value="${escapeHTML(settings.footer_copyright || '')}">
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label" for="settings-fb">Facebook Link</label>
            <input type="text" id="settings-fb" class="form-input" placeholder="https://facebook.com/..." value="${escapeHTML(settings.social_facebook || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="settings-ig">Instagram Link</label>
            <input type="text" id="settings-ig" class="form-input" placeholder="https://instagram.com/..." value="${escapeHTML(settings.social_instagram || '')}">
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;">
          <div class="form-group">
            <label class="form-label" for="settings-twitter">Twitter Link</label>
            <input type="text" id="settings-twitter" class="form-input" placeholder="https://twitter.com/..." value="${escapeHTML(settings.social_twitter || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="settings-linkedin">LinkedIn Link</label>
            <input type="text" id="settings-linkedin" class="form-input" placeholder="https://linkedin.com/in/..." value="${escapeHTML(settings.social_linkedin || '')}">
          </div>
        </div>
      </div>
      
      <!-- Shared Save Button Row -->
      <div style="display:flex; justify-content:flex-end; margin-top:24px; border-top:1px solid var(--border-color); padding-top:20px;">
        <button class="btn btn-primary" id="customization-save-btn" style="padding:14px 40px; font-size:1rem; font-weight:600;">
          <i class="fas fa-save"></i> Save Website Customizations
        </button>
      </div>
      
    </div>
  `;

  // Set initial form values for slider
  const sliderEnabledEl = document.getElementById('settings-slider-enabled');
  const sliderAutoSlideEl = document.getElementById('settings-slider-auto-slide');
  const sliderIntervalEl = document.getElementById('settings-slider-interval');
  const sliderInfiniteEl = document.getElementById('settings-slider-infinite');
  
  const sliderTransitionEl = document.getElementById('settings-slider-transition-speed');
  const sliderShowArrowsEl = document.getElementById('settings-slider-show-arrows');
  const sliderShowDotsEl = document.getElementById('settings-slider-show-dots');
  const sliderAspectDesktopEl = document.getElementById('settings-slider-aspect-desktop');
  const sliderAspectMobileEl = document.getElementById('settings-slider-aspect-mobile');

  if (sliderEnabledEl) sliderEnabledEl.checked = !!localSliderSettings.enabled;
  if (sliderAutoSlideEl) sliderAutoSlideEl.checked = !!localSliderSettings.auto_slide;
  if (sliderIntervalEl) sliderIntervalEl.value = localSliderSettings.interval || 6;
  if (sliderTransitionEl) sliderTransitionEl.value = localSliderSettings.transition_speed || 0.5;
  if (sliderInfiniteEl) sliderInfiniteEl.checked = localSliderSettings.infinite_loop !== false;
  if (sliderShowArrowsEl) sliderShowArrowsEl.checked = localSliderSettings.show_arrows !== false;
  if (sliderShowDotsEl) sliderShowDotsEl.checked = localSliderSettings.show_dots !== false;
  if (sliderAspectDesktopEl) sliderAspectDesktopEl.value = localSliderSettings.aspect_ratio_desktop || '16:9';
  if (sliderAspectMobileEl) sliderAspectMobileEl.value = localSliderSettings.aspect_ratio_mobile || '1:1';

  // Render function for cards list
  const renderSliderCardsList = () => {
    const container = document.getElementById('slider-cards-list-container');
    if (!container) return;
    
    if (localSliderSettings.cards.length === 0) {
      container.innerHTML = `<span style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:24px 0; display:block;">No cards added yet. Click "Add Card" to begin.</span>`;
      return;
    }
    
    container.innerHTML = localSliderSettings.cards.map((card, idx) => `
      <div class="slider-card-item" draggable="true" data-id="${card.id}" style="display:flex; gap:12px; align-items:center; border:1px solid var(--border-color); padding:10px; border-radius:var(--radius-sm); background:#fff; cursor:move; transition: all 0.2s ease;">
        <div style="color:var(--text-muted); cursor:grab;"><i class="fas fa-grip-vertical"></i></div>
        <div style="width:40px; height:40px; border-radius:var(--radius-xs); overflow:hidden; border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; background:#f9f9f9; flex-shrink:0;">
          ${card.image_url ? `<img src="${card.image_url}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-image" style="color:var(--text-muted);"></i>`}
        </div>
        <div style="flex:1; overflow:hidden;">
          <div style="font-weight:600; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Slide Banner #${idx + 1}</div>
          <div style="font-size:0.75rem; color:var(--text-sub); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            Desktop: ${card.image_url ? escapeHTML(card.image_url.split('/').pop().split('?')[0]) : 'None'} | Mobile: ${card.mobile_image_url ? escapeHTML(card.mobile_image_url.split('/').pop().split('?')[0]) : 'None'}
          </div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-ghost btn-icon slider-card-toggle-hide-btn" data-id="${card.id}" type="button" style="padding:6px; color:${card.hidden ? 'var(--text-muted)' : 'var(--success)'};" title="Toggle Hide/Show"><i class="${card.hidden ? 'fas fa-eye-slash' : 'fas fa-eye'}"></i></button>
          <button class="btn btn-ghost btn-icon slider-card-edit-btn" data-id="${card.id}" type="button" style="padding:6px; color:var(--primary);" title="Edit Card"><i class="fas fa-edit"></i></button>
          <button class="btn btn-ghost btn-icon slider-card-delete-btn" data-id="${card.id}" type="button" style="padding:6px; color:var(--error);" title="Delete Card"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('');
    
    // Bind Drag & Drop Events
    let draggedId = null;
    container.querySelectorAll('.slider-card-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedId = item.dataset.id;
        e.dataTransfer.effectAllowed = 'move';
        item.style.opacity = '0.5';
      });
      item.addEventListener('dragend', () => {
        item.style.opacity = '';
        draggedId = null;
      });
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetId = item.dataset.id;
        if (draggedId && draggedId !== targetId) {
          const draggedIndex = localSliderSettings.cards.findIndex(c => c.id === draggedId);
          const targetIndex = localSliderSettings.cards.findIndex(c => c.id === targetId);
          if (draggedIndex > -1 && targetIndex > -1) {
            const [removed] = localSliderSettings.cards.splice(draggedIndex, 1);
            localSliderSettings.cards.splice(targetIndex, 0, removed);
            renderSliderCardsList();
          }
        }
      });
    });
    
    // Bind Hide/Show Toggle Buttons
    container.querySelectorAll('.slider-card-toggle-hide-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const card = localSliderSettings.cards.find(c => c.id === id);
        if (card) {
          card.hidden = !card.hidden;
          renderSliderCardsList();
        }
      });
    });
    
    // Bind Edit Buttons
    container.querySelectorAll('.slider-card-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openSliderCardModal(id);
      });
    });
    
    // Bind Delete Buttons
    container.querySelectorAll('.slider-card-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this slide card?')) {
          localSliderSettings.cards = localSliderSettings.cards.filter(c => c.id !== id);
          renderSliderCardsList();
        }
      });
    });
  };

  // Dialog / Modal handler to edit card
  const openSliderCardModal = (cardId = null) => {
    const modal = document.getElementById('admin-modal');
    if (!modal) return;
    
    let card;
    if (cardId) {
      card = localSliderSettings.cards.find(c => c.id === cardId);
    } else {
      card = {
        id: 'card-' + Math.random().toString(36).substr(2, 9),
        image_url: '',
        mobile_image_url: '',
        hidden: false
      };
    }
    
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 580px; width: 100%;">
        <div class="modal-header">
          <h3>${cardId ? 'Edit Slide Card' : 'Add Slide Card'}</h3>
          <button class="modal-close" id="slider-card-modal-close" aria-label="Close dialog">&times;</button>
        </div>
        <div class="modal-body" style="display:flex; flex-direction:column; gap:16px;">
          <!-- Desktop Banner Image -->
          <div class="form-group">
            <label class="form-label" style="font-weight:600;">Desktop Banner Image *</label>
            <div style="display:flex; gap:10px; align-items:center;">
              <div id="slider-card-thumb-preview" style="width:50px; height:50px; border-radius:var(--radius-sm); border:1px solid var(--border-color); overflow:hidden; display:flex; align-items:center; justify-content:center; background:#f9f9f9; flex-shrink:0;">
                ${card.image_url ? `<img src="${card.image_url}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-image" style="color:var(--text-muted);"></i>`}
              </div>
              <input type="text" id="edit-card-image-url" class="form-input" placeholder="https://image-link.com/desktop.webp" value="${escapeHTML(card.image_url || '')}" style="flex:1;">
              <button class="btn btn-dark" id="edit-card-image-upload-btn" type="button" aria-label="Upload Desktop Banner"><i class="fas fa-upload"></i></button>
              <input type="file" id="edit-card-image-file-input" style="display:none;" accept="image/*">
            </div>
          </div>

          <!-- Mobile Banner Image -->
          <div class="form-group">
            <label class="form-label" style="font-weight:600;">Mobile Banner Image (Optional)</label>
            <div style="display:flex; gap:10px; align-items:center;">
              <div id="slider-card-mobile-thumb-preview" style="width:50px; height:50px; border-radius:var(--radius-sm); border:1px solid var(--border-color); overflow:hidden; display:flex; align-items:center; justify-content:center; background:#f9f9f9; flex-shrink:0;">
                ${card.mobile_image_url ? `<img src="${card.mobile_image_url}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-mobile-alt" style="color:var(--text-muted);"></i>`}
              </div>
              <input type="text" id="edit-card-mobile-image-url" class="form-input" placeholder="https://image-link.com/mobile.webp" value="${escapeHTML(card.mobile_image_url || '')}" style="flex:1;">
              <button class="btn btn-dark" id="edit-card-mobile-image-upload-btn" type="button" aria-label="Upload Mobile Banner"><i class="fas fa-upload"></i></button>
              <input type="file" id="edit-card-mobile-image-file-input" style="display:none;" accept="image/*">
            </div>
          </div>
          
          <div style="display:flex; gap:20px; margin-top:4px;">
            <label class="switch-label" for="edit-card-hidden" style="margin:0;">
              <input type="checkbox" id="edit-card-hidden" class="switch-input" ${card.hidden ? 'checked' : ''}>
              <span class="switch-slider"></span>
              <span>Hide Card</span>
            </label>
          </div>
        </div>
        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
          <button class="btn btn-secondary" id="slider-card-modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="slider-card-modal-save">Apply Changes</button>
        </div>
      </div>
    `;
    
    // Upload desktop image inside card modal
    const cardUploadBtn = document.getElementById('edit-card-image-upload-btn');
    const cardFileInput = document.getElementById('edit-card-image-file-input');
    if (cardUploadBtn && cardFileInput) {
      cardUploadBtn.addEventListener('click', () => cardFileInput.click());
      cardFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        showLoader();
        try {
          const publicUrl = await db.uploadImage(file, 'brand-assets');
          document.getElementById('edit-card-image-url').value = publicUrl;
          const preview = document.getElementById('slider-card-thumb-preview');
          if (preview) {
            preview.innerHTML = `<img src="${escapeHTML(publicUrl)}" style="width:100%; height:100%; object-fit:cover;">`;
          }
          showToast('Desktop image uploaded successfully', 'success');
        } catch (err) {
          showToast('Image upload failed', 'error');
        } finally {
          hideLoader();
        }
      });
    }

    // Upload mobile image inside card modal
    const mobileUploadBtn = document.getElementById('edit-card-mobile-image-upload-btn');
    const mobileFileInput = document.getElementById('edit-card-mobile-image-file-input');
    if (mobileUploadBtn && mobileFileInput) {
      mobileUploadBtn.addEventListener('click', () => mobileFileInput.click());
      mobileFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        showLoader();
        try {
          const publicUrl = await db.uploadImage(file, 'brand-assets');
          document.getElementById('edit-card-mobile-image-url').value = publicUrl;
          const preview = document.getElementById('slider-card-mobile-thumb-preview');
          if (preview) {
            preview.innerHTML = `<img src="${escapeHTML(publicUrl)}" style="width:100%; height:100%; object-fit:cover;">`;
          }
          showToast('Mobile image uploaded successfully', 'success');
        } catch (err) {
          showToast('Image upload failed', 'error');
        } finally {
          hideLoader();
        }
      });
    }
    
    // Live update thumbnail on manual URL typing
    const cardUrlInput = document.getElementById('edit-card-image-url');
    if (cardUrlInput) {
      cardUrlInput.addEventListener('input', () => {
        const url = cardUrlInput.value.trim();
        const preview = document.getElementById('slider-card-thumb-preview');
        if (preview) {
          preview.innerHTML = url ? `<img src="${escapeHTML(url)}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-image" style="color:var(--text-muted);"></i>`;
        }
      });
    }

    const mobileUrlInput = document.getElementById('edit-card-mobile-image-url');
    if (mobileUrlInput) {
      mobileUrlInput.addEventListener('input', () => {
        const url = mobileUrlInput.value.trim();
        const preview = document.getElementById('slider-card-mobile-thumb-preview');
        if (preview) {
          preview.innerHTML = url ? `<img src="${escapeHTML(url)}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-mobile-alt" style="color:var(--text-muted);"></i>`;
        }
      });
    }
    
    // Save card modal
    const saveCardBtn = document.getElementById('slider-card-modal-save');
    const cancelCardBtn = document.getElementById('slider-card-modal-cancel');
    const closeCardBtn = document.getElementById('slider-card-modal-close');
    
    const closeModal = () => {
      modal.classList.remove('active');
    };
    
    closeCardBtn.addEventListener('click', closeModal);
    cancelCardBtn.addEventListener('click', closeModal);
    
    saveCardBtn.addEventListener('click', () => {
      const updatedCard = {
        id: card.id,
        image_url: document.getElementById('edit-card-image-url').value.trim(),
        mobile_image_url: document.getElementById('edit-card-mobile-image-url').value.trim(),
        hidden: document.getElementById('edit-card-hidden').checked
      };
      
      if (cardId) {
        // Edit existing card
        const idx = localSliderSettings.cards.findIndex(c => c.id === cardId);
        if (idx > -1) localSliderSettings.cards[idx] = updatedCard;
      } else {
        // Add new card
        localSliderSettings.cards.push(updatedCard);
      }
      
      closeModal();
      renderSliderCardsList();
    });
    
    modal.classList.add('active');
  };

  // Populate dynamic cards list
  renderSliderCardsList();

  // Bind Add Card Button
  const addCardBtn = document.getElementById('slider-add-card-btn');
  if (addCardBtn) {
    addCardBtn.addEventListener('click', () => {
      openSliderCardModal(null);
    });
  }

  // Bind sub-tabs toggle
  const subTabBtns = workspace.querySelectorAll('.customization-sub-tab-btn');
  const subTabPanels = workspace.querySelectorAll('.customization-subtab-panel');
  subTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.subtab;
      subTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      subTabPanels.forEach(panel => {
        panel.style.display = panel.id === `customization-subtab-${tabId}` ? 'block' : 'none';
      });
    });
  });

  // Color pickers syncing
  const annBgInput = document.getElementById('settings-announcement-bg-color');
  const annBgText = document.getElementById('settings-announcement-bg-color-text');
  if (annBgInput && annBgText) {
    annBgInput.addEventListener('input', (e) => annBgText.value = e.target.value);
    annBgText.addEventListener('input', (e) => {
      if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) annBgInput.value = e.target.value;
    });
  }

  const annTxtInput = document.getElementById('settings-announcement-text-color');
  const annTxtText = document.getElementById('settings-announcement-text-color-text');
  if (annTxtInput && annTxtText) {
    annTxtInput.addEventListener('input', (e) => annTxtText.value = e.target.value);
    annTxtText.addEventListener('input', (e) => {
      if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) annTxtInput.value = e.target.value;
    });
  }

  const ctaBgInput = document.getElementById('settings-cta-banner-bg-color');
  const ctaBgText = document.getElementById('settings-cta-banner-bg-color-text');
  if (ctaBgInput && ctaBgText) {
    ctaBgInput.addEventListener('input', (e) => ctaBgText.value = e.target.value);
    ctaBgText.addEventListener('input', (e) => {
      if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) ctaBgInput.value = e.target.value;
    });
  }

  // Promotional Banner image uploader
  const promoFileBtn = document.getElementById('settings-promo-banner-upload-btn');
  const promoFileInput = document.getElementById('settings-promo-banner-file-input');
  if (promoFileBtn && promoFileInput) {
    promoFileBtn.addEventListener('click', () => promoFileInput.click());
    promoFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      showLoader();
      try {
        const publicUrl = await db.uploadImage(file, 'brand-assets');
        document.getElementById('settings-promo-banner-image-url').value = publicUrl;
        const previewWrap = document.getElementById('settings-promo-banner-preview-wrap');
        if (previewWrap) {
          previewWrap.innerHTML = `<img src="${escapeHTML(publicUrl)}" style="max-height: 80px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">`;
        }
        showToast('Promotional banner uploaded successfully', 'success');
      } catch (err) {
        showToast('Promo banner upload failed', 'error');
      } finally {
        hideLoader();
      }
    });
  }

  // Promotional Banner manual input preview syncing
  const promoBannerInput = document.getElementById('settings-promo-banner-image-url');
  if (promoBannerInput) {
    promoBannerInput.addEventListener('input', () => {
      const url = promoBannerInput.value.trim();
      const previewWrap = document.getElementById('settings-promo-banner-preview-wrap');
      if (previewWrap) {
        previewWrap.innerHTML = url ? `<img src="${escapeHTML(url)}" style="max-height: 80px; margin-top:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:#fff; padding: 4px; object-fit:contain;">` : '';
      }
    });
  }

  // Toggle Background types for Hero
  const bgTypeEl = document.getElementById('settings-hero-bg-type');
  const bgGradInput = document.getElementById('settings-hero-bg-gradient');
  const bgImgWrap = document.getElementById('settings-hero-image-wrap');
  if (bgTypeEl && bgGradInput && bgImgWrap) {
    bgTypeEl.addEventListener('change', (e) => {
      if (e.target.value === 'gradient') {
        bgGradInput.style.display = 'block';
        bgImgWrap.style.display = 'none';
      } else {
        bgGradInput.style.display = 'none';
        bgImgWrap.style.display = 'flex';
      }
    });
  }

  // Background Image upload handler
  const bgFileBtn = document.getElementById('settings-hero-bg-upload-btn');
  const bgFileInput = document.getElementById('settings-hero-bg-file-input');
  if (bgFileBtn && bgFileInput) {
    bgFileBtn.addEventListener('click', () => bgFileInput.click());
    bgFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      showLoader();
      try {
        const publicUrl = await db.uploadImage(file, 'brand-assets');
        document.getElementById('settings-hero-bg-image').value = publicUrl;
        showToast('Hero background uploaded successfully', 'success');
      } catch (err) {
        showToast('Hero image upload failed', 'error');
      } finally {
        hideLoader();
      }
    });
  }

  // Hero Product Images upload and clear handlers
  for (let i = 0; i < 6; i++) {
    const uploadBtn = workspace.querySelector(`.settings-hero-upload-btn[data-slot="${i}"]`);
    const fileInput = document.getElementById(`settings-hero-file-input-${i}`);
    const clearBtn = workspace.querySelector(`.settings-hero-clear-btn[data-slot="${i}"]`);
    const inputEl = document.getElementById(`settings-hero-image-${i}`);
    const previewEl = document.getElementById(`hero-thumb-preview-${i}`);

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        showLoader();
        try {
          const publicUrl = await db.uploadImage(file, 'brand-assets');
          if (inputEl) inputEl.value = publicUrl;
          if (previewEl) previewEl.innerHTML = `<img src="${escapeHTML(publicUrl)}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
          showToast(`Hero image ${i + 1} uploaded successfully`, 'success');
        } catch (err) {
          showToast(`Hero image ${i + 1} upload failed`, 'error');
        } finally {
          hideLoader();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (inputEl) inputEl.value = '';
        if (previewEl) previewEl.innerHTML = `<i class="fas fa-image" style="color: var(--text-muted);"></i>`;
      });
    }

    if (inputEl && previewEl) {
      inputEl.addEventListener('input', () => {
        const url = inputEl.value.trim();
        if (url) {
          previewEl.innerHTML = `<img src="${escapeHTML(url)}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        } else {
          previewEl.innerHTML = `<i class="fas fa-image" style="color: var(--text-muted);"></i>`;
        }
      });
    }
  }

  // Video Section 1 source toggle
  const video1TypeSelect = document.getElementById('settings-video1-type');
  const video1UploadWrap = document.getElementById('settings-video1-upload-wrap');
  const video1YoutubeInput = document.getElementById('settings-video1-youtube');
  if (video1TypeSelect && video1UploadWrap && video1YoutubeInput) {
    video1TypeSelect.addEventListener('change', (e) => {
      if (e.target.value === 'upload') {
        video1UploadWrap.style.display = 'flex';
        video1YoutubeInput.style.display = 'none';
      } else {
        video1UploadWrap.style.display = 'none';
        video1YoutubeInput.style.display = 'block';
      }
    });
  }

  // Video Section 1 MP4 upload handler
  const video1FileBtn = document.getElementById('settings-video1-upload-btn');
  const video1FileInput = document.getElementById('settings-video1-file-input');
  if (video1FileBtn && video1FileInput) {
    video1FileBtn.addEventListener('click', () => video1FileInput.click());
    video1FileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      showLoader();
      try {
        const publicUrl = await db.uploadImage(file, 'brand-assets');
        document.getElementById('settings-video1-mp4').value = publicUrl;
        showToast('Section 1 video uploaded successfully', 'success');
      } catch (err) {
        showToast('Section 1 video upload failed', 'error');
      } finally {
        hideLoader();
      }
    });
  }

  // Video Section 2 source toggle
  const video2TypeSelect = document.getElementById('settings-video2-type');
  const video2UploadWrap = document.getElementById('settings-video2-upload-wrap');
  const video2YoutubeInput = document.getElementById('settings-video2-youtube');
  if (video2TypeSelect && video2UploadWrap && video2YoutubeInput) {
    video2TypeSelect.addEventListener('change', (e) => {
      if (e.target.value === 'upload') {
        video2UploadWrap.style.display = 'flex';
        video2YoutubeInput.style.display = 'none';
      } else {
        video2UploadWrap.style.display = 'none';
        video2YoutubeInput.style.display = 'block';
      }
    });
  }

  // Video Section 2 MP4 upload handler
  const video2FileBtn = document.getElementById('settings-video2-upload-btn');
  const video2FileInput = document.getElementById('settings-video2-file-input');
  if (video2FileBtn && video2FileInput) {
    video2FileBtn.addEventListener('click', () => video2FileInput.click());
    video2FileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      showLoader();
      try {
        const publicUrl = await db.uploadImage(file, 'brand-assets');
        document.getElementById('settings-video2-mp4').value = publicUrl;
        showToast('Section 2 video uploaded successfully', 'success');
      } catch (err) {
        showToast('Section 2 video upload failed', 'error');
      } finally {
        hideLoader();
      }
    });
  }

  // Save Customization Click
  const saveBtn = document.getElementById('customization-save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const video1Select = document.getElementById('settings-video1-type');
      const video2Select = document.getElementById('settings-video2-type');
      const heroBgSelect = document.getElementById('settings-hero-bg-type');

      const payload = {
        hero_title: document.getElementById('settings-hero-title').value.trim(),
        hero_description: document.getElementById('settings-hero-desc').value.trim(),
        hero_bg_type: heroBgSelect ? heroBgSelect.value : 'gradient',
        hero_bg_gradient: document.getElementById('settings-hero-bg-gradient').value.trim(),
        hero_bg_image_url: document.getElementById('settings-hero-bg-image').value.trim() || null,
        hero_product_images: Array.from({ length: 6 }).map((_, idx) => {
          const el = document.getElementById(`settings-hero-image-${idx}`);
          return el ? el.value.trim() : '';
        }).filter(Boolean),
        hero_product_image_url: (document.getElementById('settings-hero-image-0') ? document.getElementById('settings-hero-image-0').value.trim() : '') || '/hero_product.png',
        hero_badge_1_text: document.getElementById('settings-hero-badge-1-text').value.trim() || null,
        hero_badge_1_icon: document.getElementById('settings-hero-badge-1-icon').value.trim() || null,
        hero_badge_2_text: document.getElementById('settings-hero-badge-2-text').value.trim() || null,
        hero_badge_2_icon: document.getElementById('settings-hero-badge-2-icon').value.trim() || null,
        announcement_show: document.getElementById('settings-announcement-show').checked,
        announcement_text: document.getElementById('settings-announcement-text').value.trim(),
        announcement_bg_color: document.getElementById('settings-announcement-bg-color-text').value.trim(),
        announcement_text_color: document.getElementById('settings-announcement-text-color-text').value.trim(),
        promo_banner_show: document.getElementById('settings-promo-banner-show').checked,
        promo_banner_image_url: document.getElementById('settings-promo-banner-image-url').value.trim() || null,
        promo_banner_link: document.getElementById('settings-promo-banner-link').value.trim() || null,
        cta_banner_show: document.getElementById('settings-cta-banner-show').checked,
        cta_banner_title: document.getElementById('settings-cta-banner-title').value.trim(),
        cta_banner_desc: document.getElementById('settings-cta-banner-desc').value.trim(),
        cta_banner_btn_text: document.getElementById('settings-cta-banner-btn-text').value.trim(),
        cta_banner_bg_color: document.getElementById('settings-cta-banner-bg-color-text').value.trim(),
        show_top_products: document.getElementById('settings-show-top-products').checked,
        show_best_sellers: document.getElementById('settings-show-best-sellers').checked,
        show_trending_products: document.getElementById('settings-show-trending-products').checked,
        video1_show: document.getElementById('settings-video1-show').checked,
        video1_title: document.getElementById('settings-video1-title').value.trim() || null,
        video1_desc: document.getElementById('settings-video1-desc').value.trim() || null,
        video1_type: video1Select ? video1Select.value : 'upload',
        video1_mp4_url: document.getElementById('settings-video1-mp4').value.trim() || null,
        video1_youtube_url: document.getElementById('settings-video1-youtube').value.trim() || null,
        video2_show: document.getElementById('settings-video2-show').checked,
        video2_title: document.getElementById('settings-video2-title').value.trim() || null,
        video2_desc: document.getElementById('settings-video2-desc').value.trim() || null,
        video2_type: video2Select ? video2Select.value : 'upload',
        video2_mp4_url: document.getElementById('settings-video2-mp4').value.trim() || null,
        video2_youtube_url: document.getElementById('settings-video2-youtube').value.trim() || null,
        footer_copyright: document.getElementById('settings-copyright').value.trim(),
        social_facebook: document.getElementById('settings-fb').value.trim() || null,
        social_instagram: document.getElementById('settings-ig').value.trim() || null,
        social_twitter: document.getElementById('settings-twitter').value.trim() || null,
        social_linkedin: document.getElementById('settings-linkedin').value.trim() || null,
        
        // Compile slider settings into JSON
        slider_settings: {
          enabled: document.getElementById('settings-slider-enabled').checked,
          auto_slide: document.getElementById('settings-slider-auto-slide').checked,
          interval: parseInt(document.getElementById('settings-slider-interval').value) || 6,
          transition_speed: parseFloat(document.getElementById('settings-slider-transition-speed').value) || 0.5,
          infinite_loop: document.getElementById('settings-slider-infinite').checked,
          show_arrows: document.getElementById('settings-slider-show-arrows').checked,
          show_dots: document.getElementById('settings-slider-show-dots').checked,
          aspect_ratio_desktop: document.getElementById('settings-slider-aspect-desktop').value,
          aspect_ratio_mobile: document.getElementById('settings-slider-aspect-mobile').value,
          cards: localSliderSettings.cards
        }
      };

      showLoader();
      try {
        const newSettings = await db.updateSettings(payload);
        // Succeeded: clean up localStorage fallback
        localStorage.removeItem('fallback_slider_settings');
        showToast('Website customizations saved successfully', 'success');
        applyBranding(newSettings);
        setTimeout(() => renderActiveWorkspaceTab(), 1000);
      } catch (err) {
        console.error(err);
        showToast('Failed to save website customizations', 'error');
      } finally {
        hideLoader();
      }
    });
  }
}

// ==========================================
// TAB 6: REVIEWS MANAGEMENT
// ==========================================
async function renderTabReviews(workspace) {
  const reviews = await db.fetchAllReviewsAdmin();

  workspace.innerHTML = `
    <div class="admin-header-row">
      <div class="admin-title-desc">
        <h2 class="admin-title">Manage Customer Reviews</h2>
        <span class="admin-subtitle">Moderate, delete, or write custom product reviews.</span>
      </div>
      <button class="btn btn-primary" id="admin-add-review-btn">
        <i class="fas fa-plus"></i> Add Custom Review
      </button>
    </div>
    
    <div class="admin-table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Reviewer</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${reviews.length > 0 ? reviews.map(r => `
            <tr>
              <td><strong>${escapeHTML(r.products ? r.products.title : 'Deleted Product')}</strong></td>
              <td>${escapeHTML(r.reviewer_name)}</td>
              <td>
                <div class="rating-stars" style="font-size:0.75rem;">
                  ${Array.from({ length: 5 }).map((_, i) => `<i class="${i < r.rating ? 'fas' : 'far'} fa-star"></i>`).join('')}
                </div>
              </td>
              <td><span style="font-size:0.8rem; color:var(--text-sub); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHTML(r.comment || '')}</span></td>
              <td>
                <span class="section-badge" style="font-size:0.65rem; padding: 4px 8px; border-radius:var(--r-xs); text-transform:none; letter-spacing:0; color: ${r.approved ? 'var(--success)' : 'var(--error)'}; background: ${r.approved ? 'var(--success-bg)' : 'var(--error-bg)'};">
                  ${r.approved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td>
                <div class="cell-actions">
                  <button class="btn-icon toggle-approve-btn" data-id="${r.id}" data-approved="${r.approved}" title="${r.approved ? 'Unapprove' : 'Approve'}" style="color: ${r.approved ? '#f59e0b' : '#10b981'};">
                    <i class="fas fa-${r.approved ? 'circle-xmark' : 'circle-check'}"></i>
                  </button>
                  <button class="btn-icon btn-delete delete-review-btn" data-id="${r.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="6" style="text-align:center; padding: 32px 0; color:var(--text-secondary);">No reviews found.</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  // Bind add review button
  document.getElementById('admin-add-review-btn').addEventListener('click', () => openAddReviewModal());

  // Bind approve/unapprove triggers
  document.querySelectorAll('.toggle-approve-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const currentApproved = btn.dataset.approved === 'true';
      showLoader();
      try {
        await db.updateReviewApproval(id, !currentApproved);
        showToast(!currentApproved ? 'Review approved' : 'Review unapproved', 'success');
        renderActiveWorkspaceTab();
      } catch (err) {
        showToast('Failed to update review status', 'error');
      } finally {
        hideLoader();
      }
    });
  });

  // Bind delete triggers
  document.querySelectorAll('.delete-review-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmDelete = confirm('Are you sure you want to delete this review?');
      if (confirmDelete) {
        showLoader();
        try {
          await db.deleteReview(btn.dataset.id);
          showToast('Review deleted successfully', 'success');
          renderActiveWorkspaceTab();
        } catch (err) {
          showToast('Failed to delete review', 'error');
        } finally {
          hideLoader();
        }
      }
    });
  });
}

// 6a. ADD REVIEW MODAL
async function openAddReviewModal() {
  const modal = document.getElementById('admin-modal');
  showLoader();
  let products = [];
  try {
    products = await db.fetchProducts();
  } catch (err) {
    showToast('Failed to load products list', 'error');
    hideLoader();
    return;
  }
  hideLoader();

  if (products.length === 0) {
    showToast('You must add at least one product before writing reviews.', 'error');
    return;
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 460px;">
      <div class="modal-header">
        <h3 class="modal-title">Write Custom Review</h3>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Select Product</label>
          <select id="rev-product-id" class="form-input" required>
            ${products.map(p => `<option value="${p.id}">${escapeHTML(p.title)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Reviewer Name</label>
          <input type="text" id="rev-reviewer-name" class="form-input" placeholder="e.g. John Doe" required>
        </div>
        <div class="form-group">
          <label class="form-label">Rating (1 to 5 Stars)</label>
          <select id="rev-rating" class="form-input" required>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Review Comment</label>
          <textarea id="rev-comment" class="form-input" style="height:90px; resize:none;" placeholder="Write review comments..."></textarea>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn-primary" id="modal-save-btn">Save Review</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  currentModal = modal;

  // Bind Close
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const closeModal = () => {
    modal.classList.remove('active');
    currentModal = null;
  };
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Save Trigger
  const saveBtn = document.getElementById('modal-save-btn');
  saveBtn.addEventListener('click', async () => {
    const productId = document.getElementById('rev-product-id').value;
    const reviewerName = document.getElementById('rev-reviewer-name').value.trim();
    const rating = parseInt(document.getElementById('rev-rating').value);
    const comment = document.getElementById('rev-comment').value.trim();

    if (!reviewerName) {
      showToast('Reviewer name is required', 'error');
      return;
    }

    showLoader();
    try {
      await db.saveReview({
        product_id: productId,
        reviewer_name: reviewerName,
        rating,
        comment: comment || null,
        approved: true // Default manual custom reviews as approved
      });
      showToast('Custom review created successfully', 'success');
      closeModal();
      renderActiveWorkspaceTab();
    } catch (err) {
      showToast(err.message || 'Failed to save review', 'error');
    } finally {
      hideLoader();
    }
  });
}

