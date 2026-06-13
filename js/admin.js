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
  var autoPrice = true;    // when true, price = weight x metal rate + making fee

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

  /* ---------- Pricing (weight x metal rate) ---------- */

  function parseWeight(val) {
    var n = parseFloat(String(val == null ? "" : val).replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  }

  function computePrice(grams, material, makingFee) {
    var rate = Number(rates[material]) || 0;
    return Math.max(1, Math.round(grams * rate + (Number(makingFee) || 0)));
  }

  /* Recalculate the price field from the current weight, metal and making fee,
     unless the user has switched the form to manual pricing. */
  function recalcPrice() {
    var hint = $("#price-hint");
    if (!autoPrice) {
      hint.innerHTML = 'Manual price. <a id="price-toggle">Auto-price from weight</a>';
      return;
    }
    var grams = parseWeight($("#f-weight").value);
    var material = $("#f-material").value;
    var making = Number($("#f-making").value) || 0;
    var rate = Number(rates[material]) || 0;
    if (!grams) {
      $("#f-price").value = "";
      hint.innerHTML = 'Enter a weight to price this piece automatically, ' +
        'or <a id="price-toggle">enter the price manually</a>.';
      return;
    }
    $("#f-price").value = computePrice(grams, material, making);
    if (!rate) {
      hint.innerHTML = 'No rate set for ' + esc(material) +
        ' — add one in Metal rates above, or <a id="price-toggle">enter the price manually</a>.';
    } else {
      hint.innerHTML = "= " + (grams || 0) + " g × " + rate + " JOD/g" +
        (making ? " + " + making + " making" : "") +
        '. <a id="price-toggle">Edit manually</a>';
    }
  }

  function setAutoPrice(on) {
    autoPrice = on;
    $("#f-price").readOnly = on;
    recalcPrice();
  }

  /* ---------- Metal rates editor ---------- */

  function renderRates() {
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
    $("#rates-grid").innerHTML = html;
  }

  /* ---------- Image upload ---------- */

  function showImage(url) {
    currentImage = url || "";
    var preview = $("#f-img-preview");
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
        (p.badge ? ' <span class="pill">' + esc(p.badge) + "</span>" : "") + "</td>" +
        "<td>" + esc(p.category) + "</td>" +
        "<td>" + esc(p.material) + "</td>" +
        "<td>" + esc(p.price) + " JOD</td>" +
        '<td class="row-actions">' +
        '<button type="button" data-act="edit">Edit</button> ' +
        '<button type="button" data-act="delete" class="danger">Delete</button>' +
        "</td></tr>"
      );
    }).join("");
    $("#product-rows").innerHTML =
      rows || '<tr><td colspan="6" style="opacity:0.6">No pieces yet — add your first one.</td></tr>';
  }

  function startEdit(id) {
    var p = products.find(function (x) { return x.id === id; });
    if (!p) return;
    editingId = id;
    $("#form-title").textContent = "Edit: " + p.name;
    $("#btn-save").textContent = "Save changes";
    $("#btn-cancel").style.display = "";
    $("#f-name").value = p.name;
    $("#f-category").value = p.category;
    $("#f-material").value = p.material;
    $("#f-weight").value = parseWeight(p.weight) || "";
    $("#f-making").value = p.makingFee != null ? p.makingFee : 0;
    $("#f-badge").value = p.badge || "";
    $("#f-art").value = p.art || "ring";
    $("#f-desc").value = p.description;
    showImage(p.image || "");
    $("#f-image").value = (p.image && p.image.indexOf("data:") !== 0) ? p.image : "";
    setAutoPrice(true);
    $("#f-price").value = p.price;
    $("#f-name").focus();
  }

  function resetForm() {
    editingId = null;
    $("#product-form").reset();
    $("#f-making").value = 0;
    $("#form-title").textContent = "Add a new piece";
    $("#btn-save").textContent = "Add piece";
    $("#btn-cancel").style.display = "none";
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

  /* ---------- Export ---------- */

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
      "/* Metal rates — price per gram in JOD, used to auto-price pieces in admin.html. */\n" +
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
    renderRates();
    setAutoPrice(true);
    showImage("");

    /* Metal rates: update live, save, and re-price the open form. */
    $("#rates-grid").addEventListener("input", function (e) {
      var input = e.target.closest("[data-rate]");
      if (!input) return;
      rates[input.getAttribute("data-rate")] = Math.max(0, Number(input.value) || 0);
      persistRates();
      recalcPrice();
    });

    /* Re-price whenever weight, metal or making fee changes. */
    ["f-weight", "f-material", "f-making"].forEach(function (id) {
      $("#" + id).addEventListener("input", recalcPrice);
    });

    /* Toggle between auto-pricing and manual price entry. */
    $("#price-hint").addEventListener("click", function (e) {
      if (e.target.id === "price-toggle") setAutoPrice(!autoPrice);
    });

    /* Photo: upload a file, paste a URL, or remove. */
    $("#f-img-file").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      readImageFile(file, function (url) {
        showImage(url);
        $("#f-image").value = "";
      });
      e.target.value = "";
    });
    $("#f-image").addEventListener("input", function () {
      showImage($("#f-image").value.trim());
    });
    $("#f-img-remove").addEventListener("click", function () {
      showImage("");
      $("#f-image").value = "";
    });

    $("#product-rows").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var id = btn.closest("tr").getAttribute("data-id");
      if (btn.getAttribute("data-act") === "edit") startEdit(id);
      if (btn.getAttribute("data-act") === "delete") {
        var p = products.find(function (x) { return x.id === id; });
        if (p && confirm('Delete "' + p.name + '" from the catalogue?')) {
          products = products.filter(function (x) { return x.id !== id; });
          if (editingId === id) resetForm();
          persist();
          render();
        }
      }
    });

    $("#product-form").addEventListener("submit", function (e) {
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
        category: $("#f-category").value,
        material: $("#f-material").value,
        price: Math.max(1, Math.round(Number($("#f-price").value) || 0)),
        weight: grams ? grams + " g" : "",
        makingFee: making,
        badge: $("#f-badge").value || null,
        art: $("#f-art").value,
        image: currentImage || "",
        description: $("#f-desc").value.trim()
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

    $("#btn-cancel").addEventListener("click", resetForm);
    $("#btn-export").addEventListener("click", download);

    $("#btn-reset").addEventListener("click", function () {
      if (confirm("Discard all changes made in this browser and restore the original catalogue from data.js?")) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(RATES_KEY);
        location.reload();
      }
    });
  });
})();
