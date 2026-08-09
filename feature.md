# Top Muscle Nutrition — Variant Image Switching + Flavor Search Spec

> This spec is written against the **actual current codebase** (per `PROJECT_OVERVIEW.md`, `FILE_AUDIT_REPORT.md`, `DATABASE_SCHEMA.md`, `ARCHITECTURE.md`). It does not assume a generic schema — it extends what already exists.

## Goal

1. Clicking a **flavor** OR a **weight/size** on a product page changes the displayed **image**, **price**, and **offer price** — no page reload.
2. Searching for a **flavor name** (e.g. "chocolate") surfaces the product in `/products` and shows that it has a matching variant.
3. No regression to existing behavior: current gallery (`product_images`), wishlist, reviews, admin CRUD, and RLS must keep working exactly as-is.

---

## 1. What Already Exists (do not rebuild this)

From `DATABASE_SCHEMA.md`, `products` already has:

```
variants   JSONB   -- array of { weight, flavor, price, offer_price }
flavors    TEXT     -- comma-separated flavor list, used for display/fallback
weight     TEXT     -- base weight, used only when no variants exist
price / offer_price NUMERIC -- base price, used only when no variants exist
```

`product_images` is a **separate table**, one row per image, `sort_order`-controlled, CASCADE-deleted with the product. It is a general gallery — **not** tied to flavor or weight.

So today: variant switching *can already* update price/offer_price (the data is there), but **cannot** update the image, because no column links a flavor to a specific image.

---

## 2. Schema Change — Add Flavor Images (additive only, non-breaking)

Add **one new JSONB column** to `products`. This follows the same pattern already used in this schema (`schema.sql` uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for all post-v1 fields — stay consistent with that convention):

```sql
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS flavor_images JSONB DEFAULT '{}'::jsonb;
```

Structure — a simple map from flavor name to an image URL (URLs point into the existing `product-images` Storage bucket, same as `product_images` rows do):

```json
{
  "Chocolate": "https://.../product-images/gold-whey-chocolate.jpg",
  "Vanilla":   "https://.../product-images/gold-whey-vanilla.jpg",
  "Mango":     "https://.../product-images/gold-whey-mango.jpg"
}
```

**Why a map keyed by flavor name, and not an `image_url` field inside each `variants` entry:** `variants` has one entry per (weight × flavor) combination, so a Chocolate 1kg and Chocolate 2kg entry would otherwise duplicate the same image URL. Keeping images keyed by flavor alone avoids that duplication and means updating one flavor's photo only touches one JSON key, not every weight row for that flavor.

**Fallback rule (must be implemented in both `app.js` rendering and `admin.js` preview):** if a flavor has no entry in `flavor_images` (or the column is `{}`), fall back to the product's first `product_images` row (`sort_order` ascending) — i.e. the existing default gallery image. This means the feature is opt-in per product; products without flavor-specific photos keep working exactly as they do today.

No changes needed to RLS — `flavor_images` lives on the existing `products` row, so the existing `products` SELECT/ALL policies already cover it. No new table, no new policy.

---

## 3. Admin Panel (`js/admin.js`) Changes

Currently (per the audit) the product form already manages `variants` as a repeatable weight+flavor+price group. Add:

1. **Group variants by flavor in the form UI** (not by individual weight row) — under each unique flavor name entered, show **one image upload field**. This single image applies to all weight rows sharing that flavor.
2. On save, build `flavor_images` as `{ [flavorName]: uploadedImageUrl }` alongside the existing `variants` array, and include it in the same `saveProduct(payload, images)` call already used in `js/db.js` — extend the `payload` object, don't create a new save function.
3. **Do not touch the existing `product_images` delete/re-insert logic** flagged in the audit (`FILE_AUDIT_REPORT.md` notes this already re-runs on every save) — `flavor_images` is a separate JSONB column update via the normal `products` upsert, it doesn't go through the image-gallery delete/re-insert path at all.
4. Auto-slug and base-price-disable-when-variants-present behavior (already implemented, per the audit's ✅ list) stays untouched.

---

## 4. Product Page (`js/app.js` — `renderProductDetails()`)

This function already fetches the product (`db.fetchProductBySlug(slug)`) and renders flavor/weight selectors from `variants`. Extend the existing selection handler (do not create a second parallel one):

```javascript
let selectedFlavor = getDefaultFlavor(product);   // first flavor in variants/flavors
let selectedWeight  = getDefaultWeight(product, selectedFlavor);

function updateVariantUI() {
  const matchedVariant = product.variants.find(
    v => v.flavor === selectedFlavor && v.weight === selectedWeight
  );

  const imageUrl =
    (product.flavor_images && product.flavor_images[selectedFlavor]) ||
    (product.product_images?.[0]?.image_url) || // existing default gallery fallback
    '/placeholder.jpg';

  document.getElementById('main-product-image').src = imageUrl;

  if (matchedVariant) {
    document.getElementById('price').textContent = formatPrice(matchedVariant.offer_price || matchedVariant.price);
  }
}

function selectFlavor(flavor) {
  selectedFlavor = flavor;
  // reset weight to the first weight available for this flavor, same pattern
  // as resetting size when flavor changes in a standard variant model
  const weightsForFlavor = product.variants.filter(v => v.flavor === flavor);
  selectedWeight = weightsForFlavor[0]?.weight;
  updateVariantUI();
}

function selectWeight(weight) {
  selectedWeight = weight;
  updateVariantUI();
}
```

Fix while touching this code (flagged in the audit as an existing issue): replace any hardcoded fallback flavor list inside `getFlavorsForProduct()` (e.g. `'Belgian Chocolate'`, `'Cafe Latte'`) with logic that reads only from `product.flavors` / `product.variants`. Hardcoded fallbacks will show flavors that don't actually exist for a product and will not have a matching entry in `flavor_images` or `variants`, causing a mismatch bug (image/price won't update because there's no real variant to match).

**No stock field exists in this schema** (`variants` only has `weight, flavor, price, offer_price` — no `stock`/`quantity` column). Do not fabricate an "in stock/out of stock" UI unless a stock field is deliberately added to the schema first; showing one now would display incorrect data.

---

## 5. Catalog Listing (`/products` — `renderProducts()`)

No change needed to how cards render — one card per product, using the same default image logic as `updateVariantUI()`'s fallback (first `flavor_images` entry, or first `product_images` row). This already matches the existing "1 card per product" behavior; nothing new to build here.

---

## 6. Search — Make Flavors Discoverable (`js/db.js`)

Per the audit, `fetchProducts(filters)` currently joins categories/images/reviews/variants but the search likely only filters on `title`/`short_description`. Extend the existing filter query to also match the `flavors` column (already present as comma-separated text — this column appears to exist precisely for this kind of lookup):

```javascript
// inside fetchProducts(filters), where the existing search ilike is applied
if (filters.search) {
  query = query.or(
    `title.ilike.%${filters.search}%,` +
    `short_description.ilike.%${filters.search}%,` +
    `flavors.ilike.%${filters.search}%`
  );
}
```

This is a one-line extension to an `.or()` clause already being built — it does not require a new RPC function, a new table, or a schema change, since `flavors` is plain text on the same row being queried.

If `flavors` is ever found to be out of sync with `variants` (e.g. a flavor exists in `variants` but wasn't also added to the `flavors` text field), that's a data-entry issue to fix in the admin form (auto-generate `flavors` from the unique flavor names in `variants` on save, instead of relying on it being typed separately) — flag this to check while implementing, since two sources of truth for the same information (`flavors` text + `variants` JSONB flavor keys) risk drifting apart.

---

## 7. Deep Link: Pre-select Flavor from Search Result

Same mechanism as before, no change needed to `js/router.js` (routes already support this without modification since it's just a query string on an existing route):

```
/product/gold-whey?flavor=chocolate&weight=1kg
```

In `renderProductDetails()`, after `product` is fetched and before first render:

```javascript
const params = new URLSearchParams(window.location.search);
const flavorParam = params.get('flavor');
const weightParam = params.get('weight');

if (flavorParam) {
  const match = product.variants.find(
    v => v.flavor.toLowerCase() === flavorParam.toLowerCase()
  );
  if (match) {
    selectedFlavor = match.flavor;
    selectedWeight = weightParam || match.weight;
  }
}
```

Update the catalog/search result link-builder to append `?flavor=...` when a search matched on a flavor name rather than the title, so the click lands pre-selected.

---

## 8. Rollout Checklist (specific to this codebase's known risk points)

1. Run the `ALTER TABLE products ADD COLUMN IF NOT EXISTS flavor_images JSONB DEFAULT '{}'::jsonb;` — safe, additive, matches existing schema convention. Test on a staging Supabase project first, per existing practice noted in `DEVELOPER_SETUP.md`.
2. Since `app.js` and `admin.js` are large monolithic files (174 KB / 169 KB per the audit), locate the **existing** `renderProductDetails()` and product-form variant block precisely and extend them in place — do not add a second, parallel variant-rendering code path, which would create inconsistent behavior between the two.
3. Confirm `getFlavorsForProduct()`'s hardcoded fallback removal doesn't break any product that currently has no `flavors` value at all (i.e. keep a graceful "no flavors" case — just don't invent flavor names that aren't in the data).
4. Test the search `.or()` change against products that have **no** flavors (empty `flavors` column) to confirm it doesn't throw on `null`.
5. Verify RLS is unaffected — `flavor_images` is a column, not a new table, so `products`' existing SELECT/ALL policies already apply; no new policy needed.
6. Test on a product with variants but zero `flavor_images` entries — it must fall back cleanly to the existing default gallery image, exactly as it does today, with no visual regression on products that don't get flavor photos added.