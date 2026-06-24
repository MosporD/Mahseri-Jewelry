import "server-only";
import type { MetalSpot, Product } from "./types";

export const pricingConfig = {
  usdToJod: 0.71,
  gramsPerTroyOunce: 31.1034768,
  premiumGold: 1.085,
  premiumSilver: 7,
  goldSpotAddUsd: 30,
  bounds: {
    xau: { min: 800, max: 15000 },
    xag: { min: 5, max: 500 }
  }
};

function perGramJod(usdPerOunce: number) {
  return (usdPerOunce / pricingConfig.gramsPerTroyOunce) * pricingConfig.usdToJod;
}

function validUsdOz(metal: "xau" | "xag", value: unknown) {
  const n = Number(value);
  if (!(n > 0)) return 0;
  const bounds = pricingConfig.bounds[metal];
  if (n < bounds.min || n > bounds.max) return 0;
  return n;
}

async function fetchJson(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 20 * 60 }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchQuotes() {
  const sources = [
    async () => {
      const [gold, silver] = await Promise.all([
        fetchJson("https://api.gold-api.com/price/XAU"),
        fetchJson("https://api.gold-api.com/price/XAG")
      ]);
      return {
        name: "gold-api.com",
        xau: validUsdOz("xau", gold?.price),
        xag: validUsdOz("xag", silver?.price)
      };
    },
    async () => {
      const [gold, silver] = await Promise.all([
        fetchJson("https://api.coinbase.com/v2/prices/XAU-USD/spot"),
        fetchJson("https://api.coinbase.com/v2/prices/XAG-USD/spot")
      ]);
      return {
        name: "Coinbase",
        xau: validUsdOz("xau", gold?.data?.amount),
        xag: validUsdOz("xag", silver?.data?.amount)
      };
    },
    async () => {
      const data = await fetchJson("https://mintedmetal.com/api/prices.json");
      return {
        name: "Minted Metal (LBMA)",
        xau: validUsdOz("xau", data?.metals?.gold?.price),
        xag: validUsdOz("xag", data?.metals?.silver?.price)
      };
    }
  ];

  const settled = await Promise.allSettled(sources.map((source) => source()));
  return settled
    .filter((result): result is PromiseFulfilledResult<{ name: string; xau: number; xag: number }> => {
      return result.status === "fulfilled";
    })
    .map((result) => result.value)
    .filter((quote) => quote.xau > 0 || quote.xag > 0);
}

export async function getMetalSpot(): Promise<MetalSpot> {
  const quotes = await fetchQuotes();
  const picked = quotes.reduce(
    (acc, quote) => {
      if (quote.xau > acc.xau) {
        acc.xau = quote.xau;
        acc.xauSource = quote.name;
      }
      if (quote.xag > acc.xag) {
        acc.xag = quote.xag;
        acc.xagSource = quote.name;
      }
      return acc;
    },
    { xau: 0, xag: 0, xauSource: "", xagSource: "" }
  );

  if (!(picked.xau > 0) || !(picked.xag > 0)) {
    throw new Error("No valid metal spot quotes responded.");
  }

  const xauUsd = picked.xau + pricingConfig.goldSpotAddUsd;
  return {
    gold24: perGramJod(xauUsd),
    silver: perGramJod(picked.xag),
    xauUsd,
    xauUsdRaw: picked.xau,
    xagUsd: picked.xag,
    xauSource: picked.xauSource,
    xagSource: picked.xagSource,
    ts: Date.now()
  };
}

export function computeProductPrice(product: Product, spot: MetalSpot | null) {
  if (!spot) return product.price;
  const weight = Number.parseFloat(product.weight || "");
  if (!(weight > 0)) return product.price;
  const makingFee = Number(product.making_fee ?? product.makingFee ?? 0) || 0;
  const material = product.material;
  let metal = 0;

  if (material === "21K Gold") {
    metal = spot.gold24 * 0.885 * pricingConfig.premiumGold * weight;
  } else if (material === "18K Gold") {
    metal = spot.gold24 * 0.76 * pricingConfig.premiumGold * weight;
  } else if (material === "925 Silver") {
    metal = (spot.silver * 0.925 + pricingConfig.premiumSilver) * weight;
  }

  return metal > 0 ? Math.max(1, Math.round(metal + makingFee)) : product.price;
}

export function formatPrice(value: number) {
  return `${Math.round(value).toLocaleString("en-JO")} JOD`;
}

export function formatUsdOunce(value?: number | null) {
  if (!(Number(value) > 0)) return "Unavailable";
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}/oz`;
}
