import { cacheLife, cacheTag } from "next/cache";
import { fetchAniListAnimeList } from "@/lib/anilist";
import { buildWrapped, type WrappedResult } from "@/lib/wrapped";

export async function loadWrapped(
  username: string,
  day: string,
  configVersion: number,
): Promise<WrappedResult> {
  "use cache";
  cacheTag(`wrapped:${username}:${day}:${configVersion}`);

  const fetched = await fetchAniListAnimeList(username);
  if (!fetched.ok) {
    if (fetched.code === "UPSTREAM_BUSY") cacheLife("minutes");
    else cacheLife("wrapped");
    return { ok: false, code: fetched.code };
  }

  cacheLife("wrapped");
  return buildWrapped(username, fetched.entries, new Date(`${day}T12:00:00.000Z`));
}
