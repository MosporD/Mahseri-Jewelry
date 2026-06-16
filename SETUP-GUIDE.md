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

Prices can be computed live from international gold/silver prices × product weight.
The engine is built and tested (free API, no key needed: api.gold-api.com) but **disabled**
until the Mahseri formulas are confirmed — edit the `formulas` section in `js/pricing.js`
and set `enabled: true`. Prices are cached for 20 minutes in the visitor's browser.

### Telegram metal price alerts (every 10 minutes)

The website is static — it cannot send Telegram messages while nobody has a page open. A small script on your PC (or any machine that stays on) fetches live gold/silver and messages you on a schedule.

**One-time setup**

1. Create your bot (if you have not already) — see section 2 above. Use the **same bot token and chat id** for orders and metal alerts.
2. Copy the config file:
   ```text
   scripts/metal-alert-config.example.json  →  scripts/metal-alert-config.json
   ```
3. Edit `scripts/metal-alert-config.json`:
   - `botToken` — from @BotFather
   - `chatId` — your Telegram user id (from `getUpdates`)
   - `intervalMinutes` — `10` (default)
4. Test once:
   ```powershell
   cd "C:\Users\malek.mohammad\OneDrive - Zain Jordan\Documents\My Project"
   node scripts/telegram-metal-alerts.js
   ```
   You should receive a Telegram message with gold/silver USD and JOD rates (highest of three feeds).

**Option A — Windows Task Scheduler (recommended; works when admin browser is closed)**

1. Open **Task Scheduler** → **Create Task**
2. **General:** name `Mahseri metal alerts`, run whether user is logged on or not
3. **Triggers:** New → **Daily**, repeat every **10 minutes** for **1 day**, then at bottom set **Repeat indefinitely** (or create a trigger that repeats 10 min forever)
4. **Actions:** New → Program `node`, arguments:
   ```text
   scripts\telegram-metal-alerts.js
   ```
   Start in: your project folder path (the folder that contains `scripts\`)
5. Save. Right-click the task → **Run** to test.

Or use the batch file as the program:
   ```text
   Program: C:\Users\malek.mohammad\OneDrive - Zain Jordan\Documents\My Project\scripts\send-metal-alert-once.bat
   ```

**Option B — Keep a window open (simplest for testing)**

Double-click `scripts\run-metal-alerts-loop.bat` — sends an alert immediately, then every 10 minutes until you close the window.

> `metal-alert-config.json` is in `.gitignore` so your bot token is not pushed to GitHub.

### Send gold prices to a client group or channel

**Channel (recommended for clients)** — one-way broadcast; clients subscribe, they cannot spam each other.

1. In Telegram: **New Channel** → name it e.g. `Mahseri Gold Prices` → Public or Private.
2. **@BotFather** → `/mybots` → your bot → **Bot Settings** → **Allow Groups?** → turn **On** (needed for channels too in some cases).
3. Open your channel → **Manage channel** → **Administrators** → **Add administrator** → select your bot → enable **Post messages**.
4. In the channel, post any message (e.g. `test`) so Telegram registers the chat.
5. Open in a browser (use your real token):
   ```text
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
6. Find the channel entry — `"chat":{"id":-1001234567890,"title":"Mahseri Gold Prices","type":"channel"}`  
   The **id** is usually negative and starts with `-100`.
7. In `scripts/metal-alert-config.json`, send to **you and the channel**:
   ```json
   "chatId": "5306835048",
   "chatIds": ["5306835048", "-1001234567890"]
   ```
   Or only the channel id in `chatId` if clients should be the only audience.

**Group (alternative)** — clients can chat with each other; bot posts prices into the group.

1. Create a **New Group** → add your bot as a member (search its `@username`).
2. Optional: make the bot an **admin** (Manage group → Administrators → Add).
3. Send a message in the group (`hi`).
4. Use `getUpdates` — group id looks like `-123456789` or `-100...` for supergroups.
5. Add that id to `chatIds` in the config.

**Invite clients**

- **Channel:** share the channel link (`t.me/your_channel_name`) — they tap **Join**.
- **Group:** share the group invite link (Manage group → Invite link).

**Keep order alerts private**

Leave `js/data.js` → `MAHSERI_NOTIFY.telegram.chatId` as **your personal id** (`5306835048`). Use `chatIds` in `metal-alert-config.json` only for gold-price broadcasts.

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
