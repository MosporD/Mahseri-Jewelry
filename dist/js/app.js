/* ============================================================
   Mahseri Jewellery — storefront application
   Cart (localStorage), shared chrome, and per-page behaviour.
   ============================================================ */

(function () {
  "use strict";

  var CART_KEY = "mahseri_cart_v1";
  var LANG_KEY = "mahseri_lang_v1";

  var UI = {
    en: {
      addToBag: "Add to bag",
      inStock: "In stock",
      outOfStock: "Out of stock",
      soldOut: "Sold out",
      shipsIn: "Ships in 1–2 days",
      madeToOrder: "Made to order",
      yourBag: "Your Bag",
      bagEmpty: "Your bag is empty — for now.",
      subtotal: "Subtotal",
      reviewCheckout: "Review & checkout",
      remove: "Remove",
      each: "each",
      pieces: "pieces",
      piece: "piece",
      noMatch: "No pieces match that combination — try another filter.",
      addedToBag: " added to your bag",
      added: "Added to your bag",
      bagIsEmpty: "Your bag is empty",
      genderHer: "Her",
      genderHim: "Him",
      genderBoth: "Both",
      allCategories: "All",
      metalGold: "Gold",
      metalSilver: "Silver",
      metalGems: "Gems",
      shopHubTitle: "The Collection",
      shopHubDesc: "Every piece is handcrafted in our Amman atelier. Begin with gold, silver, or precious gems.",
      shopHubEyebrow: "Choose your collection",
      shopHubHeadline: "Gold, silver or gems — one standard of craft",
      shopHubGoldSub: "21K & 18K",
      shopHubSilverSub: "925 Sterling",
      shopHubGemsSub: "Precious stones",
      shopGoldTitle: "Gold Collection",
      shopGoldDesc: "21K and 18K pieces handcrafted in our Amman atelier — dense, warm, and hallmarked for purity.",
      shopSilverTitle: "Silver Collection",
      shopSilverDesc: "925 sterling pieces — river-smooth polish, sculptural silhouettes, and the same patient hand finish as our gold.",
      shopGemsTitle: "Precious Gems",
      shopGemsDesc: "Rubies, emeralds, sapphires, diamonds and pearls — selected for colour, clarity and character.",
      gemType: "Gem type",
      allGemTypes: "All gems",
      filters: "Filters",
      shopFor: "Shop for",
      category: "Category",
      karat: "Karat",
      sort: "Sort",
      everyone: "Everyone",
      allGold: "All gold",
      collectionsEyebrow: "The Collections",
      collectionsHeadline: "Every category, one standard of craft",
      categoryBlurbs: {
        Necklaces: "Chains & pendants",
        Rings: "Bands & signets",
        Bracelets: "Cuffs & bangles",
        Earrings: "Studs & hoops",
        Brooches: "Pins & clasps",
        "Nose Jewellery": "Rings & studs",
        Anklets: "Fine chain & beads",
        "Leg Chains": "Ankle to ankle",
        "Navel Rings": "Curved & set",
        "Full Set": "Complete matching set",
        "Half Set": "Necklace & earrings",
        "3 Piece Set": "Ring, chain & earrings"
      },
      categories: {
        Necklaces: "Necklaces",
        Rings: "Rings",
        Bracelets: "Bracelets",
        Earrings: "Earrings",
        Brooches: "Brooches",
        "Nose Jewellery": "Nose Jewellery",
        Anklets: "Anklets",
        "Leg Chains": "Leg Chains",
        "Navel Rings": "Navel Rings",
        "Full Set": "Full Set",
        "Half Set": "Half Set",
        "3 Piece Set": "3 Piece Set"
      },
      gemTypes: {
        Ruby: "Ruby",
        Emerald: "Emerald",
        Sapphire: "Sapphire",
        Diamond: "Diamond",
        Pearl: "Pearl",
        "Semi-Precious": "Semi-Precious"
      },
      materials: {
        "21K Gold": "21K Gold", "18K Gold": "18K Gold", "925 Silver": "925 Silver"
      },
      badges: {
        New: "New", Bestseller: "Bestseller", Signature: "Signature"
      }
    },
    ar: {
      addToBag: "أضف إلى الحقيبة",
      inStock: "متوفر",
      outOfStock: "غير متوفر",
      soldOut: "نفدت الكمية",
      shipsIn: "الشحن خلال 1–2 يوم",
      madeToOrder: "حسب الطلب",
      yourBag: "حقيبتك",
      bagEmpty: "حقيبتك فارغة — حتى الآن.",
      subtotal: "المجموع الفرعي",
      reviewCheckout: "مراجعة الطلب والدفع",
      remove: "إزالة",
      each: "للقطعة",
      pieces: "قطع",
      piece: "قطعة",
      noMatch: "لا توجد قطع مطابقة — جرّب فلتراً آخر.",
      addedToBag: " أُضيفت إلى حقيبتك",
      added: "أُضيفت إلى حقيبتك",
      bagIsEmpty: "حقيبتك فارغة",
      genderHer: "لها",
      genderHim: "له",
      genderBoth: "للجنسين",
      allCategories: "الكل",
      metalGold: "ذهب",
      metalSilver: "فضة",
      metalGems: "أحجار كريمة",
      shopHubTitle: "المجموعة",
      shopHubDesc: "كل قطعة مصنوعة يدوياً في مشغلنا في عمّان. ابدأ بالذهب أو الفضة أو الأحجار الكريمة.",
      shopHubEyebrow: "اختر المجموعة",
      shopHubHeadline: "ذهب أو فضة أو أحجار — معيار حرفة واحد",
      shopHubGoldSub: "21 و 18 قيراط",
      shopHubSilverSub: "فضة 925",
      shopHubGemsSub: "أحجار كريمة",
      shopGoldTitle: "مجموعة الذهب",
      shopGoldDesc: "قطع من الذهب 21 و 18 قيراط — كثيفة ودافئة ومختومة للنقاء.",
      shopSilverTitle: "مجموعة الفضة",
      shopSilverDesc: "قطع من الفضة 925 — لمعان ناعم وخطوط نحتية ونفس إتقان مشغلنا.",
      shopGemsTitle: "الأحجار الكريمة",
      shopGemsDesc: "ياقوت وزمرد وياقوت أزرق وألماس ولؤلؤ — مختارة للونها ونقائها.",
      gemType: "نوع الحجر",
      allGemTypes: "كل الأحجار",
      filters: "تصفية",
      shopFor: "تسوق لـ",
      category: "الفئة",
      karat: "العيار",
      sort: "ترتيب",
      everyone: "الجميع",
      allGold: "كل الذهب",
      collectionsEyebrow: "المجموعات",
      collectionsHeadline: "كل فئة، معيار حرفة واحد",
      categoryBlurbs: {
        Necklaces: "سلاسل وقلادات",
        Rings: "خواتم وخواتم ختم",
        Bracelets: "أساور وبانجل",
        Earrings: "حلق وأقراط",
        Brooches: "بروش ودبوس",
        "Nose Jewellery": "حلق الأنف",
        Anklets: "خلاخيل وخرز",
        "Leg Chains": "سلاسل الرجل",
        "Navel Rings": "حلق السرة",
        "Full Set": "طقم كامل متكامل",
        "Half Set": "قلادة وأقراط",
        "3 Piece Set": "خاتم وسلسلة وأقراط"
      },
      categories: {
        Necklaces: "قلادات",
        Rings: "خواتم",
        Bracelets: "أساور",
        Earrings: "أقراط",
        Brooches: "بروش",
        "Nose Jewellery": "حلي الأنف",
        Anklets: "خلاخيل",
        "Leg Chains": "سلاسل الرجل",
        "Navel Rings": "حلق السرة",
        "Full Set": "طقم كامل",
        "Half Set": "نصف طقم",
        "3 Piece Set": "طقم 3 قطع"
      },
      gemTypes: {
        Ruby: "ياقوت",
        Emerald: "زمرد",
        Sapphire: "ياقوت أزرق",
        Diamond: "ألماس",
        Pearl: "لؤلؤ",
        "Semi-Precious": "أحجار شبه كريمة"
      },
      materials: {
        "21K Gold": "ذهب 21 قيراط", "18K Gold": "ذهب 18 قيراط", "925 Silver": "فضة 925"
      },
      badges: {
        New: "جديد", Bestseller: "الأكثر مبيعاً", Signature: "مميز"
      }
    }
  };

  function getLang() {
    return localStorage.getItem(LANG_KEY) === "ar" ? "ar" : "en";
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang === "ar" ? "ar" : "en");
    applyDocumentLang();
    document.dispatchEvent(new CustomEvent("mahseri:lang-changed"));
  }

  function applyDocumentLang() {
    var lang = getLang();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("lang-ar", lang === "ar");
    var btn = document.querySelector(".lang-toggle");
    if (btn) btn.textContent = lang === "ar" ? "EN" : "ع";
  }

  function t(key) {
    var lang = getLang();
    return (UI[lang] && UI[lang][key]) || UI.en[key] || key;
  }

  function pName(p) {
    return getLang() === "ar" && p.name_ar ? p.name_ar : p.name;
  }

  function pDesc(p) {
    return getLang() === "ar" && p.description_ar ? p.description_ar : p.description;
  }

  function labelCategory(cat) {
    var lang = getLang();
    return (UI[lang].categories && UI[lang].categories[cat]) || cat;
  }

  function labelMaterial(mat) {
    var lang = getLang();
    return (UI[lang].materials && UI[lang].materials[mat]) || mat;
  }

  function labelGender(g) {
    if (g === "Her") return t("genderHer");
    if (g === "Him") return t("genderHim");
    return t("genderBoth");
  }

  function labelBadge(b) {
    if (!b) return "";
    var lang = getLang();
    return (UI[lang].badges && UI[lang].badges[b]) || b;
  }

  function labelCategoryBlurb(cat) {
    var lang = getLang();
    return (UI[lang].categoryBlurbs && UI[lang].categoryBlurbs[cat]) || "";
  }

  function labelGemType(type) {
    var lang = getLang();
    return (UI[lang].gemTypes && UI[lang].gemTypes[type]) || type;
  }

  function isGemProduct(p) {
    return p.collection === "gems" || p.category === "Precious Stones";
  }

  function productTypeLabel(p) {
    return isGemProduct(p) ? labelGemType(p.category) : labelCategory(p.category);
  }

  function orderItemName(p) {
    return p.name_ar ? p.name + " / " + p.name_ar : p.name;
  }

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

  /* Category / product line art loaded from assets/art/ */
  var ART_ASSETS = {
    brooch: "assets/art/brooch.svg",
    nose: "assets/art/nose.svg",
    anklet: "assets/art/anklet.svg",
    legchain: "assets/art/leg-chains.svg",
    navel: "assets/art/navel-ring.svg",
    gemstone: "assets/art/precious-stone.svg",
    fullset: "assets/art/full-set.svg",
    halfset: "assets/art/half-set.svg",
    set3: "assets/art/three-piece-set.svg"
  };

  function artMarkup(key) {
    if (ART_ASSETS[key]) {
      return (
        '<img class="art-line" src="' + ART_ASSETS[key] + '" alt="" aria-hidden="true" loading="lazy" />'
      );
    }
    return ART[key] || ART.ring;
  }

  function artFor(product) {
    return artMarkup(product.art);
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

  function productInStock(p) {
    return p && p.inStock !== false;
  }

  function cartAdd(id, qty) {
    var product = getProduct(id);
    if (product && !productInStock(product)) {
      toast(t("soldOut"));
      return;
    }
    var items = loadCart();
    var line = items.find(function (it) { return it.id === id; });
    if (line) { line.qty += qty; } else { items.push({ id: id, qty: qty }); }
    saveCart(items);
    if (product) toast(pName(product) + t("addedToBag"));
    else toast(t("added"));
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
      var navShell = document.querySelector(".nav-shell");
      var navActions = document.querySelector(".nav-actions");
      var mobileNav = window.matchMedia("(max-width: 760px)");

      function placeNavForViewport() {
        if (mobileNav.matches) {
          if (nav.parentElement !== document.body) document.body.appendChild(nav);
        } else if (navShell && navActions && nav.parentElement !== navShell) {
          closeNav();
          navShell.insertBefore(nav, navActions);
          nav.classList.remove("open", "dragging");
          nav.style.transform = "";
        }
      }

      var backdrop = document.querySelector(".nav-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "nav-backdrop";
        backdrop.setAttribute("aria-hidden", "true");
        document.body.appendChild(backdrop);
      }

      var touchStartX = 0;
      var touchDeltaX = 0;
      var dragging = false;
      var scrollY = 0;

      function setNavOpen(open) {
        if (open) {
          scrollY = window.scrollY;
          document.body.style.top = "-" + scrollY + "px";
          nav.classList.remove("dragging");
          nav.style.transform = "";
          nav.setAttribute("aria-hidden", "false");
          backdrop.classList.add("visible");
          document.body.classList.add("nav-open");
          requestAnimationFrame(function () {
            nav.classList.add("open");
          });
        } else {
          document.body.style.top = "";
          window.scrollTo(0, scrollY);
          nav.classList.remove("open", "dragging");
          nav.style.transform = "";
          nav.setAttribute("aria-hidden", "true");
          backdrop.classList.remove("visible");
          document.body.classList.remove("nav-open");
        }
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      }

      function closeNav() { setNavOpen(false); }

      toggle.addEventListener("click", function () {
        setNavOpen(!nav.classList.contains("open"));
      });
      backdrop.addEventListener("click", closeNav);
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeNav);
      });

      nav.addEventListener("touchstart", function (e) {
        if (!nav.classList.contains("open")) return;
        touchStartX = e.touches[0].clientX;
        touchDeltaX = 0;
        dragging = true;
        nav.classList.add("dragging");
      }, { passive: true });

      nav.addEventListener("touchmove", function (e) {
        if (!dragging) return;
        touchDeltaX = Math.max(0, e.touches[0].clientX - touchStartX);
        nav.style.transform = "translate3d(" + touchDeltaX + "px, 0, 0)";
      }, { passive: true });

      function endNavDrag() {
        if (!dragging) return;
        dragging = false;
        nav.classList.remove("dragging");
        if (touchDeltaX > 72) closeNav();
        else nav.style.transform = "";
        touchDeltaX = 0;
      }

      nav.addEventListener("touchend", endNavDrag, { passive: true });
      nav.addEventListener("touchcancel", endNavDrag, { passive: true });

      backdrop.addEventListener("touchstart", function (e) {
        if (!nav.classList.contains("open")) return;
        touchStartX = e.touches[0].clientX;
        touchDeltaX = 0;
        dragging = true;
      }, { passive: true });

      backdrop.addEventListener("touchmove", function (e) {
        if (!dragging) return;
        touchDeltaX = Math.max(0, e.touches[0].clientX - touchStartX);
        nav.classList.add("dragging");
        nav.style.transform = "translate3d(" + touchDeltaX + "px, 0, 0)";
      }, { passive: true });

      backdrop.addEventListener("touchend", endNavDrag, { passive: true });
      backdrop.addEventListener("touchcancel", endNavDrag, { passive: true });

      placeNavForViewport();
      if (mobileNav.addEventListener) mobileNav.addEventListener("change", placeNavForViewport);
      else if (mobileNav.addListener) mobileNav.addListener(placeNavForViewport);
    }

    // Highlight current page in nav
    var page = document.body.getAttribute("data-page");
    var navPage = page === "shop-hub" ? "shop" : page;
    document.querySelectorAll(".site-nav a[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === navPage) a.classList.add("active");
    });

    var actions = document.querySelector(".nav-actions");
    if (actions && !document.querySelector(".lang-toggle")) {
      var langBtn = document.createElement("button");
      langBtn.className = "lang-toggle";
      langBtn.type = "button";
      langBtn.setAttribute("aria-label", "Switch language");
      langBtn.textContent = getLang() === "ar" ? "EN" : "ع";
      langBtn.addEventListener("click", function () {
        setLang(getLang() === "ar" ? "en" : "ar");
      });
      var cartBtn = actions.querySelector(".cart-button");
      if (cartBtn) actions.insertBefore(langBtn, cartBtn);
      else actions.appendChild(langBtn);
    }
    applyDocumentLang();
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
      '  <h3>' + t("yourBag") + '</h3>' +
      '  <button class="drawer-close" aria-label="Close bag">&times;</button>' +
      "</div>" +
      '<div class="drawer-items"></div>' +
      '<div class="drawer-foot">' +
      '  <div class="drawer-total"><span>' + t("subtotal") + '</span><span class="drawer-subtotal">0 JOD</span></div>' +
      '  <a class="btn btn-solid btn-wide" href="cart.html">' + t("reviewCheckout") + '</a>' +
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
        wrap.innerHTML = '<p class="drawer-empty">' + t("bagEmpty") + '</p>';
      } else {
        wrap.innerHTML = items.map(function (it) {
          var p = getProduct(it.id);
          return (
            '<div class="cart-line" data-id="' + p.id + '">' +
            '  <a class="cl-thumb" href="product.html?id=' + p.id + '">' + artFor(p) + "</a>" +
            '  <div>' +
            '    <h4><a href="product.html?id=' + p.id + '">' + pName(p) + "</a></h4>" +
            '    <p class="cl-meta">' + labelMaterial(p.material) + "</p>" +
            '    <div class="cl-qty">' +
            '      <button data-act="dec" aria-label="Decrease quantity">&minus;</button>' +
            "      <span>" + it.qty + "</span>" +
            '      <button data-act="inc" aria-label="Increase quantity">+</button>' +
            "    </div>" +
            "  </div>" +
            '  <div>' +
            '    <p class="cl-price">' + formatPrice(p.price * it.qty) + "</p>" +
            '    <button class="cl-remove" data-act="remove">' + t("remove") + '</button>' +
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

  function initReveal(scope) {
    var els = scope
      ? scope.querySelectorAll(".reveal")
      : document.querySelectorAll(".reveal:not([data-reveal-init])");
    if (!els.length) return;
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
    els.forEach(function (el) {
      el.dataset.revealInit = "1";
      if (el.classList.contains("visible")) return;
      io.observe(el);
    });
  }

  function encodeImagePath(path) {
    if (!path || path.indexOf("data:") === 0 || /^https?:\/\//i.test(path)) return path;
    return path.split("/").map(function (seg) { return encodeURIComponent(seg); }).join("/");
  }

  var SITE_ORIGIN = "https://mahserijewellery.com";
  var DEFAULT_OG_IMAGE = SITE_ORIGIN + "/assets/standalone/Fullset.jpg";

  function absoluteSiteUrl(path) {
    return SITE_ORIGIN + "/" + String(path || "").replace(/^\//, "");
  }

  function absoluteImageUrl(path) {
    if (!path) return DEFAULT_OG_IMAGE;
    if (/^https?:\/\//i.test(path)) return path;
    return absoluteSiteUrl(encodeImagePath(path));
  }

  function setMetaContent(selector, content) {
    var el = document.querySelector(selector);
    if (el && content != null) el.setAttribute("content", content);
  }

  function updatePageSeo(opts) {
    if (opts.title) document.title = opts.title;
    setMetaContent('meta[name="description"]', opts.description);
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon && opts.url) canon.setAttribute("href", opts.url);
    setMetaContent('meta[property="og:title"]', opts.title);
    setMetaContent('meta[property="og:description"]', opts.description);
    setMetaContent('meta[property="og:url"]', opts.url);
    setMetaContent('meta[property="og:image"]', opts.image);
    if (opts.type) setMetaContent('meta[property="og:type"]', opts.type);
    setMetaContent('meta[name="twitter:title"]', opts.title);
    setMetaContent('meta[name="twitter:description"]', opts.description);
    setMetaContent('meta[name="twitter:image"]', opts.image);
  }

  function productDetailMedia(p) {
    var displayName = pName(p);
    if (p.image) {
      return (
        '<img class="pd-img" src="' + encodeImagePath(p.image) + '" alt="' + displayName + '" />' +
        '<span class="pd-art-fallback" aria-hidden="true">' + artFor(p) + "</span>"
      );
    }
    return artFor(p);
  }

  function renderProductMedia(product) {
    var media = document.querySelector("#pd-media");
    if (!media) return;
    media.classList.remove("zoomed");
    var hintText = (media.querySelector(".pd-zoom-hint") || {}).textContent || "Click to zoom";
    media.innerHTML = productDetailMedia(product);
    var hint = document.createElement("span");
    hint.className = "pd-zoom-hint";
    hint.textContent = hintText;
    media.appendChild(hint);
  }

  function productCard(p, revealDelay) {
    var displayName = pName(p);
    var inStock = productInStock(p);
    var mediaContent = p.image
      ? '<img class="pc-img" src="' + encodeImagePath(p.image) + '" alt="' + displayName + '" loading="lazy" />' +
        '<span class="pc-art-fallback" aria-hidden="true">' + artFor(p) + "</span>"
      : artFor(p);
    var genderTag = p.gender && p.gender !== "Both"
      ? '<span class="pc-gender pc-gender-' + p.gender.toLowerCase() + '">' + labelGender(p.gender) + "</span>"
      : "";
    var stockClass = inStock ? "" : " pc-out-of-stock";
    var quickBtn = inStock
      ? '<button class="pc-quick" data-add="' + p.id + '">' + t("addToBag") + "</button>"
      : '<span class="pc-stock-badge">' + t("outOfStock") + "</span>";
    return (
      '<article class="product-card reveal' + stockClass + (revealDelay ? " reveal-delay-" + revealDelay : "") + '">' +
      '  <div class="pc-media">' +
      (p.badge ? '<span class="pc-badge">' + labelBadge(p.badge) + "</span>" : "") +
      genderTag +
      '    <a href="product.html?id=' + p.id + '" aria-label="' + displayName + '">' + mediaContent + "</a>" +
      "    " + quickBtn +
      "  </div>" +
      '  <div class="pc-body">' +
      '    <p class="pc-cat">' + productTypeLabel(p) + "</p>" +
      "    <h3><a href=\"product.html?id=" + p.id + '">' + displayName + "</a></h3>" +
      '    <p class="pc-material">' + labelMaterial(p.material) + " &middot; " + p.weight + "</p>" +
      '    <p class="pc-price">' + formatPrice(p.price) + "</p>" +
      '    <p class="pc-availability' + (inStock ? " in-stock" : " out-of-stock") + '">' +
      (inStock ? t("inStock") : t("outOfStock")) + "</p>" +
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

  var CATEGORY_ART = {
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

  function shopLinkForCategory(cat) {
    var items = MAHSERI_PRODUCTS.filter(function (p) { return p.category === cat; });
    var goldMats = ["21K Gold", "18K Gold"];
    var silverMats = ["925 Silver"];
    var hasGold = items.some(function (p) { return goldMats.indexOf(p.material) > -1; });
    var hasSilver = items.some(function (p) { return silverMats.indexOf(p.material) > -1; });
    var base = hasGold ? "shop-gold.html" : hasSilver ? "shop-silver.html" : "shop-gold.html";
    return base + "?category=" + encodeURIComponent(cat);
  }

  function applyHomeCollectionsI18n() {
    setText("#collections-eyebrow", t("collectionsEyebrow"));
    setText("#collections-headline", t("collectionsHeadline"));
  }

  function renderCollectionGrid() {
    var grid = document.querySelector("#collection-grid");
    if (!grid || typeof MAHSERI_CATEGORIES === "undefined") return;
    grid.innerHTML = MAHSERI_CATEGORIES.map(function (cat, i) {
      var artKey = CATEGORY_ART[cat] || "ring";
      var art = artMarkup(artKey);
      var delay = i % 4;
      return (
        '<a class="collection-card reveal' + (delay ? " reveal-delay-" + delay : "") +
        '" href="' + shopLinkForCategory(cat) + '">' +
        '<div class="cc-art">' + art + "</div>" +
        '<div class="cc-veil"></div>' +
        '<span class="cc-arrow">&rarr;</span>' +
        '<div class="cc-info"><h3>' + labelCategory(cat) + "</h3>" +
        "<p>" + labelCategoryBlurb(cat) + "</p></div></a>"
      );
    }).join("");
    initReveal(grid);
  }

  function renderFeaturedGrid() {
    var grid = document.querySelector("#featured-grid");
    if (!grid) return;
    var featured = MAHSERI_PRODUCTS.slice()
      .sort(function (a, b) { return (b.badge ? 1 : 0) - (a.badge ? 1 : 0); })
      .slice(0, 4);
    if (!featured.length) {
      grid.innerHTML =
        '<p class="empty-note" style="grid-column:1/-1;text-align:center">' +
        'Pieces coming soon — <a href="shop.html">explore the collection</a>.' +
        "</p>";
      return;
    }
    grid.innerHTML = featured.map(function (p, i) { return productCard(p, i % 4); }).join("");
    bindQuickAdd(grid);
    initReveal(grid);
  }

  function initHome() {
    applyHomeCollectionsI18n();
    renderCollectionGrid();
    renderFeaturedGrid();
    var heroViewer = document.querySelector("#hero-viewer");
    if (heroViewer) {
      var heroCardText = document.querySelector("#hero-card-text");
      var heroDots = document.querySelector("#hero-dots");
      var heroPrev = document.querySelector("#hero-prev");
      var heroNext = document.querySelector("#hero-next");
      var heroProducts = MAHSERI_PRODUCTS.slice(0, 6);
      if (!heroProducts.length) heroProducts = MAHSERI_PRODUCTS.slice(0, 1);
      heroViewer.innerHTML = heroProducts.map(function (p, idx) {
        var media = p.image
          ? '<img src="' + encodeImagePath(p.image) + '" alt="' + pName(p) + '"/>'
          : '<div class="art">' + artFor(p) + '</div>';
        return (
          '<a class="hero-slide' + (idx === 0 ? " active" : "") + '" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
          media +
          "</a>"
        );
      }).join("");
      if (heroDots) {
        heroDots.innerHTML = heroProducts.map(function (p, idx) {
          return '<button type="button" data-hero-dot="' + idx + '" aria-label="Show ' + pName(p) + '"' +
            (idx === 0 ? ' class="active"' : "") + "></button>";
        }).join("");
      }
      var heroSlides = heroViewer.querySelectorAll(".hero-slide");
      var currentHero = 0;
      var heroTimer = null;
      function showHeroSlide(i) {
        if (!heroSlides.length) return;
        currentHero = (i + heroSlides.length) % heroSlides.length;
        heroSlides.forEach(function (s, idx) { s.classList.toggle("active", idx === currentHero); });
        if (heroDots) {
          heroDots.querySelectorAll("button").forEach(function (d, idx) {
            d.classList.toggle("active", idx === currentHero);
          });
        }
        if (heroCardText) {
          var hp = heroProducts[currentHero];
          heroCardText.textContent = pName(hp) + " \u00b7 " + labelMaterial(hp.material);
        }
      }
      function restartHeroTimer() {
        if (heroTimer) clearInterval(heroTimer);
        heroTimer = setInterval(function () { showHeroSlide(currentHero + 1); }, 5000);
      }
      if (heroPrev) heroPrev.addEventListener("click", function () { showHeroSlide(currentHero - 1); restartHeroTimer(); });
      if (heroNext) heroNext.addEventListener("click", function () { showHeroSlide(currentHero + 1); restartHeroTimer(); });
      if (heroDots) {
        heroDots.addEventListener("click", function (e) {
          var dot = e.target.closest("[data-hero-dot]");
          if (!dot) return;
          showHeroSlide(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
          restartHeroTimer();
        });
      }
      showHeroSlide(0);
      restartHeroTimer();
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

  var GOLD_MATERIALS = ["21K Gold", "18K Gold"];
  var SILVER_MATERIALS = ["925 Silver"];

  var shopState = { category: "All", material: "All", gender: "All", sort: "featured" };
  var shopCategoryFiltersReady = false;

  /* Her collection category photos — assets/standalone (gold; silver map added later) */
  var HER_CATEGORY_BG_GOLD = {
    Necklaces: "assets/standalone/Necklaces.jpg",
    Rings: "assets/standalone/Rings.jpg",
    Bracelets: "assets/standalone/Bracelets.jpg",
    Earrings: "assets/standalone/Earings.jpg",
    Brooches: "assets/standalone/brooches.jpg",
    "Nose Jewellery": "assets/standalone/NoseJewelry.jpg",
    Anklets: "assets/standalone/Anklets.jpg",
    "Leg Chains": "assets/standalone/Legchain.jpg",
    "Navel Rings": "assets/standalone/Naval Rings,jpg.jpg",
    "Full Set": "assets/standalone/Fullset.jpg",
    "Half Set": "assets/standalone/Fullset.jpg",
    "3 Piece Set": "assets/standalone/Fullset.jpg"
  };
  var HER_CATEGORY_BG_SILVER = {};

  function herCategoryBackgroundPath() {
    if (shopState.category === "All" || shopState.gender === "Him") return "";
    var metal = getShopMetal();
    var map = metal === "silver" ? HER_CATEGORY_BG_SILVER : HER_CATEGORY_BG_GOLD;
    if (metal !== "gold" && metal !== "silver") return "";
    return map[shopState.category] || "";
  }

  function applyShopCategoryBackground() {
    var path = herCategoryBackgroundPath();
    var hero = document.querySelector(".page-hero");
    if (!hero) return;

    if (path) {
      hero.classList.add("has-category-bg");
      hero.style.backgroundImage = 'url("' + path.replace(/\\/g, "/") + '")';
      hero.style.backgroundPosition = "center";
      hero.style.backgroundSize = "cover";
      hero.style.backgroundRepeat = "no-repeat";
    } else {
      hero.classList.remove("has-category-bg");
      hero.style.backgroundImage = "";
      hero.style.backgroundPosition = "";
      hero.style.backgroundSize = "";
      hero.style.backgroundRepeat = "";
    }
  }

  function getShopMetal() {
    return document.body.getAttribute("data-shop-metal") || "";
  }

  function matchesShopMetal(product) {
    var metal = getShopMetal();
    var gem = isGemProduct(product);
    if (metal === "gems") return gem;
    if (metal === "gold") {
      return GOLD_MATERIALS.indexOf(product.material) > -1 && !gem;
    }
    if (metal === "silver") {
      return SILVER_MATERIALS.indexOf(product.material) > -1 && !gem;
    }
    return true;
  }

  function shopBasePath() {
    var metal = getShopMetal();
    if (metal === "gold") return "shop-gold.html";
    if (metal === "silver") return "shop-silver.html";
    if (metal === "gems") return "shop-gems.html";
    return "shop.html";
  }

  function shopLinkForProduct(p) {
    if (isGemProduct(p)) return "shop-gems.html?category=" + encodeURIComponent(p.category);
    var goldMats = ["21K Gold", "18K Gold"];
    var base = goldMats.indexOf(p.material) > -1 ? "shop-gold.html" : "shop-silver.html";
    return base + "?category=" + encodeURIComponent(p.category);
  }

  function applyShopHubI18n() {
    setText("#shop-hub-title", t("shopHubTitle"));
    setText("#shop-hub-desc", t("shopHubDesc"));
    setText("#shop-hub-eyebrow", t("shopHubEyebrow"));
    setText("#shop-hub-headline", t("shopHubHeadline"));
    setText("#shop-hub-gold-title", t("metalGold"));
    setText("#shop-hub-gold-sub", t("shopHubGoldSub"));
    setText("#shop-hub-silver-title", t("metalSilver"));
    setText("#shop-hub-silver-sub", t("shopHubSilverSub"));
    setText("#shop-hub-gems-title", t("metalGems"));
    setText("#shop-hub-gems-sub", t("shopHubGemsSub"));
  }

  function applyShopCatalogI18n() {
    var metal = getShopMetal();
    if (metal === "gold") {
      setText("#shop-hero-title", t("shopGoldTitle"));
      setText("#shop-hero-desc", t("shopGoldDesc"));
    } else if (metal === "silver") {
      setText("#shop-hero-title", t("shopSilverTitle"));
      setText("#shop-hero-desc", t("shopSilverDesc"));
    } else if (metal === "gems") {
      setText("#shop-hero-title", t("shopGemsTitle"));
      setText("#shop-hero-desc", t("shopGemsDesc"));
    }
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-chip]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-chip");
      if (key === "genderHer") el.textContent = t("genderHer");
      else if (key === "genderHim") el.textContent = t("genderHim");
      else if (key) el.textContent = t(key);
    });
    document.querySelectorAll(".shop-metal-pill").forEach(function (pill) {
      var link = pill.getAttribute("data-metal-link");
      if (link === "gold") pill.textContent = t("metalGold");
      if (link === "silver") pill.textContent = t("metalSilver");
      if (link === "gems") pill.textContent = t("metalGems");
    });
  }

  function initShopHub() {
    var params = new URLSearchParams(location.search);
    var cat = params.get("category");
    if (cat) {
      if (cat === "Precious Stones" ||
          (typeof MAHSERI_GEM_TYPES !== "undefined" && MAHSERI_GEM_TYPES.indexOf(cat) > -1)) {
        location.replace("shop-gems.html?" + params.toString());
        return;
      }
      location.replace("shop-gold.html?" + params.toString());
      return;
    }
    if (params.get("material") === "925 Silver") {
      location.replace("shop-silver.html?" + params.toString());
      return;
    }
    if (params.get("material") || params.get("gender")) {
      location.replace("shop-gold.html?" + params.toString());
      return;
    }
    applyShopHubI18n();
    initReveal();
  }

  function renderCategoryFilters() {
    var wrap = document.querySelector("#category-filters");
    if (!wrap) return;
    var isGems = getShopMetal() === "gems";
    var list = isGems
      ? (typeof MAHSERI_GEM_TYPES !== "undefined" ? MAHSERI_GEM_TYPES : [])
      : (typeof MAHSERI_CATEGORIES !== "undefined" ? MAHSERI_CATEGORIES : []);
    var allLabel = isGems ? t("allGemTypes") : t("allCategories");
    var html = (
      '<button type="button" class="chip' + (shopState.category === "All" ? " active" : "") +
      '" data-filter-category="All">' + allLabel + "</button>"
    );
    list.forEach(function (cat) {
      var label = isGems ? labelGemType(cat) : labelCategory(cat);
      html += (
        '<button type="button" class="chip' + (shopState.category === cat ? " active" : "") +
        '" data-filter-category="' + cat + '">' + label + "</button>"
      );
    });
    wrap.innerHTML = html;
  }

  function initShop() {
    applyShopCatalogI18n();
    var params = new URLSearchParams(location.search);
    if (params.get("category")) shopState.category = params.get("category");
    if (params.get("material")) shopState.material = params.get("material");
    if (params.get("gender")) shopState.gender = params.get("gender");

    var categoryWrap = document.querySelector("#category-filters");
    if (categoryWrap && !shopCategoryFiltersReady) {
      shopCategoryFiltersReady = true;
      categoryWrap.addEventListener("click", function (e) {
        var chip = e.target.closest("[data-filter-category]");
        if (!chip) return;
        shopState.category = chip.getAttribute("data-filter-category");
        renderCategoryFilters();
        renderShop();
      });
    }
    renderCategoryFilters();

    function bindChips(attr, stateKey) {
      document.querySelectorAll("[data-filter-" + attr + "]").forEach(function (chip) {
        var val = chip.dataset["filter" + attr.charAt(0).toUpperCase() + attr.slice(1)];
        chip.classList.toggle("active", val === shopState[stateKey]);
        chip.addEventListener("click", function () {
          shopState[stateKey] = val;
          document.querySelectorAll("[data-filter-" + attr + "]").forEach(function (c) {
            c.classList.toggle("active", c === chip);
          });
          renderShop();
        });
      });
    }

    bindChips("material", "material");
    bindChips("gender", "gender");

    // Both mobile and desktop sort selects stay in sync
    function bindSort(sel) {
      if (!sel) return;
      sel.value = shopState.sort;
      sel.addEventListener("change", function () {
        shopState.sort = sel.value;
        document.querySelectorAll("#shop-sort, #shop-sort-desktop").forEach(function (s) {
          if (s !== sel) s.value = shopState.sort;
        });
        renderShop();
      });
    }
    bindSort(document.querySelector("#shop-sort"));
    bindSort(document.querySelector("#shop-sort-desktop"));

    // Mobile filter panel toggle
    var toggle = document.querySelector("#filter-toggle");
    var panel = document.querySelector("#shop-filters");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("open");
        toggle.classList.toggle("active", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
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
      var okGen = shopState.gender === "All" ||
        (p.gender === shopState.gender) ||
        (p.gender === "Both");
      return okCat && okMat && okGen && matchesShopMetal(p);
    });

    if (shopState.sort === "price-asc") items.sort(function (a, b) { return a.price - b.price; });
    if (shopState.sort === "price-desc") items.sort(function (a, b) { return b.price - a.price; });
    if (shopState.sort === "name") items.sort(function (a, b) { return a.name.localeCompare(b.name); });

    document.querySelectorAll(".shop-count").forEach(function (el) {
      el.textContent = items.length + " " + (items.length === 1 ? t("piece") : t("pieces"));
    });

    grid.innerHTML = items.length
      ? items.map(function (p, i) { return productCard(p, i % 4); }).join("")
      : '<p class="empty-note" style="grid-column:1/-1">' + t("noMatch") + '</p>';
    applyShopCategoryBackground();
    initReveal();
  }

  /* ---------- Page: product detail ---------- */

  var productQty = 1;
  var productPageReady = false;

  function renderProductContent() {
    var id = new URLSearchParams(location.search).get("id");
    var product = getProduct(id) || MAHSERI_PRODUCTS[0];

    updatePageSeo({
      title: pName(product) + " | Mahseri Jewellery",
      description: pDesc(product),
      url: absoluteSiteUrl("product.html?id=" + encodeURIComponent(product.id)),
      image: absoluteImageUrl(product.image),
      type: "product"
    });
    renderProductMedia(product);
    setText("#pd-category", productTypeLabel(product));
    setText("#pd-name", pName(product));
    setText("#pd-price", formatPrice(product.price));
    setText("#pd-desc", pDesc(product));
    setText("#pd-material", labelMaterial(product.material));
    setText("#pd-weight", product.weight);
    setText("#pd-breadcrumb", pName(product));

    var inStock = productInStock(product);
    var stockEl = document.querySelector("#pd-stock");
    if (stockEl) {
      stockEl.textContent = inStock
        ? t("inStock") + " · " + t("shipsIn")
        : t("outOfStock") + " · " + t("madeToOrder");
      stockEl.classList.toggle("pd-stock-in", inStock);
      stockEl.classList.toggle("pd-stock-out", !inStock);
    }
    var addBtn = document.querySelector("#pd-add");
    if (addBtn) {
      addBtn.disabled = !inStock;
      addBtn.textContent = inStock ? t("addToBag") : t("soldOut");
      addBtn.classList.toggle("is-disabled", !inStock);
    }
    var qtyDec = document.querySelector("#qty-dec");
    var qtyInc = document.querySelector("#qty-inc");
    if (qtyDec) qtyDec.disabled = !inStock;
    if (qtyInc) qtyInc.disabled = !inStock;

    var shopLink = document.querySelector("#pd-shop-link");
    if (shopLink) shopLink.href = shopLinkForProduct(product);

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
      grid.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
    }
    return product;
  }

  function initProduct() {
    var id = new URLSearchParams(location.search).get("id");
    var product = getProduct(id) || MAHSERI_PRODUCTS[0];

    var media = document.querySelector("#pd-media");
    if (media && !media.dataset.zoomBound) {
      media.dataset.zoomBound = "1";
      media.addEventListener("click", function () { media.classList.toggle("zoomed"); });
    }

    if (!productPageReady) {
      productPageReady = true;
      var out = document.querySelector("#pd-qty");
      document.querySelector("#qty-dec").addEventListener("click", function () {
        productQty = Math.max(1, productQty - 1);
        out.textContent = productQty;
      });
      document.querySelector("#qty-inc").addEventListener("click", function () {
        productQty = Math.min(10, productQty + 1);
        out.textContent = productQty;
      });
      document.querySelector("#pd-add").addEventListener("click", function () {
        var pid = new URLSearchParams(location.search).get("id");
        var p = getProduct(pid) || MAHSERI_PRODUCTS[0];
        cartAdd(p.id, productQty);
        openDrawer();
      });
    }

    renderProductContent();
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  /* ---------- Order notifications (Telegram + email invoice) ---------- */

  var PAYMENT_LABELS = {
    cod: "Cash on delivery",
    cliq: "CliQ / bank transfer",
    whatsapp: "WhatsApp confirmation",
    card: "Card — Visa / Mastercard"
  };
  var CONFIRM_DEPOSIT_RATE = 0.4;
  var DEPOSIT_ALIAS_PRIMARY = "MosporD";
  var DEPOSIT_ALIAS_SECONDARY = "00962797157007";

  function paymentNeedsDeposit(payment) {
    return payment === "cod" || payment === "cliq";
  }

  function paymentDeposit(total, payment) {
    if (!paymentNeedsDeposit(payment)) return 0;
    return Math.round(total * CONFIRM_DEPOSIT_RATE * 100) / 100;
  }

  function depositPaymentInfoText() {
    return "Deposit payment aliases: " + DEPOSIT_ALIAS_PRIMARY + " or " + DEPOSIT_ALIAS_SECONDARY + ".";
  }

  function orderText(order) {
    return [
      "🛍 NEW ORDER — " + order.no,
      "",
      order.items.map(function (it) {
        return "• " + it.name + " ×" + it.qty + " — " + formatPrice(it.lineTotal);
      }).join("\n"),
      "",
      "Subtotal: " + formatPrice(order.subtotal),
      "Delivery: " + (order.shipping === 0 ? "Free" : formatPrice(order.shipping)),
      "TOTAL: " + formatPrice(order.total),
      order.depositDue > 0 ? "Deposit (40%): " + formatPrice(order.depositDue) : "",
      order.depositDue > 0 ? "Remaining (60%): " + formatPrice(order.balanceDue) : "",
      order.depositDue > 0 ? depositPaymentInfoText() : "",
      "",
      "Payment: " + (PAYMENT_LABELS[order.payment] || order.payment),
      "Name: " + order.name,
      "Phone: " + order.phone,
      "Email: " + order.email,
      "City: " + order.city,
      "Address: " + order.address,
      order.notes ? "Notes: " + order.notes : ""
    ].join("\n").trim();
  }

  function notifyOrder(order) {
    var cfg = typeof MAHSERI_NOTIFY !== "undefined" ? MAHSERI_NOTIFY : null;
    if (!cfg) return;

    // Telegram message to the owner
    var tg = cfg.telegram;
    if (tg && tg.enabled && tg.botToken && tg.chatId) {
      fetch("https://api.telegram.org/bot" + tg.botToken + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tg.chatId, text: orderText(order) })
      }).catch(function () { /* notification failure must not block the order */ });
    }

    // Branded invoice email via EmailJS (to customer, BCC to the atelier)
    var ej = cfg.emailjs;
    if (ej && ej.enabled && window.emailjs && ej.publicKey && ej.serviceId && ej.templateId) {
      var itemsHtml = order.items.map(function (it) {
        return (
          '<tr>' +
          '<td style="padding:10px 0;border-bottom:1px solid #eee5d0;">' + it.name +
          ' <span style="color:#9b8a66;">&times;' + it.qty + "</span></td>" +
          '<td align="right" style="padding:10px 0;border-bottom:1px solid #eee5d0;">' +
          formatPrice(it.lineTotal) + "</td></tr>"
        );
      }).join("");
      try {
        emailjs.init({ publicKey: ej.publicKey });
        emailjs.send(ej.serviceId, ej.templateId, {
          order_no: order.no,
          order_date: order.date,
          customer_name: order.name,
          customer_phone: order.phone,
          customer_email: order.email,
          city: order.city,
          address: order.address,
          payment_method: PAYMENT_LABELS[order.payment] || order.payment,
          notes: (order.notes || "—") + (order.depositDue > 0
            ? " | Deposit required: " + formatPrice(order.depositDue) + " (40%), Remaining: " + formatPrice(order.balanceDue) +
              ". " + depositPaymentInfoText()
            : ""),
          items_html: itemsHtml,
          subtotal: formatPrice(order.subtotal),
          shipping: order.shipping === 0 ? "Free" : formatPrice(order.shipping),
          total: formatPrice(order.total)
        }).catch(function () { /* ignore */ });
      } catch (e) { /* ignore */ }
    }
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
        '    <h4><a href="product.html?id=' + p.id + '">' + pName(p) + "</a></h4>" +
        '    <p class="cl-meta">' + labelMaterial(p.material) + " &middot; " + formatPrice(p.price) + " " + t("each") + "</p>" +
        '    <div class="cl-qty">' +
        '      <button data-act="dec" aria-label="Decrease quantity">&minus;</button>' +
        "      <span>" + it.qty + "</span>" +
        '      <button data-act="inc" aria-label="Increase quantity">+</button>' +
        "    </div>" +
        "  </div>" +
        '  <div>' +
        '    <p class="cl-price">' + formatPrice(p.price * it.qty) + "</p>" +
        '    <button class="cl-remove" data-act="remove">' + t("remove") + '</button>' +
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
    function refreshDepositNote() {
      var pay = form.querySelector('input[name="payment"]:checked');
      var noteEl = document.querySelector("#deposit-note");
      if (!noteEl) return;
      var subtotal = cartSubtotal();
      var shipping = shippingFor(subtotal);
      var total = subtotal + shipping;
      if (pay && paymentNeedsDeposit(pay.value)) {
        var due = paymentDeposit(total, pay.value);
        var remain = Math.max(0, total - due);
        noteEl.textContent = "Confirmation deposit due now: " + formatPrice(due) +
          " (40%). Remaining: " + formatPrice(remain) + ". " + depositPaymentInfoText();
      } else {
        noteEl.textContent = "";
      }
    }
    form.querySelectorAll('input[name="payment"]').forEach(function (el) {
      el.addEventListener("change", refreshDepositNote);
    });
    var cartLines = document.querySelector("#cart-lines");
    if (cartLines) {
      cartLines.addEventListener("click", function () {
        setTimeout(refreshDepositNote, 0);
      });
    }
    refreshDepositNote();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!loadCart().length) { toast(t("bagIsEmpty")); return; }

      var data = new FormData(form);
      var orderNo = "MJ-" + Date.now().toString(36).toUpperCase();
      var items = loadCart();
      var subtotal = cartSubtotal();
      var shipping = shippingFor(subtotal);
      var payment = data.get("payment");
      var total = subtotal + shipping;
      var depositDue = paymentDeposit(total, payment);

      var order = {
        no: orderNo,
        date: new Date().toLocaleString("en-GB"),
        name: data.get("name"),
        phone: data.get("phone"),
        email: data.get("email"),
        city: data.get("city"),
        address: data.get("address"),
        notes: data.get("notes") || "",
        payment: payment,
        items: items.map(function (it) {
          var p = getProduct(it.id);
          return { name: orderItemName(p), qty: it.qty, price: p.price, lineTotal: p.price * it.qty };
        }),
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        depositDue: depositDue,
        balanceDue: Math.max(0, total - depositDue)
      };

      notifyOrder(order);

      if (payment === "whatsapp") {
        var msg = [
          "Hello Mahseri Jewellery, I would like to place order " + orderNo + ":",
          order.items.map(function (it) {
            return "- " + it.name + " x" + it.qty + " (" + formatPrice(it.lineTotal) + ")";
          }).join("\n"),
          "Total: " + formatPrice(order.total),
          "Name: " + order.name,
          "Phone: " + order.phone,
          "City: " + order.city,
          "Address: " + order.address
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
        var followUp = payment === "card"
          ? " with a secure card payment link and to confirm delivery to " + order.city + "."
          : " within working hours to confirm delivery to " + order.city + ".";
        var depositText = order.depositDue > 0
          ? " To confirm your order, please complete the 40% deposit (" + formatPrice(order.depositDue) +
            "). The remaining 60% (" + formatPrice(order.balanceDue) + ") is due at delivery. " +
            depositPaymentInfoText()
          : "";
        setText(
          "#order-msg",
          "Thank you, " + order.name.split(" ")[0] +
          ". Your invoice is on its way to " + order.email +
          ". Our concierge will contact " + order.phone + followUp + depositText
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

  function refreshPageContent() {
    var page = document.body.getAttribute("data-page");
    renderCartUI();
    if (page === "shop") {
      applyShopCatalogI18n();
      renderCategoryFilters();
      renderShop();
    }
    if (page === "shop-hub") applyShopHubI18n();
    if (page === "cart") renderCartPage();
    if (page === "product") renderProductContent();
    if (page === "home") {
      applyHomeCollectionsI18n();
      renderCollectionGrid();
      renderFeaturedGrid();
    }
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
    if (page === "shop-hub") initShopHub();
    if (page === "shop") initShop();
    if (page === "product") initProduct();
    if (page === "cart") initCart();
    if (page === "about") initAbout();
    if (page === "contact") initContact();

    var yearEl = document.querySelector("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Live metal prices arrived after first render — repaint anything showing a price
    document.addEventListener("mahseri:prices-updated", function () {
      refreshPageContent();
    });

    document.addEventListener("mahseri:lang-changed", function () {
      var drawer = document.querySelector(".cart-drawer");
      if (drawer) {
        var head = drawer.querySelector(".drawer-head h3");
        if (head) head.textContent = t("yourBag");
        var subLabel = drawer.querySelector(".drawer-total span:first-child");
        if (subLabel) subLabel.textContent = t("subtotal");
        var checkout = drawer.querySelector(".drawer-foot .btn");
        if (checkout) checkout.textContent = t("reviewCheckout");
      }
      refreshPageContent();
    });
  });
})();
