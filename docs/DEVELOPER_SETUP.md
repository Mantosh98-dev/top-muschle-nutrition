# Top Muscle Nutrition — Developer Setup Guide

## Prerequisites

| Tool | Required Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime for Vite dev server |
| npm | 9+ | Package management |
| Supabase account | — | Backend, auth, storage |
| Git | Any | Version control |

---

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd "Top Muscle Nutrition"
npm install
```

---

## 2. Supabase Setup

### 2a. Create a Supabase Project
1. Go to https://supabase.com → New Project
2. Choose a name, region, and set a strong database password.

### 2b. Run the Database Schema
1. In Supabase Dashboard → **SQL Editor**
2. Copy the entire contents of [`schema.sql`](../schema.sql)
3. Click **Run**

> **Note:** The schema.sql file uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for post-v1 columns. Run the entire file in one go — Supabase handles the `IF NOT EXISTS` clauses safely.

### 2c. Enable Authentication
1. Supabase Dashboard → **Authentication → Providers**
2. Ensure **Email** provider is enabled
3. Create your admin user: **Authentication → Users → Invite user** (or use the Supabase CLI)

### 2d. Get Your API Keys
1. Supabase Dashboard → **Settings → API**
2. Copy:
   - **Project URL** (e.g. `https://abcxyz.supabase.co`)
   - **anon / public key** (safe to use in frontend)

---

## 3. Configure Supabase Credentials

### Option A: Edit `js/config.js` (Production recommended)

```javascript
// js/config.js
export const SUPABASE_URL = 'https://your-project-id.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-public-key';
```

> ⚠️ **Never commit your Service Role key here.** Only the anon key is safe for client-side code.

### Option B: Use localStorage (Development quick start)

Open browser console on `http://localhost:5173` and run:
```javascript
localStorage.setItem('SUPABASE_URL', 'https://your-project-id.supabase.co');
localStorage.setItem('SUPABASE_ANON_KEY', 'your-anon-key');
location.reload();
```

The admin panel will show a banner warning you that credentials are in localStorage.  
**Do not use this method in production.**

---

## 4. Run the Development Server

```bash
npm run dev
```

Open: http://localhost:5173

---

## 5. Build for Production

```bash
npm run build
```

Output: `dist/` directory. Deploy this to Vercel, Netlify, or any static host.

---

## 6. Deploy to Vercel

1. Push code to a GitHub repository.
2. Import the repo on https://vercel.com/new
3. Framework preset: **Other** (or Vite — no special config needed)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**

The `vercel.json` rewrites are pre-configured to handle SPA routing.

---

## 7. First-Time Admin Login

1. Open `https://your-domain.com/admin`
2. Enter the email/password for the Supabase auth user you created in Step 2c.
3. You'll be redirected to the admin dashboard.

From the admin dashboard, configure:
- **Settings tab** → Brand name, logo, WhatsApp number, colors
- **Preferences tab** → Add categories, define weight sizes
- **Products tab** → Add your first products with images and variants
- **Website Customization tab** → Configure hero slider, announcement bar, banners

---

## 8. Storage Buckets

The `schema.sql` creates two storage buckets:
- `product-images` — product gallery & category images
- `brand-assets` — logos, favicons, OG images

If buckets don't exist, create them manually:
1. Supabase Dashboard → **Storage**
2. Create bucket `product-images` (Public)
3. Create bucket `brand-assets` (Public)
4. Apply the RLS policies from `schema.sql` (the storage policy section)

---

## Common Issues

| Problem | Solution |
|---|---|
| Blank page after deploy | Check that `vercel.json` rewrites are in place. Check browser console for errors. |
| "Supabase not configured" toast | Add credentials to `js/config.js` or localStorage. |
| Admin login fails | Verify the user exists in Supabase Auth and the password is correct. |
| Images not loading | Check storage bucket is public, and bucket name matches what `db.uploadImage()` calls. |
| Products not appearing | Check Supabase RLS policies — public SELECT must be enabled on `products` and `product_images`. |
| Reviews not showing | Reviews must have `approved = true` in the `reviews` table. Use the Admin → Reviews tab to approve them. |

---

## Development Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview production build locally |
