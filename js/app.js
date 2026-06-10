/* ============================================================
   Mahseri Jewellery — storefront application
   Cart (localStorage), shared chrome, and per-page behaviour.
   ============================================================ */

(function () {
  "use strict";

  var CART_KEY = "mahseri_cart_v1";

  /* ---------- Catalogue helpers ---------- */

  function getProduct(id) {
    return MAHSERI_PRODUCTS.find(function (p) { return p.id === id; }) || null;
  }

  function formatPrice(value) {
    return value.toLocaleString("en-JO", { maximumFractionDigits: 0 }) + " JOD";
  }

  /* ---------- SVG line art (gold strokes) ---------- */

  var GOLD = "#c6a35c";
  var GOLD_SOFT = "rgba(198,163,92,0.45)";

  var ART = {
    ring:
      '<svg viewBox="0 0 200 200" fill="none" aria-hidden="true">' +
      '<circle cx="100" cy="118" r="52" stroke="' + GOLD + '" stroke-width="7"/>' +
      '<circle cx="100" cy="118" r="40" stroke="' + GOLD_SOFT + '" stroke-width="1.5"/>' +
      '<path d="M78 64 L100 34 L122 64 L100 80 Z" stroke="' + GOLD + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M78 64 L122 64" stroke="' + GOLD + '" stroke-width="3"/>' +
      '<path d="M100 34 L93 64 M100 34 L107 64" stroke="' + GOLD_SOFT + '" stroke-width="1.5"/>' +
      "</svg>",
    necklace:
      '<svg viewBox="0 0 200 200" fill="none" aria-hidden="true">' +
      '<path d="M30 32 C45 105 75 130 100 134 C125 130 155 105 170 32" stroke="' + GOLD + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M40 32 C53 98 78 122 100 126 C122 122 147 98 160 32" stroke="' + GOLD_SOFT + '" stroke-width="1.6"/>' +
      '<circle cx="100" cy="148" r="13" stroke="' + GOLD + '" stroke-width="4"/>' +
      '<path d="M100 134 L100 136" stroke="' + GOLD + '" stroke-width="4"/>' +
      '<path d="M95 168 L100 180 L105 168" stroke="' + GOLD + '" stroke-width="3" stroke-linecap="round"/>' +
      "</svg>",
    pendant:
      '<svg viewBox="0 0 200 200" fill="none" aria-hidden="true">' +
      '<path d="M52 26 C70 70 86 84 100 88 C114 84 130 70 148 26" stroke="' + GOLD + '" stroke-width="3.4" stroke-linecap="round"/>' +
      '<rect x="78" y="98" width="44" height="58" stroke="' + GOLD + '" stroke-width="4"/>' +
      '<rect x="86" y="108" width="28" height="38" stroke="' + GOLD_SOFT + '" stroke-width="1.6"/>' +
      '<path d="M100 88 L100 98" stroke="' + GOLD + '" stroke-width="3"/>' +
      '<path d="M78 127 H122" stroke="' + GOLD_SOFT + '" stroke-width="1.6"/>' +
      "</svg>",
    earrings:
      '<svg viewBox="0 0 200 200" fill="none" aria-hidden="true">' +
      '<path d="M62 34 a9 9 0 1 1 0.1 0" stroke="' + GOLD + '" stroke-width="3"/>' +
      '<path d="M62 50 L62 76" stroke="' + GOLD + '" stroke-width="3"/>' +
      '<circle cx="62" cy="116" r="38" stroke="' + GOLD + '" stroke-width="5"/>' +
      '<path d="M138 34 a9 9 0 1 1 0.1 0" stroke="' + GOLD + '" stroke-width="3"/>' +
      '<path d="M138 50 L138 70" stroke="' + GOLD + '" stroke-width="3"/>' +
      '<path d="M138 70 L120 130 L156 130 Z" stroke="' + GOLD + '" stroke-width="4" stroke-linejoin="round"/>' +
      "</svg>",
    bangle:
      '<svg viewBox="0 0 200 200" fill="none" aria-hidden="true">' +
      '<circle cx="100" cy="100" r="62" stroke="' + GOLD + '" stroke-width="8"/>' +
      '<circle cx="100" cy="100" r="48" stroke="' + GOLD_SOFT + '" stroke-width="1.6"/>' +
      '<circle cx="100" cy="38" r="7" fill="' + GOLD + '"/>' +
      '<circle cx="156" cy="120" r="5" fill="' + GOLD_SOFT + '"/>' +
      "</svg>"
  };

  function artFor(product) {
    return ART[product.art] || ART.ring;
  }

  /* ---------- Cart store ---------- */

  function loadCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var items = raw ? JSON.parse(raw) : [];
      return items.filter(function (it) { return getProduct(it.id); });
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCartUI();
  }

  function cartAdd(id, qty) {
    var items = loadCart();
    var line = items.find(function (it) { return it.id === id; });
    if (line) { line.qty += qty; } else { items.push({ id: id, qty: qty }); }
    saveCart(items);
    var product = getProduct(id);
    toast(product ? product.name + " added to your bag" : "Added to your bag");
    bumpCount();
  }

  function cartSetQty(id, qty) {
    var items = loadCart();
    if (qty <= 0) {
      items = items.filter(function (it) { return it.id !== id; });
    } else {
      var line = items.find(function (it) { return it.id === id; });
      if (line) line.qty = qty;
    }
    saveCart(items);
  }

  function cartClear() {
    saveCart([]);
  }

  function cartCount() {
    return loadCart().reduce(function (n, it) { return n + it.qty; }, 0);
  }

  function cartSubtotal() {
    return loadCart().reduce(function (sum, it) {
      var p = getProduct(it.id);
      return sum + (p ? p.price * it.qty : 0);
    }, 0);
  }

  function shippingFor(subtotal) {
    if (subtotal === 0) return 0;
    return subtotal >= MAHSERI_STORE.freeShippingThreshold ? 0 : MAHSERI_STORE.shippingFlat;
  }

  /* ---------- Toast ---------- */

  var toastTimer = null;
  function toast(message) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(function () { el.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  function bumpCount() {
    document.querySelectorAll(".cart-count").forEach(function (el) {
      el.classList.remove("bump");
      void el.offsetWidth;
      el.classList.add("bump");
    });
  }

  /* ---------- Shared chrome: header, nav, drawer ---------- */

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (header) {
      window.addEventListener("scroll", function () {
        header.classList.toggle("scrolled", window.scrollY > 10);
      }, { passive: true });
    }

    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.classList.remove("open");
        });
      });
    }

    // Highlight current page in nav
    var page = document.body.getAttribute("data-page");
    document.querySelectorAll(".site-nav a[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) a.classList.add("active");
    });
  }

  function buildDrawer() {
    if (document.querySelector(".cart-drawer")) return;
    var veil = document.createElement("div");
    veil.className = "drawer-veil";
    veil.addEventListener("click", closeDrawer);

    var drawer = document.createElement("aside");
    drawer.className = "cart-drawer";
    drawer.setAttribute("aria-label", "Shopping bag");
    drawer.innerHTML =
      '<div class="drawer-head">' +
      '  <h3>Your Bag</h3>' +
      '  <button class="drawer-close" aria-label="Close bag">&times;</button>' +
      "</div>" +
      '<div class="drawer-items"></div>' +
      '<div class="drawer-foot">' +
      '  <div class="drawer-total"><span>Subtotal</span><span class="drawer-subtotal">0 JOD</span></div>' +
      '  <a class="btn btn-solid btn-wide" href="cart.html">Review &amp; checkout</a>' +
      "</div>";
    drawer.querySelector(".drawer-close").addEventListener("click", closeDrawer);

    document.body.appendChild(veil);
    document.body.appendChild(drawer);
  }

  function openDrawer() {
    renderCartUI();
    document.body.classList.add("drawer-open");
  }

  function closeDrawer() {
    document.body.classList.remove("drawer-open");
  }

  function renderCartUI() {
    var count = cartCount();
    document.querySelectorAll(".cart-count").forEach(function (el) {
      el.textContent = count;
    });

    var wrap = document.querySelector(".drawer-items");
    if (wrap) {
      var items = loadCart();
      if (!items.length) {
        wrap.innerHTML = '<p class="drawer-empty">Your bag is empty &mdash; for now.</p>';
      } else {
        wrap.innerHTML = items.map(function (it) {
          var p = getProduct(it.id);
          return (
            '<div class="cart-line" data-id="' + p.id + '">' +
            '  <a class="cl-thumb" href="product.html?id=' + p.id + '">' + artFor(p) + "</a>" +
            '  <div>' +
            '    <h4><a href="product.html?id=' + p.id + '">' + p.name + "</a></h4>" +
            '    <p class="cl-meta">' + p.material + "</p>" +
            '    <div class="cl-qty">' +
            '      <button data-act="dec" aria-label="Decrease quantity">&minus;</button>' +
            "      <span>" + it.qty + "</span>" +
            '      <button data-act="inc" aria-label="Increase quantity">+</button>' +
            "    </div>" +
            "  </div>" +
            '  <div>' +
            '    <p class="cl-price">' + formatPrice(p.price * it.qty) + "</p>" +
            '    <button class="cl-remove" data-act="remove">Remove</button>' +
            "  </div>" +
            "</div>"
          );
        }).join("");
      }
      var subEl = document.querySelector(".drawer-subtotal");
      if (subEl) subEl.textContent = formatPrice(cartSubtotal());
    }
  }

  function bindCartLineEvents(container) {
    container.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var line = btn.closest("[data-id]");
      if (!line) return;
      var id = line.getAttribute("data-id");
      var items = loadCart();
      var entry = items.find(function (it) { return it.id === id; });
      if (!entry) return;
      var act = btn.getAttribute("data-act");
      if (act === "inc") cartSetQty(id, entry.qty + 1);
      if (act === "dec") cartSetQty(id, entry.qty - 1);
      if (act === "remove") cartSetQty(id, 0);
      if (document.body.getAttribute("data-page") === "cart") renderCartPage();
    });
  }

  /* ---------- Reveal on scroll ---------- */

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Product card markup ---------- */

  function productCard(p, revealDelay) {
    return (
      '<article class="product-card reveal' + (revealDelay ? " reveal-delay-" + revealDelay : "") + '">' +
      '  <div class="pc-media">' +
      (p.badge ? '<span class="pc-badge">' + p.badge + "</span>" : "") +
      '    <a href="product.html?id=' + p.id + '" aria-label="' + p.name + '">' + artFor(p) + "</a>" +
      '    <button class="pc-quick" data-add="' + p.id + '">Add to bag</button>' +
      "  </div>" +
      '  <div class="pc-body">' +
      '    <p class="pc-cat">' + p.category + "</p>" +
      "    <h3><a href=\"product.html?id=" + p.id + '">' + p.name + "</a></h3>" +
      '    <p class="pc-material">' + p.material + " &middot; " + p.weight + "</p>" +
      '    <p class="pc-price">' + formatPrice(p.price) + "</p>" +
      "  </div>" +
      "</article>"
    );
  }

  function bindQuickAdd(container) {
    container.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-add]");
      if (!btn) return;
      cartAdd(btn.getAttribute("data-add"), 1);
      openDrawer();
    });
  }

  /* ---------- Page: home ---------- */

  function initHome() {
    // Featured products: badges first, then price
    var featured = MAHSERI_PRODUCTS.slice()
      .sort(function (a, b) { return (b.badge ? 1 : 0) - (a.badge ? 1 : 0); })
      .slice(0, 4);
    var grid = document.querySelector("#featured-grid");
    if (grid) {
      grid.innerHTML = featured.map(function (p, i) { return productCard(p, i % 4); }).join("");
      bindQuickAdd(grid);
    }

    // Gold particles in hero
    var particles = document.querySelector(".particles");
    if (particles) {
      for (var i = 0; i < 22; i++) {
        var dot = document.createElement("i");
        dot.style.left = (Math.random() * 100).toFixed(1) + "%";
        dot.style.bottom = (-4 - Math.random() * 10).toFixed(1) + "%";
        dot.style.animationDuration = (9 + Math.random() * 14).toFixed(1) + "s";
        dot.style.animationDelay = (Math.random() * 14).toFixed(1) + "s";
        dot.style.transform = "scale(" + (0.5 + Math.random()).toFixed(2) + ")";
        particles.appendChild(dot);
      }
    }

    // Material explorer tabs
    var tabs = document.querySelectorAll(".material-tabs button");
    var panels = document.querySelectorAll(".material-panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("active"); });
        panels.forEach(function (p) { p.classList.remove("active"); });
        tab.classList.add("active");
        var panel = document.querySelector('.material-panel[data-material="' + tab.dataset.material + '"]');
        if (panel) {
          panel.classList.add("active");
          var bar = panel.querySelector(".purity-bar i");
          if (bar) {
            bar.style.width = "0";
            requestAnimationFrame(function () {
              requestAnimationFrame(function () { bar.style.width = bar.dataset.purity + "%"; });
            });
          }
        }
      });
    });
    var firstBar = document.querySelector(".material-panel.active .purity-bar i");
    if (firstBar) {
      setTimeout(function () { firstBar.style.width = firstBar.dataset.purity + "%"; }, 600);
    }

    // Testimonial slider
    var slides = document.querySelectorAll(".testimonial");
    var dots = document.querySelectorAll(".testimonial-dots button");
    var current = 0;
    function show(i) {
      current = i;
      slides.forEach(function (s, idx) { s.classList.toggle("active", idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle("active", idx === i); });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); });
    });
    if (slides.length) {
      setInterval(function () { show((current + 1) % slides.length); }, 6500);
    }
  }

  /* ---------- Page: shop ---------- */

  var shopState = { category: "All", material: "All", sort: "featured" };

  function initShop() {
    var params = new URLSearchParams(location.search);
    if (params.get("category")) shopState.category = params.get("category");
    if (params.get("material")) shopState.material = params.get("material");

    document.querySelectorAll("[data-filter-category]").forEach(function (chip) {
      chip.classList.toggle("active", chip.dataset.filterCategory === shopState.category);
      chip.addEventListener("click", function () {
        shopState.category = chip.dataset.filterCategory;
        document.querySelectorAll("[data-filter-category]").forEach(function (c) {
          c.classList.toggle("active", c === chip);
        });
        renderShop();
      });
    });

    document.querySelectorAll("[data-filter-material]").forEach(function (chip) {
      chip.classList.toggle("active", chip.dataset.filterMaterial === shopState.material);
      chip.addEventListener("click", function () {
        shopState.material = chip.dataset.filterMaterial;
        document.querySelectorAll("[data-filter-material]").forEach(function (c) {
          c.classList.toggle("active", c === chip);
        });
        renderShop();
      });
    });

    var sortSel = document.querySelector("#shop-sort");
    if (sortSel) {
      sortSel.addEventListener("change", function () {
        shopState.sort = sortSel.value;
        renderShop();
      });
    }

    var grid = document.querySelector("#shop-grid");
    if (grid) bindQuickAdd(grid);
    renderShop();
  }

  function renderShop() {
    var grid = document.querySelector("#shop-grid");
    if (!grid) return;

    var items = MAHSERI_PRODUCTS.filter(function (p) {
      var okCat = shopState.category === "All" || p.category === shopState.category;
      var okMat = shopState.material === "All" || p.material === shopState.material;
      return okCat && okMat;
    });

    if (shopState.sort === "price-asc") items.sort(function (a, b) { return a.price - b.price; });
    if (shopState.sort === "price-desc") items.sort(function (a, b) { return b.price - a.price; });
    if (shopState.sort === "name") items.sort(function (a, b) { return a.name.localeCompare(b.name); });

    var countEl = document.querySelector(".shop-count");
    if (countEl) countEl.textContent = items.length + (items.length === 1 ? " piece" : " pieces");

    grid.innerHTML = items.length
      ? items.map(function (p, i) { return productCard(p, i % 4); }).join("")
      : '<p class="empty-note" style="grid-column:1/-1">No pieces match that combination &mdash; try another filter.</p>';
    initReveal();
  }

  /* ---------- Page: product detail ---------- */

  function initProduct() {
    var id = new URLSearchParams(location.search).get("id");
    var product = getProduct(id) || MAHSERI_PRODUCTS[0];
    var qty = 1;

    document.title = product.name + " | Mahseri Jewellery";
    setText("#pd-category", product.category);
    setText("#pd-name", product.name);
    setText("#pd-price", formatPrice(product.price));
    setText("#pd-desc", product.description);
    setText("#pd-material", product.material);
    setText("#pd-weight", product.weight);
    setText("#pd-breadcrumb", product.name);

    var media = document.querySelector("#pd-media");
    if (media) {
      media.insertAdjacentHTML("afterbegin", artFor(product));
      media.addEventListener("click", function () { media.classList.toggle("zoomed"); });
    }

    var out = document.querySelector("#pd-qty");
    document.querySelector("#qty-dec").addEventListener("click", function () {
      qty = Math.max(1, qty - 1);
      out.textContent = qty;
    });
    document.querySelector("#qty-inc").addEventListener("click", function () {
      qty = Math.min(10, qty + 1);
      out.textContent = qty;
    });

    document.querySelector("#pd-add").addEventListener("click", function () {
      cartAdd(product.id, qty);
      openDrawer();
    });

    // Related pieces: same category first, then same material
    var related = MAHSERI_PRODUCTS.filter(function (p) { return p.id !== product.id; })
      .sort(function (a, b) {
        function score(x) {
          return (x.category === product.category ? 2 : 0) + (x.material === product.material ? 1 : 0);
        }
        return score(b) - score(a);
      })
      .slice(0, 4);
    var grid = document.querySelector("#related-grid");
    if (grid) {
      grid.innerHTML = related.map(function (p, i) { return productCard(p, i % 4); }).join("");
      bindQuickAdd(grid);
    }
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  /* ---------- Page: cart & checkout ---------- */

  function renderCartPage() {
    var wrap = document.querySelector("#cart-lines");
    if (!wrap) return;
    var items = loadCart();
    var layout = document.querySelector("#cart-layout");
    var emptyEl = document.querySelector("#cart-empty");

    if (!items.length) {
      if (layout) layout.style.display = "none";
      if (emptyEl) emptyEl.style.display = "block";
      return;
    }
    if (layout) layout.style.display = "";
    if (emptyEl) emptyEl.style.display = "none";

    wrap.innerHTML = items.map(function (it) {
      var p = getProduct(it.id);
      return (
        '<div class="cart-line" data-id="' + p.id + '">' +
        '  <a class="cl-thumb" href="product.html?id=' + p.id + '">' + artFor(p) + "</a>" +
        '  <div>' +
        '    <h4><a href="product.html?id=' + p.id + '">' + p.name + "</a></h4>" +
        '    <p class="cl-meta">' + p.material + " &middot; " + formatPrice(p.price) + " each</p>" +
        '    <div class="cl-qty">' +
        '      <button data-act="dec" aria-label="Decrease quantity">&minus;</button>' +
        "      <span>" + it.qty + "</span>" +
        '      <button data-act="inc" aria-label="Increase quantity">+</button>' +
        "    </div>" +
        "  </div>" +
        '  <div>' +
        '    <p class="cl-price">' + formatPrice(p.price * it.qty) + "</p>" +
        '    <button class="cl-remove" data-act="remove">Remove</button>' +
        "  </div>" +
        "</div>"
      );
    }).join("");

    var subtotal = cartSubtotal();
    var shipping = shippingFor(subtotal);
    setText("#sum-subtotal", formatPrice(subtotal));
    setText("#sum-shipping", shipping === 0 ? "Free" : formatPrice(shipping));
    setText("#sum-total", formatPrice(subtotal + shipping));

    var note = document.querySelector("#free-ship-note");
    if (note) {
      if (shipping === 0) {
        note.textContent = "Complimentary insured delivery included.";
      } else {
        note.textContent = "Add " + formatPrice(MAHSERI_STORE.freeShippingThreshold - subtotal) +
          " more for complimentary delivery.";
      }
    }
  }

  function initCart() {
    renderCartPage();
    bindCartLineEvents(document.querySelector("#cart-lines"));

    var citySel = document.querySelector("#co-city");
    if (citySel) {
      citySel.innerHTML = MAHSERI_STORE.cities.map(function (c) {
        return "<option>" + c + "</option>";
      }).join("");
    }

    var form = document.querySelector("#checkout-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!loadCart().length) { toast("Your bag is empty"); return; }

      var data = new FormData(form);
      var orderNo = "MJ-" + Date.now().toString(36).toUpperCase();
      var items = loadCart();
      var subtotal = cartSubtotal();
      var shipping = shippingFor(subtotal);
      var summaryLines = items.map(function (it) {
        var p = getProduct(it.id);
        return "- " + p.name + " x" + it.qty + " (" + formatPrice(p.price * it.qty) + ")";
      });

      var payment = data.get("payment");
      if (payment === "whatsapp") {
        var msg = [
          "Hello Mahseri Jewellery, I would like to place order " + orderNo + ":",
          summaryLines.join("\n"),
          "Total: " + formatPrice(subtotal + shipping),
          "Name: " + data.get("name"),
          "Phone: " + data.get("phone"),
          "City: " + data.get("city"),
          "Address: " + data.get("address")
        ].join("\n");
        window.open("https://wa.me/" + MAHSERI_STORE.whatsapp + "?text=" + encodeURIComponent(msg), "_blank");
      }

      cartClear();
      var layout = document.querySelector("#cart-layout");
      if (layout) layout.style.display = "none";
      var success = document.querySelector("#order-success");
      if (success) {
        success.style.display = "block";
        setText("#order-no", "Order " + orderNo);
        setText(
          "#order-msg",
          "Thank you, " + data.get("name").split(" ")[0] +
          ". Our concierge will call " + data.get("phone") +
          " within working hours to confirm delivery to " + data.get("city") + "."
        );
        if (success.scrollIntoView) success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  /* ---------- Page: about ---------- */

  function initAbout() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;
    if (!("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        el.textContent = parseInt(el.dataset.count, 10).toLocaleString() + (el.dataset.suffix || "");
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = parseInt(el.dataset.count, 10);
        var suffix = el.dataset.suffix || "";
        var start = performance.now();
        var duration = 1600;
        function tick(now) {
          var t = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Page: contact ---------- */

  function initContact() {
    var form = document.querySelector("#contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.querySelector("#contact-status");
      var name = new FormData(form).get("name") || "";
      if (status) {
        status.textContent =
          "Thank you" + (name ? ", " + name.split(" ")[0] : "") +
          " — your message is with us. We reply within one working day.";
      }
      form.reset();
      toast("Message sent — we will be in touch");
    });
  }

  /* ---------- Boot ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    buildDrawer();
    renderCartUI();
    initReveal();

    document.querySelectorAll(".cart-button").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openDrawer();
      });
    });

    var drawer = document.querySelector(".cart-drawer");
    if (drawer) bindCartLineEvents(drawer);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });

    var page = document.body.getAttribute("data-page");
    if (page === "home") initHome();
    if (page === "shop") initShop();
    if (page === "product") initProduct();
    if (page === "cart") initCart();
    if (page === "about") initAbout();
    if (page === "contact") initContact();

    var yearEl = document.querySelector("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });
})();
