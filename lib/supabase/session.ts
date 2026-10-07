import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "./server";

export type AuthUser = {
  id: string;
  email: string | null;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (typeof id !== "string" || !id) return null;
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  return { id, email };
}

export async function isSignedIn(): Promise<boolean> {
  return (await getAuthUser()) != null;
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return user;
}
