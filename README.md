# Top Muscle Nutrition

> A modern, fully dynamic **WhatsApp-first product catalogue** for a nutrition supplements retailer.

Built with **Vanilla JavaScript (ES Modules)**, **Vite**, and **Supabase**. No traditional e-commerce checkout — customers order directly via WhatsApp.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your Supabase credentials to js/config.js

# 3. Start development server
npm run dev
```

See [docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md) for full setup instructions including Supabase configuration, schema deployment, and Vercel deployment.

---

## Documentation

| Document | Description |
|---|---|
| [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | What this project is, pages, routes, admin tabs |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, module responsibilities, data flow, security model |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | All tables, columns, relationships, RLS policies |
| [FILE_AUDIT_REPORT.md](docs/FILE_AUDIT_REPORT.md) | Per-file issue log from Phase 1 audit |
| [ISSUES_AND_RECOMMENDATIONS.md](docs/ISSUES_AND_RECOMMENDATIONS.md) | Prioritized issue tracker with detailed recommendations |
| [DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md) | Local setup, Supabase config, deployment, troubleshooting |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML / CSS / Vanilla JavaScript |
| Bundler | Vite |
| Backend | Supabase (PostgreSQL + Auth + Storage + RPC) |
| Deployment | Vercel |

---

## Key Features

- 📦 **Full product catalogue** with category filtering, search, and sort
- 🛒 **WhatsApp ordering** — pre-filled order messages with product details
- 🔐 **Product authentication** — unique codes for anti-counterfeit verification
- ⚙️ **Admin dashboard** — complete no-code content management (products, categories, banners, hero slider, reviews, settings)
- 💬 **Customer reviews** — submission + admin moderation workflow
- ❤️ **Wishlist** — localStorage-based product save list
- 📱 **Mobile responsive** — hamburger drawer navigation, touch-friendly

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
