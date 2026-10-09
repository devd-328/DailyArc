import { CONFIG_VERSION } from "@/lib/config";
import { deleteOwnedAccount, isSameOrigin, type AccountAdmin } from "@/lib/delete-account";
import { getProfile } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRouteClient } from "@/lib/supabase/route";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/session";
import { isDailyArcUsername } from "@/lib/username";
import { utcDay } from "@/lib/wrapped";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

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

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request.nextUrl.origin, request.headers.get("origin"))) {
    return NextResponse.json({ error: "origin" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createRouteClient(request, response);
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ error: "auth" }, { status: 401 });
  }

  let deleted: { anilistUsername: string | null };
  try {
    deleted = await deleteOwnedAccount(accountAdmin(), userId);
  } catch {
    return NextResponse.json({ error: "delete" }, { status: 500 });
  }

  if (deleted.anilistUsername) {
    try {
      revalidateTag(`wrapped:${deleted.anilistUsername}:${utcDay()}:${CONFIG_VERSION}`, { expire: 0 });
    } catch {
      // The account is already gone. Still end the session below.
    }
  }

  await supabase.auth.signOut({ scope: "local" });
  return response;
}

function accountAdmin(): AccountAdmin {
  const admin = createAdminClient();
  return {
    async readProfile(userId) {
      const { data, error } = await admin
        .from("profiles")
        .select("anilist_username")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw new Error("profile");
      const name = data?.anilist_username;
      return { anilistUsername: typeof name === "string" && name.length > 0 ? name : null };
    },
    async removeAvatar(path) {
      const { error } = await admin.storage.from("avatars").remove([path]);
      if (error && error.status !== 404) throw new Error("avatar");
    },
    async deleteAuthUser(userId) {
      const { error } = await admin.auth.admin.deleteUser(userId, false);
      if (error) throw new Error("auth");
    },
  };
}
