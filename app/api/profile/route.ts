import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/session";
import { isDailyArcUsername } from "@/lib/username";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const profile = await getProfile(user.id);
  if (!profile) return NextResponse.json({ error: "profile" }, { status: 404 });

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
  const patch: { username?: string; timezone?: string; is_public?: boolean } = {};

  if ("username" in record) {
    if (typeof record.username !== "string" || !isDailyArcUsername(record.username)) {
      return NextResponse.json({ error: "username" }, { status: 400 });
    }
    patch.username = record.username;
  }
  if ("timezone" in record) {
    if (typeof record.timezone !== "string" || !isTimeZone(record.timezone)) {
      return NextResponse.json({ error: "timezone" }, { status: 400 });
    }
    patch.timezone = record.timezone;
  }
  if ("is_public" in record) {
    if (typeof record.is_public !== "boolean") {
      return NextResponse.json({ error: "is_public" }, { status: 400 });
    }
    patch.is_public = record.is_public;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "taken" }, { status: 409 });
    return NextResponse.json({ error: "save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

function isTimeZone(value: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
