# Top Muscle Nutrition — Project Overview

## Purpose

Top Muscle Nutrition is a **WhatsApp-first product catalogue** for a nutrition supplements retailer.  
It is **not** a traditional e-commerce checkout platform. There is no cart or payment gateway.  
Customers browse the catalogue, then click "Order via WhatsApp" to contact the store directly.

## Core Value Proposition

| Feature | How it's delivered |
|---|---|
| Product showcase | Dynamic SPA with Supabase-backed products |
| Order flow | Pre-filled WhatsApp deep links |
| Product authentication | Customer-facing verification page + admin-managed unique codes |
| Admin control | Full no-code admin panel (login-gated with Supabase Auth) |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript (ES Modules) |
| Bundler | **Vite** (development server + build) |
| Backend-as-a-Service | **Supabase** (PostgreSQL + Auth + Storage + RPC) |
| Deployment | **Vercel** (SPA routing via `vercel.json` rewrites) |
| Icon set | Font Awesome 6 (CDN) |
| Fonts | Google Fonts — *Bebas Neue* (headings) + *Nunito* (body) |

---

## Repository Structure

```
/                         — Project root
├── index.html            — Single HTML shell (SPA entry point)
├── vite.config.js        — Vite bundler configuration
├── package.json          — npm scripts & Vite dependency
├── vercel.json           — SPA rewrite rules for Vercel
├── schema.sql            — Full Supabase SQL schema + RLS + policies
├── instructioins.md      — Original client project specification
├── instructionlast.md    — Audit protocol & phase guide
│
├── js/
│   ├── config.js         — Supabase URL & anon key constants
│   ├── supabase-client.js— Supabase SDK initializer (lazy + safe)
│   ├── db.js             — Data access layer (all CRUD + RPC)
│   ├── router.js         — Client-side SPA router
│   ├── app.js            — Main application (rendering, state, UI)
│   └── admin.js          — Admin dashboard (lazy-loaded)
│
└── public/               — Static assets served as-is
    └── (images, favicons, og-image.jpg, etc.)
```

---

## Pages & Routes

| Route Pattern | Rendered by | Description |
|---|---|---|
| `/` | `renderHome()` | Home: hero, featured, top/best-seller/trending sliders, categories, CTA, contact |
| `/products` | `renderProducts()` | Catalogue with search + category filter |
| `/products?category=<id>` | `renderProducts()` | Category-filtered catalogue |
| `/product/:slug` | `renderProductDetails()` | Full product detail page |
| `/verify` | `renderProductVerification()` | Anti-counterfeit code verification |
| `/categories` | `renderCategories()` | Grid of product categories |
| `/about` | `renderAbout()` | Brand story page |
| `/privacy` | `renderPrivacyPolicy()` | Privacy policy |
| `/terms` | `renderTerms()` | Terms & conditions |
| `/cart` | `renderCart()` | Wishlisted products list |
| `/account` | `renderAccount()` | Customer dashboard (wishlist) |
| `/admin` | `renderAdminPage()` | Admin login / dashboard (lazy-loaded) |
| `/admin/:tab` | `renderAdminPage()` | Admin tabbed workspace |
| `*` | `render404()` | Custom 404 page |

---

## Admin Dashboard Tabs

| Tab | Route | Functionality |
|---|---|---|
| Dashboard | `/admin/dashboard` | Stat cards (products, categories, codes, featured), quick links |
| Products | `/admin/products` | Full CRUD with image gallery, variants, pricing, badges |
| Preferences | `/admin/preferences` | Category CRUD, weight/size library, currency display |
| Website Customization | `/admin/customization` | Hero slider, banners, homepage sections, footer, videos |
| Verification Codes | `/admin/codes` | Generate/edit/delete unique product auth codes |
| Reviews | `/admin/reviews` | Approve/reject customer reviews |
| Settings | `/admin/settings` | Branding, colors, WhatsApp number, contacts, SEO |
| Logout | — | Supabase signOut + localStorage clear |

---

## Design Themes

- **Colors:** Primary red (`#d32f2f` default) + white, configurable from Admin panel
- **Fonts:** Bebas Neue (headings), Nunito (body)
- **Mode:** Light mode only for public site; Admin panel supports dark/light toggle (stored in `localStorage`)
- **Responsive:** Mobile-first; hamburger drawer menu below 768px

---

## Deployment Notes

- The app is a **100% client-side SPA**. All routes return `index.html` via Vercel's `rewrites`.
- Supabase credentials are hardcoded in `js/config.js` **or** overridden via `localStorage` keys for development.
- Images are stored in two Supabase Storage buckets: `product-images` and `brand-assets`.
- SEO meta tags (`<title>`, `<meta name="description">`, OG tags) are updated dynamically in `applyBranding()`.
