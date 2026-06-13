/* Mahseri Jewellery — product catalogue
   Prices in Jordanian Dinar (JOD). Art keys map to SVG line art in app.js. */

const MAHSERI_PRODUCTS = [
  {
    id: "amman-rope-chain",
    name: "Amman Rope Chain",
    category: "Necklaces",
    material: "21K Gold",
    gender: "Him",
    price: 1480,
    weight: "14.2 g",
    badge: "Bestseller",
    art: "necklace",
    image: "https://picsum.photos/seed/amman-rope-chain/400/400",
    description:
      "A hand-twisted rope chain in rich 21K gold — the signature Mahseri piece. Dense, fluid, and finished link by link in our Amman workshop for a drape that catches light from every angle."
  },
  {
    id: "petra-pendant",
    name: "Petra Pendant",
    category: "Necklaces",
    material: "18K Gold",
    gender: "Her",
    price: 620,
    weight: "6.8 g",
    badge: "New",
    art: "pendant",
    image: "https://picsum.photos/seed/petra-pendant/400/400",
    description:
      "Inspired by the carved facades of Petra, this 18K pendant pairs architectural edges with a satin-polished face. Suspended on a fine box chain, it sits perfectly at the collarbone."
  },
  {
    id: "qamar-hoops",
    name: "Qamar Hoops",
    category: "Earrings",
    material: "18K Gold",
    gender: "Her",
    price: 540,
    weight: "5.4 g",
    badge: null,
    art: "earrings",
    image: "https://picsum.photos/seed/qamar-hoops/400/400",
    description:
      "Named after the moon, these crescent hoops are hollow-formed for featherweight all-day wear, with a mirror finish inside and brushed gold outside."
  },
  {
    id: "dana-band",
    name: "Dana Band",
    category: "Rings",
    material: "21K Gold",
    gender: "Him",
    price: 980,
    weight: "8.1 g",
    badge: "Signature",
    art: "ring",
    image: "https://picsum.photos/seed/dana-band/400/400",
    description:
      "A rich 21K statement band with a softly hammered surface. Each facet is struck by hand, so no two bands ever carry the same light."
  },
  {
    id: "wadi-cuff",
    name: "Wadi Cuff",
    category: "Bracelets",
    material: "925 Silver",
    gender: "Both",
    price: 145,
    weight: "22 g",
    badge: null,
    art: "bangle",
    image: "https://picsum.photos/seed/wadi-cuff/400/400",
    description:
      "A solid sterling cuff with a river-smooth interior and a sculpted, open silhouette inspired by the curves of Wadi Rum. Adjustable for a precise fit."
  },
  {
    id: "yasmin-studs",
    name: "Yasmin Studs",
    category: "Earrings",
    material: "925 Silver",
    gender: "Her",
    price: 78,
    weight: "2.6 g",
    badge: null,
    art: "earrings",
    image: "https://picsum.photos/seed/yasmin-studs/400/400",
    description:
      "Minimal jasmine-bud studs in polished sterling silver — the everyday essential that layers with everything in the collection."
  },
  {
    id: "salt-signet",
    name: "Salt Signet",
    category: "Rings",
    material: "925 Silver",
    gender: "Both",
    price: 120,
    weight: "9.4 g",
    badge: "Bestseller",
    art: "ring",
    image: "https://picsum.photos/seed/salt-signet/400/400",
    description:
      "A clean-faced signet ring ready for hand-engraved initials. Solid 925 silver with a deep polish — customisation included in the price."
  },
  {
    id: "noor-lariat",
    name: "Noor Lariat",
    category: "Necklaces",
    material: "18K Gold",
    gender: "Her",
    price: 760,
    weight: "7.9 g",
    badge: null,
    art: "necklace",
    image: "https://picsum.photos/seed/noor-lariat/400/400",
    description:
      "A fluid lariat that ties as you please. Fine 18K links end in two polished drops, letting light travel the full length of the piece."
  },
  {
    id: "zain-curb-bracelet",
    name: "Zain Curb Bracelet",
    category: "Bracelets",
    material: "21K Gold",
    gender: "Him",
    price: 1150,
    weight: "12.6 g",
    badge: null,
    art: "bangle",
    image: "https://picsum.photos/seed/zain-curb-bracelet/400/400",
    description:
      "A confident curb-link bracelet in 21K gold, beveled and polished by hand. Substantial on the wrist with a secure box clasp."
  },
  {
    id: "layla-threader",
    name: "Layla Threader Earrings",
    category: "Earrings",
    material: "21K Gold",
    gender: "Her",
    price: 410,
    weight: "3.2 g",
    badge: "New",
    art: "earrings",
    image: "https://picsum.photos/seed/layla-threader/400/400",
    description:
      "Delicate 21K threader chains that fall like lines of light. Wear them long and dramatic, or doubled for a closer drop."
  },
  {
    id: "raya-stacking-set",
    name: "Raya Stacking Set",
    category: "Rings",
    material: "18K Gold",
    gender: "Her",
    price: 690,
    weight: "6.0 g",
    badge: null,
    art: "ring",
    image: "https://picsum.photos/seed/raya-stacking-set/400/400",
    description:
      "Three slim 18K bands — polished, brushed, and beaded — designed to be worn together, apart, or shared. The set arrives in a single Mahseri keep-box."
  },
  {
    id: "hala-bangle",
    name: "Hala Bangle",
    category: "Bracelets",
    material: "21K Gold",
    gender: "Her",
    price: 1980,
    weight: "18.4 g",
    badge: "Signature",
    art: "bangle",
    image: "https://picsum.photos/seed/hala-bangle/400/400",
    description:
      "The heirloom piece: a seamless 21K bangle raised from a single ingot, with a softly domed profile that glows rather than glitters. Made to order in your exact size."
  },
  {
    id: "mina-anklet",
    name: "Mina Anklet",
    category: "Bracelets",
    material: "925 Silver",
    gender: "Her",
    price: 95,
    weight: "4.8 g",
    badge: null,
    art: "necklace",
    image: "https://picsum.photos/seed/mina-anklet/400/400",
    description:
      "A fine sterling anklet with hand-set beads spaced along the chain. Finished with a two-centimetre extender for the perfect drape."
  }
];

/* Making charge ("ujra") in JOD per gram, keyed by the material value used on
   products above. The pure metal value per gram comes LIVE from the gold/silver
   market (see js/pricing.js); the final price of a piece is:

       price = (live metal value per gram x weight) + (making charge per gram x weight)

   Edit these to your workshop's making charges — or change them in the
   catalogue manager (admin.html) and click "Download data.js". */
const MAHSERI_MAKING = {
  "21K Gold": 4,
  "18K Gold": 4,
  "925 Silver": 1
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
    botToken: "PASTE_BOT_TOKEN_HERE",
    chatId: "PASTE_CHAT_ID_HERE"
  },
  emailjs: {
    enabled: false,
    publicKey: "PASTE_PUBLIC_KEY_HERE",
    serviceId: "PASTE_SERVICE_ID_HERE",
    templateId: "PASTE_TEMPLATE_ID_HERE"
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
    var savedMaking = localStorage.getItem("mahseri_making_admin_v1");
    if (savedMaking) {
      var making = JSON.parse(savedMaking);
      if (making && typeof making === "object") {
        Object.keys(making).forEach(function (k) { MAHSERI_MAKING[k] = making[k]; });
      }
    }
  } catch (e) { /* ignore corrupt saved data */ }
})();
