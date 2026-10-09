import { AppHeader, AppHeaderFallback } from "@/components/AppHeader";
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
  const profile = await requireProfile(user.id);
  return (
    <div className="app-shell halftone relative min-h-dvh overflow-x-clip">
      <div className="page-gutter app-main mx-auto w-full">
        <AppHeader username={profile.username} streakDays={profile.current_streak} />
        {children}
      </div>
      <TabBar />
    </div>
  );
}

function AppShellFallback() {
  return (
    <div className="app-shell halftone relative min-h-dvh overflow-x-clip">
      <div className="page-gutter app-main mx-auto w-full">
        <AppHeaderFallback />
      </div>
    </div>
  );
}
