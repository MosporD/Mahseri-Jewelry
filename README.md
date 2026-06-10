# Mahseri Jewellery

A multi-page e-commerce storefront for **Mahseri Jewellery**, a family jewellery atelier in
Amman, Jordan. Built as a fully static site — no build step, no backend — so it can be hosted
on GitHub Pages or any static host.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Home — hero, collections, featured pieces, interactive material guide, services, testimonials |
| `shop.html` | Full catalogue with live category/metal filters and sorting |
| `product.html?id=…` | Product detail — zoomable artwork, specs, size guide, quantity, related pieces |
| `cart.html` | Bag review and checkout (cash on delivery, CliQ, or WhatsApp order) |
| `about.html` | House story, animated stats, timeline, values |
| `contact.html` | Contact form, atelier hours, map, FAQ |

## E-commerce features

- Persistent shopping bag stored in `localStorage`, shared across all pages
- Slide-out bag drawer with quantity controls available site-wide
- Pricing in Jordanian Dinar (JOD) with free-delivery threshold logic
- Checkout flow with Jordanian cities, cash-on-delivery / CliQ / WhatsApp order options
- Order confirmation with generated order number

## Stack

Plain HTML, CSS and vanilla JavaScript.

- `css/style.css` — design system (Cormorant Garamond + Jost, ivory/charcoal/gold palette)
- `js/data.js` — product catalogue and store settings (edit here to change products, prices, contact details)
- `js/app.js` — cart engine, shared UI chrome, and per-page behaviour

## Running locally

Serve the folder with any static server, e.g.:

```bash
python3 -m http.server 8000
```

then open <http://localhost:8000>.
