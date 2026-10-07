import { cache } from "./config";

export const CARD_FORMATS = ["story", "square"] as const;
export type CardFormat = (typeof CARD_FORMATS)[number];

export const CARD_SIZE = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
} as const;

/** Placeholder until the product domain is decided. From DESIGN_SYSTEM.md. */
export const CARD_URL_MARK = "domain.tld";

export function parseCardFormat(value: string | null): CardFormat | null {
  if (value == null || value === "") return "story";
  if (value === "story" || value === "square") return value;
  return null;
}

export function cardCacheControl(hasProfile: boolean): string {
  const ttl = hasProfile ? cache.cardWithProfileTtlSeconds : cache.cardWithoutProfileTtlSeconds;
  return `public, max-age=${ttl}, s-maxage=${ttl}`;
}

export function cardDownloadName(username: string, format: CardFormat): string {
  return `${username}-${format}.png`;
}

export function formatCardCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function completionLabel(rate: number | null): string {
  return rate == null ? "-" : `${Math.round(rate * 100)}%`;
}
