import { useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { ChevronLeft } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { cancelOrder, getOrder, getTracking, type Order, type Tracking } from "@/lib/api/checkout";
import { errorMessage } from "@/lib/api/client";
import { formatDate, formatPaise } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ErrorBox } from "@/components/ui/field";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import { OrderTracker } from "@/components/account/order-tracker";
import { Spinner } from "@/components/ui/spinner";

/** Mirrors `CUSTOMER_CANCELLABLE` in diva-backend's `lib/orders/state-machine.ts`. */
const CUSTOMER_CANCELLABLE = new Set(["PENDING", "PAYMENT_FAILED", "PAYMENT_SUCCESS", "CONFIRMED"]);

export function OrderDetailView({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await getOrder(orderNumber);
        if (cancelled) return;
        setOrder(data);
      } catch (cause) {
        if (!cancelled) setLoadError(errorMessage(cause));
        return;
      }
      try {
        const data = await getTracking(orderNumber);
        if (!cancelled) setTracking(data);
      } catch {
        if (!cancelled) setTracking(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      setOrder(await cancelOrder(orderNumber));
    } catch (cause) {
      setCancelError(errorMessage(cause));
    } finally {
      setCancelling(false);
    }
  };

  if (loadError) {
    return (
      <View style={{ paddingVertical: 80, alignItems: "center" }}>
        <Sans size={14} color={colors.muted} align="center">
          {loadError}
        </Sans>
        <Button href="/account/orders" variant="outline" style={{ marginTop: 24 }}>
          Back to orders
        </Button>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
        <Spinner size={44} />
      </View>
    );
  }

  return (
    <View>
      <Link href="/account/orders" style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" }}>
        <ChevronLeft size={13} color={colors.muted} />
        <Eyebrow size={10}>All orders</Eyebrow>
      </Link>

      <View style={{ marginTop: 24, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <View>
          <Display size={30}>{order.orderNumber}</Display>
          <Sans size={14} color={colors.muted} style={{ marginTop: 4 }}>
            Placed {formatDate(order.createdAt)}
          </Sans>
        </View>
        <Eyebrow color={colors.gold}>{order.status.replace(/_/g, " ")}</Eyebrow>
      </View>

      {cancelError ? (
        <View style={{ marginTop: 24 }}>
          <ErrorBox>{cancelError}</ErrorBox>
        </View>
      ) : null}

      <View style={{ marginTop: 32 }}>
        <OrderTracker order={order} tracking={tracking} />
      </View>

      <View style={{ marginTop: 40, gap: 40 }}>
        <View>
          <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }}>
            {order.items.map((item, index) => (
              <View key={`${item.sku}-${index}`} style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 20, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.line }}>
                <Link href={`/product/${item.slug}`} style={{ width: 80, height: 80, backgroundColor: colors.beige, overflow: "hidden" }}>
                  {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
                </Link>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/product/${item.slug}`}>
                    <Display size={18}>{item.title}</Display>
                  </Link>
                  <Sans size={12} color={colors.muted} style={{ marginTop: 2 }}>
                    {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity}
                  </Sans>
                </View>
                <Sans size={14}>{formatPaise(item.lineTotalPaise)}</Sans>
              </View>
            ))}
          </View>

          {CUSTOMER_CANCELLABLE.has(order.status) ? (
            <Button variant="outline" style={{ marginTop: 32 }} onPress={() => void handleCancel()} loading={cancelling} disabled={cancelling}>
              Cancel order
            </Button>
          ) : null}
        </View>

        <View>
          <Eyebrow size={10}>Shipping to</Eyebrow>
          <Sans size={14} style={{ marginTop: 12 }}>
            {order.shippingAddress.fullName}
          </Sans>
          <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 4 }}>
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            {"\n"}
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            {"\n"}
            {order.shippingAddress.phone}
          </Sans>

          <Eyebrow size={10} style={{ marginTop: 32 }}>
            Payment
          </Eyebrow>
          <Sans size={14} style={{ marginTop: 12 }}>
            {order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}
          </Sans>
          {order.paymentMethod === "COD" && order.status !== "DELIVERED" ? (
            <Sans size={12} color={colors.muted} style={{ marginTop: 4 }}>
              {formatPaise(order.totals.grandTotalPaise)} due to the courier at the door.
            </Sans>
          ) : null}

          <Eyebrow size={10} style={{ marginTop: 32 }}>
            Order total
          </Eyebrow>
          <View style={{ marginTop: 12, gap: 8 }}>
            <Row label="Subtotal" value={formatPaise(order.totals.subtotalPaise)} />
            {order.totals.discountPaise > 0 ? <Row label="Discount" value={`-${formatPaise(order.totals.discountPaise)}`} valueColor={colors.gold} /> : null}
            {order.totals.shippingPaise > 0 ? <Row label="Shipping" value={formatPaise(order.totals.shippingPaise)} /> : null}
            <Row label="GST" value={formatPaise(order.totals.gstPaise)} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8 }}>
              <Sans size={14}>Total</Sans>
              <Sans size={14}>{formatPaise(order.totals.grandTotalPaise)}</Sans>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Row({ label, value, valueColor = colors.ink }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Sans size={14} color={colors.muted}>
        {label}
      </Sans>
      <Sans size={14} color={valueColor}>
        {value}
      </Sans>
    </View>
  );
}
