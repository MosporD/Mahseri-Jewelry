#!/usr/bin/env node
/* ============================================================
   Mahseri Jewellery — Telegram metal price alerts
   Fetches gold/silver from multiple feeds, picks the highest,
   and sends a Telegram message.

   One-shot:  node scripts/telegram-metal-alerts.js
   Loop:      node scripts/telegram-metal-alerts.js --loop

   Config:    scripts/metal-alert-config.json
              (copy from metal-alert-config.example.json)
   ============================================================ */

"use strict";

var fs = require("fs");
var path = require("path");

var CONFIG_PATH = path.join(__dirname, "metal-alert-config.json");
var FETCH_TIMEOUT_MS = 10000;
var BOUNDS = { xau: { min: 800, max: 15000 }, xag: { min: 5, max: 500 } };

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(
      "Missing " + CONFIG_PATH + "\n" +
      "Copy scripts/metal-alert-config.example.json to scripts/metal-alert-config.json\n" +
      "and paste your Telegram bot token and chat id."
    );
    process.exit(1);
  }
  var cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  if (!cfg.botToken || cfg.botToken.indexOf("PASTE_") === 0) {
    console.error("Set botToken in scripts/metal-alert-config.json");
    process.exit(1);
  }
  if (!cfg.chatId || String(cfg.chatId).indexOf("PASTE_") === 0) {
    if (!cfg.chatIds || !cfg.chatIds.length) {
      console.error("Set chatId or chatIds in scripts/metal-alert-config.json");
      process.exit(1);
    }
  }
  cfg.chatIds = resolveChatIds(cfg);
  cfg.ownerChatIds = resolveIdList(cfg.ownerChatIds);
  cfg.clientChatIds = resolveIdList(cfg.clientChatIds);
  if (!cfg.ownerChatIds.length && cfg.chatId && String(cfg.chatId).indexOf("PASTE_") !== 0) {
    cfg.ownerChatIds = [String(cfg.chatId).trim()];
  }
  if (!cfg.clientChatIds.length && cfg.chatIds.length) {
    cfg.chatIds.forEach(function (id) {
      if (String(id).indexOf("-") === 0 && cfg.clientChatIds.indexOf(id) === -1) {
        cfg.clientChatIds.push(id);
      }
    });
  }
  if (!cfg.ownerChatIds.length && !cfg.clientChatIds.length) {
    console.error("Set ownerChatIds and/or clientChatIds in metal-alert-config.json");
    process.exit(1);
  }
  cfg.intervalMinutes = Number(cfg.intervalMinutes) || 10;
  cfg.usdToJod = Number(cfg.usdToJod) || 0.71;
  cfg.gramsPerTroyOunce = Number(cfg.gramsPerTroyOunce) || 31.1034768;
  cfg.premiumGold = Number(cfg.premiumGold) || 1.2;
  cfg.premiumSilver = Number(cfg.premiumSilver) || 7;
  cfg.goldSpotAddUsd = Number(cfg.goldSpotAddUsd) || 0;
  return cfg;
}

function resolveIdList(list) {
  var out = [];
  if (!list || !list.length) return out;
  list.forEach(function (id) {
    var s = String(id).trim();
    if (s && out.indexOf(s) === -1) out.push(s);
  });
  return out;
}

function resolveChatIds(cfg) {
  var list = [];
  if (cfg.chatIds && cfg.chatIds.length) {
    cfg.chatIds.forEach(function (id) {
      var s = String(id).trim();
      if (s && list.indexOf(s) === -1) list.push(s);
    });
  }
  if (cfg.chatId && String(cfg.chatId).indexOf("PASTE_") !== 0) {
    var single = String(cfg.chatId).trim();
    if (single && list.indexOf(single) === -1) list.push(single);
  }
  return list;
}

function validUsdOz(metal, value) {
  var n = Number(value);
  if (!(n > 0)) return 0;
  var b = BOUNDS[metal];
  if (!b) return n;
  if (n < b.min || n > b.max) return 0;
  return n;
}

function fetchJson(url) {
  return Promise.race([
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " " + url);
      return r.json();
    }),
    new Promise(function (_, reject) {
      setTimeout(function () { reject(new Error("timeout: " + url)); }, FETCH_TIMEOUT_MS);
    })
  ]);
}

var SPOT_SOURCES = [
  {
    name: "gold-api.com",
    fetch: function () {
      return Promise.all([
        fetchJson("https://api.gold-api.com/price/XAU"),
        fetchJson("https://api.gold-api.com/price/XAG")
      ]).then(function (res) {
        return {
          name: "gold-api.com",
          xau: validUsdOz("xau", res[0] && res[0].price),
          xag: validUsdOz("xag", res[1] && res[1].price)
        };
      });
    }
  },
  {
    name: "Coinbase",
    fetch: function () {
      return Promise.all([
        fetchJson("https://api.coinbase.com/v2/prices/XAU-USD/spot"),
        fetchJson("https://api.coinbase.com/v2/prices/XAG-USD/spot")
      ]).then(function (res) {
        return {
          name: "Coinbase",
          xau: validUsdOz("xau", res[0] && res[0].data && res[0].data.amount),
          xag: validUsdOz("xag", res[1] && res[1].data && res[1].data.amount)
        };
      });
    }
  },
  {
    name: "Minted Metal (LBMA)",
    fetch: function () {
      return fetchJson("https://mintedmetal.com/api/prices.json").then(function (data) {
        return {
          name: "Minted Metal (LBMA)",
          xau: validUsdOz("xau", data.metals && data.metals.gold && data.metals.gold.price),
          xag: validUsdOz("xag", data.metals && data.metals.silver && data.metals.silver.price)
        };
      });
    }
  }
];

function pickHighestQuotes(quotes) {
  var xau = 0;
  var xag = 0;
  var xauSource = "";
  var xagSource = "";
  var lines = [];

  quotes.forEach(function (q) {
    if (!q || !q.name) return;
    if (q.xau > 0) {
      lines.push("Gold  $" + q.xau.toFixed(2) + "/oz  — " + q.name);
      if (q.xau > xau) { xau = q.xau; xauSource = q.name; }
    }
    if (q.xag > 0) {
      lines.push("Silver $" + q.xag.toFixed(2) + "/oz  — " + q.name);
      if (q.xag > xag) { xag = q.xag; xagSource = q.name; }
    }
  });

  return { xau: xau, xag: xag, xauSource: xauSource, xagSource: xagSource, lines: lines };
}

function perGramJod(cfg, usdPerOz) {
  return (usdPerOz / cfg.gramsPerTroyOunce) * cfg.usdToJod;
}

function fmt(n) {
  return Number(n).toLocaleString("en-JO", { maximumFractionDigits: 2 });
}

function computeRates(cfg, picked) {
  var adjXau = picked.xau + (Number(cfg.goldSpotAddUsd) || 0);
  var gold24 = perGramJod(cfg, adjXau);
  var silverSpot = perGramJod(cfg, picked.xag);
  return {
    adjXau: adjXau,
    rawXau: picked.xau,
    xagUsd: picked.xag,
    gold24: gold24,
    gold21: gold24 * (21 / 24) * cfg.premiumGold,
    gold18: gold24 * (18 / 24) * cfg.premiumGold,
    silver925Metal: silverSpot * 0.925,
    silver925Sell: silverSpot * 0.925 + cfg.premiumSilver
  };
}

function formatAmmanTime() {
  return new Date().toLocaleString("en-GB", {
    timeZone: "Asia/Amman",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function buildClientMessage(cfg, rates) {
  return [
    "MAHSERI JEWELLERY",
    "Gold & silver rates",
    "",
    "JOD / gram",
    "21K gold    " + fmt(rates.gold21), " JOD/g",
    "18K gold    " + fmt(rates.gold18)," JOD/g",
    "925 silver  " + fmt(rates.silver925Metal)," JOD/g",
    "",
    "USD / troy Premium ounce",
    "Gold        " + fmt(rates.adjXau), " USD/oz",
    "Silver      " + fmt(rates.xagUsd), " USD/oz",
    "",
    formatAmmanTime() + " · Amman"
  ].join("\n");
}

function buildOwnerMessage(cfg, rates, picked) {
  var goldUsdLine = cfg.goldSpotAddUsd > 0
    ? "Gold:   $" + rates.adjXau.toFixed(2) + "/oz  (spot $" + rates.rawXau.toFixed(2) + " + $" + cfg.goldSpotAddUsd + ")  ← " + picked.xauSource
    : "Gold:   $" + rates.adjXau.toFixed(2) + "/oz  ← " + picked.xauSource;

  return [
    "Mahseri — metal spot (highest of feeds)",
    "Updated: " + formatAmmanTime() + " (Amman)",
    "",
    "USD / troy oz (for pricing)",
    goldUsdLine,
    "Silver: $" + picked.xag.toFixed(2) + "/oz  ← " + picked.xagSource,
    "",
    "JOD / gram (Mahseri formulas)",
    "24K base:  " + fmt(rates.gold24) + " JOD/g",
    "21K sell:  " + fmt(rates.gold21) + " JOD/g",
    "18K sell:  " + fmt(rates.gold18) + " JOD/g",
    "925 metal: " + fmt(rates.silver925Metal) + " JOD/g",
    "925 sell:  " + fmt(rates.silver925Sell) + " JOD/g  (+ " + cfg.premiumSilver + " JOD/g product markup)",
    "",
    "All feeds:",
    picked.lines.join("\n")
  ].join("\n");
}

function buildMessage(cfg, picked) {
  var rates = computeRates(cfg, picked);
  return buildOwnerMessage(cfg, rates, picked);
}

function fetchSpot() {
  return Promise.allSettled(SPOT_SOURCES.map(function (src) { return src.fetch(); }))
    .then(function (results) {
      var quotes = results
        .filter(function (r) { return r.status === "fulfilled" && r.value; })
        .map(function (r) { return r.value; })
        .filter(function (q) { return q.xau > 0 || q.xag > 0; });
      var picked = pickHighestQuotes(quotes);
      if (!(picked.xau > 0) || !(picked.xag > 0)) {
        throw new Error("No valid quotes (" + quotes.length + " feeds responded)");
      }
      return picked;
    });
}

function sendTelegram(cfg, chatId, text) {
  return fetch("https://api.telegram.org/bot" + cfg.botToken + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      disable_web_page_preview: true
    })
  }).then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.ok) throw new Error(data.description || "Telegram API error");
      return data;
    });
}

function runOnce(cfg) {
  return fetchSpot()
    .then(function (picked) {
      var rates = computeRates(cfg, picked);
      var clientMsg = buildClientMessage(cfg, rates);
      var ownerMsg = buildOwnerMessage(cfg, rates, picked);
      var tasks = [];

      cfg.clientChatIds.forEach(function (id) {
        tasks.push(sendTelegram(cfg, id, clientMsg));
      });
      cfg.ownerChatIds.forEach(function (id) {
        if (cfg.clientChatIds.indexOf(id) === -1) {
          tasks.push(sendTelegram(cfg, id, ownerMsg));
        }
      });

      return Promise.all(tasks).then(function () {
        return {
          clients: cfg.clientChatIds.length,
          owners: cfg.ownerChatIds.filter(function (id) {
            return cfg.clientChatIds.indexOf(id) === -1;
          }).length
        };
      });
    })
    .then(function (counts) {
      console.log(
        "Metal alert sent — " + counts.clients + " client, " +
        counts.owners + " owner at " + new Date().toISOString()
      );
    });
}

function main() {
  var cfg = loadConfig();
  var loop = process.argv.indexOf("--loop") > -1;
  var ms = cfg.intervalMinutes * 60000;

  function tick() {
    runOnce(cfg).catch(function (err) {
      console.error("Alert failed:", err.message || err);
      var failMsg = "Mahseri metal alert failed: " + (err.message || err);
      var tasks = cfg.ownerChatIds.map(function (id) {
        return sendTelegram(cfg, id, failMsg).catch(function () {});
      });
      return Promise.all(tasks);
    });
  }

  if (loop) {
    console.log("Metal alerts every " + cfg.intervalMinutes + " min. Press Ctrl+C to stop.");
    tick();
    setInterval(tick, ms);
  } else {
    runOnce(cfg).catch(function (err) {
      console.error(err.message || err);
      process.exit(1);
    });
  }
}

main();
