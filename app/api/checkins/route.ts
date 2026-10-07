import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/session";
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
  const questId =
    body && typeof body === "object" && "quest_id" in body ? (body as { quest_id: unknown }).quest_id : null;
  if (typeof questId !== "string" || !questId) {
    return NextResponse.json({ error: "quest_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_in", { p_quest_id: questId });
  if (error) {
    return NextResponse.json({ error: "checkin" }, { status: 400 });
  }
  return NextResponse.json(data);
}
