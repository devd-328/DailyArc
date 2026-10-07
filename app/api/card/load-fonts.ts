import type { WrappedCardData } from "@/lib/wrapped";

type FontFile = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 700;
  style: "normal";
};

const cache = new Map<string, Promise<ArrayBuffer>>();

/** Safari 5 UA so Google Fonts returns TTF/OTF, which ImageResponse accepts. */
const FONT_UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

export async function loadCardFonts(card: WrappedCardData): Promise<FontFile[]> {
  const text = fontText(card);
  const [dela, zen500, zen700] = await Promise.all([
    loadGoogleFont("Dela Gothic One", 400, text),
    loadGoogleFont("Zen Kaku Gothic New", 500, text),
    loadGoogleFont("Zen Kaku Gothic New", 700, text),
  ]);
  return [
    { name: "Dela Gothic One", data: dela, weight: 400, style: "normal" },
    { name: "Zen Kaku Gothic New", data: zen500, weight: 500, style: "normal" },
    { name: "Zen Kaku Gothic New", data: zen700, weight: 700, style: "normal" },
  ];
}

function fontText(card: WrappedCardData): string {
  const raw = [
    card.username,
    card.watcherTypeLabel,
    card.watcherLine,
    ...card.topGenres,
    card.hotTake?.title ?? "",
    "DailyArc Hours Episodes Completed Top genres Hot take Level rank Anime Wrapped for domain.tld",
    "0123456789,%. -",
  ].join("");
  return [...new Set(raw)].join("");
}

async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const key = `${family}:${weight}:${text}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const pending = (async () => {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await fetch(cssUrl, { headers: { "User-Agent": FONT_UA } }).then((res) => {
      if (!res.ok) throw new Error(`Font CSS ${family} ${res.status}`);
      return res.text();
    });
    const match = /src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/.exec(css);
    if (!match) throw new Error(`No TTF for ${family} ${weight}`);
    const font = await fetch(match[1]);
    if (!font.ok) throw new Error(`Font file ${family} ${font.status}`);
    return font.arrayBuffer();
  })();

  cache.set(key, pending);
  return pending;
}
