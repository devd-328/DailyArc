import { describe, expect, it } from "vitest";
import {
  INSTALL_DISMISS_MS,
  installPromptClearsTabBar,
  installPromptDismissed,
  isInstalledDisplay,
} from "./install-prompt";

describe("installPromptDismissed", () => {
  it("hides the suggestion for a week after Not now", () => {
    const at = 1_000;
    expect(installPromptDismissed(String(at), at + INSTALL_DISMISS_MS - 1)).toBe(true);
    expect(installPromptDismissed(String(at), at + INSTALL_DISMISS_MS)).toBe(false);
  });

  it("ignores a missing or unreadable dismissal", () => {
    expect(installPromptDismissed(null, 1_000)).toBe(false);
    expect(installPromptDismissed("", 1_000)).toBe(false);
    expect(installPromptDismissed("later", 1_000)).toBe(false);
  });
});

describe("isInstalledDisplay", () => {
  it("treats an installed window as already installed", () => {
    expect(isInstalledDisplay({ standalone: true, overlay: false, iosStandalone: false })).toBe(true);
    expect(isInstalledDisplay({ standalone: false, overlay: true, iosStandalone: false })).toBe(true);
    expect(isInstalledDisplay({ standalone: false, overlay: false, iosStandalone: true })).toBe(true);
    expect(isInstalledDisplay({ standalone: false, overlay: false, iosStandalone: false })).toBe(false);
  });
});

describe("installPromptClearsTabBar", () => {
  it("lifts the suggestion above the signed-in tab bar only", () => {
    expect(installPromptClearsTabBar("/quests")).toBe(true);
    expect(installPromptClearsTabBar("/profile")).toBe(true);
    expect(installPromptClearsTabBar("/login")).toBe(false);
    expect(installPromptClearsTabBar("/")).toBe(false);
  });
});
