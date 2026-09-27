import { View } from "react-native";
import { Check, CircleDashed, ExternalLink, Truck } from "lucide-react-native";
import { colors } from "@/lib/theme";
import type { Order, Tracking } from "@/lib/api/checkout";
import { formatShortDate, formatWhen } from "@/lib/format";
import { Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";

/**
 * Where an order is, at a glance: five stops, with the order's own
 * `statusHistory` saying which have happened. Courier scans sit beneath.
 */

type Step = { key: string; label: string; statuses: string[]; hint: string };

const STEPS: Step[] = [
  { key: "placed", label: "Placed", statuses: ["PENDING"], hint: "Order received" },
  { key: "confirmed", label: "Confirmed", statuses: ["PAYMENT_SUCCESS", "CONFIRMED", "SHIPMENT_CREATED"], hint: "Being checked and packed" },
  { key: "shipped", label: "Shipped", statuses: ["SHIPPED"], hint: "With the courier" },
  { key: "out", label: "Out for delivery", statuses: ["OUT_FOR_DELIVERY"], hint: "Arriving today" },
  { key: "delivered", label: "Delivered", statuses: ["DELIVERED"], hint: "Signed for" },
];

const STATUS_STEP: Record<string, number> = {
  PENDING: 0,
  PAYMENT_INITIATED: 0,
  PAYMENT_FAILED: 0,
  PAYMENT_SUCCESS: 1,
  CONFIRMED: 1,
  SHIPMENT_CREATED: 1,
  SHIPPED: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  RETURN_REQUESTED: 4,
  RETURN_PICKED: 4,
};

const OFF_TRACK: Record<string, { title: string; body: string }> = {
  CANCELLED: {
    title: "This order was cancelled",
    body: "Nothing will be shipped. If a payment was taken, it is refunded to the original method within 5–7 working days.",
  },
  REFUNDED: { title: "Refunded", body: "The amount has been returned to the payment method you used." },
  ABANDONED: {
    title: "This checkout was not completed",
    body: "No payment was taken and nothing was reserved. Add the pieces to your bag again to order.",
  },
  PAYMENT_FAILED: { title: "Payment did not go through", body: "Nothing was charged. You can retry from your bag, or place the order again." },
};

export function OrderTracker({ order, tracking }: { order: Order; tracking: Tracking | null }) {
  const offTrack = OFF_TRACK[order.status];
  const isReturn = order.status === "RETURN_REQUESTED" || order.status === "RETURN_PICKED";
  const reached = STATUS_STEP[order.status] ?? 0;

  const reachedAt = new Map<string, string>();
  for (const event of order.statusHistory ?? []) {
    const step = STEPS.find((s) => s.statuses.includes(event.status));
    if (step && !reachedAt.has(step.key)) reachedAt.set(step.key, event.at);
  }

  const eta = tracking?.estimatedDeliveryAt;

  return (
    <View style={{ borderWidth: 1, borderColor: colors.line }}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
          backgroundColor: "rgba(248,245,240,0.5)",
          paddingHorizontal: 24,
          paddingVertical: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Truck size={14} color={colors.gold} />
          <Eyebrow size={10} color={colors.gold}>
            Order tracking
          </Eyebrow>
        </View>
        {!offTrack && order.status !== "DELIVERED" && eta ? (
          <Sans size={12} color={colors.muted}>
            Expected by <Sans size={12}>{formatShortDate(eta)}</Sans>
          </Sans>
        ) : null}
        {order.status === "DELIVERED" && order.deliveredAt ? (
          <Sans size={12} color={colors.muted}>
            Delivered <Sans size={12}>{formatWhen(order.deliveredAt)}</Sans>
          </Sans>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
        {offTrack ? (
          <View>
            <Sans size={14}>{offTrack.title}</Sans>
            <Sans size={12} leading="relaxed" color={colors.muted} style={{ marginTop: 4 }}>
              {offTrack.body}
            </Sans>
          </View>
        ) : (
          <View style={{ flexDirection: "row" }}>
            {STEPS.map((step, index) => {
              const done = index <= reached;
              const current = index === reached;
              const when = reachedAt.get(step.key);
              return (
                <View key={step.key} style={{ flex: 1, alignItems: "center" }}>
                  {index > 0 ? (
                    <View style={{ position: "absolute", top: 12, left: "-50%", right: "50%", height: 1, backgroundColor: done ? colors.gold : colors.line }} />
                  ) : null}
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: done ? colors.gold : colors.line,
                      backgroundColor: done ? colors.gold : colors.white,
                      alignItems: "center",
                      justifyContent: "center",
                      ...(current && order.status !== "DELIVERED"
                        ? { shadowColor: colors.gold, shadowOpacity: 0.15, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } }
                        : {}),
                    }}
                  >
                    {done ? <Check size={12} strokeWidth={3} color={colors.white} /> : <CircleDashed size={12} color={colors.muted} />}
                  </View>
                  <Eyebrow size={8} color={done ? colors.ink : colors.muted} align="center" style={{ marginTop: 8 }}>
                    {step.label}
                  </Eyebrow>
                  <Sans size={9} color={colors.muted} align="center" style={{ marginTop: 2 }}>
                    {when ? formatWhen(when) : current ? step.hint : ""}
                  </Sans>
                </View>
              );
            })}
          </View>
        )}

        {isReturn ? (
          <Sans size={12} leading="relaxed" color={colors.muted} style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 16 }}>
            {order.status === "RETURN_REQUESTED"
              ? "A return has been requested. The courier will collect the parcel; keep it in its original packaging."
              : "The return has been collected. Your refund is issued once it reaches us and is checked."}
          </Sans>
        ) : null}

        {tracking && (tracking.courierName || tracking.awbCode || tracking.events.length > 0) ? (
          <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 20 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Sans size={14}>
                {tracking.courierName ?? "Courier"}
                {tracking.awbCode ? <Sans size={14} color={colors.muted}> · AWB {tracking.awbCode}</Sans> : null}
              </Sans>
              {tracking.trackingUrl ? (
                <Link href={tracking.trackingUrl} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Sans size={12} color={colors.gold}>
                    Track on courier site
                  </Sans>
                  <ExternalLink size={11} color={colors.gold} />
                </Link>
              ) : null}
            </View>

            {tracking.events.length > 0 ? (
              <View style={{ marginTop: 16, gap: 12 }}>
                {tracking.events.map((event, index) => (
                  <View key={`${event.occurredAt}-${index}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                    <View style={{ marginTop: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: index === 0 ? colors.gold : colors.line }} />
                    <View style={{ flex: 1 }}>
                      <Sans size={12}>{event.status.replace(/_/g, " ")}</Sans>
                      <Sans size={12} color={colors.muted}>
                        {formatWhen(event.occurredAt)}
                        {event.location ? ` · ${event.location}` : ""}
                        {event.description ? ` — ${event.description}` : ""}
                      </Sans>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
