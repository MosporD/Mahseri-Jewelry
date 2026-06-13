/* ============================================================
   Mahseri Jewellery — live metal pricing
   Fetches live gold (XAU) and silver (XAG) prices and prices
   every piece from its weight:

       price = (live metal value/gram x weight) + (making charge/gram x weight)

   The pure metal value comes from the market; the making charge
   per gram lives in MAHSERI_MAKING (js/data.js, editable in admin).
   When offline, the static prices in data.js are used as-is.
   ============================================================ */

var MAHSERI_PRICING = {
  /* Live pricing is on. Set to false to fall back to the fixed
     prices stored in data.js. */
  enabled: true,

  usdToJod: 0.709,              // 1 USD ~ 0.709 JOD (JOD is pegged to the USD)
  gramsPerTroyOunce: 31.1034768,
  cacheMinutes: 60,             // re-fetch live prices at most once per hour

  /* How pure each material is, and which metal it's made of.
     factor = karat / 24 for gold, fineness for silver. */
  purity: {
    "21K Gold":   { metal: "gold",   factor: 21 / 24 },
    "18K Gold":   { metal: "gold",   factor: 18 / 24 },
    "925 Silver": { metal: "silver", factor: 0.925 }
  },

  round: function (price) { return Math.round(price); }
};

(function () {
  "use strict";

  var CACHE_KEY = "mahseri_metal_prices_v1";
  /* Current live value of PURE metal, in JOD per gram. Null until loaded. */
  var current = null;   // { gold24, silver, ts }

  function perGramJod(usdPerOunce) {
    return (usdPerOunce / MAHSERI_PRICING.gramsPerTroyOunce) * MAHSERI_PRICING.usdToJod;
  }

  function makingFor(material) {
    var m = (typeof MAHSERI_MAKING !== "undefined" && MAHSERI_MAKING)
      ? Number(MAHSERI_MAKING[material]) : 0;
    return isNaN(m) ? 0 : m;
  }

  function setCurrent(xauUsdOz, xagUsdOz, ts) {
    current = {
      gold24: perGramJod(xauUsdOz),
      silver: perGramJod(xagUsdOz),
      ts: ts || Date.now()
    };
  }

  /* ---------- Public helpers (used by admin.html too) ---------- */

  /* Live value of the PURE-karat metal for a material, JOD per gram
     (e.g. the 21K-gold value/gram), before any making charge. */
  MAHSERI_PRICING.metalPerGram = function (material) {
    var pur = MAHSERI_PRICING.purity[material];
    if (!current || !pur) return null;
    return (pur.metal === "gold" ? current.gold24 : current.silver) * pur.factor;
  };

  /* Final selling price for a material + weight, or null if rates aren't
     loaded / the inputs are invalid. */
  MAHSERI_PRICING.priceFor = function (material, weight) {
    var grams = parseFloat(weight);
    var perGram = MAHSERI_PRICING.metalPerGram(material);
    if (perGram == null || !(grams > 0)) return null;
    return MAHSERI_PRICING.round(perGram * grams + makingFor(material) * grams);
  };

  /* The current live rates, or null. */
  MAHSERI_PRICING.liveRates = function () {
    return current
      ? { gold24: current.gold24, silver: current.silver, ts: current.ts }
      : null;
  };

  function readCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (c && c.xau && c.xag &&
          Date.now() - c.ts < MAHSERI_PRICING.cacheMinutes * 60000) {
        return c;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function fetchLive() {
    return Promise.all([
      fetch("https://api.gold-api.com/price/XAU").then(function (r) { return r.json(); }),
      fetch("https://api.gold-api.com/price/XAG").then(function (r) { return r.json(); })
    ]).then(function (res) {
      var xau = res[0] && res[0].price;
      var xag = res[1] && res[1].price;
      if (!(xau > 0) || !(xag > 0)) throw new Error("bad price data");
      var ts = Date.now();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ xau: xau, xag: xag, ts: ts }));
      setCurrent(xau, xag, ts);
      return MAHSERI_PRICING.liveRates();
    });
  }

  /* Ensure live rates are available, then call cb(rates|null).
     Pass force=true to skip the cache and re-fetch. */
  MAHSERI_PRICING.ensureRates = function (cb, force) {
    if (!force) {
      var cached = readCache();
      if (cached) {
        setCurrent(cached.xau, cached.xag, cached.ts);
        if (cb) cb(MAHSERI_PRICING.liveRates());
        return;
      }
    }
    fetchLive()
      .then(function (rates) { if (cb) cb(rates); })
      .catch(function () { if (cb) cb(null); });
  };

  /* Reprice every product in MAHSERI_PRODUCTS from the live rates. */
  MAHSERI_PRICING.repriceProducts = function () {
    if (typeof MAHSERI_PRODUCTS === "undefined") return false;
    var changed = false;
    MAHSERI_PRODUCTS.forEach(function (p) {
      var price = MAHSERI_PRICING.priceFor(p.material, p.weight);
      if (price && price > 0 && price !== p.price) {
        p.price = price;
        changed = true;
      }
    });
    if (changed) document.dispatchEvent(new CustomEvent("mahseri:prices-updated"));
    return changed;
  };

  /* ---------- Auto-run on every page when enabled ---------- */

  if (MAHSERI_PRICING.enabled) {
    MAHSERI_PRICING.ensureRates(function (rates) {
      if (rates) MAHSERI_PRICING.repriceProducts();
    });
  }
})();
