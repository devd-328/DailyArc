/**
 * Validate an AniList username before any upstream call.
 * Rule from ARCHITECTURE.md: letters, digits and underscore, 2 to 20 characters.
 * AniList's own rules are not verified. Check them before launch.
 *
 * DailyArc public names use the same character rules. Reserved names that clash
 * with routes are rejected (ARCHITECTURE.md). PRODUCT.md still lists username
 * rules for users without AniList as open; this follows Architecture.
 */
const PATTERN = /^[A-Za-z0-9_]{2,20}$/;
const RESERVED = new Set(["api", "login", "u", "wrapped"]);

export function isValidUsername(username: string): boolean {
  return PATTERN.test(username);
}

export function isReservedUsername(username: string): boolean {
  return RESERVED.has(username.toLowerCase());
}

export function isDailyArcUsername(username: string): boolean {
  return isValidUsername(username) && !isReservedUsername(username);
}
