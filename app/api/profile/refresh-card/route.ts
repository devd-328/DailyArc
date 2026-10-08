import { applyPendingAniListIdentity, refreshLinkedCard } from "@/lib/anilist-link";
import { getProfile } from "@/lib/profile";
import { getAuthUser } from "@/lib/supabase/session";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const profile = await getProfile(user.id);
  if (!profile) return NextResponse.json({ error: "profile" }, { status: 404 });

  if (!profile.anilist_username) {
    const linked = await applyPendingAniListIdentity(user.id);
    if (linked === "taken") return NextResponse.json({ error: "taken" }, { status: 409 });
    if (linked === "bound") return NextResponse.json({ error: "bound" }, { status: 409 });
    if (linked !== "ok") return NextResponse.json({ error: "not-linked" }, { status: 400 });
  }

  const result = await refreshLinkedCard(user.id);
  if (!result.ok) {
    if (result.error === "cooldown") return NextResponse.json({ error: "cooldown" }, { status: 429 });
    if (result.error === "busy") return NextResponse.json({ error: "busy" }, { status: 503 });
    return NextResponse.json({ error: "not-linked" }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    watcher_type: result.watcherType,
    refreshed_at: result.refreshedAt,
  });
}
