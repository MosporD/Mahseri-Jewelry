#!/usr/bin/env node
/* ============================================================
   Mahseri Jewellery — post catalogue to Telegram channel

   Scheduled (cron, default):
     node scripts/telegram-post-products.js
     node scripts/telegram-post-products.js --scheduled

   Manual:
     node scripts/telegram-post-products.js --all
     node scripts/telegram-post-products.js --id amman-rope-chain
     node scripts/telegram-post-products.js --dry-run

   Loop (every hour, alternative to Task Scheduler):
     node scripts/telegram-post-products.js --loop

   Uses scripts/metal-alert-config.json, js/data.js, and optionally
   scripts/telegram-scheduled-products.json (from admin download).
   ============================================================ */

"use strict";

var fs = require("fs");
var path = require("path");

var CONFIG_PATH = path.join(__dirname, "metal-alert-config.json");
var SCHEDULE_PATH = path.join(__dirname, "telegram-scheduled-products.json");
var DATA_PATH = path.join(__dirname, "..", "js", "data.js");
var DELAY_MS = 3200;

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error("Missing " + CONFIG_PATH);
    process.exit(1);
  }
  var cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  if (!cfg.botToken) {
    console.error("Set botToken in metal-alert-config.json");
    process.exit(1);
  }
  var channelId = cfg.channelId;
  if (!channelId && cfg.clientChatIds && cfg.clientChatIds.length) {
    channelId = cfg.clientChatIds[0];
  }
  if (!channelId) {
    console.error("Set channelId or clientChatIds in metal-alert-config.json");
    process.exit(1);
  }
  cfg.channelId = String(channelId);
  cfg.siteUrl = cfg.siteUrl || "https://your-site.example.com";
  cfg.productPostIntervalMinutes = Number(cfg.productPostIntervalMinutes) || 60;
  cfg.productPostsEnabled = cfg.productPostsEnabled !== false;
  return cfg;
}

function loadProducts() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error("Missing " + DATA_PATH);
    process.exit(1);
  }
  var src = fs.readFileSync(DATA_PATH, "utf8");
  var fn = new Function(src + "\n;return typeof MAHSERI_PRODUCTS !== \"undefined\" ? MAHSERI_PRODUCTS : [];");
  return fn();
}

function loadScheduleIds() {
  if (!fs.existsSync(SCHEDULE_PATH)) return null;
  try {
    var data = JSON.parse(fs.readFileSync(SCHEDULE_PATH, "utf8"));
    if (data && Array.isArray(data.productIds)) return data.productIds;
  } catch (e) {
    console.warn("Could not read " + SCHEDULE_PATH + ":", e.message);
  }
  return null;
}

function productInStock(p) {
  return p && p.inStock !== false;
}

function productScheduled(p, scheduleIds) {
  if (scheduleIds && scheduleIds.length) {
    return scheduleIds.indexOf(p.id) !== -1;
  }
  return !!(p && p.telegramSchedule);
}

function headline(p) {
  if (p.telegramHeadline && p.telegramHeadline.trim()) return p.telegramHeadline.trim().toUpperCase();
  if (p.badge) return String(p.badge).toUpperCase();
  return "MAHSERI JEWELLERY";
}

function blurb(p) {
  var text = (p.telegramBlurb || p.description || "").trim();
  if (text.length > 180) return text.slice(0, 177) + "...";
  return text;
}

function shopUrl(p, siteUrl) {
  return siteUrl.replace(/\/$/, "") + "/product.html?id=" + encodeURIComponent(p.id);
}

function resolveImage(p, siteUrl) {
  var img = (p && p.image) || "";
  if (!img || img.indexOf("data:") === 0) return "";
  if (/^https?:\/\//i.test(img)) return img;
  return siteUrl.replace(/\/$/, "") + "/" + img.replace(/^\//, "");
}

function formatPost(p, siteUrl) {
  return [
    headline(p),
    "",
    p.name,
    p.category + " · " + p.material + (p.weight ? " · " + p.weight : ""),
    "",
    blurb(p),
    "",
    Number(p.price).toLocaleString("en-JO") + " JOD",
    productInStock(p) ? "In stock" : "Out of stock",
    "",
    "Shop: " + shopUrl(p, siteUrl)
  ].join("\n");
}

function telegramApi(cfg, method, body) {
  return fetch("https://api.telegram.org/bot" + cfg.botToken + "/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.ok) throw new Error(data.description || "Telegram API error");
      return data;
    });
}

function postProduct(cfg, p) {
  var caption = formatPost(p, cfg.siteUrl);
  var image = resolveImage(p, cfg.siteUrl);
  if (image) {
    return telegramApi(cfg, "sendPhoto", {
      chat_id: cfg.channelId,
      photo: image,
      caption: caption
    });
  }
  return telegramApi(cfg, "sendMessage", {
    chat_id: cfg.channelId,
    text: caption,
    disable_web_page_preview: false
  });
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function selectProducts(allProducts, opts) {
  if (opts.singleId) {
    return allProducts.filter(function (p) { return p.id === opts.singleId; });
  }
  if (opts.postAll) return allProducts.slice();
  var scheduleIds = loadScheduleIds();
  var scheduled = allProducts.filter(function (p) {
    return productScheduled(p, scheduleIds);
  });
  return scheduled;
}

function runOnce(cfg, opts) {
  var products = selectProducts(loadProducts(), opts);
  if (opts.singleId && !products.length) {
    return Promise.reject(new Error("No product with id: " + opts.singleId));
  }
  if (!opts.postAll && !opts.singleId && !products.length) {
    console.log("No products flagged for hourly posting (telegramSchedule or telegram-scheduled-products.json).");
    return Promise.resolve();
  }
  if (opts.dryRun) {
    products.forEach(function (p) {
      console.log("--- " + p.id + " ---\n" + formatPost(p, cfg.siteUrl) + "\n");
    });
    return Promise.resolve();
  }

  console.log("Posting " + products.length + " piece(s) to channel " + cfg.channelId + "…");

  var chain = Promise.resolve();
  products.forEach(function (p, i) {
    chain = chain.then(function () {
      if (i > 0) return sleep(DELAY_MS);
    }).then(function () {
      console.log("[" + (i + 1) + "/" + products.length + "] " + p.name);
      return postProduct(cfg, p);
    });
  });

  return chain.then(function () {
    console.log("Done at " + new Date().toISOString() + ".");
  });
}

function main() {
  var args = process.argv.slice(2);
  var opts = {
    dryRun: args.indexOf("--dry-run") !== -1,
    postAll: args.indexOf("--all") !== -1,
    singleId: ""
  };
  var idIdx = args.indexOf("--id");
  if (idIdx !== -1) opts.singleId = args[idIdx + 1] || "";

  var cfg = loadConfig();
  if (!cfg.productPostsEnabled && args.indexOf("--loop") === -1 && !opts.dryRun) {
    console.log("Product posts disabled in metal-alert-config.json (productPostsEnabled: false).");
    return;
  }

  var loop = args.indexOf("--loop") > -1;
  var ms = cfg.productPostIntervalMinutes * 60000;

  function tick() {
    return runOnce(cfg, opts).catch(function (err) {
      console.error("Product post failed:", err.message || err);
    });
  }

  if (loop) {
    console.log(
      "Scheduled product posts every " + cfg.productPostIntervalMinutes +
      " min. Press Ctrl+C to stop."
    );
    tick();
    setInterval(tick, ms);
    return;
  }

  tick().catch(function (err) {
    console.error(err.message || err);
    process.exit(1);
  });
}

main();
