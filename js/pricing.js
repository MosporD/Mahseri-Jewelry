/* ============================================================
   Mahseri Jewellery — live metal pricing
   Fetches gold (XAU) and silver (XAG) from several open feeds,
   compares them, and uses the highest USD/troy-oz for each metal
   (conservative for the atelier). Used by admin and storefront.
   ============================================================ */

var MAHSERI_PRICING = {
  /* Set to true to auto-update storefront prices from live metal. */
  enabled: true,

  usdToJod: 0.71,               // JOD is pegged to the USD
  gramsPerTroyOunce: 31.1034768,
  cacheMinutes: 20,             // lock spot for 20 minutes — stable but current prices
  CACHE_KEY: "mahseri_metal_prices_v2",
  fetchTimeoutMs: 10000,

  /* Mahseri markup on raw metal value (gold) or per-gram add-on (silver). */
  premiumGold: 1.085,
  premiumSilver: 7,

  /* USD added per troy oz to international gold spot before pricing (atelier rule). */
  goldSpotAddUsd: 30,

  /* Sanity bounds for USD/troy oz (reject bad API payloads). */
  bounds: {
    xau: { min: 800, max: 15000 },
    xag: { min: 5, max: 500 }
  },

  formulas: {
    "21K Gold": function (gold24, silver, weight) {
      return (gold24 * 0.885) * MAHSERI_PRICING.premiumGold * weight;
    },
    "18K Gold": function (gold24, silver, weight) {
      return (gold24 * 0.760) * MAHSERI_PRICING.premiumGold * weight;
    },
    "925 Silver": function (gold24, silver, weight) {
      return ((silver * 0.925) + MAHSERI_PRICING.premiumSilver) * weight;
    }
  },

  round: function (price) { return Math.round(price); },

  perGramJod: function (usdPerOunce) {
    return (usdPerOunce / this.gramsPerTroyOunce) * this.usdToJod;
  },

  adjustGoldUsdOz: function (rawUsdOz) {
    return Number(rawUsdOz) + (Number(this.goldSpotAddUsd) || 0);
  },

  spotFromUsd: function (xauUsdOz, xagUsdOz, meta) {
    var rawXau = Number(xauUsdOz);
    var adjXau = this.adjustGoldUsdOz(rawXau);
    var spot = {
      gold24: this.perGramJod(adjXau),
      silver: this.perGramJod(xagUsdOz),
      xauUsd: adjXau,
      xauUsdRaw: rawXau,
      xagUsd: xagUsdOz,
      goldSpotAddUsd: Number(this.goldSpotAddUsd) || 0,
      ts: Date.now()
    };
    if (meta) {
      spot.xauSource = meta.xauSource;
      spot.xagSource = meta.xagSource;
      spot.sources = meta.sources;
      spot.comparison = meta.comparison;
    }
    return spot;
  },

  computePrice: function (material, weightGrams, makingFee, spot) {
    var formula = this.formulas[material];
    if (!formula || !(weightGrams > 0) || !spot) return 0;
    var metal = formula(spot.gold24, spot.silver, weightGrams);
    return Math.max(1, this.round(metal + (Number(makingFee) || 0)));
  },

  effectiveRate: function (material, spot) {
    var formula = this.formulas[material];
    if (!formula || !spot) return 0;
    return this.round(formula(spot.gold24, spot.silver, 1));
  },

  applyStorefrontPrices: function (spot) {
    if (typeof MAHSERI_PRODUCTS === "undefined" || !spot) return false;
    var changed = false;
    MAHSERI_PRODUCTS.forEach(function (p) {
      var weight = parseFloat(p.weight);
      var makingFee = p.makingFee != null ? p.makingFee : p.making_fee;
      var price = MAHSERI_PRICING.computePrice(
        p.material, weight, makingFee || 0, spot
      );
      if (price > 0 && price !== p.price) {
        p.price = price;
        changed = true;
      }
    });
    if (changed) {
      document.dispatchEvent(new CustomEvent("mahseri:prices-updated"));
    }
    return changed;
  },

  validUsdOz: function (metal, value) {
    var n = Number(value);
    if (!(n > 0)) return 0;
    var b = this.bounds[metal];
    if (!b) return n;
    if (n < b.min || n > b.max) return 0;
    return n;
  },

  readCache: function () {
    try {
      var raw = localStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || !(c.xau > 0) || !(c.xag > 0)) return null;
      if (Date.now() - c.ts >= this.cacheMinutes * 60000) return null;
      var spot = this.spotFromUsd(c.xau, c.xag, c);
      spot.ts = c.ts;
      return spot;
    } catch (e) { return null; }
  },

  readStaleCache: function () {
    try {
      var raw = localStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || !(c.xau > 0) || !(c.xag > 0)) return null;
      var spot = this.spotFromUsd(c.xau, c.xag, c);
      spot.ts = c.ts;
      spot.stale = true;
      return spot;
    } catch (e) { return null; }
  },

  fetchJson: function (url, timeoutMs) {
    var ms = timeoutMs || this.fetchTimeoutMs;
    return Promise.race([
      fetch(url).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }),
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error("timeout")); }, ms);
      })
    ]);
  },

  writeCache: function (xauUsdOz, xagUsdOz, meta) {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify({
      xau: xauUsdOz,
      xag: xagUsdOz,
      ts: Date.now(),
      xauSource: meta && meta.xauSource,
      xagSource: meta && meta.xagSource,
      sources: meta && meta.sources,
      comparison: meta && meta.comparison
    }));
  },

  /* Open feeds — each returns { name, xau, xag } in USD per troy oz. */
  spotSources: [
    {
      name: "gold-api.com",
      fetch: function (api) {
        return Promise.all([
          api.fetchJson("https://api.gold-api.com/price/XAU"),
          api.fetchJson("https://api.gold-api.com/price/XAG")
        ]).then(function (res) {
          return {
            name: "gold-api.com",
            xau: api.validUsdOz("xau", res[0] && res[0].price),
            xag: api.validUsdOz("xag", res[1] && res[1].price)
          };
        });
      }
    },
    {
      name: "Coinbase",
      fetch: function (api) {
        return Promise.all([
          api.fetchJson("https://api.coinbase.com/v2/prices/XAU-USD/spot"),
          api.fetchJson("https://api.coinbase.com/v2/prices/XAG-USD/spot")
        ]).then(function (res) {
          return {
            name: "Coinbase",
            xau: api.validUsdOz("xau", res[0] && res[0].data && res[0].data.amount),
            xag: api.validUsdOz("xag", res[1] && res[1].data && res[1].data.amount)
          };
        });
      }
    },
    {
      name: "Minted Metal (LBMA)",
      fetch: function (api) {
        return api.fetchJson("https://mintedmetal.com/api/prices.json").then(function (data) {
          return {
            name: "Minted Metal (LBMA)",
            xau: api.validUsdOz("xau", data.metals && data.metals.gold && data.metals.gold.price),
            xag: api.validUsdOz("xag", data.metals && data.metals.silver && data.metals.silver.price)
          };
        });
      }
    }
  ],

  pickHighestQuotes: function (quotes) {
    var xau = 0;
    var xag = 0;
    var xauSource = "";
    var xagSource = "";
    var comparison = [];
    var sources = [];

    quotes.forEach(function (q) {
      if (!q || !q.name) return;
      if (sources.indexOf(q.name) === -1) sources.push(q.name);
      if (q.xau > 0) {
        comparison.push({ metal: "gold", source: q.name, usdOz: q.xau });
        if (q.xau > xau) {
          xau = q.xau;
          xauSource = q.name;
        }
      }
      if (q.xag > 0) {
        comparison.push({ metal: "silver", source: q.name, usdOz: q.xag });
        if (q.xag > xag) {
          xag = q.xag;
          xagSource = q.name;
        }
      }
    });

    return {
      xau: xau,
      xag: xag,
      xauSource: xauSource,
      xagSource: xagSource,
      sources: sources,
      comparison: comparison
    };
  },

  fetchAllQuotes: function () {
    var self = this;
    return Promise.allSettled(
      self.spotSources.map(function (src) {
        return src.fetch(self);
      })
    ).then(function (results) {
      return results
        .filter(function (r) { return r.status === "fulfilled" && r.value; })
        .map(function (r) { return r.value; })
        .filter(function (q) { return (q.xau > 0) || (q.xag > 0); });
    });
  },

  fetchSpotPrices: function (force) {
    var self = this;
    if (!force) {
      var cached = self.readCache();
      if (cached) return Promise.resolve(cached);
    }

    return self.fetchAllQuotes().then(function (quotes) {
      var picked = self.pickHighestQuotes(quotes);
      if (!(picked.xau > 0) || !(picked.xag > 0)) {
        throw new Error("No valid spot quotes (" + quotes.length + " feeds responded)");
      }
      self.writeCache(picked.xau, picked.xag, picked);
      return self.spotFromUsd(picked.xau, picked.xag, picked);
    }).catch(function (err) {
      var stale = self.readStaleCache();
      if (stale) return stale;
      throw err;
    });
  },

  formatSpotSummary: function (spot) {
    if (!spot) return "";
    var goldNote = spot.goldSpotAddUsd > 0
      ? " (spot $" + Number(spot.xauUsdRaw || spot.xauUsd).toFixed(0) + " + $" + spot.goldSpotAddUsd + "/oz)"
      : "";
    var parts = [
      "24K gold " + Number(spot.gold24).toLocaleString("en-JO", { maximumFractionDigits: 2 }) + " JOD/g" + goldNote,
      "silver " + Number(spot.silver).toLocaleString("en-JO", { maximumFractionDigits: 2 }) + " JOD/g"
    ];
    if (spot.xauSource || spot.xagSource) {
      parts.push(
        "(highest feed — gold: " + (spot.xauSource || "—") +
        ", silver: " + (spot.xagSource || "—") + ")"
      );
    }
    return parts.join(", ");
  }
};

/* ---------- Storefront auto-reprice (when enabled) ---------- */

(function () {
  "use strict";

  if (!MAHSERI_PRICING.enabled) return;

  MAHSERI_PRICING.fetchSpotPrices(false)
    .then(function (spot) { MAHSERI_PRICING.applyStorefrontPrices(spot); })
    .catch(function () { /* offline — keep static prices */ });
})();
