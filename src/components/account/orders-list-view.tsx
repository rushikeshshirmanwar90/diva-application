import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Package } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { listOrders, type Order } from "@/lib/api/checkout";
import { errorMessage } from "@/lib/api/client";
import { formatDate, formatPaise } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBox } from "@/components/ui/field";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import { Spinner } from "@/components/ui/spinner";

const PAGE_SIZE = 10;

export const STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting payment",
  PAYMENT_INITIATED: "Awaiting payment",
  PAYMENT_FAILED: "Payment failed",
  ABANDONED: "Not completed",
  PAYMENT_SUCCESS: "Confirmed",
  CONFIRMED: "Confirmed",
  SHIPMENT_CREATED: "Packing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return requested",
  RETURN_PICKED: "Return collected",
  REFUNDED: "Refunded",
};

const statusTone: Record<string, string> = {
  DELIVERED: colors.success,
  CANCELLED: colors.sale,
  PAYMENT_FAILED: colors.sale,
  ABANDONED: colors.sale,
  REFUNDED: colors.sale,
  SHIPPED: colors.gold,
  OUT_FOR_DELIVERY: colors.gold,
};

export function OrdersListView() {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setOrders(null);
      setError(null);
      try {
        const result = await listOrders(page, PAGE_SIZE);
        if (cancelled) return;
        setOrders(result.items);
        setTotal(result.total);
      } catch (cause) {
        if (cancelled) return;
        setError(errorMessage(cause));
        setOrders([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <View>
      <Display size={24}>Your orders</Display>
      <Sans size={14} color={colors.muted} style={{ marginTop: 8 }}>
        Invoices, tracking and return requests all live here.
      </Sans>

      {error ? (
        <View style={{ marginTop: 24 }}>
          <ErrorBox>{error}</ErrorBox>
        </View>
      ) : null}

      {orders === null ? (
        <View style={{ marginTop: 40, alignItems: "center", paddingVertical: 40 }}>
          <Spinner size={44} />
        </View>
      ) : orders.length === 0 ? (
        <View style={{ marginTop: 40 }}>
          <EmptyState icon={<Package size={24} strokeWidth={1.3} color={colors.gold} />} title="No orders yet" body="Pieces you buy will show up here, with tracking and invoices." />
        </View>
      ) : (
        <>
          <View style={{ marginTop: 40, gap: 24 }}>
            {orders.map((order) => (
              <Link
                key={order.orderNumber}
                href={`/account/orders/${order.orderNumber}`}
                style={{
                  borderWidth: 1,
                  borderColor: colors.line,
                  backgroundColor: "rgba(248,245,240,0.5)",
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
                pressedStyle={{ backgroundColor: colors.beige }}
              >
                <View>
                  <Sans size={14}>{order.orderNumber}</Sans>
                  <Sans size={12} color={colors.muted} style={{ marginTop: 2 }}>
                    Placed {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "piece" : "pieces"}
                  </Sans>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Eyebrow size={10} color={statusTone[order.status] ?? colors.charcoal}>
                    {STATUS_LABEL[order.status] ?? order.status.replace(/_/g, " ")}
                  </Eyebrow>
                  <Sans size={14} style={{ marginTop: 2 }}>
                    {formatPaise(order.totals.grandTotalPaise)}
                  </Sans>
                </View>
              </Link>
            ))}
          </View>

          {totalPages > 1 ? (
            <View style={{ marginTop: 32, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24 }}>
              <Pressable onPress={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ opacity: page === 1 ? 0.3 : 1 }}>
                <Eyebrow size={10} color={colors.charcoal}>
                  Previous
                </Eyebrow>
              </Pressable>
              <Sans size={11} color={colors.muted}>
                Page {page} of {totalPages}
              </Sans>
              <Pressable onPress={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ opacity: page === totalPages ? 0.3 : 1 }}>
                <Eyebrow size={10} color={colors.charcoal}>
                  Next
                </Eyebrow>
              </Pressable>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
