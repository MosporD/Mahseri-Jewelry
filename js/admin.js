/* ============================================================
   Mahseri Jewellery — catalogue manager (admin.html)
   Edits are saved to localStorage and override js/data.js in
   this browser. "Download data.js" exports the full catalogue
   so the file can be replaced on the host for all visitors.
   ============================================================ */

(function () {
  "use strict";

  var STORAGE_KEY = "mahseri_products_admin_v1";
  var RATES_KEY = "mahseri_rates_admin_v1";
  var SESSION_KEY = "mahseri_admin_session";
  /* NOTE: this passcode only deters casual visitors. Anyone who reads the
     page source can see it — real protection requires a server. Change it
     to your own value before publishing. */
  var PASSCODE = "mahseri2026";

  var products = MAHSERI_PRODUCTS.slice();
  /* Per-gram price by metal, copied from data.js (which has already merged any
     saved overrides from localStorage). Edited live in the rates panel. */
  var rates = {};
  Object.keys(MAHSERI_RATES).forEach(function (k) { rates[k] = MAHSERI_RATES[k]; });

  var editingId = null;
  var currentImage = "";   // the image URL / data URL for the piece being edited
  var autoPrice = true;    // when true, price = pricing.js formula + making fee
  var liveSpot = null;     // { gold24, silver, xauUsd, xagUsd, ts } from pricing.js
  var bulkDrafts = [];     // staged rows for bulk import
  var bulkKeySeq = 0;

  function setAutoPrice(on) {
    autoPrice = !!on;
    var priceInput = $("#f-price");
    if (priceInput) priceInput.readOnly = autoPrice;
    recalcPrice();
  }

  function $(sel) { return document.querySelector(sel); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Gate ---------- */

  function initGate() {
    if (sessionStorage.getItem(SESSION_KEY) === "ok") {
      $("#admin-app").style.display = "";
      render();
      return;
    }
    $("#admin-gate").style.display = "";
    function tryEnter() {
      if ($("#gate-pass").value === PASSCODE) {
        sessionStorage.setItem(SESSION_KEY, "ok");
        $("#admin-gate").style.display = "none";
        $("#admin-app").style.display = "";
        render();
      } else {
        $("#gate-error").textContent = "Incorrect passcode.";
      }
    }
    $("#gate-enter").addEventListener("click", tryEnter);
    $("#gate-pass").addEventListener("keydown", function (e) {
      if (e.key === "Enter") tryEnter();
    });
  }

  /* ---------- Persistence ---------- */

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function persistRates() {
    localStorage.setItem(RATES_KEY, JSON.stringify(rates));
  }

  /* ---------- Pricing (pricing.js formulas + live spot) ---------- */

  function parseWeight(val) {
    var n = parseFloat(String(val == null ? "" : val).replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  }

  function computePrice(grams, material, makingFee) {
    if (liveSpot && typeof MAHSERI_PRICING !== "undefined") {
      var live = MAHSERI_PRICING.computePrice(material, grams, makingFee, liveSpot);
      if (live > 0) return live;
    }
    var rate = Number(rates[material]) || 0;
    return Math.max(1, Math.round(grams * rate + (Number(makingFee) || 0)));
  }

  function formatSpot(n) {
    return Number(n).toLocaleString("en-JO", { maximumFractionDigits: 2 });
  }

  function setSpotStatus(mode, detail) {
    var el = $("#spot-status");
    if (!el) return;
    el.className = "spot-status " + mode;
    el.textContent = detail;
  }

  function applyLiveSpot(spot, opts) {
    opts = opts || {};
    liveSpot = spot;
    if (!spot) return;
    var ageMin = Math.round((Date.now() - spot.ts) / 60000);
    var staleNote = spot.stale || opts.stale ? " (cached" + (ageMin > 0 ? ", " + ageMin + " min old" : "") + ")" : "";
    var summary = typeof MAHSERI_PRICING.formatSpotSummary === "function"
      ? MAHSERI_PRICING.formatSpotSummary(spot)
      : (
        "24K gold " + formatSpot(spot.gold24) + " JOD/g, silver " +
        formatSpot(spot.silver) + " JOD/g"
      );
    setSpotStatus(
      spot.stale || opts.stale ? "fallback" : "live",
      (spot.stale || opts.stale ? "Using cached spot (highest of feeds)" : "Spot locked for 20 min (highest of feeds)") +
      (opts.refreshed ? " — refreshed" : "") +
      " — " + summary + staleNote
    );
    renderRates();
    if (!editingId && autoPrice) recalcPrice();
  }

  function loadSpotPrices(force) {
    if (typeof MAHSERI_PRICING === "undefined") {
      setSpotStatus("fallback", "pricing.js not loaded — using fallback rates from data.js.");
      renderRates();
      return Promise.resolve(null);
    }

    /* Admin stays usable immediately — show fallback rates, then upgrade when live loads. */
    renderRates();

    if (!force) {
      var stale = MAHSERI_PRICING.readStaleCache();
      if (stale) applyLiveSpot(stale, { stale: true });
      else setSpotStatus("", "Loading live metal prices… (fallback rates below)");
    } else {
      setSpotStatus("", "Refreshing live metal prices…");
    }

    return MAHSERI_PRICING.fetchSpotPrices(!!force).then(function (spot) {
      if (!spot) return null;
      applyLiveSpot(spot, { refreshed: !!force, stale: !!spot.stale });
      return spot;
    }).catch(function () {
      liveSpot = null;
      setSpotStatus(
        "fallback",
        "Live prices unavailable — using fallback rates from data.js. Check your connection and try Refresh."
      );
      renderRates();
      recalcPrice();
      return null;
    });
  }

  /* Recalculate the price field from weight, metal and making fee,
     unless the user has switched the form to manual pricing. */
  function recalcPrice() {
    var hint = $("#price-hint");
    if (!hint) return;
    if (!autoPrice) {
      hint.innerHTML = 'Manual price. <a id="price-toggle">Auto-price from weight</a>';
      return;
    }
    var grams = parseWeight($("#f-weight").value);
    var material = $("#f-material").value;
    var making = Number($("#f-making").value) || 0;
    if (!grams) {
      $("#f-price").value = "";
      hint.innerHTML = 'Enter a weight to price this piece automatically, ' +
        'or <a id="price-toggle">enter the price manually</a>.';
      return;
    }
    $("#f-price").value = computePrice(grams, material, making);
    if (liveSpot && typeof MAHSERI_PRICING !== "undefined" && MAHSERI_PRICING.formulas[material]) {
      var metalOnly = MAHSERI_PRICING.round(
        MAHSERI_PRICING.formulas[material](liveSpot.gold24, liveSpot.silver, grams)
      );
      var effRate = MAHSERI_PRICING.effectiveRate(material, liveSpot);
      hint.innerHTML =
        "pricing.js: " + grams + " g × ~" + effRate + " JOD/g = " + metalOnly + " JOD metal" +
        (making ? " + " + making + " making" : "") +
        '. <a id="price-toggle">Edit manually</a>';
    } else {
      var rate = Number(rates[material]) || 0;
      if (!rate) {
        hint.innerHTML = 'No fallback rate for ' + esc(material) +
          ' — refresh live prices or set a fallback rate below, or ' +
          '<a id="price-toggle">enter the price manually</a>.';
      } else {
        hint.innerHTML = "Fallback: " + grams + " g × " + rate + " JOD/g" +
          (making ? " + " + making + " making" : "") +
          '. <a id="price-toggle">Edit manually</a>';
      }
    }
  }

  function on(sel, ev, fn) {
    var el = $(sel);
    if (el) el.addEventListener(ev, fn);
  }

  /* ---------- Categories ---------- */

  function inferCollection(p) {
    if (p && p.collection) return p.collection;
    if (p && p.image) {
      var img = String(p.image).toLowerCase();
      if (img.indexOf("/products/silver/") > -1) return "silver";
      if (img.indexOf("/products/gems/") > -1) return "gems";
      if (img.indexOf("/products/gold/") > -1) return "gold";
    }
    if (p && p.category === "Precious Stones") return "gems";
    if (p && typeof MAHSERI_GEM_TYPES !== "undefined" &&
        MAHSERI_GEM_TYPES.indexOf(p.category) > -1 && p.collection !== "gold" && p.collection !== "silver") {
      return "gems";
    }
    if (p && p.material === "925 Silver") return "silver";
    return "gold";
  }

  function populateCategories() {
    var sel = $("#f-category");
    var collSel = $("#f-collection");
    if (!sel) return;
    var coll = collSel ? collSel.value : "gold";
    var list = coll === "gems" && typeof MAHSERI_GEM_TYPES !== "undefined"
      ? MAHSERI_GEM_TYPES
      : (typeof MAHSERI_CATEGORIES !== "undefined" ? MAHSERI_CATEGORIES : []);
    var current = sel.value;
    sel.innerHTML = list.map(function (c) {
      return "<option>" + esc(c) + "</option>";
    }).join("");
    if (current && list.indexOf(current) > -1) sel.value = current;
    else if (list.length) sel.value = list[0];
    var label = $("#f-category-label");
    if (label) label.textContent = coll === "gems" ? "Gem type" : "Category";
  }

  function categoriesForCollection(coll) {
    if (coll === "gems" && typeof MAHSERI_GEM_TYPES !== "undefined") return MAHSERI_GEM_TYPES.slice();
    return typeof MAHSERI_CATEGORIES !== "undefined" ? MAHSERI_CATEGORIES.slice() : [];
  }

  function populateBulkDefaultCategories() {
    var sel = $("#bulk-def-category");
    var collSel = $("#bulk-def-collection");
    if (!sel) return;
    var coll = collSel ? collSel.value : "gold";
    var list = categoriesForCollection(coll);
    var current = sel.value;
    sel.innerHTML = list.map(function (c) {
      return "<option>" + esc(c) + "</option>";
    }).join("");
    if (current && list.indexOf(current) > -1) sel.value = current;
    else if (list.length) sel.value = list[0];
  }

  function categorySelectHtml(coll, selected) {
    return categoriesForCollection(coll).map(function (c) {
      return "<option" + (c === selected ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("");
  }

  function categoryFolderSlug(category) {
    var map = {
      Necklaces: "necklaces",
      Rings: "rings",
      Bracelets: "bracelets",
      Earrings: "earrings",
      Brooches: "brooches",
      "Nose Jewellery": "nose-jewellery",
      Anklets: "anklets",
      "Leg Chains": "leg-chains",
      "Navel Rings": "navel-rings",
      "Full Set": "full-set",
      "Half Set": "half-set",
      "3 Piece Set": "3-piece-set"
    };
    return map[category] || "misc";
  }

  function imageFolderForCategory(category, collection) {
    if (collection === "gems" ||
        (typeof MAHSERI_GEM_TYPES !== "undefined" && MAHSERI_GEM_TYPES.indexOf(category) > -1)) {
      return "assets/Products/gems/";
    }
    var type = collection === "silver" ? "silver" : "gold";
    return "assets/Products/" + type + "/" + categoryFolderSlug(category) + "/";
  }

  var PRODUCT_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

  function productImageSlug(name) {
    return String(name || "").trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "";
  }

  /* Image file = product name before the extension, in the category folder. */
  function candidateImagePaths(name, category, collection) {
    var folder = imageFolderForCategory(category, collection);
    var stem = String(name || "").trim();
    var slug = productImageSlug(name);
    var paths = [];
    var seen = {};
    function add(base) {
      if (!base || seen[base]) return;
      seen[base] = true;
      PRODUCT_IMAGE_EXTS.forEach(function (ext) { paths.push(base + ext); });
    }
    if (stem) add(folder + stem);
    if (slug) add(folder + slug);
    return paths;
  }

  function resolveProductImagePath(name, category, explicit, collection) {
    if (explicit && String(explicit).trim()) return String(explicit).trim();
    var paths = candidateImagePaths(name, category, collection);
    return paths.length ? paths[0] : "";
  }

  function applyAutoImageToDraft(draft) {
    if (draft.image && String(draft.image).trim()) return draft;
    draft.image = resolveProductImagePath(draft.name, draft.category, "", draft.collection);
    return draft;
  }

  function adminImageSrc(url) {
    if (!url || url.indexOf("data:") === 0 || /^https?:\/\//i.test(url)) return url;
    return url.split("/").map(function (seg) { return encodeURIComponent(seg); }).join("/");
  }

  function probeImageUrl(url) {
    var toFetch = adminImageSrc(url);
    return fetch(toFetch, { method: "HEAD" }).then(function (r) {
      return r.ok ? url : null;
    }).catch(function () { return null; });
  }

  function resolveProductImagePathAsync(name, category, explicit, collection) {
    if (explicit && String(explicit).trim()) {
      var path = String(explicit).trim();
      return probeImageUrl(path).then(function (found) { return found || path; });
    }
    var paths = candidateImagePaths(name, category, collection);
    var i = 0;
    function next() {
      if (i >= paths.length) return Promise.resolve("");
      return probeImageUrl(paths[i++]).then(function (found) {
        return found || next();
      });
    }
    return next();
  }

  function resolveBulkDraftImages(done) {
    var pending = bulkDrafts.filter(function (d) {
      return d.name.trim() && (!d.image || d.image.indexOf("data:") !== 0);
    });
    if (!pending.length) {
      if (done) done();
      return;
    }
    var left = pending.length;
    pending.forEach(function (draft) {
      var explicit = draft.image && draft.image.trim() ? draft.image.trim() : "";
      resolveProductImagePathAsync(draft.name, draft.category, explicit, draft.collection).then(function (url) {
        if (url) draft.image = url;
        else if (!explicit) draft.image = resolveProductImagePath(draft.name, draft.category, "", draft.collection);
        left--;
        if (left === 0) { renderBulkTable(); if (done) done(); }
      });
    });
  }

  function inferArt(category) {
    var map = {
      Necklaces: "necklace",
      Rings: "ring",
      Bracelets: "bangle",
      Earrings: "earrings",
      Brooches: "brooch",
      "Nose Jewellery": "nose",
      Anklets: "anklet",
      "Leg Chains": "legchain",
      "Navel Rings": "navel",
      "Full Set": "fullset",
      "Half Set": "halfset",
      "3 Piece Set": "set3"
    };
    if (typeof MAHSERI_GEM_TYPES !== "undefined" && MAHSERI_GEM_TYPES.indexOf(category) > -1) {
      return "gemstone";
    }
    return map[category] || "ring";
  }

  function getBulkDefaults() {
    return {
      collection: ($("#bulk-def-collection") && $("#bulk-def-collection").value) || "gold",
      category: ($("#bulk-def-category") && $("#bulk-def-category").value) || "Rings",
      material: ($("#bulk-def-material") && $("#bulk-def-material").value) || "21K Gold",
      gender: ($("#bulk-def-gender") && $("#bulk-def-gender").value) || "Her",
      makingFee: Math.max(0, Math.round(Number($("#bulk-def-making") && $("#bulk-def-making").value) || 0))
    };
  }

  function newBulkDraft(overrides) {
    var defs = getBulkDefaults();
    bulkKeySeq += 1;
    return Object.assign({
      _key: "bulk-" + bulkKeySeq,
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      weight: "",
      collection: defs.collection,
      category: defs.category,
      material: defs.material,
      gender: defs.gender,
      image: "",
      makingFee: defs.makingFee,
      badge: "",
      inStock: true
    }, overrides || {});
  }

  function bulkDraftPrice(draft) {
    var grams = parseWeight(draft.weight);
    if (!grams) return 0;
    return computePrice(grams, draft.material, draft.makingFee);
  }

  function renderBulkTable() {
    var tbody = $("#bulk-rows");
    var countEl = $("#bulk-count");
    if (!tbody) return;
    if (!bulkDrafts.length) {
      tbody.innerHTML = '<tr><td colspan="12" class="bulk-empty">No draft rows yet — upload photos or import a file.</td></tr>';
      if (countEl) countEl.textContent = "0 pieces ready";
      return;
    }
    tbody.innerHTML = bulkDrafts.map(function (d, idx) {
      var thumb = d.image
        ? '<img class="bulk-thumb" src="' + esc(adminImageSrc(d.image)) + '" alt="" />'
        : '<span class="bulk-thumb"></span>';
      var price = bulkDraftPrice(d);
      var imgVal = d.image && d.image.indexOf("data:") === 0 ? "" : (d.image || "");
      var imgPh = "(auto) " + imageFolderForCategory(d.category, d.collection) + (d.name.trim() || "Product Name") + ".jpg";
      return (
        "<tr data-bulk-key=\"" + esc(d._key) + "\">" +
        "<td>" + thumb + "</td>" +
        "<td><input data-field=\"name\" value=\"" + esc(d.name) + "\" placeholder=\"Piece name\" /></td>" +
        "<td><input data-field=\"name_ar\" value=\"" + esc(d.name_ar) + "\" dir=\"rtl\" /></td>" +
        "<td><textarea data-field=\"description\" rows=\"2\">" + esc(d.description) + "</textarea></td>" +
        "<td><input data-field=\"weight\" type=\"number\" min=\"0\" step=\"0.1\" value=\"" + esc(d.weight) + "\" /></td>" +
        "<td><select data-field=\"collection\">" +
        ["gold", "silver", "gems"].map(function (c) {
          return "<option value=\"" + c + "\"" + (d.collection === c ? " selected" : "") + ">" + c + "</option>";
        }).join("") + "</select></td>" +
        "<td><select data-field=\"category\">" + categorySelectHtml(d.collection, d.category) + "</select></td>" +
        "<td><select data-field=\"material\">" +
        ["21K Gold", "18K Gold", "925 Silver"].map(function (m) {
          return "<option" + (d.material === m ? " selected" : "") + ">" + esc(m) + "</option>";
        }).join("") + "</select></td>" +
        "<td><select data-field=\"gender\">" +
        ["Her", "Him", "Both"].map(function (g) {
          return "<option value=\"" + g + "\"" + (d.gender === g ? " selected" : "") + ">" + g + "</option>";
        }).join("") + "</select></td>" +
        "<td><input data-field=\"image\" value=\"" + esc(imgVal) + "\" placeholder=\"" + esc(imgPh) + "\" /></td>" +
        "<td class=\"bulk-price\">" + (price ? price + " JOD" : "—") + "</td>" +
        "<td><button type=\"button\" data-bulk-remove=\"" + esc(d._key) + "\">Remove</button></td>" +
        "</tr>"
      );
    }).join("");
    if (countEl) {
      var ready = bulkDrafts.filter(function (d) {
        return d.name.trim() && parseWeight(d.weight) > 0;
      }).length;
      countEl.textContent = bulkDrafts.length + " row(s) — " + ready + " ready to import";
    }
  }

  function syncBulkDraftFromRow(row) {
    var key = row.getAttribute("data-bulk-key");
    var draft = bulkDrafts.find(function (d) { return d._key === key; });
    if (!draft) return;
    row.querySelectorAll("[data-field]").forEach(function (el) {
      var field = el.getAttribute("data-field");
      if (field === "image") {
        var val = el.value.trim();
        draft.image = val || (draft.image && draft.image.indexOf("data:") === 0 ? draft.image : "");
      } else if (field === "weight" || field === "makingFee") {
        draft[field] = el.value;
      } else {
        draft[field] = el.value;
      }
    });
    if (draft.collection && categoriesForCollection(draft.collection).indexOf(draft.category) === -1) {
      draft.category = categoriesForCollection(draft.collection)[0] || draft.category;
    }
  }

  function syncAllBulkDrafts() {
    document.querySelectorAll("#bulk-rows tr[data-bulk-key]").forEach(syncBulkDraftFromRow);
  }

  function parseCSVLine(line) {
    var out = [], cur = "", inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        out.push(cur); cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out;
  }

  function normalizeImportRecord(rec) {
    var out = {};
    Object.keys(rec).forEach(function (key) {
      var k = key.trim().toLowerCase().replace(/\s+/g, "_");
      out[k] = rec[key];
    });
    if (!out.name && out.product_name) out.name = out.product_name;
    if (!out.name && out.title) out.name = out.title;
    if (!out.material && out.metal) out.material = out.metal;
    if (!out.image && out.photo) out.image = out.photo;
    if (!out.image && out.picture) out.image = out.picture;
    if (!out.weight && out.grams) out.weight = out.grams;
    if (!out.making_fee && out.makingfee) out.making_fee = out.makingfee;
  if (!out.in_stock && out.instock) out.in_stock = out.instock;
    return out;
  }

  function parseCSV(text) {
    text = String(text || "").replace(/^\uFEFF/, "");
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length < 2) return [];
    var delimiter = ",";
    if (lines[0].indexOf(";") > -1 && lines[0].indexOf(",") === -1) delimiter = ";";
    function splitLine(line) {
      if (delimiter === ";") return line.split(";").map(function (c) { return c.trim(); });
      return parseCSVLine(line);
    }
    var headers = splitLine(lines[0]).map(function (h) {
      return h.trim().toLowerCase().replace(/\s+/g, "_");
    });
    return lines.slice(1).map(function (line) {
      var cells = splitLine(line);
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = (cells[i] || "").trim(); });
      return normalizeImportRecord(obj);
    }).filter(function (rec) {
      return (rec.name || rec.title || "").trim();
    });
  }

  function rowFromImportRecord(rec) {
    var defs = getBulkDefaults();
    var inStock = rec.in_stock;
    if (inStock === "false" || inStock === "0" || inStock === "no") inStock = false;
    else if (inStock === "true" || inStock === "1" || inStock === "yes") inStock = true;
    else inStock = true;
    var draft = newBulkDraft({
      name: rec.name || rec.title || "",
      name_ar: rec.name_ar || "",
      description: rec.description || "",
      description_ar: rec.description_ar || "",
      weight: rec.weight || rec.grams || "",
      collection: rec.collection || defs.collection,
      category: rec.category || defs.category,
      material: rec.material || rec.metal || defs.material,
      gender: rec.gender || defs.gender,
      image: rec.image || rec.photo || rec.picture || "",
      makingFee: rec.making_fee != null && rec.making_fee !== "" ? rec.making_fee : defs.makingFee,
      badge: rec.badge || "",
      inStock: inStock
    });
    return applyAutoImageToDraft(draft);
  }

  function downloadBulkTemplate() {
    function saveCsv(csv) {
      var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mahseri-products-template.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    }
    fetch("assets/Products/mahseri-products-template.csv")
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(saveCsv)
      .catch(function () {
        saveCsv([
          "name,name_ar,description,description_ar,weight,collection,category,material,gender,image,making_fee,badge,in_stock",
          "Example Ring,,Edit description in admin.,,8,gold,Rings,21K Gold,Her,assets/Products/gold/rings/Example Ring.jpg,0,,true",
          "Example Bracelet,,Edit description in admin.,,40,gold,Bracelets,21K Gold,Her,assets/Products/gold/bracelets/Example Bracelet.jpg,0,,true"
        ].join("\n"));
      });
  }

  function uniqueProductId(name) {
    var base = slugify(name);
    var slug = base, n = 2;
    while (products.some(function (p) { return p.id === slug; })) {
      slug = base + "-" + n++;
    }
    return slug;
  }

  function buildProductFromDraft(draft) {
    var grams = parseWeight(draft.weight);
    var making = Math.max(0, Math.round(Number(draft.makingFee) || 0));
    var category = draft.category || getBulkDefaults().category;
    var collection = draft.collection || inferCollection({ category: category, material: draft.material });
    return {
      id: uniqueProductId(draft.name),
      name: draft.name.trim(),
      name_ar: (draft.name_ar || "").trim(),
      collection: collection,
      category: category,
      material: draft.material,
      gender: draft.gender || "Both",
      price: computePrice(grams, draft.material, making),
      weight: grams ? grams + " g" : "",
      makingFee: making,
      badge: draft.badge ? draft.badge : null,
      art: inferArt(category),
      image: resolveProductImagePath(draft.name, category, draft.image, collection),
      description: (draft.description || "").trim(),
      description_ar: (draft.description_ar || "").trim(),
      inStock: draft.inStock !== false,
      telegramHeadline: "",
      telegramBlurb: "",
      telegramSchedule: false
    };
  }

  function importBulkDrafts() {
    syncAllBulkDrafts();
    var valid = bulkDrafts.filter(function (d) {
      return d.name.trim() && parseWeight(d.weight) > 0;
    });
    if (!valid.length) {
      alert("Add at least one row with a name and weight (grams).");
      return;
    }
    var dataUrlCount = valid.filter(function (d) {
      return d.image && d.image.indexOf("data:") === 0;
    }).length;
    if (dataUrlCount > 8) {
      if (!confirm(
        dataUrlCount + " rows use uploaded photos stored as data in the browser. " +
        "Too many can exceed storage limits. Continue anyway?\n\n" +
        "Tip: put files in assets/Products/&lt;gold|silver&gt;/&lt;category&gt;/ (see assets/Products/README.txt) and use paths in the Image column instead."
      )) return;
    }
    valid.forEach(function (draft) {
      applyAutoImageToDraft(draft);
    });
    if (!confirm("Add " + valid.length + " piece(s) to the catalogue?")) return;
    valid.forEach(function (draft) {
      products.push(buildProductFromDraft(draft));
    });
    bulkDrafts = [];
    persist();
    render();
    renderBulkTable();
    alert("Added " + valid.length + " piece(s). Download data.js when ready to publish.");
  }

  /* ---------- Metal rates editor ---------- */

  function renderRates() {
    var metals = Object.keys(rates);
    if (liveSpot && typeof MAHSERI_PRICING !== "undefined") {
      var liveLabel = liveSpot.stale ? "From cached spot via pricing.js" : "From live spot via pricing.js";
      $("#rates-grid").innerHTML = metals.map(function (metal) {
        var eff = MAHSERI_PRICING.effectiveRate(metal, liveSpot);
        return (
          '<div data-metal="' + esc(metal) + '">' +
          "<label>" + esc(metal) + "</label>" +
          '<div class="rate-input">' +
          '<input type="number" value="' + esc(eff) + '" readonly />' +
          '<span class="unit">JOD / g</span>' +
          "</div>" +
          '<p class="derived">' + liveLabel + "</p>" +
          "</div>"
        );
      }).join("");
    } else {
      $("#rates-grid").innerHTML = metals.map(function (metal) {
        return (
          '<div data-metal="' + esc(metal) + '">' +
          "<label>" + esc(metal) + "</label>" +
          '<div class="rate-input">' +
          '<input type="number" value="' + esc(rates[metal]) + '" readonly />' +
          '<span class="unit">JOD / g</span>' +
          "</div>" +
          '<p class="derived">Fallback rate from data.js</p>' +
          "</div>"
        );
      }).join("");
    }
    renderFallbackRates();
  }

  function renderFallbackRates() {
    var html = Object.keys(rates).map(function (metal) {
      return (
        '<div data-metal="' + esc(metal) + '">' +
        "<label>" + esc(metal) + "</label>" +
        '<div class="rate-input">' +
        '<input type="number" min="0" step="0.1" value="' + esc(rates[metal]) + '" data-rate="' + esc(metal) + '" />' +
        '<span class="unit">JOD / g</span>' +
        "</div></div>"
      );
    }).join("");
    $("#fallback-rates-grid").innerHTML = html;
  }

  /* ---------- Image upload ---------- */

  function showImage(url) {
    currentImage = url || "";
    var preview = $("#f-img-preview");
    if (!preview) return;
    if (currentImage) {
      preview.src = currentImage;
      preview.style.display = "";
    } else {
      preview.removeAttribute("src");
      preview.style.display = "none";
    }
  }

  /* Downscale an uploaded photo to a data URL so it stays small enough for
     localStorage and loads fast on the site. Falls back to the raw file if
     anything goes wrong. */
  function readImageFile(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 900;
        var w = img.width, h = img.height;
        if (w > max || h > max) {
          if (w >= h) { h = Math.round(h * max / w); w = max; }
          else { w = Math.round(w * max / h); h = max; }
        }
        try {
          var canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          cb(canvas.toDataURL("image/jpeg", 0.85));
        } catch (e) {
          cb(reader.result);
        }
      };
      img.onerror = function () { cb(reader.result); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- Table ---------- */

  function render() {
    var rows = products.map(function (p) {
      var thumb = p.image
        ? '<img class="thumb" src="' + esc(p.image) + '" alt="" loading="lazy" />'
        : '<span class="thumb"></span>';
      return (
        '<tr data-id="' + esc(p.id) + '">' +
        '<td class="thumb-cell">' + thumb + "</td>" +
        "<td><strong>" + esc(p.name) + "</strong>" +
        (p.name_ar ? '<span class="name-ar">' + esc(p.name_ar) + "</span>" : "") +
        (p.badge ? ' <span class="pill">' + esc(p.badge) + "</span>" : "") + "</td>" +
        "<td>" + esc(p.category) + "</td>" +
        "<td>" + esc(p.material) + "</td>" +
        "<td>" + esc(p.price) + " JOD</td>" +
        "<td>" + (p.inStock === false ? '<span class="pill" style="background:rgba(192,57,43,0.12);color:#c0392b">Out</span>' : '<span class="pill">In stock</span>') + "</td>" +
        "<td>" + (p.telegramSchedule ? '<span class="pill" style="background:rgba(26,122,74,0.15);color:#1a7a4a">On</span>' : "—") + "</td>" +
        '<td class="row-actions">' +
        '<button type="button" data-act="edit">Edit</button> ' +
        '<button type="button" data-act="telegram" title="Post to Telegram channel">Post</button> ' +
        '<button type="button" data-act="delete" class="danger">Delete</button>' +
        "</td></tr>"
      );
    }).join("");
    $("#product-rows").innerHTML =
      rows || '<tr><td colspan="8" style="opacity:0.6">No pieces yet — add your first one.</td></tr>';
  }

  function highlightEditingRow(id) {
    document.querySelectorAll("#product-rows tr").forEach(function (tr) {
      tr.classList.toggle("is-editing-row", tr.getAttribute("data-id") === id);
    });
  }

  function startEdit(id) {
    if (!id) return;
    var p = products.find(function (x) { return x.id === id; });
    if (!p) return;
    editingId = id;
    var form = $("#product-form");
    $("#form-title").textContent = "Edit: " + p.name;
    $("#btn-save").textContent = "Save changes";
    $("#btn-cancel").style.display = "";
    $("#f-name").value = p.name || "";
    $("#f-name-ar").value = p.name_ar || "";
    if ($("#f-collection")) $("#f-collection").value = inferCollection(p);
    populateCategories();
    if ($("#f-category")) $("#f-category").value = p.category || "";
    if ($("#f-material")) $("#f-material").value = p.material || "21K Gold";
    if ($("#f-gender")) $("#f-gender").value = p.gender || "Both";
    if ($("#f-weight")) $("#f-weight").value = parseWeight(p.weight) || "";
    if ($("#f-making")) $("#f-making").value = p.makingFee != null ? p.makingFee : 0;
    if ($("#f-badge")) $("#f-badge").value = p.badge || "";
    if ($("#f-art")) $("#f-art").value = p.art || "ring";
    if ($("#f-desc")) $("#f-desc").value = p.description || "";
    if ($("#f-desc-ar")) $("#f-desc-ar").value = p.description_ar || "";
    if ($("#f-in-stock")) $("#f-in-stock").checked = p.inStock !== false;
    if ($("#f-telegram-headline")) $("#f-telegram-headline").value = p.telegramHeadline || "";
    if ($("#f-telegram-blurb")) $("#f-telegram-blurb").value = p.telegramBlurb || "";
    if ($("#f-telegram-schedule")) $("#f-telegram-schedule").checked = !!p.telegramSchedule;
    if ($("#btn-post-telegram")) $("#btn-post-telegram").style.display = "";
    showImage(p.image || "");
    if ($("#f-image")) {
      $("#f-image").value = (p.image && p.image.indexOf("data:") !== 0) ? p.image : "";
    }
    setAutoPrice(false);
    if ($("#f-price")) $("#f-price").value = p.price || "";
    highlightEditingRow(id);
    if (form) {
      form.classList.add("is-editing");
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if ($("#f-name")) $("#f-name").focus();
  }

  function resetForm() {
    editingId = null;
    var form = $("#product-form");
    if (form) form.reset();
    if ($("#f-making")) $("#f-making").value = 0;
    $("#form-title").textContent = "Add a new piece";
    $("#btn-save").textContent = "Add piece";
    $("#btn-cancel").style.display = "none";
    if ($("#btn-post-telegram")) $("#btn-post-telegram").style.display = "none";
    if (form) form.classList.remove("is-editing");
    highlightEditingRow("");
    showImage("");
    setAutoPrice(true);
  }

  function slugify(name) {
    var base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "piece";
    var slug = base, n = 2;
    while (products.some(function (p) { return p.id === slug; })) {
      slug = base + "-" + n++;
    }
    return slug;
  }

  function downloadCronSchedule() {
    var ids = products.filter(function (p) { return p.telegramSchedule; }).map(function (p) { return p.id; });
    var payload = {
      updated: new Date().toISOString(),
      productIds: ids
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "telegram-scheduled-products.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    alert(
      ids.length
        ? "Saved schedule for " + ids.length + " piece(s).\n\nPlace the file in scripts/ on the PC that runs the hourly cron, then run post-scheduled-products-once.bat (or Task Scheduler)."
        : "No pieces have hourly posting enabled. Check \"Post to channel every hour\" on the pieces you want, save, then download again."
    );
  }

  function postProductTelegram(p, btn) {
    if (!p) return;
    var tg = typeof MAHSERI_NOTIFY !== "undefined" && MAHSERI_NOTIFY.telegram;
    if (!tg || !tg.botToken || !tg.channelId) {
      alert("Telegram channel is not configured in js/data.js (botToken + channelId).");
      return;
    }
    var label = btn;
    if (label) {
      label.disabled = true;
      label.textContent = "Posting…";
    }
    mahseriPostProductToTelegram(p)
      .then(function () {
        alert('Posted "' + p.name + '" to the Telegram channel.');
      })
      .catch(function (err) {
        alert("Telegram post failed: " + (err.message || err));
      })
      .finally(function () {
        if (label) {
          label.disabled = false;
          label.textContent = label.id === "btn-post-all-telegram" ? "Post all to channel" : "Post to channel";
        }
      });
  }

  function postAllProductsTelegram(btn) {
    if (!products.length) {
      alert("No products to post.");
      return;
    }
    if (!confirm("Post all " + products.length + " pieces to the Telegram channel? (about 3 seconds between each)")) return;
    var i = 0;
    function next() {
      if (i >= products.length) {
        alert("Finished posting " + products.length + " pieces.");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Post all to channel";
        }
        return;
      }
      if (btn) btn.textContent = "Posting " + (i + 1) + "/" + products.length + "…";
      mahseriPostProductToTelegram(products[i])
        .catch(function (err) {
          console.warn("Failed:", products[i].name, err);
        })
        .then(function () {
          i++;
          setTimeout(next, 3200);
        });
    }
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Posting 1/" + products.length + "…";
    }
    next();
  }


  function buildDataJs() {
    var loader =
      "/* Products edited via admin.html are stored in this browser's localStorage\n" +
      "   and override the catalogue above. Use \"Download data.js\" in the admin\n" +
      "   page and replace this file on your host to publish for all visitors. */\n" +
      "(function () {\n" +
      "  try {\n" +
      '    var saved = localStorage.getItem("' + STORAGE_KEY + '");\n' +
      "    if (saved) {\n" +
      "      var arr = JSON.parse(saved);\n" +
      "      if (Array.isArray(arr) && arr.length) {\n" +
      "        MAHSERI_PRODUCTS.length = 0;\n" +
      "        arr.forEach(function (p) { MAHSERI_PRODUCTS.push(p); });\n" +
      "      }\n" +
      "    }\n" +
      '    var savedRates = localStorage.getItem("' + RATES_KEY + '");\n' +
      "    if (savedRates) {\n" +
      "      var r = JSON.parse(savedRates);\n" +
      "      if (r && typeof r === \"object\") {\n" +
      "        Object.keys(r).forEach(function (k) { MAHSERI_RATES[k] = r[k]; });\n" +
      "      }\n" +
      "    }\n" +
      "  } catch (e) { /* ignore corrupt saved data */ }\n" +
      "})();\n";

    return (
      "/* Mahseri Jewellery — product catalogue\n" +
      "   Prices in Jordanian Dinar (JOD). Art keys map to SVG line art in app.js.\n" +
      "   Generated by the catalogue manager on " + new Date().toLocaleString() + " */\n\n" +
      "const MAHSERI_PRODUCTS = " + JSON.stringify(products, null, 2) + ";\n\n" +
      "const MAHSERI_CATEGORIES = " + JSON.stringify(
        typeof MAHSERI_CATEGORIES !== "undefined" ? MAHSERI_CATEGORIES : [],
        null,
        2
      ) + ";\n\n" +
      "const MAHSERI_GEM_TYPES = " + JSON.stringify(
        typeof MAHSERI_GEM_TYPES !== "undefined" ? MAHSERI_GEM_TYPES : [],
        null,
        2
      ) + ";\n\n" +
      "/* Metal rates — fallback JOD/g when live spot prices are unavailable.\n" +
      "   Auto-pricing uses js/pricing.js formulas when spot prices load. */\n" +
      "const MAHSERI_RATES = " + JSON.stringify(rates, null, 2) + ";\n\n" +
      "const MAHSERI_STORE = " + JSON.stringify(MAHSERI_STORE, null, 2) + ";\n\n" +
      "/* Order notifications — fill in your keys and set enabled: true.\n" +
      "   Full setup steps are in SETUP-GUIDE.md at the project root. */\n" +
      "const MAHSERI_NOTIFY = " + JSON.stringify(MAHSERI_NOTIFY, null, 2) + ";\n\n" +
      loader
    );
  }

  function download() {
    var blob = new Blob([buildDataJs()], { type: "text/javascript" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  /* ---------- Events ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    initGate();
    populateCategories();
    populateBulkDefaultCategories();
    renderRates();
    setAutoPrice(true);
    showImage("");
    loadSpotPrices(false);

    on("#f-collection", "change", function () {
      populateCategories();
      if ($("#f-collection") && $("#f-collection").value === "gems" && $("#f-art")) {
        $("#f-art").value = "gemstone";
      }
    });

    on("#bulk-def-collection", "change", populateBulkDefaultCategories);

    on("#bulk-rows", "input", function (e) {
      var row = e.target.closest("tr[data-bulk-key]");
      if (!row) return;
      syncBulkDraftFromRow(row);
      if (e.target.getAttribute("data-field") === "collection") {
        var draft = bulkDrafts.find(function (d) { return d._key === row.getAttribute("data-bulk-key"); });
        if (draft) {
          var cats = categoriesForCollection(draft.collection);
          draft.category = cats.indexOf(draft.category) > -1 ? draft.category : (cats[0] || draft.category);
          renderBulkTable();
        }
      } else if (
        e.target.getAttribute("data-field") === "weight" ||
        e.target.getAttribute("data-field") === "material"
      ) {
        var priceCell = row.querySelector(".bulk-price");
        var d2 = bulkDrafts.find(function (x) { return x._key === row.getAttribute("data-bulk-key"); });
        if (priceCell && d2) {
          var p = bulkDraftPrice(d2);
          priceCell.textContent = p ? p + " JOD" : "—";
        }
      } else if (
        e.target.getAttribute("data-field") === "name" ||
        e.target.getAttribute("data-field") === "category"
      ) {
        var dImg = bulkDrafts.find(function (x) { return x._key === row.getAttribute("data-bulk-key"); });
        if (dImg && (!dImg.image || dImg.image.indexOf("data:") !== 0)) {
          applyAutoImageToDraft(dImg);
          resolveProductImagePathAsync(dImg.name, dImg.category, "", dImg.collection).then(function (url) {
            if (url) dImg.image = url;
            renderBulkTable();
          });
        }
      }
    });

    on("#bulk-rows", "change", function (e) {
      var row = e.target.closest("tr[data-bulk-key]");
      if (!row) return;
      syncBulkDraftFromRow(row);
      if (e.target.getAttribute("data-field") === "collection") renderBulkTable();
      else if (
        e.target.getAttribute("data-field") === "weight" ||
        e.target.getAttribute("data-field") === "material"
      ) {
        var priceCell = row.querySelector(".bulk-price");
        var d3 = bulkDrafts.find(function (x) { return x._key === row.getAttribute("data-bulk-key"); });
        if (priceCell && d3) {
          var p2 = bulkDraftPrice(d3);
          priceCell.textContent = p2 ? p2 + " JOD" : "—";
        }
      } else if (
        e.target.getAttribute("data-field") === "name" ||
        e.target.getAttribute("data-field") === "category" ||
        e.target.getAttribute("data-field") === "collection"
      ) {
        var dImg2 = bulkDrafts.find(function (x) { return x._key === row.getAttribute("data-bulk-key"); });
        if (dImg2 && (!dImg2.image || dImg2.image.indexOf("data:") !== 0)) {
          applyAutoImageToDraft(dImg2);
          resolveProductImagePathAsync(dImg2.name, dImg2.category, "", dImg2.collection).then(function (url) {
            if (url) dImg2.image = url;
            renderBulkTable();
          });
        }
      }
    });

    on("#bulk-rows", "click", function (e) {
      var btn = e.target.closest("[data-bulk-remove]");
      if (!btn) return;
      var key = btn.getAttribute("data-bulk-remove");
      bulkDrafts = bulkDrafts.filter(function (d) { return d._key !== key; });
      renderBulkTable();
    });

    on("#bulk-img-files", "change", function (e) {
      var files = Array.prototype.slice.call(e.target.files || []);
      if (!files.length) return;
      var added = 0;
      files.forEach(function (file, i) {
        readImageFile(file, function (url) {
          var baseName = file.name.replace(/\.[^.]+$/, "")
            .replace(/^WhatsApp Image.*$/i, "Piece")
            .trim() || ("Piece " + (bulkDrafts.length + 1));
          bulkDrafts.push(newBulkDraft({ name: baseName, image: url }));
          added++;
          if (added === files.length) renderBulkTable();
        });
      });
      e.target.value = "";
    });

    on("#bulk-data-file", "change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var text = reader.result;
          var rows;
          if (/\.json$/i.test(file.name) || text.trim().charAt(0) === "[") {
            rows = JSON.parse(text);
            if (!Array.isArray(rows)) rows = rows.products || [];
          } else {
            rows = parseCSV(text);
          }
          if (!rows.length) {
            alert("No product rows found in file.");
            return;
          }
          rows.forEach(function (rec) {
            bulkDrafts.push(rowFromImportRecord(normalizeImportRecord(rec)));
          });
          renderBulkTable();
          resolveBulkDraftImages(function () {
            alert(
              "Loaded " + rows.length + " row(s). Use the image column for a path, or leave it empty " +
              "to match a photo named like the product. Review thumbs, then Add all to catalogue."
            );
          });
        } catch (err) {
          alert("Could not read file: " + (err.message || err));
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });

    on("#btn-bulk-template", "click", downloadBulkTemplate);
    on("#btn-bulk-add-row", "click", function () {
      bulkDrafts.push(newBulkDraft());
      renderBulkTable();
    });
    on("#btn-bulk-clear", "click", function () {
      if (bulkDrafts.length && !confirm("Clear all bulk import rows?")) return;
      bulkDrafts = [];
      renderBulkTable();
    });
    on("#btn-bulk-import", "click", importBulkDrafts);

    on("#btn-refresh-spot", "click", function () {
      loadSpotPrices(true);
    });

    /* Fallback rates: used when live spot is unavailable. */
    on("#fallback-rates-grid", "input", function (e) {
      var input = e.target.closest("[data-rate]");
      if (!input) return;
      rates[input.getAttribute("data-rate")] = Math.max(0, Number(input.value) || 0);
      persistRates();
      recalcPrice();
    });

    /* Re-price whenever weight, metal or making fee changes. */
    ["f-weight", "f-material", "f-making"].forEach(function (id) {
      on("#" + id, "input", recalcPrice);
    });

    /* Toggle between auto-pricing and manual price entry. */
    on("#price-hint", "click", function (e) {
      if (e.target.id === "price-toggle") setAutoPrice(!autoPrice);
    });

    /* Photo: upload a file, paste a URL, or remove. */
    on("#f-img-file", "change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      readImageFile(file, function (url) {
        showImage(url);
        if ($("#f-image")) $("#f-image").value = "";
      });
      e.target.value = "";
    });
    on("#f-image", "input", function () {
      showImage($("#f-image").value.trim());
    });
    on("#f-img-remove", "click", function () {
      showImage("");
      if ($("#f-image")) $("#f-image").value = "";
    });

    on("#product-rows", "click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var row = btn.closest("tr");
      if (!row) return;
      var id = row.getAttribute("data-id");
      var act = btn.getAttribute("data-act");
      if (act === "edit") {
        e.preventDefault();
        startEdit(id);
        return;
      }
      if (act === "telegram") {
        e.preventDefault();
        var piece = products.find(function (x) { return x.id === id; });
        postProductTelegram(piece, btn);
        return;
      }
      if (act === "delete") {
        var p = products.find(function (x) { return x.id === id; });
        var label = p ? (p.name + (p.name_ar ? " / " + p.name_ar : "")) : id;
        if (p && confirm('Delete "' + label + '" from the catalogue?')) {
          products = products.filter(function (x) { return x.id !== id; });
          if (editingId === id) resetForm();
          persist();
          render();
        }
      }
    });

    on("#product-form", "submit", function (e) {
      e.preventDefault();
      var existing = editingId
        ? products.find(function (x) { return x.id === editingId; })
        : null;
      var grams = parseWeight($("#f-weight").value);
      var making = Math.max(0, Math.round(Number($("#f-making").value) || 0));
      /* Start from the existing piece so fields the form doesn't edit
         (e.g. gender, name_ar) are preserved. */
      var entry = Object.assign({}, existing, {
        id: editingId || slugify($("#f-name").value),
        name: $("#f-name").value.trim(),
        name_ar: $("#f-name-ar").value.trim(),
        collection: $("#f-collection").value,
        category: $("#f-category").value,
        material: $("#f-material").value,
        gender: $("#f-gender").value,
        price: Math.max(1, Math.round(Number($("#f-price").value) || 0)),
        weight: grams ? grams + " g" : "",
        makingFee: making,
        badge: $("#f-badge").value || null,
        art: $("#f-art").value,
        image: currentImage || resolveProductImagePath(
          $("#f-name").value.trim(),
          $("#f-category").value,
          $("#f-image") ? $("#f-image").value.trim() : "",
          $("#f-collection").value
        ),
        description: $("#f-desc").value.trim(),
        description_ar: $("#f-desc-ar").value.trim(),
        inStock: $("#f-in-stock") ? $("#f-in-stock").checked : true,
        telegramHeadline: $("#f-telegram-headline") ? $("#f-telegram-headline").value.trim() : "",
        telegramBlurb: $("#f-telegram-blurb") ? $("#f-telegram-blurb").value.trim() : "",
        telegramSchedule: $("#f-telegram-schedule") ? $("#f-telegram-schedule").checked : false
      });
      if (!entry.name || !entry.price) return;

      if (editingId) {
        var i = products.findIndex(function (x) { return x.id === editingId; });
        if (i > -1) products[i] = entry;
      } else {
        products.push(entry);
      }
      persist();
      render();
      resetForm();
    });

    on("#btn-cancel", "click", resetForm);
    on("#btn-export", "click", download);
    on("#btn-download-schedule", "click", downloadCronSchedule);
    on("#btn-post-telegram", "click", function () {
      if (!editingId) return;
      var p = products.find(function (x) { return x.id === editingId; });
      postProductTelegram(p, $("#btn-post-telegram"));
    });
    on("#btn-post-all-telegram", "click", function () {
      postAllProductsTelegram($("#btn-post-all-telegram"));
    });

    on("#btn-reset", "click", function () {
      if (confirm("Discard all changes made in this browser and restore the original catalogue from data.js?")) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(RATES_KEY);
        location.reload();
      }
    });
  });
})();
