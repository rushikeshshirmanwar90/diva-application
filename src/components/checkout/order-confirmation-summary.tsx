import { useEffect, useState } from "react";
import { View } from "react-native";
import { Banknote, Mail, MapPin, Package } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { getOrder, type Order } from "@/lib/api/checkout";
import { formatLongDate, formatPaise } from "@/lib/format";
import { Eyebrow, Sans } from "@/components/ui/text";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";

/** The "what happens next" tiles on the confirmation screen, from the real order. */
export function OrderConfirmationSummary({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await getOrder(orderNumber);
        if (!cancelled) setOrder(result);
      } catch {
        if (!cancelled) setOrder(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  if (order === undefined) {
    return (
      <SkeletonGroup label="Loading order" style={{ backgroundColor: colors.line, gap: 1 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} style={{ height: 144, backgroundColor: colors.white }} />
        ))}
      </SkeletonGroup>
    );
  }

  if (order === null) {
    return (
      <View style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, padding: 28 }}>
        <Package size={20} strokeWidth={1.3} color={colors.gold} />
        <Eyebrow size={10} color={colors.ink} style={{ marginTop: 16 }}>
          Quality check
        </Eyebrow>
        <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 8 }}>
          Weighed, hallmarked and photographed within 48 hours. A confirmation email is on its way with your delivery details.
        </Sans>
      </View>
    );
  }

  const eta = new Date(order.createdAt);
  eta.setDate(eta.getDate() + 4);

  const tiles = [
    { Icon: Package, title: "Quality check", body: "Weighed, hallmarked and photographed within 48 hours." },
    { Icon: MapPin, title: "Delivering to", body: `${order.shippingAddress.line1}, ${order.shippingAddress.city} ${order.shippingAddress.pincode}` },
    { Icon: Mail, title: "Expected by", body: formatLongDate(eta) },
    ...(order.paymentMethod === "COD"
      ? [
          {
            Icon: Banknote,
            title: "Pay on delivery",
            body: `${formatPaise(order.totals.grandTotalPaise)} to the courier — cash or UPI at the door. Nothing has been charged yet.`,
          },
        ]
      : []),
  ];

  return (
    <View style={{ backgroundColor: colors.line, gap: 1 }}>
      {tiles.map(({ Icon, title, body }) => (
        <View key={title} style={{ backgroundColor: colors.white, padding: 28 }}>
          <Icon size={20} strokeWidth={1.3} color={colors.gold} />
          <Eyebrow size={10} color={colors.ink} style={{ marginTop: 16 }}>
            {title}
          </Eyebrow>
          <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 8 }}>
            {body}
          </Sans>
        </View>
      ))}
    </View>
  );
}
