# Supabase Setup

This project uses Supabase for product data, product images, admin authentication, and orders.

## 1. Create Project

Create a Supabase project, then copy:

- Project URL
- Anon public key
- Service role key

Set the values in `.env.local` for local development and in Vercel Project Settings for production.

## 2. Apply Migrations

Run the SQL files in order from `supabase/migrations` in the Supabase SQL editor:

1. `001_initial_schema.sql`
2. `002_admin_policies.sql`

Then set an auth user for the owner/admin account. Use the same email in `ADMIN_EMAIL`.

## 3. Environment Variables

Required for public reads and admin login:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Required for server writes, product import, orders, and image upload:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PRODUCTS_BUCKET=product-images
SUPABASE_PRODUCTS_TABLE=products
ADMIN_EMAIL=
```

Optional order notifications:

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_CHANNEL_ID=
```

## 4. Import Existing Products

After configuring `.env.local`, run:

```bash
npm run import:products
```

This imports the existing `MAHSERI_PRODUCTS` catalogue and uploads matching local product images to Supabase Storage.
