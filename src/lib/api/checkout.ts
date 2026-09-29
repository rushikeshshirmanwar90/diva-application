import { apiFetch, apiFetchWithMeta } from "@/lib/api/client";

/**
 * Checkout, payment and shipping calls.
 *
 * Note what none of these send: an amount. The server prices the order from
 * live metal rates and its own stored variant specs; the client says only what
 * it wants and how many. Adding a `total` here would be adding a number the
 * customer can edit.
 *
 * These types are hand-written against the backend's Zod validators. Once the
 * catalogue reads move to the API, run `npm run sync:types` and replace them
 * with the generated ones — that is the drift guard described in
 * `implementation.md`, and hand-copies are exactly what it exists to catch.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AddressInput = {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

export type OrderItemInput = {
  productId: string;
  variantId: string;
  quantity: number;
};

/** What a customer may pick at checkout. `MANUAL` is staff-only and never sent from here. */
export type CheckoutPaymentMethod = "PHONEPE" | "COD";

export type CreateOrderInput = {
  items: OrderItemInput[];
  addressId?: string;
  shippingAddress?: AddressInput;
  couponCode?: string;
  giftNote?: string;
  /** Defaults to PHONEPE server-side when omitted. */
  paymentMethod?: CheckoutPaymentMethod;
};

export type OrderTotals = {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  gstPaise: number;
  grandTotalPaise: number;
};

export type Order = {
  _id: string;
  orderNumber: string;
  status: string;
  /** Every status change, oldest first — what the tracker is drawn from. */
  statusHistory: { status: string; at: string; note?: string }[];
  paymentMethod: CheckoutPaymentMethod | "MANUAL";
  deliveredAt?: string;
  totals: OrderTotals;
  items: {
    title: string;
    slug: string;
    sku: string;
    imageUrl?: string;
    size?: string;
    quantity: number;
    lineTotalPaise: number;
  }[];
  shippingAddress: AddressInput & { country: string };
  createdAt: string;
};

export type InitiatedPayment = {
  merchantTransactionId: string;
  redirectUrl: string;
  orderNumber: string;
  amountPaise: number;
};

export type InitiatedSDKPayment = {
  merchantId: string;
  merchantTransactionId: string;
  orderNumber: string;
  amountPaise: number;
  base64Body: string;
  checksum: string;
  environment: "SANDBOX" | "PRODUCTION";
};

export type PaymentStatus = {
  merchantTransactionId: string;
  orderNumber: string;
  status: "INITIATED" | "PENDING" | "SUCCESS" | "FAILED" | "REFUND_INITIATED" | "REFUNDED";
  orderStatus: string;
  amountPaise: number;
  failureMessage?: string;
};

export type Serviceability = {
  serviceable: boolean;
  pincode: string;
  shippingChargePaise: number;
  estimatedDays: { min: number; max: number } | null;
  courierName: string | null;
  /** Store policy for this cart value — the switch and the order-value cap. */
  codAvailable: boolean;
  codUnavailableReason?: string;
  reason?: string;
};

export type Tracking = {
  orderNumber: string;
  status: string;
  awbCode: string | null;
  courierName: string | null;
  trackingUrl: string | null;
  estimatedDeliveryAt: string | null;
  events: {
    status: string;
    description?: string;
    location?: string;
    occurredAt: string;
  }[];
};

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

export function createOrder(input: CreateOrderInput) {
  return apiFetch<Order>("/orders", { method: "POST", body: input });
}

export async function listOrders(page = 1, limit = 10): Promise<{ items: Order[]; total: number }> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  const { data, meta } = await apiFetchWithMeta<Order[]>(`/orders?${query}`);

  return { items: data, total: (meta.total as number) ?? data.length };
}

export function getOrder(orderNumber: string) {
  return apiFetch<Order>(`/orders/${encodeURIComponent(orderNumber)}`);
}

export function cancelOrder(orderNumber: string, reason?: string) {
  return apiFetch<Order>(`/orders/${encodeURIComponent(orderNumber)}/cancel`, {
    method: "POST",
    body: { reason },
  });
}

export function initiatePayment(orderNumber: string) {
  return apiFetch<InitiatedPayment>("/payments/phonepe/initiate", {
    method: "POST",
    body: { orderNumber },
  });
}

/**
 * Initiates payment via PhonePe's native React Native SDK (react-native-phonepe-pg).
 * Returns the base64 payload and checksum for startTransaction().
 */
export function initiatePaymentSDK(orderNumber: string) {
  return apiFetch<InitiatedSDKPayment>("/payments/phonepe/initiate-sdk", {
    method: "POST",
    body: { orderNumber },
  });
}

/**
 * Polled by the return page while a payment settles.
 *
 * It reaches PhonePe on every call, so poll it on a couple of seconds' interval
 * with a hard ceiling — not in a tight loop.
 */
export function paymentStatus(merchantTransactionId: string, signal?: AbortSignal) {
  return apiFetch<PaymentStatus>(
    `/payments/phonepe/status/${encodeURIComponent(merchantTransactionId)}`,
    { signal },
  );
}

export function checkServiceability(pincode: string, cartValuePaise: number) {
  const query = new URLSearchParams({
    pincode,
    cartValuePaise: String(cartValuePaise),
  });

  return apiFetch<Serviceability>(`/shipping/serviceability?${query}`);
}

export function getTracking(orderNumber: string) {
  return apiFetch<Tracking>(`/orders/${encodeURIComponent(orderNumber)}/tracking`);
}
