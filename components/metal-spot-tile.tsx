import { formatUsdOunce } from "@/src/lib/pricing";
import type { MetalSpot, ProductCollection } from "@/src/lib/types";

export function MetalSpotTile({
  collection,
  spot
}: {
  collection: ProductCollection;
  spot: MetalSpot | null;
}) {
  if (collection !== "gold" && collection !== "silver") return null;

  const isGold = collection === "gold";
  const value = spot ? (isGold ? spot.xauUsdRaw || spot.xauUsd : spot.xagUsd) : null;
  const source = spot ? (isGold ? spot.xauSource : spot.xagSource) : null;
  const label = isGold ? "Gold now" : "Silver now";

  return (
    <aside className="metal-spot-tile spot-card" aria-live="polite">
      <span className="spot-tile-label">{label}</span>
      <strong>{formatUsdOunce(value)}</strong>
      <span className="spot-tile-meta">{source || "Spot unavailable"}</span>
    </aside>
  );
}
