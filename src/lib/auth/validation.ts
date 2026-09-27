/**
 * Client-side echoes of the backend's auth field rules.
 *
 * These exist to catch the common, obvious mistakes — an email with no `@`,
 * a password of nine characters — before a round trip to the server, not to
 * replace it as the source of truth. The backend (`validators/common.ts`,
 * `lib/auth/password.ts`) re-validates everything regardless; a client check
 * that fell out of sync would only ever be too strict or too loose, never
 * unsafe, because the server has the last word either way.
 */

/** Deliberately permissive — just enough to reject "not an email" before a request goes out. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Mirrors `phone` in the backend's `validators/common.ts`: a 10-digit Indian mobile number. */
export function isValidIndianPhone(value: string): boolean {
  return /^(\+91)?[6-9]\d{9}$/.test(value.trim());
}

/** Mirrors `validatePasswordStrength` in the backend's `lib/auth/password.ts`. */
export function passwordProblem(value: string): string | null {
  if (value.length < 10) return "Password must be at least 10 characters";
  if (value.length > 128) return "Password must be at most 128 characters";
  if (/^(.)\1+$/.test(value)) return "Password cannot be a single repeated character";
  return null;
}
