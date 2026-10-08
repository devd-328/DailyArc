import { getProfile } from "@/lib/profile";
import { starterById } from "@/lib/quest-templates";
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
  const templateId =
    body && typeof body === "object" && "template_id" in body
      ? (body as { template_id: unknown }).template_id
      : null;
  if (typeof templateId !== "string" || !templateId) {
    return NextResponse.json({ error: "template_id" }, { status: 400 });
  }

  const template = starterById(templateId);
  if (!template) return NextResponse.json({ error: "template" }, { status: 404 });

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("quests")
    .select("id")
    .eq("user_id", profile.id)
    .eq("active", true)
    .eq("name", template.name)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ id: existing.id, already: true });
  }

  const { data, error } = await supabase
    .from("quests")
    .insert({
      name: template.name,
      stat: template.stat,
      xp_value: template.xp_value,
      cadence: "daily",
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("quest limit")) {
      return NextResponse.json({ error: "limit" }, { status: 409 });
    }
    return NextResponse.json({ error: "save" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, already: false });
}
