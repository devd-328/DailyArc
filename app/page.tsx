import { isSignedIn } from "@/lib/supabase/session";
import { redirect } from "next/navigation";

export const instant = false;

export default async function Home() {
  if (await isSignedIn()) redirect("/onboarding");
  redirect("/login");
}
