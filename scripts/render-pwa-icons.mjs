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

function renderPng(size) {
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: false },
  }).render();

  if (png.width !== size || png.height !== size) {
    throw new Error(`favicon rendered at ${png.width}x${png.height}, expected ${size}x${size}`);
  }

  return png.asPng();
}

for (const [name, size] of sizes) {
  await writeFile(path.join(outDir, name), renderPng(size));
}

// Browser tabs request /favicon.ico directly. Pack the brand mark so that
// request does not fall back to the default Next.js icon.
const faviconSizes = [16, 32, 48];
const faviconPngs = faviconSizes.map((size) => ({ size, buffer: renderPng(size) }));
await writeFile(path.join(root, "app", "favicon.ico"), icoFromPngs(faviconPngs));

function icoFromPngs(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + 16 * count;
  const entries = [];
  const images = [];

  for (const { size, buffer } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    images.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images]);
}
