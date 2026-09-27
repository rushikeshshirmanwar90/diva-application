import { View } from "react-native";
import { colors } from "@/lib/theme";
import type { CartTotals } from "@/lib/totals";
import { formatPaise } from "@/lib/format";
import { Display, Eyebrow, Sans } from "@/components/ui/text";

export function OrderSummary({ totals, coupon, title = "Order summary" }: { totals: CartTotals; coupon?: string | null; title?: string }) {
  return (
    <View style={{ backgroundColor: colors.beige, padding: 28 }}>
      <Eyebrow color={colors.ink}>{title}</Eyebrow>

      <View style={{ marginTop: 24, gap: 12 }}>
        <Row label={`Subtotal (${totals.itemCount} ${totals.itemCount === 1 ? "piece" : "pieces"})`} value={formatPaise(totals.subtotal)} />
        {totals.savings > 0 ? <Row label="Discount on MRP" value={`− ${formatPaise(totals.savings)}`} tone="success" /> : null}
        <Row label="GST (3%)" value={formatPaise(totals.gst)} />
        {totals.shipping > 0 ? <Row label="Insured shipping" value={formatPaise(totals.shipping)} /> : null}
      </View>

      <View style={{ marginTop: 24, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 20 }}>
        <Eyebrow>Total payable</Eyebrow>
        <Display size={30}>{formatPaise(totals.total)}</Display>
      </View>

      {totals.savings > 0 ? (
        <Sans size={12} color={colors.success} style={{ marginTop: 12 }}>
          You save {formatPaise(totals.savings)} on this order
        </Sans>
      ) : null}

      {coupon ? (
        <Sans size={12} color={colors.muted} style={{ marginTop: 12 }}>
          Code <Sans size={12}>{coupon}</Sans> will be applied at checkout.
        </Sans>
      ) : null}
    </View>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
      <Sans size={14} color={colors.muted} style={{ flexShrink: 1 }}>
        {label}
      </Sans>
      <Sans size={14} color={tone === "success" ? colors.success : colors.ink}>
        {value}
      </Sans>
    </View>
  );
}
