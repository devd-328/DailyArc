import { HowItWorks } from "@/components/HowItWorks";
import { LoginForm } from "@/components/LoginForm";
import { QuestDemo } from "@/components/QuestDemo";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="halftone relative min-h-dvh overflow-x-clip">
      <div className="page-gutter mx-auto w-full max-w-6xl">
        <header className="relative mb-[18px] flex items-center">
          <Link href="/" className="font-display text-xl">
            DailyArc
          </Link>
        </header>
        <Suspense>
          <LoginBody />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginBody() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/onboarding");

  return (
    <div className="mx-auto grid w-full max-w-[390px] gap-6 md:max-w-md lg:max-w-4xl lg:grid-cols-2 lg:items-start lg:gap-10">
      <div>
        <h1 className="font-display text-[32px] leading-[1.1]">Sign in or sign up</h1>
        <p className="mt-3 text-[15px] font-medium leading-normal">
          Daily quests, XP, and a rank. One account covers all of it. The anime card is optional.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <div className="flex flex-col gap-6">
        <QuestDemo />
        <HowItWorks />
      </div>
    </div>
  );
}
