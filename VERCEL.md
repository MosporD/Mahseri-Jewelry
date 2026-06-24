# Vercel Deployment

The migrated app is a Next.js application intended to run on Vercel.

## Project Settings

1. Import the GitHub repository into Vercel.
2. Framework preset: `Next.js`.
3. Build command: `npm run build`.
4. Install command: `npm install`.
5. Output directory: leave empty/default.

## Environment Variables

Add the values from `.env.example` in Vercel Project Settings.

Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PRODUCTS_BUCKET=product-images
SUPABASE_PRODUCTS_TABLE=products
ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=https://mahserijewellery.com
```

Optional:

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_CHANNEL_ID=
```

## Domain Handoff

Keep Cloudflare as DNS. In Vercel, add:

- `mahserijewellery.com`
- `www.mahserijewellery.com`

Then update Cloudflare DNS records to the values Vercel provides. Keep proxying disabled if Vercel asks for DNS-only records during verification.

## Legacy URL Redirects

`vercel.json` redirects the old static pages like `/shop-gold.html` to the new Next routes like `/shop/gold`.
