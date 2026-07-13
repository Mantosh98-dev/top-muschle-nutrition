# Top Muscle Nutrition — Database Schema Reference

> Derived from `schema.sql`. This is the authoritative reference for all database tables, columns, relationships, and security policies.

---

## Tables

### `categories`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique category identifier |
| `name` | TEXT | NOT NULL | Display name (e.g. "Whey Protein") |
| `slug` | TEXT | NOT NULL, UNIQUE | URL-friendly identifier |
| `image_url` | TEXT | — | Optional category icon/image URL |

---

### `products`

| Column | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | UUID | PRIMARY KEY | gen_random_uuid() | |
| `title` | TEXT | NOT NULL | — | Product display name |
| `slug` | TEXT | NOT NULL, UNIQUE | — | URL slug for routing |
| `category_id` | UUID | FK → categories.id ON DELETE SET NULL | — | |
| `short_description` | TEXT | — | — | One-liner for cards |
| `long_description` | TEXT | — | — | Full HTML-safe description |
| `benefits` | TEXT | — | — | Key benefits text |
| `ingredients` | TEXT | — | — | Ingredients list |
| `nutrition` | TEXT | — | — | Nutrition facts (parsed to table by app) |
| `usage` | TEXT | — | — | Serving/usage instructions |
| `warnings` | TEXT | — | — | Safety warnings |
| `featured` | BOOLEAN | — | false | Show in Featured section |
| `top_product` | BOOLEAN | — | false | Show in Top Products slider |
| `best_seller` | BOOLEAN | — | false | Show in Best Sellers slider |
| `trending` | BOOLEAN | — | false | Show in Trending slider |
| `whatsapp_enabled` | BOOLEAN | — | true | Show "Order via WhatsApp" button |
| `weight` | TEXT | — | — | Base weight/size (e.g. "1 kg") |
| `price` | NUMERIC | — | — | Base original price (INR) |
| `offer_price` | NUMERIC | — | — | Base discounted price (INR) |
| `variants` | JSONB | — | — | Array of `{weight, flavor, price, offer_price}` |
| `product_type` | TEXT | — | 'gym' | 'gym' or 'medicine' |
| `brand` | TEXT | — | 'Top Muscle Nutrition' | Manufacturer/brand name |
| `flavors` | TEXT | — | — | Comma-separated flavor list |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | now() UTC | |

---

### `product_images`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | |
| `product_id` | UUID | FK → products.id ON DELETE CASCADE, NOT NULL | |
| `image_url` | TEXT | NOT NULL | Public URL (Supabase Storage or CDN) |
| `sort_order` | INTEGER | — | Controls display order (ASC) |

> **Max 10 images per product** — enforced by application logic, not the DB.

---

### `reviews`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | |
| `product_id` | UUID | FK → products.id ON DELETE CASCADE, NOT NULL | |
| `reviewer_name` | TEXT | NOT NULL | Customer's full name |
| `rating` | INTEGER | CHECK (rating >= 1 AND rating <= 5), NOT NULL | 1–5 star rating |
| `comment` | TEXT | — | Optional written review |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | Submission timestamp |
| `approved` | BOOLEAN | — | false | Must be approved by admin to appear publicly |

---

### `authentication_codes`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | |
| `product_id` | UUID | FK → products.id ON DELETE CASCADE, NOT NULL | |
| `unique_code` | TEXT | NOT NULL, UNIQUE | The verification code printed on packaging |
| `manufacturing_date` | DATE | — | Optional MFG date |
| `expiry_date` | DATE | — | Optional expiry date |
| `status` | TEXT | — | 'active' | 'active' or 'inactive' |

---

### `settings` (single-row config table)

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, CHECK(id=1) | Always 1 — enforces single row |
| `brand_name` | TEXT | 'Top Muscle Nutrition' | |
| `brand_logo_url` | TEXT | NULL | Navbar logo |
| `footer_logo_url` | TEXT | NULL | Footer logo |
| `primary_color` | TEXT | '#d32f2f' | Applied as CSS var |
| `secondary_color` | TEXT | '#ffffff' | Applied as CSS var |
| `favicon_url` | TEXT | NULL | Browser tab favicon |
| `seo_title` | TEXT | 'Top Muscle Nutrition - Premium Supplements' | `<title>` tag |
| `seo_description` | TEXT | '...' | `<meta name="description">` |
| `og_image_url` | TEXT | NULL | Open Graph share image |
| `hero_title` | TEXT | 'Fuel Your Performance' | |
| `hero_description` | TEXT | '...' | |
| `hero_bg_type` | TEXT | 'gradient' | 'gradient' or 'image' |
| `hero_bg_gradient` | TEXT | 'linear-gradient(...)' | CSS gradient string |
| `hero_bg_image_url` | TEXT | NULL | Hero background image URL |
| `hero_product_image_url` | TEXT | 'hero_product.png' | |
| `hero_product_images` | JSONB | '[]' | Array of hero product image URLs |
| `hero_badge_1_text` | TEXT | '100% Genuine' | |
| `hero_badge_1_icon` | TEXT | 'fas fa-shield-halved' | Font Awesome class |
| `hero_badge_2_text` | TEXT | 'FSSAI Certified' | |
| `hero_badge_2_icon` | TEXT | 'fas fa-certificate' | |
| `whatsapp_number` | TEXT | '+1234567890' | Used in all WA order links |
| `contact_email` | TEXT | 'info@...' | |
| `contact_phone` | TEXT | '+1234567890' | |
| `contact_address` | TEXT | '123 Muscle Street...' | |
| `google_map_iframe` | TEXT | NULL | Google Maps `<iframe>` HTML string |
| `footer_copyright` | TEXT | '© 2026...' | |
| `social_facebook` | TEXT | NULL | URL |
| `social_instagram` | TEXT | NULL | URL |
| `social_twitter` | TEXT | NULL | URL |
| `social_linkedin` | TEXT | NULL | URL |
| `weight_sizes` | TEXT | '500 g, 1 kg, 2 kg, 5 kg' | Comma-separated size presets |
| `show_top_products` | BOOLEAN | true | Homepage section visibility |
| `show_best_sellers` | BOOLEAN | true | Homepage section visibility |
| `show_trending_products` | BOOLEAN | true | Homepage section visibility |
| `video1_show` | BOOLEAN | false | Homepage video block 1 |
| `video1_title` | TEXT | 'About Our Brand' | |
| `video1_desc` | TEXT | '...' | |
| `video1_type` | TEXT | 'youtube' | 'upload' or 'youtube' |
| `video1_mp4_url` | TEXT | NULL | If type = 'upload' |
| `video1_youtube_url` | TEXT | NULL | If type = 'youtube' |
| `video2_show` | BOOLEAN | false | Homepage video block 2 |
| `video2_title` | TEXT | 'Authentic Verification Guide' | |
| `video2_desc` | TEXT | '...' | |
| `video2_type` | TEXT | 'youtube' | |
| `video2_mp4_url` | TEXT | NULL | |
| `video2_youtube_url` | TEXT | NULL | |
| `announcement_show` | BOOLEAN | false | Top announcement bar |
| `announcement_text` | TEXT | 'Welcome to...' | |
| `announcement_bg_color` | TEXT | '#d32f2f' | |
| `announcement_text_color` | TEXT | '#ffffff' | |
| `promo_banner_show` | BOOLEAN | false | Homepage promo banner |
| `promo_banner_image_url` | TEXT | NULL | |
| `promo_banner_link` | TEXT | NULL | Click destination |
| `cta_banner_show` | BOOLEAN | false | CTA section |
| `cta_banner_title` | TEXT | 'Ready to Level Up...' | |
| `cta_banner_desc` | TEXT | '...' | |
| `cta_banner_btn_text` | TEXT | 'Chat on WhatsApp' | |
| `cta_banner_bg_color` | TEXT | '#1a1a1a' | |
| `slider_settings` | JSONB | NULL | Hero slider config object |

---

## RPC Functions

### `verify_product_code(input_code TEXT)`

```sql
RETURNS TABLE (
  verified BOOLEAN,
  product_name TEXT,
  product_image TEXT,
  manufacturing_date DATE,
  expiry_date DATE,
  status TEXT
) SECURITY DEFINER
```

- Called by `db.verifyProductCode(code)` on the public-facing verification page.
- Uses `SECURITY DEFINER` so it can read `authentication_codes` without the public SELECT RLS policy.
- Returns empty result set (not an error) if code is not found.

---

## Row Level Security (RLS) Summary

| Table | Public SELECT | Public INSERT | Public UPDATE | Admin (authenticated) |
|---|---|---|---|---|
| `categories` | ✅ All rows | ❌ | ❌ | ✅ Full CRUD |
| `products` | ✅ All rows | ❌ | ❌ | ✅ Full CRUD |
| `product_images` | ✅ All rows | ❌ | ❌ | ✅ Full CRUD |
| `authentication_codes` | ❌ No direct access | ❌ | ❌ | ✅ Full CRUD |
| `settings` | ✅ All rows | ❌ | ❌ | ✅ Full CRUD |
| `reviews` | ✅ WHERE approved=true | ✅ (submit review) | ❌ | ✅ Full CRUD |

---

## Storage Buckets

| Bucket | Public | Used for |
|---|---|---|
| `product-images` | ✅ | Product gallery images, category images |
| `brand-assets` | ✅ | Brand logos, favicons, OG images |

Both buckets allow public read, authenticated write (admin only).

---

## Entity Relationships

```
categories ──< products ──< product_images
                    │
                    ├──< authentication_codes
                    └──< reviews
```

- All child tables CASCADE DELETE from `products`.
- `products.category_id` SET NULL on category delete.
