import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svg = await readFile(path.join(root, "public", "brand", "icon.svg"));
const outDir = path.join(root, "public", "icons");

await mkdir(outDir, { recursive: true });

const sizes = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
];

for (const [name, size] of sizes) {
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: false },
  }).render();

  if (png.width !== size || png.height !== size) {
    throw new Error(`${name} rendered at ${png.width}x${png.height}, expected ${size}x${size}`);
  }

  await writeFile(path.join(outDir, name), png.asPng());
}
