/**
 * Validate an AniList username before any upstream call.
 * Rule from ARCHITECTURE.md: letters, digits and underscore, 2 to 20 characters.
 * AniList's own rules are not verified. Check them before launch.
 */
const PATTERN = /^[A-Za-z0-9_]{2,20}$/;

export function isValidUsername(username: string): boolean {
  return PATTERN.test(username);
}
