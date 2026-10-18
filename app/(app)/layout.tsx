import { AppHeader, AppHeaderFallback } from "@/components/AppHeader";
import { TabBar } from "@/components/TabBar";
import { avatarImageSrc, resolveAvatar } from "@/lib/avatar";
import { quests, streaks } from "@/lib/config";
import { buildNotices } from "@/lib/notices";
import { loadQuestBoard, primeActiveQuests, requireProfile } from "@/lib/profile";
import { minutesUntilDayReset } from "@/lib/streaks";
import { getSupabasePublicEnv } from "@/lib/supabase/public-env";
import { requireUser } from "@/lib/supabase/session";
import { connection } from "next/server";
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
  return (
    <div className="app-shell halftone relative min-h-dvh overflow-x-clip">
      <div className="page-gutter app-main mx-auto w-full">
        <Suspense fallback={<AppHeaderFallback />}>
          <LiveHeader userId={user.id} />
        </Suspense>
        {children}
      </div>
      <Suspense fallback={<TabBar canCompose />}>
        <LiveTabBar userId={user.id} />
      </Suspense>
    </div>
  );
}

async function LiveHeader({ userId }: { userId: string }) {
  await connection();
  primeActiveQuests(userId);
  const profile = await requireProfile(userId);
  const avatar = resolveAvatar(profile.avatar_type, profile.avatar_url);
  const avatarSrc = avatarImageSrc(avatar.type, avatar.url, getSupabasePublicEnv().url);
  const now = new Date();
  const board = await loadQuestBoard(profile, now);
  const notices = buildNotices({
    localDay: board.localDay,
    streakDays: profile.current_streak,
    lastCheckinDate: profile.last_checkin_date,
    minutesLeft: minutesUntilDayReset(now, profile.timezone),
    reminderWindowMinutes: streaks.reminderWindowMinutes,
    questCount: board.quests.length,
    questsLeft: board.quests.filter((quest) => !quest.done).length,
    anilistLinked: Boolean(profile.anilist_username),
  });
  return (
    <AppHeader
      userId={profile.id}
      username={profile.username}
      avatarSrc={avatarSrc}
      streakDays={profile.current_streak}
      notices={notices}
    />
  );
}

async function LiveTabBar({ userId }: { userId: string }) {
  await connection();
  primeActiveQuests(userId);
  const profile = await requireProfile(userId);
  const board = await loadQuestBoard(profile, new Date());
  return <TabBar canCompose={board.quests.length < quests.maxActive} />;
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
