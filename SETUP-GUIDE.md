# Mahseri Jewellery — Setup Guide

Everything below works on a static host (GitHub Pages, Netlify, Vercel — no server needed).

---

## 1. Catalogue manager (admin page)

Open **`admin.html`** in your browser (e.g. `mahserijewellery.com/admin.html`).

- Passcode: **`mahseri2026`** — change it in `js/admin.js` (the `PASSCODE` line) before going live.
- Add, edit or delete pieces. Changes apply **instantly in your browser** so you can preview them on the site.
- To publish for **all visitors**: click **Download data.js**, then replace `js/data.js` in your repository / host with the downloaded file and redeploy.
- **Reset to original** discards your browser-only edits.

> Note: the passcode only deters casual visitors — anyone reading the page source can find it. Real login security needs a server. For a small catalogue page this is normally acceptable; just don't link to admin.html from the site.

---

## 2. Telegram order alerts (free, instant, recommended)

You get a Telegram message the moment an order is placed, with the full order details.

1. In Telegram, message **@BotFather** → send `/newbot` → give it a name (e.g. "Mahseri Orders") → BotFather replies with a **bot token** like `123456789:AAH3x...`.
2. Open a chat with your new bot and press **Start** (send any message).
3. Get your chat id: visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser — find `"chat":{"id":123456789,...}`. That number is your **chat id**.
4. In `js/data.js`, under `MAHSERI_NOTIFY.telegram`, paste the token and chat id and set `enabled: true`.

> WhatsApp alternative: automatic WhatsApp messages require the paid WhatsApp Business API (via Twilio/Meta, needs business verification). Telegram does the same job for free, which is why it's wired in. The customer-side "Confirm via WhatsApp" checkout option still opens WhatsApp to your number as before.

> Note: the bot token is visible in the page source. Worst case someone could send you fake messages through your bot — it cannot read your chats or access your account. Acceptable for a store this size; a serverless function can hide it later if needed.

## 3. Invoice email (EmailJS — free up to 200 emails/month)

Sends a branded Mahseri invoice to the customer and a copy (BCC) to mahserijewellery@gmail.com.

1. Create a free account at **emailjs.com**.
2. **Email Services → Add New Service** → choose Gmail → connect `mahserijewellery@gmail.com`. Note the **Service ID**.
3. **Email Templates → Create New Template** → switch the editor to **Code** view → paste the entire contents of `assets/email-invoice-template.html`.
4. In the template **Settings** set:
   - **To email:** `{{customer_email}}`
   - **BCC:** `mahserijewellery@gmail.com`
   - **Subject:** `Your Mahseri Jewellery invoice — {{order_no}}`
   - Note the **Template ID**.
5. **Account → General** → copy your **Public Key**.
6. In `js/data.js`, under `MAHSERI_NOTIFY.emailjs`, paste the public key, service ID and template ID, and set `enabled: true`.

---

## 4. Card payments (Visa / Mastercard)

The checkout now has a **"Card — Visa / Mastercard"** option. Real card processing legally requires a
**payment gateway merchant account** — no website can charge cards without one. Options that work
for businesses in Jordan:

| Gateway | Notes |
|---|---|
| **Montypay / PayTabs** | Popular in Jordan & MENA, JOD support, hosted payment pages |
| **HyperPay** | Amman-based, strong local support |
| **Telr** | MENA-focused, quick onboarding |
| **Stripe** | Not directly available in Jordan |

Until a gateway account exists, the card option works like this: the order arrives with payment
method "Card", and you send the customer a secure payment link (all gateways above can generate
payment links from their dashboard — no coding needed). Once you have an account, I can wire the
hosted checkout page directly into the site.

---

## 5. Live metal pricing (`js/pricing.js`)

Prices are computed **live** from the international gold/silver market (free API, no key
needed: `api.gold-api.com`). Every piece is priced as:

```
price = (live metal value per gram × weight) + (making charge per gram × weight)
```

- The **metal value** is pulled live (24K gold and silver per gram, converted to JOD),
  then adjusted for the piece's karat (21K = 21/24 of pure gold, 925 silver = 0.925, etc.).
- The **making charge** ("ujra") per gram is your workshop's labour/profit, set per metal
  in `MAHSERI_MAKING` (`js/data.js`) — or edit it in the catalogue manager (`admin.html`)
  under **Live gold & silver → making**, then click **Download data.js**.

Live pricing is **on** (`enabled: true` in `js/pricing.js`). Prices are cached for 1 hour in
the visitor's browser; when offline, the fixed prices saved in `data.js` are used as a fallback.
To switch back to fixed manual prices, set `enabled: false`.

> Tip: open `admin.html`, set each metal's making charge, and you'll see the whole catalogue
> reprice instantly from the current gold price. The price shown there is exactly what visitors see.

---

## 6. Publishing at mahserijewellery.com

### Step 1 — Buy the domain (~$10–15/year)
Buy `mahserijewellery.com` at a registrar: **Namecheap**, **Cloudflare Registrar** (cheapest), or **GoDaddy**.

### Step 2 — Host the site (free)

**Option A — Netlify (easiest, recommended)**
1. Push this folder to a GitHub repository (it already is a git repo).
2. Sign up at netlify.com with your GitHub account → **Add new site → Import an existing project** → pick the repo. Build settings: leave everything empty (it's a static site). Deploy.
3. **Domain settings → Add custom domain** → enter `mahserijewellery.com`.
4. Netlify shows you DNS records. At your registrar, set:
   - `A` record for `@` → `75.2.60.5` (Netlify's load balancer)
   - `CNAME` record for `www` → `<your-site>.netlify.app`
   (or simply switch the domain's nameservers to the ones Netlify gives you — easier.)
5. HTTPS certificate is issued automatically. Done — every `git push` updates the live site.

**Option B — GitHub Pages (also free)**
1. Push to GitHub → repo **Settings → Pages** → Source: `main` branch, root folder.
2. In **Custom domain** enter `mahserijewellery.com`.
3. At your registrar add four `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www` → `<username>.github.io`.
4. Tick **Enforce HTTPS** once the certificate is ready (can take up to 24h).

DNS changes can take from a few minutes to 24–48 hours to propagate worldwide.

### Step 3 — After going live
- Change the admin passcode in `js/admin.js`.
- Fill in the Telegram + EmailJS keys (sections 2–3) and redeploy.
- Optional: add the site to **Google Search Console** so it appears in search.
