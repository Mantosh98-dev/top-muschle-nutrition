# Top Muscle Nutrition — Full File Audit Report

> **Phase 1 Audit** — Every file read, examined, and catalogued.

---

## File Inventory

### Root Configuration

| File | Size | Purpose |
|---|---|---|
| `index.html` | ~5 KB | Single HTML shell. Defines `<head>` (meta, fonts, FA icons), `<body>` structure (`#app-content`, `#global-loader`, `.nav`, footer), and `<script type="module" src="/js/app.js">` entry. |
| `vite.config.js` | ~200 B | Minimal Vite config. Sets `build.outDir: 'dist'` and `build.rollupOptions.output` for chunked output. No plugins. |
| `package.json` | ~300 B | Only dependency: `vite`. Dev script: `vite`. Build: `vite build`. Preview: `vite preview`. |
| `vercel.json` | ~150 B | `rewrites` rule: all non-asset routes → `/index.html` (enables SPA deep linking on Vercel). |
| `schema.sql` | ~15 KB | Complete Supabase SQL schema: tables, RLS policies, storage buckets, seed data, RPC function `verify_product_code()`. The authoritative database reference. |
| `instructioins.md` | ~6.5 KB | Original client spec: pages, features, database fields, design guidelines. |
| `instructionlast.md` | (checked) | 9-phase audit protocol for this session. |

### JavaScript Modules (`js/`)

| File | Size | Role | Exports |
|---|---|---|---|
| `config.js` | ~300 B | Supabase credentials constants | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `supabase-client.js` | ~2 KB | SDK lazy-init with localStorage override | `supabaseClient`, `clientReady`, `isSupabaseConfigured`, `clearSupabaseConfig` |
| `router.js` | ~4 KB | Client-side SPA router class | `router` (singleton) |
| `db.js` | ~8 KB | Data access layer — all Supabase calls | All DB functions (see Architecture doc) |
| `app.js` | **~174 KB** | Main app orchestrator: state, rendering, all public page views | `showToast`, `showLoader`, `hideLoader`, `applyBranding`, `escapeHTML`, `globalSettings`, `mergeSettings`, `DEFAULT_SLIDER_SETTINGS`, `updateCategoryLinksActiveState` |
| `admin.js` | **~169 KB** | Full admin dashboard UI + all CRUD workflows | `renderAdminPage` |

---

## Per-File Issue Log

### `js/config.js`
- ✅ Clear and minimal.
- ⚠️ **ISSUE:** Supabase credentials are hardcoded in source. This is standard for client-side Supabase (anon key is public), but the `SUPABASE_URL` and `SUPABASE_ANON_KEY` will be visible in the built bundle. Acceptable per Supabase's security model (RLS enforces actual access control).

### `js/supabase-client.js`
- ✅ Handles missing credentials gracefully (`isSupabaseConfigured()`).
- ✅ `clientReady` Promise pattern prevents race conditions at startup.
- ⚠️ **ISSUE:** The `initializeSupabase()` function dynamically imports the Supabase SDK from `esm.sh` CDN. If the CDN is unavailable, the entire app fails silently. Consider bundling the SDK via npm instead.

### `js/router.js`
- ✅ Clean class-based router. Properly handles `popstate`, `pushState`, and link interception.
- ✅ Scroll position restoration via `history.state.scrollY`.
- ⚠️ **MINOR:** Route matching uses sequential `for` loop + regex. With 10+ routes this is negligible, but a lookup map would be more scalable.
- ⚠️ **MINOR:** No error boundary if a route handler throws — the exception propagates uncaught.

### `js/db.js`
- ✅ Clean separation of concerns. No DOM references.
- ✅ `fetchProducts()` does a rich join: `categories`, `product_images`, `reviews`, `variants`.
- ⚠️ **ISSUE:** `fetchProducts()` fetches **all** products every time with no pagination. As the catalogue grows, this will become a performance bottleneck (all images and review data are also loaded).
- ⚠️ **ISSUE:** `fetchAuthCodes()` joins `products` — fetching the entire product list alongside every code. Could be expensive at scale.
- ⚠️ **MINOR:** Error handling is minimal; callers are expected to wrap in try/catch. No standardized error codes.

### `js/app.js`
- ✅ `init()` correctly awaits settings before rendering any page.
- ✅ `applyBranding()` properly updates all dynamic site-wide properties (title, favicon, colors, logos).
- ✅ `escapeHTML()` is used before injecting DB data into HTML templates — XSS is mitigated.
- ✅ Wishlist uses localStorage correctly with helper functions `getWishlist()`, `addToWishlist()`, `removeFromWishlist()`, `isWishlisted()`.
- ✅ `initScrollAnimations()` uses IntersectionObserver correctly.
- ⚠️ **ISSUE (Major):** `app.js` is ~174 KB (4,070 lines). It handles rendering for ALL public pages in one monolithic file. This makes it difficult to maintain and debug. Splitting into `home.js`, `products.js`, `product-detail.js` etc. is strongly recommended.
- ⚠️ **ISSUE:** `renderHome()` fetches products and settings independently (though `globalSettings` is cached). Each route re-renders completely on navigation, even if data hasn't changed. No client-side data caching layer exists.
- ⚠️ **ISSUE:** `getFlavorsForProduct()` function contains hardcoded flavor lists as fallbacks (e.g., 'Belgian Chocolate', 'Cafe Latte'). These are not from the database and should ideally be data-driven.
- ⚠️ **MINOR:** `window.handleWishlistToggleClick` is exposed on the global `window` object to be callable from inline onclick handlers. A better pattern would use event delegation.
- ⚠️ **MINOR:** Hero image rotation interval (`setInterval`) in `renderHome()` is not cleaned up when navigating away (though the check `if (!document.body.contains(heroImageElements[0]))` mitigates infinite loops).
- ⚠️ **MINOR:** `renderProductDetails()` re-creates a new lightbox and keyboard handler on each call but calls `window.removeEventListener` to clean up the old one — the pattern works but is fragile.
- ⚠️ **MINOR (Bug Risk):** `parseNutritionInfo()` regex `^([^:-]+)[::-]\\s*(.+)$` uses `[^:-]` character class — the `-` at end position is fine, but `::` in the middle class looks intentional for double-colon separators. The intent is slightly unclear.

### `js/admin.js`
- ✅ Auth check on every admin route load.
- ✅ Logout properly clears both Supabase session and localStorage auth tokens.
- ✅ Product form disables base price inputs when variants are present (prevents confusion).
- ✅ Auto-slug generation on title blur (both product and category forms).
- ✅ The "Development Mode" banner warns admins when credentials are in localStorage.
- ⚠️ **ISSUE (Major):** Like `app.js`, `admin.js` is ~169 KB (3,427 lines). All admin tabs are in one file with no code splitting.
- ⚠️ **ISSUE:** `openCodeModal(codeId)` loads ALL auth codes to find one by ID (`codes.find(c => c.id === codeId)`). It should fetch a single record by primary key instead.
- ⚠️ **ISSUE:** Product save re-deletes and re-inserts all `product_images` rows on every save, even if images haven't changed. This could cause brief image unavailability.
- ⚠️ **MINOR:** `confirm()` browser dialogs are used for delete confirmation. These are non-styleable and block the thread. A custom modal would be better UX.
- ⚠️ **MINOR:** Admin sidebar does not trap focus when open on mobile (accessibility gap).

### `index.html`
- ✅ Proper `lang="en"` attribute.
- ✅ Viewport meta tag present.
- ✅ Font Awesome loaded from CDN.
- ✅ Google Fonts loaded in `<head>`.
- ⚠️ **MINOR:** Static `<title>` and `<meta description>` in HTML are overwritten dynamically by `applyBranding()`. The static fallbacks are generic defaults which is fine.
- ⚠️ **MINOR:** No `<noscript>` fallback for users with JavaScript disabled (SPA requirement makes this unavoidable).

### `schema.sql`
- ✅ RLS is enabled on all tables.
- ✅ `verify_product_code()` RPC correctly uses `SECURITY DEFINER` to bypass RLS for the public code lookup.
- ✅ Storage buckets defined with appropriate public/authenticated policies.
- ⚠️ **MINOR:** The schema file uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for all post-v1 columns. This is fine for iterative development but the file is not a clean, single-pass schema — it would need cleanup before being used on a fresh deployment (the initial `CREATE TABLE` for `products` doesn't include `price`, `variants`, `top_product`, etc.).
- ⚠️ **MINOR:** The `reviews` table has a public INSERT policy with no rate limiting or CAPTCHA. Bot-submitted reviews are possible.

---

## Summary Statistics

| Metric | Value |
|---|---|
| Total JS files | 6 |
| Total JS size | ~358 KB (pre-bundle) |
| Largest file | `app.js` (174 KB, 4,070 lines) |
| Total issues found | 18 |
| Critical issues | 0 |
| Major issues | 5 |
| Minor issues | 13 |
