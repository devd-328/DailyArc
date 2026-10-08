import { avatars } from "./config";

export type AvatarType = "preset" | "gallery";

const PRESET_PATH = /^\/avatars\/avatar-(0[1-9]|1[0-2])\.svg$/;

export function presetAvatarPath(index: number): string {
  if (!Number.isInteger(index) || index < 1 || index > avatars.count) {
    throw new Error("invalid avatar");
  }
  return `/avatars/avatar-${String(index).padStart(2, "0")}.svg`;
}

export function presetAvatarPaths(): string[] {
  return Array.from({ length: avatars.count }, (_, index) => presetAvatarPath(index + 1));
}

export function isPresetAvatarPath(value: string): boolean {
  return PRESET_PATH.test(value);
}

export function isAvatarType(value: string): value is AvatarType {
  return value === "preset" || value === "gallery";
}

/** Storage object path. One file per user, overwritten on each upload. */
export function galleryAvatarPath(userId: string): string {
  return `${userId}/avatar.jpg`;
}

export function resolveAvatar(
  type: string | null | undefined,
  url: string | null | undefined,
): { type: AvatarType; url: string } {
  if (type === "gallery" && typeof url === "string" && url.endsWith("/avatar.jpg")) {
    return { type: "gallery", url };
  }
  if (typeof url === "string" && isPresetAvatarPath(url)) {
    return { type: "preset", url };
  }
  return { type: "preset", url: presetAvatarPath(1) };
}

export function avatarImageSrc(type: AvatarType, url: string, supabaseUrl: string): string {
  if (type === "gallery") {
    const base = supabaseUrl.replace(/\/$/, "");
    return `${base}/storage/v1/object/public/avatars/${url}`;
  }
  return url;
}

/**
 * Center-crop to a square and re-encode as a small JPEG.
 * Drawing through a canvas drops EXIF, including GPS.
 * Call this only from client code.
 */
export async function cropAvatar(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = Math.floor((bitmap.width - side) / 2);
    const sy = Math.floor((bitmap.height - side) / 2);
    const canvas = document.createElement("canvas");
    canvas.width = avatars.size;
    canvas.height = avatars.size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");
    context.drawImage(bitmap, sx, sy, side, side, 0, 0, avatars.size, avatars.size);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", avatars.jpegQuality);
    });
    if (!blob) throw new Error("encode");
    return blob;
  } finally {
    bitmap.close();
  }
}
