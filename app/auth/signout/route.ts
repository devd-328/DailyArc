import { getSupabasePublicEnv } from "@/lib/supabase/public-env";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/", origin), { status: 303 });
  const { url, key } = getSupabasePublicEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([header, value]) => response.headers.set(header, value));
      },
    },
  });
  await supabase.auth.signOut();
  return response;
}
