# Top Muscle Nutrition — Issues & Recommendations

> Based on the Phase 1 full codebase audit.  
> Issues are ranked by **Priority**: 🔴 High | 🟡 Medium | 🟢 Low

---

## 🔴 High Priority

### ISS-001 — `app.js` is a 4,070-line monolith
**File:** `js/app.js`  
**Problem:** All public page rendering functions live in a single 174 KB file. This makes it extremely hard to:
- Locate specific functionality
- Test individual features
- Collaborate or onboard new developers
- Optimize bundle splitting

**Recommendation:** Refactor into per-page modules:
- `js/pages/home.js`
- `js/pages/products.js`
- `js/pages/product-detail.js`
- `js/pages/verify.js`
- `js/pages/cart.js`
- Keep shared utilities in `js/utils.js` or `js/ui.js`

---

### ISS-002 — `admin.js` is a 3,427-line monolith
**File:** `js/admin.js`  
**Problem:** Same structural issue as `app.js`. All admin tabs — products, categories, settings, customization, reviews, codes — are in one file.

**Recommendation:** Split into per-tab modules:
- `js/admin/products-tab.js`
- `js/admin/settings-tab.js`
- `js/admin/customization-tab.js`
- `js/admin/codes-tab.js`
- `js/admin/reviews-tab.js`

---

### ISS-003 — No pagination on product fetch
**File:** `js/db.js` → `fetchProducts()`  
**Problem:** All products with their joined images and reviews are fetched in a single Supabase query. As the catalogue grows (50+ products × 10 images × reviews), this will significantly increase load time and bandwidth.

**Recommendation:** Implement server-side pagination using Supabase `.range(from, to)` on the `fetchProducts()` function. The admin table and public grid should both adopt paginated fetching with a "Load More" or numbered pagination UI.

---

### ISS-004 — Supabase SDK loaded from CDN in `supabase-client.js`
**File:** `js/supabase-client.js`  
**Problem:** The Supabase JS client is dynamically imported from `https://esm.sh/@supabase/supabase-js`. This means:
- App completely fails if `esm.sh` is unreachable
- CDN latency adds to first load time
- No version pinning guarantee (a minor version bump could change behavior)

**Recommendation:** Install `@supabase/supabase-js` as a proper npm dependency in `package.json` and import it locally:
```bash
npm install @supabase/supabase-js
```
Then: `import { createClient } from '@supabase/supabase-js';`

---

### ISS-005 — Product image delete-and-reinsert on every save
**File:** `js/admin.js` → product save handler, `js/db.js` → `saveProduct()`  
**Problem:** Every time a product is saved (even just a title change), ALL `product_images` rows are deleted and re-inserted. This causes:
- Brief moment where product has no images
- Unnecessary database writes
- Risk of data loss if the INSERT fails after the DELETE

**Recommendation:** Diff the image list and only insert new images / delete removed images. Or use upsert with stable `sort_order` as the key.

---

## 🟡 Medium Priority

### ISS-006 — `openCodeModal` loads all codes to find one by ID
**File:** `js/admin.js` → `openCodeModal(codeId)`  
**Problem:** To edit a single code, the function fetches ALL auth codes and then uses `Array.find()`. This is an O(n) client-side filter for a data that should be fetched by primary key.

**Recommendation:** Add a `db.fetchAuthCodeById(id)` function that queries `supabaseClient.from('authentication_codes').select('...').eq('id', id).single()`.

---

### ISS-007 — `getFlavorsForProduct()` has hardcoded fallback flavor lists
**File:** `js/app.js` → `getFlavorsForProduct()`  
**Problem:** When a product has no `flavors` field and no variant flavors, the function generates fake flavor options based on the product title keywords (e.g., "Belgian Chocolate", "Cafe Latte"). This data is not from the database and may mislead customers.

**Recommendation:** Either remove the hardcoded fallback (show nothing if no flavors defined) or move the default flavor lists to the `settings` table as configurable data.

---

### ISS-008 — `window.handleWishlistToggleClick` global pollution
**File:** `js/app.js`  
**Problem:** The wishlist toggle handler is exposed via `window.handleWishlistToggleClick` to be callable from inline `onclick` HTML attributes inside template strings. This is an anti-pattern because:
- It pollutes the global namespace
- It makes the function difficult to test
- It's fragile — if `app.js` isn't loaded, the onclick breaks silently

**Recommendation:** Switch to event delegation on the `#app-content` element or use event listeners after rendering.

---

### ISS-009 — No rate limiting or CAPTCHA on review submissions
**File:** `js/app.js` → `renderProductDetails()` submit review handler, `schema.sql` reviews INSERT policy  
**Problem:** The public INSERT policy on `reviews` has no protection. Any bot can spam thousands of fake reviews which admins must then manually clear.

**Recommendation:** Implement a basic honeypot field in the review form, or consider requiring a simple math CAPTCHA. At the Supabase level, consider a rate limiting edge function or Cloudflare page rule.

---

### ISS-010 — `schema.sql` is not idempotent as a standalone setup script
**File:** `schema.sql`  
**Problem:** The schema file has the initial `CREATE TABLE` definitions for `products` that are missing columns added later via `ALTER TABLE`. A developer running the script on a fresh database will need to understand that `ALTER TABLE` blocks are additive amendments.

**Recommendation:** Consolidate all columns into the original `CREATE TABLE` statements and maintain the `ALTER TABLE` blocks only as migration history (or remove them once consolidated).

---

### ISS-011 — Hero image rotation interval not properly cleaned up
**File:** `js/app.js` → `renderHome()`  
**Problem:** `setInterval()` is created for hero image rotation with a DOM-presence check as the cleanup guard. If navigation happens faster than the 4000ms interval and the DOM is replaced, the guard works, but there's no explicit `clearInterval()` call.

**Recommendation:** Store the interval ID and call `clearInterval()` in a cleanup hook (or in the router's navigation handler) for explicit resource management.

---

### ISS-012 — `confirm()` dialogs used for all delete confirmations in admin
**File:** `js/admin.js`  
**Problem:** Native browser `confirm()` dialogs:
- Cannot be styled to match the admin theme
- Block the browser's JavaScript thread
- Are sometimes blocked by certain browser policies

**Recommendation:** Replace all `confirm()` calls with a lightweight custom confirmation modal (can reuse the existing `#admin-modal` with a simple yes/no layout).

---

### ISS-013 — Admin sidebar lacks focus trap on mobile
**File:** `js/admin.js` → `renderDashboard()`  
**Problem:** When the hamburger menu opens the sidebar on mobile, keyboard users can tab to elements behind the sidebar overlay. This is an accessibility (a11y) gap.

**Recommendation:** Add a focus trap when the sidebar is open (using `tabindex`, `inert` attribute on the main content, or a focus-trap library).

---

## 🟢 Low Priority

### ISS-014 — Static `<title>` and `<meta description>` are generic defaults
**File:** `index.html`  
**Problem:** The initial `<title>` is "Top Muscle Nutrition" before `applyBranding()` runs. For users with very slow connections, this stale title may briefly appear in browser tabs/history.  
**Recommendation:** Set the desired defaults directly in `index.html` to match what `applyBranding()` will set.

---

### ISS-015 — Router has no error boundary for failed route handlers
**File:** `js/router.js`  
**Problem:** If a route handler (e.g., `renderProducts()`) throws an unhandled exception, the router has no catch block to display an error message. The page simply goes blank.  
**Recommendation:** Wrap the route handler dispatch in a `try/catch` in the router and render a generic error state in `#app-content`.

---

### ISS-016 — `via.placeholder.com` used as image fallback in code
**File:** `js/app.js` → `renderProductCard()`, `js/admin.js`  
**Problem:** `https://via.placeholder.com` is an external service with no SLA. It may be slow or unavailable.  
**Recommendation:** Replace with a local SVG placeholder or an inline data URI fallback.

---

### ISS-017 — No loading skeleton for product cards
**File:** `js/app.js`  
**Problem:** While `fetchProducts()` is loading, the page shows a full-screen loader overlay. There are no skeleton placeholders, which makes the page feel abrupt when content appears.  
**Recommendation:** Render skeleton card placeholders (CSS shimmer effect) while data loads.

---

### ISS-018 — No `<noscript>` fallback
**File:** `index.html`  
**Problem:** Users with JavaScript disabled see a completely blank page.  
**Recommendation:** Add a `<noscript>` tag with a meaningful message (e.g., "Please enable JavaScript to use this site.").

---

## Issue Tracker Summary

| ID | Priority | File | Status |
|---|---|---|---|
| ISS-001 | 🔴 High | `js/app.js` | Open |
| ISS-002 | 🔴 High | `js/admin.js` | Open |
| ISS-003 | 🔴 High | `js/db.js` | Open |
| ISS-004 | 🔴 High | `js/supabase-client.js` | Open |
| ISS-005 | 🔴 High | `js/admin.js` + `js/db.js` | Open |
| ISS-006 | 🟡 Medium | `js/admin.js` | Open |
| ISS-007 | 🟡 Medium | `js/app.js` | Open |
| ISS-008 | 🟡 Medium | `js/app.js` | Open |
| ISS-009 | 🟡 Medium | `js/app.js` + `schema.sql` | Open |
| ISS-010 | 🟡 Medium | `schema.sql` | Open |
| ISS-011 | 🟡 Medium | `js/app.js` | Open |
| ISS-012 | 🟡 Medium | `js/admin.js` | Open |
| ISS-013 | 🟡 Medium | `js/admin.js` | Open |
| ISS-014 | 🟢 Low | `index.html` | Open |
| ISS-015 | 🟢 Low | `js/router.js` | Open |
| ISS-016 | 🟢 Low | `js/app.js` + `js/admin.js` | Open |
| ISS-017 | 🟢 Low | `js/app.js` | Open |
| ISS-018 | 🟢 Low | `index.html` | Open |
