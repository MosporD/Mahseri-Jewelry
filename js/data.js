/* Mahseri Jewellery — product catalogue
   Prices in Jordanian Dinar (JOD). Art keys map to SVG line art in app.js. */

/* Real catalogue — one product per photo in assets/Products/{gold|silver}/<category>/.
   Gems: assets/Products/gems/ (flat). Edit details in admin.html → Download data.js. */
const MAHSERI_PRODUCTS = [
  {
    id: "flower-oval-rolo-bracelet",
    name: "Gold Bracelet — edit name",
    collection: "gold",
    category: "Bracelets",
    material: "21K Gold",
    gender: "Her",
    price: 2600,
    weight: "40 g",
    making_fee: 0,
    badge: null,
    art: "bangle",
    in_stock: true,
    image: "assets/Products/gold/bracelets/Flower Oval Rolo Bracelet.jpeg",
    description: "Edit description in admin."
  },
  {
    id: "gold-half-lira-bracelet-paper-clip",
    name: "Gold Bracelet — edit name",
    collection: "gold",
    category: "Bracelets",
    material: "21K Gold",
    gender: "Her",
    price: 2600,
    weight: "40 g",
    making_fee: 0,
    badge: null,
    art: "bangle",
    in_stock: true,
    image: "assets/Products/gold/bracelets/Gold Half Lira Bracelet Paper Clip.jpeg",
    description: "Edit description in admin."
  },
  {
    id: "gold-quarter-lira-bracelet-paper-clip",
    name: "Gold Bracelet — edit name",
    collection: "gold",
    category: "Bracelets",
    material: "21K Gold",
    gender: "Her",
    price: 2600,
    weight: "40 g",
    making_fee: 0,
    badge: null,
    art: "bangle",
    in_stock: true,
    image: "assets/Products/gold/bracelets/Gold Quarter Lira Bracelet Paper Clip.jpeg",
    description: "Edit description in admin."
  },
  {
    id: "oval-rolo-bracelet",
    name: "Gold Bracelet — edit name",
    collection: "gold",
    category: "Bracelets",
    material: "21K Gold",
    gender: "Her",
    price: 2600,
    weight: "40 g",
    making_fee: 0,
    badge: null,
    art: "bangle",
    in_stock: true,
    image: "assets/Products/gold/bracelets/Oval Rolo Bracelet.jpeg",
    description: "Edit description in admin."
  },
  {
    id: "stacked-gold-half-liras-bracelet",
    name: "Gold Bracelet — edit name",
    collection: "gold",
    category: "Bracelets",
    material: "21K Gold",
    gender: "Her",
    price: 2600,
    weight: "40 g",
    making_fee: 0,
    badge: null,
    art: "bangle",
    in_stock: true,
    image: "assets/Products/gold/bracelets/Stacked Gold Half Liras Bracelet.jpeg",
    description: "Edit description in admin."
  },
  {
    id: "stacked-gold-liras-bracelet",
    name: "Gold Bracelet — edit name",
    collection: "gold",
    category: "Bracelets",
    material: "21K Gold",
    gender: "Her",
    price: 2600,
    weight: "40 g",
    making_fee: 0,
    badge: null,
    art: "bangle",
    in_stock: true,
    image: "assets/Products/gold/bracelets/Stacked Gold Liras Bracelet.jpeg",
    description: "Edit description in admin."
  },
  {
    id: "stacked-gold-quarter-liras-bracelet",
    name: "Gold Bracelet — edit name",
    collection: "gold",
    category: "Bracelets",
    material: "21K Gold",
    gender: "Her",
    price: 2600,
    weight: "40 g",
    making_fee: 0,
    badge: null,
    art: "bangle",
    in_stock: true,
    image: "assets/Products/gold/bracelets/Stacked Gold Quarter Liras Bracelet.jpeg",
    description: "Edit description in admin."
  }
];

const MAHSERI_CATEGORIES = [
  "Necklaces",
  "Rings",
  "Bracelets",
  "Earrings",
  "Brooches",
  "Nose Jewellery",
  "Anklets",
  "Leg Chains",
  "Navel Rings",
  "Full Set",
  "Half Set",
  "3 Piece Set"
];

/* Gem types — used on shop-gems.html (not mixed with jewellery categories). */
const MAHSERI_GEM_TYPES = [
  "Ruby",
  "Emerald",
  "Sapphire",
  "Diamond",
  "Pearl",
  "Semi-Precious"
];

/* Metal rates — price per gram in JOD, keyed by the material value used on
   products above. The admin page uses these to auto-calculate a piece's price
   from its weight and metal (price = weight in grams x rate + making fee).
   Edit these whenever the gold/silver market moves, or change them in the
   catalogue manager and click "Download data.js". */
const MAHSERI_RATES = {
  "21K Gold": 65,
  "18K Gold": 56,
  "925 Silver": 1.2
};

const MAHSERI_STORE = {
  currency: "JOD",
  freeShippingThreshold: 300,
  shippingFlat: 5,
  phone: "+962 7 9715 7007",
  whatsapp: "962797157007",
  email: "mahserijewellery@gmail.com",
  address: "Madaba ST - Wehdat - Amman - Jordan",
  cities: [
    "Amman", "Zarqa", "Irbid", "Aqaba", "Madaba", "Salt",
    "Jerash", "Ajloun", "Karak", "Mafraq", "Tafilah", "Ma'an"
  ]
};

/* Order notifications — fill in your keys and set enabled: true.
   Full setup steps are in SETUP-GUIDE.md at the project root. */
const MAHSERI_NOTIFY = {
  telegram: {
    enabled: true,
    botToken: "8943736269:AAFzqxcT2eYIvanCrmF_svfqtLodaNkxjQg",
    chatId: "5306835048",
    channelId: "-1004372771709",
    siteUrl: "https://mahserijewellery.com",
    metalAlerts: {
      enabled: true,
      intervalMinutes: 10
    }
  },
  emailjs: {
    enabled: true,
    publicKey: "Qzlv3YiOFEdma-qKK",
      serviceId: "service_0cdrg8n",
      templateId: "template_wt1mexr"
  }
};

/* Products edited via admin.html are stored in this browser's localStorage
   and override the catalogue above. Use "Download data.js" in the admin
   page and replace this file on your host to publish for all visitors. */
(function () {
  try {
    var saved = localStorage.getItem("mahseri_products_admin_v1");
    if (saved) {
      var arr = JSON.parse(saved);
      if (Array.isArray(arr) && arr.length) {
        MAHSERI_PRODUCTS.length = 0;
        arr.forEach(function (p) { MAHSERI_PRODUCTS.push(p); });
      }
    }
    var savedRates = localStorage.getItem("mahseri_rates_admin_v1");
    if (savedRates) {
      var rates = JSON.parse(savedRates);
      if (rates && typeof rates === "object") {
        Object.keys(rates).forEach(function (k) { MAHSERI_RATES[k] = rates[k]; });
      }
    }
  } catch (e) { /* ignore corrupt saved data */ }
})();
