# Top Muscle Nutrition — Architecture Document

## System Diagram

```
Browser
  │
  ├─► index.html  (single HTML shell — all routes return this)
  │      │
  │      ├─ <link> CSS bundle
  │      └─ <script type="module"> → js/app.js (entry point)
  │
  └─► js/app.js
        │
        ├─ imports Router          (js/router.js)
        ├─ imports db              (js/db.js)
        ├─ imports supabaseClient  (js/supabase-client.js ← js/config.js)
        │
        ├── init()                 ─► fetchSettings → applyBranding → router.init()
        │
        └── Route handlers (SPA pages rendered via innerHTML into #app-content)
              │
              ├── renderHome()
              ├── renderProducts()
              ├── renderProductDetails()
              ├── renderProductVerification()
              ├── renderCategories()
              ├── renderAbout() / renderPrivacyPolicy() / renderTerms()
              ├── renderCart() / renderAccount()
              ├── render404()
              └── renderAdminPage() ─► import('./admin.js') [lazy load]
```

---

## Module Responsibilities

### `js/config.js`
- Exports `SUPABASE_URL` and `SUPABASE_ANON_KEY` constants (hardcoded for production).
- **Never** import `supabaseClient` from here; always import from `supabase-client.js`.

### `js/supabase-client.js`
- Lazily initializes the Supabase JS SDK client.
- Reads credentials from `localStorage` first (dev override), then falls back to `js/config.js`.
- Exports: `supabaseClient`, `clientReady` (Promise), `isSupabaseConfigured()`, `clearSupabaseConfig()`.
- `clientReady` is an async Promise that resolves when the SDK is loaded and client created.

### `js/db.js`
- Pure data-access layer. **No DOM access whatsoever.**
- All functions are `async` and return typed data.
- Key functions:

| Function | Table | Notes |
|---|---|---|
| `fetchSettings()` | `settings` | Returns raw row (id=1) |
| `updateSettings(payload)` | `settings` | UPSERT with `{ id: 1 }` |
| `fetchProducts(filters?)` | `products` | Joins `categories`, `product_images`, `variants` |
| `fetchProductBySlug(slug)` | `products` | Full join including `reviews` |
| `fetchProductById(id)` | `products` | Admin edit mode |
| `saveProduct(payload, images)` | `products` + `product_images` | Upsert + image sync |
| `deleteProduct(id)` | `products` | CASCADE handled by DB |
| `fetchCategories()` | `categories` | — |
| `saveCategory(payload)` | `categories` | Upsert |
| `deleteCategory(id)` | `categories` | — |
| `fetchAuthCodes()` | `authentication_codes` | Joins `products` |
| `saveAuthCode(payload)` | `authentication_codes` | Upsert |
| `deleteAuthCode(id)` | `authentication_codes` | — |
| `verifyProductCode(code)` | RPC `verify_product_code()` | SECURITY DEFINER fn |
| `fetchReviews(productId)` | `reviews` | Only `approved = true` for public |
| `saveReview(payload)` | `reviews` | Public INSERT, `approved: false` |
| `uploadImage(file, bucket)` | Supabase Storage | Returns public URL |

### `js/router.js`
- Class-based SPA router (`class Router`).
- Intercepts `<a>` clicks (excluding external, anchor, download, and mailto links).
- Manages `history.pushState` / `popstate` for back/forward navigation.
- `router.navigate(path)` — programmatic navigation.
- `router.addRoute(pattern, handler)` — registers a route (supports `:param` captures).
- Scroll position restoration via `history.state.scrollY`.

### `js/app.js`
- **Main orchestrator.** Exports helper functions used by `admin.js`.
- Key global state:
  - `globalSettings` — cached settings row object.
  - `activeCategoryFilter`, `activeBrandFilter`, `productSearchQuery` — catalogue filter state.
- Key exports:
  - `showToast(message, type)` — toast notification system.
  - `showLoader()` / `hideLoader()` — full-screen spinner.
  - `applyBranding(settings)` — applies colors, logos, title, favicon to DOM.
  - `escapeHTML(str)` — XSS-safe HTML escaping utility.
  - `globalSettings` — re-exported for admin.js consumption.
  - `mergeSettings(raw)` — merges DB row with `DEFAULT_SLIDER_SETTINGS` defaults.
  - `DEFAULT_SLIDER_SETTINGS` — constant containing all slider defaults.
  - `updateCategoryLinksActiveState()` — updates active class on nav links.

### `js/admin.js`
- Lazy-loaded only when `/admin` route is matched.
- Imports from `app.js`, `db.js`, `router.js`, `supabase-client.js`.
- Entry point: `renderAdminPage(params)` — checks auth session and renders accordingly.
- Manages:
  - Login form (`renderLogin()`)
  - Dashboard shell with sidebar (`renderDashboard()`)
  - Per-tab workspace rendering (`renderActiveWorkspaceTab()` — switches on `activeTab`)
  - All CRUD modals for products, categories, codes, reviews
  - Settings forms for branding, contacts, SEO
  - Website Customization sub-tabs: Hero Slider, Banners, Homepage Feeds, Footer Socials

---

## Data Flow

### Public user visits product page
```
Browser → /product/gold-whey → Router matches /product/:slug
  → renderProductDetails({ slug: "gold-whey" })
    → db.fetchProductBySlug("gold-whey")   [Supabase SELECT with join]
    → db.fetchReviews(product.id)
    → db.fetchProducts({ category_id: ... }) [related products]
    → Build HTML string → appContent.innerHTML = html
    → Bind event listeners (gallery, lightbox, variants, reviews)
```

### Admin saves a product
```
Admin → modal form → "Save Product" button
  → Validate fields
  → db.saveProduct(payload, tempProductImages)
    → supabaseClient.from('products').upsert(payload)
    → DELETE old product_images WHERE product_id = id
    → INSERT new product_images rows
  → showToast('success')
  → closeModal()
  → renderActiveWorkspaceTab() [re-renders table]
```

### Settings applied to live site
```
Admin → "Save Global Configurations" → db.updateSettings(payload)
  → UPSERT settings row id=1
  → applyBranding(newSettings)
    → document.title = seo_title
    → meta description content
    → CSS variables: --primary-color, --secondary-color
    → navbar logo src
    → favicon href
```

---

## State Management

| State | Location | Persistence |
|---|---|---|
| `globalSettings` | In-memory (`app.js` module-level var) | Fetched once at init |
| `activeCategoryFilter` | In-memory (`app.js`) | URL query param |
| Wishlist | `localStorage` key `"wishlist"` | Persistent across sessions |
| Admin auth session | Supabase SDK + `localStorage` `sb-*-auth-token` key | JWT-based |
| Admin theme (dark/light) | `localStorage` key `"admin-theme"` | Persistent |
| Admin active tab | `activeTab` variable in `admin.js` | In-memory only |
| Supabase dev credentials | `localStorage` `SUPABASE_URL` + `SUPABASE_ANON_KEY` | Dev override |

---

## Security Model

| Concern | Approach |
|---|---|
| **Admin access** | Supabase Auth (email/password). Session checked on every `/admin` route load. |
| **Public reads** | Row Level Security (RLS) policies: public SELECT on `products`, `categories`, `settings`, `product_images`, approved `reviews`. |
| **Authenticated writes** | Admin (authenticated role) gets full CRUD via `FOR ALL TO authenticated` RLS policies. |
| **Auth code listing** | Public users **cannot** SELECT from `authentication_codes`. Only the RPC function `verify_product_code()` (SECURITY DEFINER) allows a point-lookup by code. |
| **Review submission** | Public INSERT allowed on `reviews` table. `approved` defaults to `false`. Admin must approve via admin panel. |
| **XSS prevention** | `escapeHTML()` helper used before injecting any user/DB data into HTML templates. |
| **Supabase credentials** | Anon key is public by design (Supabase model). RLS is the real security boundary. |

---

## Performance Patterns

- **Lazy loading images:** All product images use `loading="lazy"` and `decoding="async"`.
- **Lazy module loading:** `admin.js` is only imported via `import('./admin.js')` when the `/admin` route is accessed.
- **Parallel data fetching:** `Promise.all()` is used extensively to fetch multiple data sources concurrently.
- **No framework overhead:** Vanilla JS + Vite = minimal bundle size with full tree shaking.
- **Scroll position restoration:** Router saves `scrollY` in `history.state` and restores it after navigation.
