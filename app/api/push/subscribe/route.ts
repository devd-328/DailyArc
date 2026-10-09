import { isSameOrigin } from "@/lib/delete-account";
import { getProfile } from "@/lib/profile";
import { parsePushSubscription } from "@/lib/push";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/supabase/session";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request.nextUrl.origin, request.headers.get("origin"))) {
    return NextResponse.json({ error: "origin" }, { status: 403 });
  }
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
  const subscription = parsePushSubscription(body);
  if (!subscription) return NextResponse.json({ error: "subscription" }, { status: 400 });

  const admin = createAdminClient();
  const existing = await admin
    .from("push_subscriptions")
    .select("user_id")
    .eq("endpoint", subscription.endpoint)
    .maybeSingle();
  if (existing.error) return NextResponse.json({ error: "save" }, { status: 500 });
  if (existing.data && existing.data.user_id !== user.id) {
    return NextResponse.json({ error: "taken" }, { status: 409 });
  }

  if (existing.data) {
    const { error } = await admin
      .from("push_subscriptions")
      .update({ p256dh: subscription.p256dh, auth: subscription.auth })
      .eq("endpoint", subscription.endpoint)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: "save" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin.from("push_subscriptions").insert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.p256dh,
    auth: subscription.auth,
  });
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "taken" }, { status: 409 });
    return NextResponse.json({ error: "save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request.nextUrl.origin, request.headers.get("origin"))) {
    return NextResponse.json({ error: "origin" }, { status: 403 });
  }
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const endpoint =
    body && typeof body === "object" && "endpoint" in body ? (body as { endpoint: unknown }).endpoint : null;
  if (typeof endpoint !== "string" || endpoint.length === 0) {
    return NextResponse.json({ error: "endpoint" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
  if (error) return NextResponse.json({ error: "save" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
