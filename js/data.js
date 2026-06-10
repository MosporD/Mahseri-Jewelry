/* Mahseri Jewellery — product catalogue
   Prices in Jordanian Dinar (JOD). Art keys map to SVG line art in app.js. */

const MAHSERI_PRODUCTS = [
  {
    id: "amman-rope-chain",
    name: "Amman Rope Chain",
    category: "Necklaces",
    material: "21K Gold",
    price: 1480,
    weight: "14.2 g",
    badge: "Bestseller",
    art: "necklace",
    description:
      "A hand-twisted rope chain in rich 21K gold — the signature Mahseri piece. Dense, fluid, and finished link by link in our Amman workshop for a drape that catches light from every angle."
  },
  {
    id: "petra-pendant",
    name: "Petra Pendant",
    category: "Necklaces",
    material: "18K Gold",
    price: 620,
    weight: "6.8 g",
    badge: "New",
    art: "pendant",
    description:
      "Inspired by the carved facades of Petra, this 18K pendant pairs architectural edges with a satin-polished face. Suspended on a fine box chain, it sits perfectly at the collarbone."
  },
  {
    id: "qamar-hoops",
    name: "Qamar Hoops",
    category: "Earrings",
    material: "18K Gold",
    price: 540,
    weight: "5.4 g",
    badge: null,
    art: "earrings",
    description:
      "Named after the moon, these crescent hoops are hollow-formed for featherweight all-day wear, with a mirror finish inside and brushed gold outside."
  },
  {
    id: "dana-band",
    name: "Dana Band",
    category: "Rings",
    material: "24K Gold",
    price: 980,
    weight: "8.1 g",
    badge: "Signature",
    art: "ring",
    description:
      "A pure 24K statement band with a softly hammered surface. Each facet is struck by hand, so no two bands ever carry the same light."
  },
  {
    id: "wadi-cuff",
    name: "Wadi Cuff",
    category: "Bracelets",
    material: "925 Silver",
    price: 145,
    weight: "22 g",
    badge: null,
    art: "bangle",
    description:
      "A solid sterling cuff with a river-smooth interior and a sculpted, open silhouette inspired by the curves of Wadi Rum. Adjustable for a precise fit."
  },
  {
    id: "yasmin-studs",
    name: "Yasmin Studs",
    category: "Earrings",
    material: "925 Silver",
    price: 78,
    weight: "2.6 g",
    badge: null,
    art: "earrings",
    description:
      "Minimal jasmine-bud studs in polished sterling silver — the everyday essential that layers with everything in the collection."
  },
  {
    id: "salt-signet",
    name: "Salt Signet",
    category: "Rings",
    material: "925 Silver",
    price: 120,
    weight: "9.4 g",
    badge: "Bestseller",
    art: "ring",
    description:
      "A clean-faced signet ring ready for hand-engraved initials. Solid 925 silver with a deep polish — customisation included in the price."
  },
  {
    id: "noor-lariat",
    name: "Noor Lariat",
    category: "Necklaces",
    material: "18K Gold",
    price: 760,
    weight: "7.9 g",
    badge: null,
    art: "necklace",
    description:
      "A fluid lariat that ties as you please. Fine 18K links end in two polished drops, letting light travel the full length of the piece."
  },
  {
    id: "zain-curb-bracelet",
    name: "Zain Curb Bracelet",
    category: "Bracelets",
    material: "21K Gold",
    price: 1150,
    weight: "12.6 g",
    badge: null,
    art: "bangle",
    description:
      "A confident curb-link bracelet in 21K gold, beveled and polished by hand. Substantial on the wrist with a secure box clasp."
  },
  {
    id: "layla-threader",
    name: "Layla Threader Earrings",
    category: "Earrings",
    material: "21K Gold",
    price: 410,
    weight: "3.2 g",
    badge: "New",
    art: "earrings",
    description:
      "Delicate 21K threader chains that fall like lines of light. Wear them long and dramatic, or doubled for a closer drop."
  },
  {
    id: "raya-stacking-set",
    name: "Raya Stacking Set",
    category: "Rings",
    material: "18K Gold",
    price: 690,
    weight: "6.0 g",
    badge: null,
    art: "ring",
    description:
      "Three slim 18K bands — polished, brushed, and beaded — designed to be worn together, apart, or shared. The set arrives in a single Mahseri keep-box."
  },
  {
    id: "hala-bangle",
    name: "Hala Bangle",
    category: "Bracelets",
    material: "24K Gold",
    price: 1980,
    weight: "18.4 g",
    badge: "Signature",
    art: "bangle",
    description:
      "The heirloom piece: a seamless 24K bangle raised from a single ingot, with a softly domed profile that glows rather than glitters. Made to order in your exact size."
  },
  {
    id: "mina-anklet",
    name: "Mina Anklet",
    category: "Bracelets",
    material: "925 Silver",
    price: 95,
    weight: "4.8 g",
    badge: null,
    art: "necklace",
    description:
      "A fine sterling anklet with hand-set beads spaced along the chain. Finished with a two-centimetre extender for the perfect drape."
  }
];

const MAHSERI_STORE = {
  currency: "JOD",
  freeShippingThreshold: 300,
  shippingFlat: 5,
  phone: "+962 7 9000 0000",
  whatsapp: "962790000000",
  email: "hello@mahserijewellery.com",
  address: "Gold Souq, King Faisal Street, Downtown Amman, Jordan",
  cities: [
    "Amman", "Zarqa", "Irbid", "Aqaba", "Madaba", "Salt",
    "Jerash", "Ajloun", "Karak", "Mafraq", "Tafilah", "Ma'an"
  ]
};
