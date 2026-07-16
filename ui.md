# Homepage Layout & Advertisement Banner System

## Objective

Refactor the homepage while preserving the existing UI/UX, design language, responsiveness, animations, spacing, and performance.

This is **not a redesign**. Only the homepage content flow and promotional system should be updated.

---

# New Homepage Flow

The homepage should follow this order:

Hero Section

↓

Categories

↓

Featured Products

↓

Best Sellers

↓

Other Product Sections (Latest, Trending, etc.)

↓

Footer

Between any two sections, an Advertisement Banner may appear if assigned by the admin.

If no banner is assigned, nothing should be rendered and there should be **no empty spacing**.

---

# Remove Existing Promotional Sections

Remove these sections permanently from the homepage:

- Shop Products CTA Button
- Authenticate Product CTA Button
- Authenticate Our Product promotional image
- Fast Delivery / Authentic Products / Secure Payment / Customer Support cards
- 100% Genuine Products
- Best Prices Guaranteed
- On Time Delivery
- Easy Returns Policy
- Any other hardcoded promotional cards or CTA sections

These sections should be completely removed from the codebase instead of only hiding them.

Going forward, **all promotions, announcements, offers, CTAs, and marketing content will be displayed only through Advertisement Banners.**

---

# Advertisement Banner System

Create a reusable Advertisement Banner module.

The banner system should work across the entire website and should not be limited to the homepage.

---

## Admin Features

Create a dedicated Advertisement/Banner Management module.

Each banner should support:

- Banner Name
- Image Upload
- JPEG / PNG
- Click URL
- Open in New Tab
- Active / Inactive
- Start Date (Optional)
- End Date (Optional)
- Display Priority
- Sort Order
- Enable / Disable

---

# Banner Sizes

Support two aspect ratios:

- 16:9
- 16:4

Images should never stretch.

Use proper object-fit.

---

# Banner Layout Types

## 1. Standard Banner

Uses the existing container.

Should inherit:

- Existing padding
- Existing border radius
- Existing spacing
- Existing shadows
- Existing responsive behavior

It should look exactly like the current website components.

---

## 2. Full Width Banner

Create another layout option.

This banner should:

- Touch both sides of the screen
- Behave exactly like the Hero section
- No container padding
- Fully responsive
- No layout mismatch
- Maintain image quality

---

# Banner Placement System

The admin should be able to place banners anywhere.

Examples:

- Below Hero
- Above Categories
- Below Categories
- Above Featured Products
- Below Featured Products
- Above Best Sellers
- Below Best Sellers
- Between Product Sections
- Above Footer

Not only on Homepage.

Also support:

- Product Page
- Category Page
- Brand Page
- Authentication Page
- Search Page
- Future Pages

The system must be reusable.

No code changes should be required when adding new positions.

---

# Admin Placement Options

For every banner the admin should select:

- Target Page
- Position
- Display Order
- Layout Type
- Aspect Ratio

---

# Dynamic Rendering

Only render banners that are Active.

If no banner exists for a position:

- Remove the entire banner container.
- Do not leave blank spacing.

---

# Storage

Use Supabase.

Banner metadata:

- Supabase Database

Banner Images:

- Supabase Storage

---

# Performance

- Lazy Load Images
- Optimized Image Loading
- Responsive Images
- No CLS (Layout Shift)
- High Performance
- Reusable Components

---

# UI Consistency

Do NOT modify:

- Existing Typography
- Existing Colors
- Existing Animations
- Existing Cards
- Existing Product Sections
- Existing Responsive Layout
- Existing Design Language

Everything should integrate seamlessly as if this feature existed from the beginning.

---

# Future Goal

The Advertisement Banner System should become the **only promotional system** on the website.

Whenever promotional content, offers, announcements, festival sales, launches, authentication campaigns, brand messages, or CTAs need to be shown, they should be managed entirely from the Banner Management module.

There should be **no hardcoded promotional sections** remaining anywhere in the website.