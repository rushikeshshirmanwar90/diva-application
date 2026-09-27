import type { Product, Variant } from "@/lib/types";
import { FREE_SHIPPING_THRESHOLD, GST_RATE, SHIPPING_CHARGE } from "@/lib/format";

export type ResolvedLine = {
  key: string;
  product: Product;
  variant: Variant;
  qty: number;
  unitPrice: number;
  unitMrp: number;
  lineTotal: number;
};

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  savings: number;
  taxable: number;
  gst: number;
  shipping: number;
  total: number;
};

/**
 * The one place cart arithmetic happens. A coupon discount is deliberately not
 * estimated here — only the backend knows whether a staged code is valid.
 */
export function computeTotals(lines: ResolvedLine[]): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const mrpTotal = lines.reduce((sum, l) => sum + l.unitMrp * l.qty, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

  return {
    itemCount: lines.reduce((n, l) => n + l.qty, 0),
    subtotal,
    savings: Math.max(0, mrpTotal - subtotal),
    taxable: subtotal,
    gst,
    shipping,
    total: subtotal + gst + shipping,
  };
}
