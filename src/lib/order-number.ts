import { randomBytes } from "crypto";

/**
 * Produces order numbers shaped exactly like the ones already visible in
 * your admin dashboard's Recent Orders table, e.g. "ORD-20260412-D1B65D":
 *   ORD-<YYYYMMDD>-<6 uppercase hex chars>
 */
export function generateOrderNumber(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = randomBytes(3).toString("hex").toUpperCase(); // 3 bytes = 6 hex chars
  return `ORD-${y}${m}${d}-${suffix}`;
}
