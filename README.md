# Mahseri Jewellery

A Next.js storefront and admin app for **Mahseri Jewellery**, a family jewellery atelier in
Amman, Jordan. The app is designed for Vercel hosting with Supabase for product data,
product images, admin authentication, and orders.

## Current Stack

- `app/` — Next.js App Router pages and API routes.
- `components/` — React UI for site chrome, cart, products, and admin.
- `src/lib/` — Supabase, catalogue, pricing, order, and type helpers.
- `supabase/migrations/` — database/storage schema for products, orders, and admin policies.
- `css/style.css` — existing design system reused by the React app.
- `js/`, root `*.html`, and `dist/` — legacy static implementation kept as reference during migration.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home, collection entry points, featured products |
| `/shop` | Collection hub |
| `/shop/gold`, `/shop/silver`, `/shop/gems` | Product listings with filters and live metal pricing |
| `/product/[id]` | Product detail and related pieces |
| `/cart` | Cart and checkout |
| `/admin` | Supabase-authenticated catalogue management |
| `/api/orders` | Server-side order creation and notification |
| `/api/admin/*` | Protected product and image management APIs |

## Running Locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

The app works with seed products if Supabase env vars are missing. To use the database, copy
`.env.example` to `.env.local`, fill the Supabase values, apply `supabase/migrations`, then run:

```bash
npm run import:products
```

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

See `SUPABASE.md` and `VERCEL.md` for setup and deployment details.
