/* Mahseri — Telegram product posts (admin + scripts) */

function mahseriTelegramConfig() {
  return typeof MAHSERI_NOTIFY !== "undefined" && MAHSERI_NOTIFY.telegram
    ? MAHSERI_NOTIFY.telegram
    : null;
}

function mahseriProductInStock(p) {
  return p && p.inStock !== false;
}

function mahseriProductScheduled(p) {
  return !!(p && p.telegramSchedule);
}

function mahseriProductHeadline(p) {
  if (p.telegramHeadline && p.telegramHeadline.trim()) return p.telegramHeadline.trim().toUpperCase();
  if (p.badge) return String(p.badge).toUpperCase();
  return "MAHSERI JEWELLERY";
}

function mahseriProductBlurb(p) {
  var text = (p.telegramBlurb || p.description || "").trim();
  if (text.length > 180) return text.slice(0, 177) + "...";
  return text;
}

function mahseriProductShopUrl(p, siteUrl) {
  var base = (siteUrl || "").replace(/\/$/, "");
  if (!base && typeof location !== "undefined") base = location.origin || "";
  return base + "/product.html?id=" + encodeURIComponent(p.id);
}

function mahseriResolveProductImage(p, siteUrl) {
  var img = (p && p.image) || "";
  if (!img || img.indexOf("data:") === 0) return "";
  if (/^https?:\/\//i.test(img)) return img;
  var base = (siteUrl || "").replace(/\/$/, "");
  if (!base && typeof location !== "undefined") base = location.origin || "";
  if (base) return base + "/" + img.replace(/^\//, "");
  return "";
}

function mahseriFormatProductPost(p, siteUrl) {
  var stock = mahseriProductInStock(p) ? "In stock" : "Out of stock";
  var lines = [
    mahseriProductHeadline(p),
    "",
    p.name,
    p.category + " · " + p.material + (p.weight ? " · " + p.weight : ""),
    "",
    mahseriProductBlurb(p),
    "",
    Number(p.price).toLocaleString("en-JO") + " JOD",
    stock,
    "",
    "Shop: " + mahseriProductShopUrl(p, siteUrl)
  ];
  return lines.join("\n");
}

function mahseriTelegramApi(tg, method, body) {
  return fetch("https://api.telegram.org/bot" + tg.botToken + "/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.ok) throw new Error(data.description || "Telegram API error");
      return data;
    });
}

function mahseriPostProductToTelegram(p, opts) {
  var tg = mahseriTelegramConfig();
  if (!tg || !tg.botToken) return Promise.reject(new Error("Telegram not configured"));
  opts = opts || {};
  var chatId = opts.chatId || tg.channelId;
  if (!chatId) return Promise.reject(new Error("No Telegram channelId configured"));
  var siteUrl = opts.siteUrl || tg.siteUrl || "";
  var caption = mahseriFormatProductPost(p, siteUrl);
  var image = mahseriResolveProductImage(p, siteUrl);
  if (image) {
    return mahseriTelegramApi(tg, "sendPhoto", {
      chat_id: chatId,
      photo: image,
      caption: caption
    });
  }
  return mahseriTelegramApi(tg, "sendMessage", {
    chat_id: chatId,
    text: caption,
    disable_web_page_preview: false
  });
}
