"use client";

import {
  INSTALL_DISMISS_KEY,
  installPromptClearsTabBar,
  installPromptDismissed,
  isInstalledDisplay,
} from "@/lib/install-prompt";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type InstallChoice = { outcome: "accepted" | "dismissed" };

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

function installedAlready(): boolean {
  const iosStandalone =
    "standalone" in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isInstalledDisplay({
    standalone: window.matchMedia("(display-mode: standalone)").matches,
    overlay: window.matchMedia("(display-mode: window-controls-overlay)").matches,
    iosStandalone,
  });
}

function rememberDismissal() {
  try {
    localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
  } catch {
    // Private mode can block storage. The suggestion just returns next visit.
  }
}

function dismissalIsActive(): boolean {
  try {
    return installPromptDismissed(localStorage.getItem(INSTALL_DISMISS_KEY), Date.now());
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const pathname = usePathname();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (installedAlready() || dismissalIsActive()) return;

    function onPrompt(event: Event) {
      if (installedAlready() || dismissalIsActive()) return;
      const installEvent = event as BeforeInstallPromptEvent;
      if (typeof installEvent.prompt !== "function") return;
      event.preventDefault();
      setPromptEvent(installEvent);
    }

    function onInstalled() {
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!promptEvent) return null;

  async function install() {
    setBusy(true);
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome !== "accepted") rememberDismissal();
      setPromptEvent(null);
    } catch {
      setBusy(false);
    }
  }

  function dismiss() {
    rememberDismissal();
    setPromptEvent(null);
  }

  const aboveTabs = installPromptClearsTabBar(pathname);

  return (
    <aside
      aria-label="Install DailyArc"
      className={`fixed z-[25] right-3 left-3 lg:left-auto lg:w-80 ${
        aboveTabs
          ? "bottom-[calc(76px+env(safe-area-inset-bottom)+0.75rem)] lg:bottom-4 lg:right-4"
          : "bottom-[max(0.75rem,env(safe-area-inset-bottom))] lg:right-4 lg:bottom-4"
      }`}
    >
      <div className="rounded-card border-2 border-ink bg-card p-3.5 shadow-panel">
        <div className="flex items-center gap-3">
          <img
            src="/icons/icon-192.png"
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-badge border-2 border-ink"
          />
          <div>
            <p className="font-display text-lg leading-none">Install DailyArc</p>
            <p className="mt-1 text-sm font-medium leading-snug text-ink-soft">
              Add it to your home screen. Quests stay one tap away.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => void install()}
            disabled={busy}
            className="flex min-h-11 flex-1 items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
          >
            Install
          </button>
          <button
            type="button"
            onClick={dismiss}
            disabled={busy}
            className="flex min-h-11 flex-1 items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
