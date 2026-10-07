import { quests as questConfig, STATS, type Stat } from "@/lib/config";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/session";
import type { Cadence } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const profile = await getProfile(user.id);
  if (!profile) return NextResponse.json({ error: "profile" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const stat = record.stat;
  const xpValue = record.xp_value;
  const cadence = record.cadence;

  if (!name) return NextResponse.json({ error: "name" }, { status: 400 });
  if (!isStat(stat)) return NextResponse.json({ error: "stat" }, { status: 400 });
  if (!isXp(xpValue)) return NextResponse.json({ error: "xp" }, { status: 400 });
  if (cadence !== "daily" && cadence !== "weekly") {
    return NextResponse.json({ error: "cadence" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quests")
    .insert({
      name,
      stat,
      xp_value: xpValue,
      cadence: cadence as Cadence,
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("quest limit")) {
      return NextResponse.json({ error: "limit" }, { status: 409 });
    }
    return NextResponse.json({ error: "save" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

function isStat(value: unknown): value is Stat {
  return typeof value === "string" && (STATS as readonly string[]).includes(value);
}

function isXp(value: unknown): value is (typeof questConfig.allowedXpValues)[number] {
  return typeof value === "number" && (questConfig.allowedXpValues as readonly number[]).includes(value);
}
