/* Mahseri Jewellery — product catalogue
   Prices in Jordanian Dinar (JOD). Art keys map to SVG line art in app.js. */

/* Real catalogue — one product per photo in assets/Products/{gold|silver}/<category>/.
   Gems: assets/Products/gems/ (flat). Edit details in admin.html → Download data.js. */
const MAHSERI_PRODUCTS = [
  {
    id: "flower-oval-rolo-bracelet",
    sku: "SKU-0001",
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
    sku: "SKU-0002",
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
    sku: "SKU-0003",
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
    sku: "SKU-0004",
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
    sku: "SKU-0005",
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
    sku: "SKU-0006",
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
    sku: "SKU-0007",
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

/* Image folders available to admin.html → Bulk import → Import products from folder.
   Keep this manifest in sync when adding image files to assets/Products. */
const MAHSERI_PRODUCT_IMAGE_FOLDERS = [
  {
    collection: "gold",
    category: "Bracelets",
    folder: "assets/Products/gold/bracelets/",
    files: [
      "Flower Oval Rolo Bracelet.jpeg",
      "Gold Half Lira Bracelet Paper Clip.jpeg",
      "Gold Quarter Lira Bracelet Paper Clip.jpeg",
      "Oval Rolo Bracelet.jpeg",
      "Stacked Gold Half Liras Bracelet.jpeg",
      "Stacked Gold Liras Bracelet.jpeg",
      "Stacked Gold Quarter Liras Bracelet.jpeg"
    ]
  },
  {
    collection: "silver",
    category: "Bracelets",
    folder: "assets/Products/silver/bracelets/",
    files: [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
      "6.jpg",
      "7.jpg",
      "8.jpg",
      "9.jpg",
      "10.jpg",
      "11.jpg",
      "12.jpg",
      "13.jpg",
      "14.jpg",
      "15.jpg",
      "16.jpg",
      "17.jpg",
      "18.jpg",
      "19.jpg",
      "20.jpg",
      "21.jpg",
      "22.jpg",
      "23.jpg",
      "24.jpg",
      "25.jpg",
      "26.jpg",
      "27.jpg"
    ]
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
    enabled: false,
    botToken: "",
    chatId: "",
    channelId: "",
    siteUrl: "https://mahserijewellery.com",
    metalAlerts: {
      enabled: true,
      intervalMinutes: 10
    }
  },
  emailjs: {
    enabled: false,
    publicKey: "",
      serviceId: "",
      templateId: ""
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
