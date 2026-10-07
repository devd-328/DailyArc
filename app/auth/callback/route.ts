import { getSupabasePublicEnv } from "@/lib/supabase/public-env";
import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextPath = safeNext(searchParams.get("next"));

  const success = NextResponse.redirect(new URL(nextPath, origin));
  const fail = NextResponse.redirect(new URL("/login?error=1", origin));
  const supabase = supabaseOn(request, success);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return success;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return success;
  }

  return fail;
}

function supabaseOn(request: NextRequest, response: NextResponse) {
  const { url, key } = getSupabasePublicEnv();
  return createServerClient(url, key, {
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
}

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/onboarding";
  return value;
}
