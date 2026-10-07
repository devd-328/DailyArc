import { TabBar } from "@/components/TabBar";
import { requireProfile } from "@/lib/profile";
import { requireUser } from "@/lib/supabase/session";
import type { ReactNode } from "react";
import { Suspense } from "react";

export const instant = false;

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AppShellFallback />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}

async function AppShell({ children }: { children: ReactNode }) {
  const user = await requireUser();
  await requireProfile(user.id);
  return (
    <div className="halftone relative min-h-dvh overflow-x-clip pb-[calc(76px+env(safe-area-inset-bottom))]">
      <div className="page-gutter mx-auto w-full max-w-[390px] md:max-w-md">{children}</div>
      <TabBar />
    </div>
  );
}

function AppShellFallback() {
  return (
    <div className="halftone relative min-h-dvh overflow-x-clip pb-[calc(76px+env(safe-area-inset-bottom))]">
      <div className="page-gutter mx-auto w-full max-w-[390px] md:max-w-md" />
    </div>
  );
}
