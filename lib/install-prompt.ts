/** How long a "Not now" hides the install suggestion. */
export const INSTALL_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export const INSTALL_DISMISS_KEY = "dailyarc-install-dismissed";

const TAB_ROUTES = ["/quests", "/stats", "/cards", "/profile"];

export function installPromptDismissed(stored: string | null, now: number): boolean {
  if (stored == null || stored === "") return false;
  const at = Number(stored);
  if (!Number.isFinite(at)) return false;
  return now - at < INSTALL_DISMISS_MS;
}

export function isInstalledDisplay(modes: {
  standalone: boolean;
  overlay: boolean;
  iosStandalone: boolean;
}): boolean {
  return modes.standalone || modes.overlay || modes.iosStandalone;
}

/** Signed-in screens pin a tab bar to the bottom, so the suggestion sits above it. */
export function installPromptClearsTabBar(pathname: string): boolean {
  return TAB_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
