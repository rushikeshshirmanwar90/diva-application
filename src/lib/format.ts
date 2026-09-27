/** Money helpers. Everything is paise (integers). Port of diva-frontend `lib/format.ts`. */

/**
 * Hermes ships without full ICU on some builds, so `Intl.NumberFormat("en-IN")`
 * cannot be relied on for the lakh/crore grouping. Done by hand instead:
 * 12990000 → "₹1,29,900".
 */
export function formatPaise(paise: number): string {
  const rupees = Math.round(paise / 100);
  const negative = rupees < 0;
  const digits = String(Math.abs(rupees));
  if (digits.length <= 3) return `${negative ? "-" : ""}₹${digits}`;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}₹${rest},${last3}`;
}

/** ₹ amount → paise. */
export function rupees(amount: number): number {
  return Math.round(amount * 100);
}

export function discountPercent(price: number, mrp: number): number {
  if (mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "22 Jul 2026" — the site's `en-IN` short date. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Friday, 24 July" */
export function formatLongDate(date: Date): string {
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS_LONG[date.getMonth()]}`;
}

/** "Fri, 24 Jul" */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getDay()].slice(0, 3)}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "24 Jul, 3:05 pm" */
export function formatWhen(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${h}:${m} ${ampm}`;
}

/** GST on jewellery — 3%. */
export const GST_RATE = 0.03;

/**
 * Free shipping above this cart value (paise). 0 makes shipping free on every
 * order; `SHIPPING_CHARGE` keeps its real value so restoring the policy is a
 * one-line change. Mirrors the site.
 */
export const FREE_SHIPPING_THRESHOLD = rupees(0);
export const SHIPPING_CHARGE = rupees(99);
