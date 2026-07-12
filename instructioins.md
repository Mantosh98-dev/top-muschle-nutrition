# E-Commerce Website Project Specification

## Project Overview

Create a modern, responsive, clean, and professional e-commerce website.

This website is **NOT** a traditional online store with payment gateway or cart functionality.

The purpose of the website is to showcase products professionally while allowing customers to place orders through WhatsApp.

The entire website must be manageable from an Admin Panel.

Website should by red and white themed

Backend must use **Supabase**.

---

## Technology Stack

**Frontend:**
- HTML
- CSS
- JavaScript
- Responsive Design
- Modern UI

**Backend:**
- Supabase

**Storage:**
- Supabase Storage

**Database:**
- Supabase PostgreSQL

**Authentication:**
- Supabase Authentication (Admin Only)

---

## Branding

The project must support:

- Custom Brand Name
- Custom Brand Logo
- Brand Colors
- Favicon
- SEO Title
- SEO Description

Everything should be configurable.

---

## Website Pages

### 1. Home Page

Design should be minimal, premium and clean.

**Navigation Bar**
- Brand Logo
- Brand Name
- Menu: Home, Products, Authentication, Contact
- Sticky, mobile responsive

**Hero Section**
- Large Heading
- Small Description
- Background: image or gradient
- Everything editable from Admin Panel

**Featured Products Section**
- Product Image, Name, Short Description, View Product Button
- Products come from database
- Admin chooses which products are featured

**Categories Preview**
- e.g. Protein, Glucose, Energy Drink, Supplements
- Fetched from database

**Contact Section**
- Brand Address, Email, Phone Number, WhatsApp Button, Google Map (optional)
- Editable from Admin Panel

**Footer**
- Brand Logo, Copyright, Social Links, Quick Links
- Everything editable

---

### 2. Products Page

- Search
- Category Filter
- Responsive Grid
- Pagination (optional)

Each product card: Image, Name, Short Description, View Details Button.
Products fetched from Supabase.

---

### 3. Product Details Page

All products use the same template — no separate page design per product. Everything loads dynamically from the database.

**Left Side**
- Large Product Image
- 10 Thumbnail Images (clicking a thumbnail swaps the main image instantly)
- If fewer than 10 images exist, display only available images

**Right Side**
- Product Title
- Short Description
- Long Description
- Benefits
- Ingredients
- Nutrition Information
- Usage Instructions
- Warnings
- Nothing hardcoded — all from database

**Order Button**
- Labeled "Order via WhatsApp" (not "Buy Now")
- Opens WhatsApp with message: `Hello, I would like to order: [Product Name] [Product Code]`
- WhatsApp number editable from Admin Panel — no code changes required

---

### 4. Product Authentication Page

Lets customers verify original products.

**Layout**
- Heading
- Enter Product Code field
- Verify Button
- Result Card

**Results**
- Verified Product → show Product Name, Image, Manufacturing Date, Expiry Date, Verification Status
- Invalid Product Code

Unique product codes are managed via the Admin Panel.

---

## Admin Panel

Secure Admin Login (Supabase Authentication). Only admin can access.

**Dashboard**
- Total Products
- Categories
- Authentication Codes
- Featured Products

**Products Management**
- Create / Edit / Delete Product
- Upload Images
- Choose Featured Product
- Change Product Details
- Manage Product Gallery
- No code required

**Categories Management**
- Create / Rename / Delete Category
- Products update automatically

**Authentication Management**
- Generate Unique Codes
- Add / Delete Codes
- Assign Codes to Products
- Change Verification Status

**WhatsApp Settings**
- Change WhatsApp Number without editing source code

**Branding Settings**
- Brand Name, Brand Logo, Primary/Secondary Color, Website Title, Favicon, Footer Information, Contact Details
- Updates automatically across the site

**Homepage Management**
- Hero Heading, Hero Description, Hero Button
- Featured Products
- Contact Information
- Homepage sections
- All without touching code

---

## Database (Supabase)

### `products`
| Field | Description |
|---|---|
| id | |
| title | |
| slug | |
| category_id | |
| short_description | |
| long_description | |
| ingredients | |
| nutrition | |
| usage | |
| warnings | |
| featured | |
| whatsapp_enabled | |
| created_at | |

### `product_images`
| Field | Description |
|---|---|
| id | |
| product_id | |
| image_url | |
| sort_order | |

Maximum 10 images per product.

### `categories`
| Field | Description |
|---|---|
| id | |
| name | |
| slug | |

### `authentication_codes`
| Field | Description |
|---|---|
| id | |
| product_id | |
| unique_code | |
| manufacturing_date | |
| expiry_date | |
| status | |

### `settings`
Stores: Brand Name, Logo, WhatsApp Number, Contact Details, SEO, Colors, Homepage Content, Footer — everything configurable.

---

## Design Guidelines

**Design must be:** Modern, Premium, Clean, Responsive, Minimal, Fast, Professional

**Avoid:** Heavy animations, unnecessary effects, cluttered layouts

**Use:** Soft shadows, rounded corners, proper spacing, consistent typography

---

## Performance

- Lazy loading images
- Optimized assets
- Fast page loading
- Mobile-first responsive design

---

## SEO

- Meta Title / Meta Description
- Open Graph
- Structured Data
- Clean URLs
- Alt Text
- Dynamic Sitemap
- robots.txt

---

## Security

- Supabase Row Level Security (RLS)
- Protected Admin Panel
- Form validation
- Input sanitization
- Secure database operations

---

## Final Goal

Build a fully responsive, modern product showcase website where:

- Customers browse products
- Customers open product details
- Customers place orders through WhatsApp
- Customers verify products using unique authentication codes
- Admin manages every piece of website content from the Admin Panel
- No source code edits are required for routine content updates
- All dynamic content comes from Supabase
- The project is production-ready, scalable, cleanly structured, and easy to maintain

The codebase should follow best practices with reusable components, clean folder structure, proper documentation, and maintainable architecture.
