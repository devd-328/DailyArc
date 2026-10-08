import { STARTER_TEMPLATES } from "@/lib/quest-templates";
import { getProfile } from "@/lib/profile";
import { getAuthUser } from "@/lib/supabase/session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const profile = await getProfile(user.id);
  if (!profile) return NextResponse.json({ error: "profile" }, { status: 403 });

  const kind = new URL(request.url).searchParams.get("kind");
  if (kind != null && kind !== "starter") {
    return NextResponse.json({ error: "kind" }, { status: 400 });
  }

  return NextResponse.json({ templates: STARTER_TEMPLATES });
}
