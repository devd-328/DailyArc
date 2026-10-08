import { proof } from "./config";

/** Fit a photo inside the upload width. Never upscales. */
export function fittedSize(
  width: number,
  height: number,
  maxWidth = proof.maxWidth,
): { width: number; height: number } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("invalid image size");
  }
  if (width <= maxWidth) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  return {
    width: maxWidth,
    height: Math.max(1, Math.round((height * maxWidth) / width)),
  };
}

/**
 * Re-encode a photo as a small JPEG in the browser.
 * Drawing through a canvas drops EXIF, including GPS.
 * Call this only from client code.
 */
export async function compressProof(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const size = fittedSize(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", proof.jpegQuality);
    });
    if (!blob) throw new Error("encode");
    return blob;
  } finally {
    bitmap.close();
  }
}
