import { redirect } from "next/navigation";
import { leveling, STATS, type Rank, type Stat, type WatcherType } from "./config";
import { rankForLevel } from "./ranks";
import { localCheckinDate, periodStart } from "./streaks";
import { createClient } from "./supabase/server";
import { isWatcherType } from "./watcherType";
import { xpProgress } from "./xp";
import type { Cadence } from "./types";

export type ProfileRow = {
  id: string;
  username: string;
  timezone: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
  watcher_type: string | null;
  is_public: boolean;
  anilist_username: string | null;
};

export type QuestRow = {
  id: string;
  name: string;
  stat: Stat;
  xp_value: number;
  cadence: Cadence;
  active: boolean;
};

export type StatXp = Record<Stat, number>;

export type PublicProfileRow = {
  username: string;
  anilistUsername: string | null;
  level: number;
  rank: Rank;
  watcherType: WatcherType | null;
};

export function parsePublicProfile(data: unknown): PublicProfileRow | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  if (typeof row.username !== "string") return null;
  const rawLevel = row.level;
  const level = typeof rawLevel === "string" && /^\d+$/.test(rawLevel) ? Number(rawLevel) : rawLevel;
  if (typeof level !== "number" || !Number.isInteger(level) || level < 1 || level > leveling.levelCap) {
    return null;
  }
  const anilistUsername = row.anilist_username;
  if (anilistUsername != null && typeof anilistUsername !== "string") return null;
  const watcherType = row.watcher_type;
  if (watcherType != null && !isWatcherType(watcherType)) return null;
  return {
    username: row.username,
    anilistUsername: anilistUsername ?? null,
    level,
    rank: rankForLevel(level),
    watcherType: watcherType ?? null,
  };
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return data as ProfileRow;
}

export async function requireProfile(userId: string): Promise<ProfileRow> {
  const profile = await getProfile(userId);
  if (!profile) redirect("/onboarding");
  return profile;
}

/** Public page lookup. Username rules follow ARCHITECTURE.md (same characters as AniList, reserved names rejected). */
export async function getPublicProfile(username: string): Promise<PublicProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_profiles")
    .select("username, anilist_username, level, rank, watcher_type")
    .eq("username", username)
    .maybeSingle();
  if (error || !data) return null;
  return parsePublicProfile(data);
}

export function progressFromProfile(profile: ProfileRow) {
  const progress = xpProgress(profile.total_xp);
  return {
    ...progress,
    rank: rankForLevel(progress.level),
  };
}

export async function loadQuestBoard(profile: ProfileRow, now: Date) {
  const supabase = await createClient();
  const localDay = localCheckinDate(now, profile.timezone);
  const { data: quests } = await supabase
    .from("quests")
    .select("id, name, stat, xp_value, cadence, active")
    .eq("user_id", profile.id)
    .eq("active", true)
    .order("created_at", { ascending: true });

  const rows = (quests ?? []) as QuestRow[];
  const periods = [...new Set(rows.map((quest) => periodStart(localDay, quest.cadence)))];
  let doneIds = new Set<string>();
  if (rows.length > 0) {
    const { data: checkins } = await supabase
      .from("checkins")
      .select("quest_id, period_start")
      .eq("user_id", profile.id)
      .in(
        "quest_id",
        rows.map((quest) => quest.id),
      )
      .in("period_start", periods);
    doneIds = new Set(
      (checkins ?? [])
        .filter((row) => {
          const quest = rows.find((item) => item.id === row.quest_id);
          if (!quest) return false;
          return row.period_start === periodStart(localDay, quest.cadence);
        })
        .map((row) => row.quest_id as string),
    );
  }

  return {
    localDay,
    quests: rows.map((quest) => ({
      ...quest,
      done: doneIds.has(quest.id),
    })),
  };
}

export async function loadStatXp(userId: string): Promise<StatXp> {
  const supabase = await createClient();
  const { data } = await supabase.from("stats").select("*").eq("user_id", userId).maybeSingle();
  const empty = Object.fromEntries(STATS.map((stat) => [stat, 0])) as StatXp;
  if (!data) return empty;
  return {
    strength: data.strength_xp ?? 0,
    intelligence: data.intelligence_xp ?? 0,
    discipline: data.discipline_xp ?? 0,
    charisma: data.charisma_xp ?? 0,
    vitality: data.vitality_xp ?? 0,
  };
}

