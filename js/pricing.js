/* ============================================================
   Mahseri Jewellery — live metal pricing
   Fetches live gold (XAU) and silver (XAG) prices and reprices
   every product from its weight. When disabled or offline, the
   static prices in data.js are used as-is.
   ============================================================ */

var MAHSERI_PRICING = {
  /* Set to true once the formulas below are confirmed. */
  enabled: false,

  usdToJod: 0.709,              // JOD is pegged to the USD
  gramsPerTroyOunce: 31.1034768,
  cacheMinutes: 60,             // re-fetch live prices at most once per hour

  /* ----------------------------------------------------------
     FORMULAS — replace with the real Mahseri formulas.
     Inputs:
       gold24  = live price of pure (24K) gold, JOD per gram
       silver  = live price of pure silver, JOD per gram
       weight  = product weight in grams
     Must return the final selling price in JOD.
     ---------------------------------------------------------- */
  formulas: {
    "21K Gold": function (gold24, silver, weight) {
      return (gold24 * 21 / 24) * weight;          // PLACEHOLDER
    },
    "18K Gold": function (gold24, silver, weight) {
      return (gold24 * 18 / 24) * weight;          // PLACEHOLDER
    },
    "925 Silver": function (gold24, silver, weight) {
      return (silver * 0.925) * weight;            // PLACEHOLDER
    }
  },

  round: function (price) { return Math.round(price); }
};

(function () {
  "use strict";

  if (!MAHSERI_PRICING.enabled) return;

  var CACHE_KEY = "mahseri_metal_prices_v1";

  function perGramJod(usdPerOunce) {
    return (usdPerOunce / MAHSERI_PRICING.gramsPerTroyOunce) * MAHSERI_PRICING.usdToJod;
  }

  function applyPrices(xauUsdOz, xagUsdOz) {
    var gold24 = perGramJod(xauUsdOz);
    var silver = perGramJod(xagUsdOz);
    var changed = false;

    MAHSERI_PRODUCTS.forEach(function (p) {
      var formula = MAHSERI_PRICING.formulas[p.material];
      var weight = parseFloat(p.weight);
      if (!formula || !(weight > 0)) return;
      var price = MAHSERI_PRICING.round(formula(gold24, silver, weight));
      if (price > 0 && price !== p.price) {
        p.price = price;
        changed = true;
      }
    });

    if (changed) {
      document.dispatchEvent(new CustomEvent("mahseri:prices-updated"));
    }
  }

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
    Promise.all([
      fetch("https://api.gold-api.com/price/XAU").then(function (r) { return r.json(); }),
      fetch("https://api.gold-api.com/price/XAG").then(function (r) { return r.json(); })
    ]).then(function (res) {
      var xau = res[0] && res[0].price;
      var xag = res[1] && res[1].price;
      if (!(xau > 0) || !(xag > 0)) return;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ xau: xau, xag: xag, ts: Date.now() }));
      applyPrices(xau, xag);
    }).catch(function () { /* offline — keep static prices */ });
  }

  var cached = readCache();
  if (cached) {
    applyPrices(cached.xau, cached.xag);
  } else {
    fetchLive();
  }
})();
