import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { AlertTriangle, Banknote, Check, ChevronLeft, Clock, Gift, Lock, Plus, ShieldCheck, ShoppingBag, Smartphone, Truck } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { cdnImage, IMG } from "@/lib/images";
import { useStore } from "@/lib/store/store";
import { useAuth } from "@/lib/auth/auth-context";
import { errorMessage } from "@/lib/api/client";
import { createAddress, listAddresses, type Address } from "@/lib/api/addresses";
import {
  checkServiceability,
  createOrder,
  initiatePayment,
  initiatePaymentSDK,
  type CheckoutPaymentMethod,
  type Serviceability,
} from "@/lib/api/checkout";
import { isPhonePeNativeAvailable, startPhonePeTransaction } from "@/lib/phonepe";
import { formatPaise } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Checkbox, Field } from "@/components/ui/field";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link, useNavigate } from "@/components/ui/link";
import { Logo } from "@/components/layout/logo";
import { OrderSummary } from "@/components/cart/order-summary";
import { AddressForm } from "@/components/account/address-form";
import { Container } from "@/components/layout/page";

/**
 * Two-step checkout: address → payment. A port of the site's `CheckoutView`.
 *
 * The only difference is what happens after `initiatePayment`: the site sets
 * `window.location` to PhonePe; here the payment-return screen opens the
 * gateway in an in-app browser and polls our status endpoint meanwhile.
 */

const steps = ["Address", "Payment"] as const;

const acceptedMethods = [
  { id: "upi", label: "UPI", sub: "GPay, PhonePe, Paytm — pay from any UPI app" },
  { id: "card", label: "Credit / debit card", sub: "Visa, Mastercard, RuPay, Amex" },
  { id: "netbanking", label: "Net banking", sub: "58 banks supported" },
  { id: "wallet", label: "Wallets", sub: "PhonePe wallet and linked balances" },
];

export function CheckoutView() {
  const navigate = useNavigate();
  const { hydrated, lines, totals, coupon, clearCart } = useStore();
  const { status: authStatus } = useAuth();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);

  const [giftNote, setGiftNote] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("PHONEPE");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "guest") navigate("/login?redirect=/checkout", "replace");
  }, [authStatus, navigate]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    void (async () => {
      try {
        const list = await listAddresses();
        if (cancelled) return;
        setAddresses(list);
        setAddressId((current) => current ?? list.find((a) => a.isDefault)?._id ?? list[0]?._id ?? null);
      } catch {
        if (!cancelled) setAddresses([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  const address = addresses?.find((a) => a._id === addressId) ?? null;

  const [lookup, setLookup] = useState<{ pincode: string; result: Serviceability | null } | null>(null);
  const shipping = address && lookup?.pincode === address.pincode ? lookup.result : null;
  const checkingPincode = !!address && lookup?.pincode !== address.pincode;
  const codAvailable = shipping ? shipping.codAvailable : true;
  const codUnavailableReason = shipping?.codUnavailableReason;

  useEffect(() => {
    if (!hydrated || lines.length === 0 || !address) return;
    const pincode = address.pincode;
    let cancelled = false;

    void (async () => {
      let result: Serviceability | null = null;
      try {
        result = await checkServiceability(pincode, totals.total);
      } catch (cause) {
        console.warn("[checkout] Serviceability check failed", cause);
      }
      if (cancelled) return;
      setLookup({ pincode, result });
      if (result && !result.serviceable) setError(result.reason ?? "We cannot deliver to this pincode.");
      if (result && !result.codAvailable) setPaymentMethod("PHONEPE");
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address?.pincode, hydrated, lines.length, totals.total]);

  if (!hydrated) return <View style={{ minHeight: 480 }} />;
  if (authStatus === "loading" || authStatus === "guest") return <View style={{ minHeight: 480 }} />;

  if (lines.length === 0) {
    return (
      <Container>
        <EmptyState
          icon={<ShoppingBag size={24} strokeWidth={1.3} color={colors.gold} />}
          title="Nothing to check out"
          body="Your bag is empty. Add a piece and the rate will be locked for 30 minutes from this screen."
        />
      </Container>
    );
  }

  const placeOrder = async () => {
    if (!address) {
      setError("Please select or add a delivery address.");
      setStep(0);
      return;
    }

    setPlacing(true);
    setError(null);

    try {
      const deliverable = await checkServiceability(address.pincode, totals.total).catch(() => null);

      if (deliverable && !deliverable.serviceable) {
        setLookup({ pincode: address.pincode, result: deliverable });
        setError(deliverable.reason ?? "We cannot deliver to this pincode.");
        setStep(0);
        setPlacing(false);
        return;
      }

      if (paymentMethod === "COD" && deliverable && !deliverable.codAvailable) {
        setLookup({ pincode: address.pincode, result: deliverable });
        setPaymentMethod("PHONEPE");
        setError(deliverable.codUnavailableReason ?? "Cash on delivery is not available for this order. Please pay online.");
        setPlacing(false);
        return;
      }

      const order = await createOrder({
        items: lines.map((line) => ({ productId: line.product.id, variantId: line.variant.id, quantity: line.qty })),
        addressId: address._id,
        couponCode: coupon ?? undefined,
        giftNote: giftNote && giftMessage.trim() ? giftMessage.trim() : undefined,
        paymentMethod,
      });

      if (paymentMethod === "COD") {
        clearCart();
        navigate(`/order-confirmed?order=${encodeURIComponent(order.orderNumber)}`, "replace");
        return;
      }

      if (isPhonePeNativeAvailable()) {
        try {
          const sdkPayment = await initiatePaymentSDK(order.orderNumber);
          void startPhonePeTransaction({
            merchantId: sdkPayment.merchantId,
            base64Body: sdkPayment.base64Body,
            checksum: sdkPayment.checksum,
            environment: sdkPayment.environment,
          });
          navigate(
            `/checkout/payment-return?ref=${encodeURIComponent(sdkPayment.merchantTransactionId)}`,
            "replace",
          );
          return;
        } catch (sdkError) {
          console.warn("[checkout] SDK initiate failed, falling back to web flow:", sdkError);
        }
      }

      const payment = await initiatePayment(order.orderNumber);
      navigate(
        `/checkout/payment-return?ref=${encodeURIComponent(payment.merchantTransactionId)}&url=${encodeURIComponent(payment.redirectUrl)}`,
        "replace",
      );
    } catch (cause) {
      setError(errorMessage(cause));
      setPlacing(false);
    }
  };

  const radio = (selected: boolean) => (
    <View
      style={{ marginTop: 4, width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: selected ? colors.gold : colors.line, alignItems: "center", justifyContent: "center" }}
    >
      {selected ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold }} /> : null}
    </View>
  );

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.line }}>
      <Container style={{ paddingVertical: 40 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <Logo width={96} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Lock size={12} color={colors.gold} />
            <Eyebrow size={10}>Secure checkout</Eyebrow>
          </View>
        </View>

        {/* Step indicator */}
        <View style={{ marginTop: 40, flexDirection: "row", alignItems: "center", gap: 12 }}>
          {steps.map((label, i) => (
            <View key={label} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Pressable onPress={() => i < step && setStep(i)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: i < step ? colors.gold : i === step ? colors.charcoal : colors.line,
                    backgroundColor: i < step ? colors.gold : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i < step ? (
                    <Check size={13} strokeWidth={3} color={colors.white} />
                  ) : (
                    <Sans size={12} color={i === step ? colors.charcoal : colors.muted}>
                      {i + 1}
                    </Sans>
                  )}
                </View>
                <Eyebrow size={10} color={i <= step ? colors.ink : colors.muted}>
                  {label}
                </Eyebrow>
              </Pressable>
              {i < steps.length - 1 ? <View style={{ flex: 1, height: 1, backgroundColor: i < step ? colors.gold : colors.line }} /> : null}
            </View>
          ))}
        </View>

        {error ? (
          <View
            accessibilityRole="alert"
            style={{ marginTop: 32, flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1, borderColor: "rgba(192,57,43,0.3)", backgroundColor: "rgba(192,57,43,0.05)", padding: 16 }}
          >
            <AlertTriangle size={16} strokeWidth={1.6} color={colors.error} style={{ marginTop: 2 }} />
            <Sans size={14} color={colors.error} style={{ flex: 1 }}>
              {error}
            </Sans>
          </View>
        ) : null}

        <View style={{ marginTop: 48, gap: 56 }}>
          <View>
            {step === 0 ? (
              <View>
                <Display size={30}>Where should it go?</Display>
                <Sans size={14} color={colors.muted} style={{ marginTop: 8 }}>
                  Photo ID matching the name below is required at delivery — this is an insured jewellery shipment.
                </Sans>

                {addresses === null ? (
                  <View style={{ marginTop: 32, alignItems: "center", paddingVertical: 40 }}>
                    <ActivityIndicator color={colors.muted} />
                  </View>
                ) : addingAddress || addresses.length === 0 ? (
                  <View style={{ marginTop: 32 }}>
                    <AddressForm
                      onCancel={() => setAddingAddress(false)}
                      onSaved={(saved) => {
                        setAddresses((current) => [...(current ?? []), saved]);
                        setAddressId(saved._id);
                        setAddingAddress(false);
                      }}
                      save={(input) => createAddress(input)}
                    />
                  </View>
                ) : (
                  <>
                    <View style={{ marginTop: 32, gap: 16 }}>
                      {addresses.map((a) => {
                        const selected = addressId === a._id;
                        return (
                          <Pressable
                            key={a._id}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            onPress={() => setAddressId(a._id)}
                            style={{
                              flexDirection: "row",
                              gap: 16,
                              borderWidth: 1,
                              borderColor: selected ? colors.charcoal : colors.line,
                              backgroundColor: selected ? "rgba(248,245,240,0.6)" : "transparent",
                              padding: 20,
                            }}
                          >
                            {radio(selected)}
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                                <Eyebrow size={10} color={colors.gold}>
                                  {a.label || a.type}
                                </Eyebrow>
                                {a.isDefault ? <Eyebrow size={9}>Default</Eyebrow> : null}
                              </View>
                              <Sans size={14} style={{ marginTop: 6 }}>
                                {a.fullName}
                              </Sans>
                              <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 4 }}>
                                {a.line1}
                                {a.line2 ? `, ${a.line2}` : ""}
                                {"\n"}
                                {a.city}, {a.state} {a.pincode}
                                {"\n"}
                                {a.phone}
                              </Sans>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Pressable onPress={() => setAddingAddress(true)} style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" }}>
                      <Plus size={12} color={colors.gold} />
                      <Eyebrow size={10} color={colors.gold}>
                        Add a new address
                      </Eyebrow>
                    </Pressable>
                  </>
                )}

                {address ? (
                  <View style={{ marginTop: 24, flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: colors.beige, padding: 16 }}>
                    {checkingPincode ? (
                      <>
                        <ActivityIndicator size="small" color={colors.gold} />
                        <Sans size={12} color={colors.muted} style={{ flex: 1 }}>
                          Checking delivery to {address.pincode}…
                        </Sans>
                      </>
                    ) : shipping?.serviceable ? (
                      <>
                        <Truck size={16} strokeWidth={1.5} color={colors.gold} style={{ marginTop: 2 }} />
                        <Sans size={12} leading="relaxed" color={colors.muted} style={{ flex: 1 }}>
                          Delivers to {shipping.pincode} in{" "}
                          <Sans size={12}>
                            {shipping.estimatedDays ? `${shipping.estimatedDays.min}–${shipping.estimatedDays.max} days` : "3–7 days"}
                          </Sans>
                          {shipping.courierName ? ` via ${shipping.courierName}` : ""}. Insured shipping is complimentary.
                        </Sans>
                      </>
                    ) : shipping ? (
                      <>
                        <AlertTriangle size={16} strokeWidth={1.5} color={colors.error} style={{ marginTop: 2 }} />
                        <Sans size={12} color={colors.error} style={{ flex: 1 }}>
                          {shipping.reason ?? "We cannot deliver to this pincode."}
                        </Sans>
                      </>
                    ) : null}
                  </View>
                ) : null}

                {addresses && addresses.length > 0 && !addingAddress ? (
                  <Link href="/account/addresses" style={{ marginTop: 24, alignSelf: "flex-start" }}>
                    <Sans size={12} color={colors.gold}>
                      Manage saved addresses
                    </Sans>
                  </Link>
                ) : null}

                <View style={{ marginTop: 32, borderWidth: 1, borderColor: colors.line, padding: 20 }}>
                  <Checkbox checked={giftNote} onChange={setGiftNote}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Gift size={14} color={colors.gold} />
                      <Sans size={14}>Add a handwritten gift note</Sans>
                    </View>
                    <Sans size={12} color={colors.muted} style={{ marginTop: 4 }}>
                      Written by our team in Bengaluru and tucked into the box. The invoice is emailed to you instead of being
                      enclosed.
                    </Sans>
                  </Checkbox>
                </View>

                {giftNote ? (
                  <View style={{ marginTop: 16 }}>
                    <Field boxed multiline value={giftMessage} onChangeText={setGiftMessage} placeholder="Your message, up to 200 characters" maxLength={200} />
                  </View>
                ) : null}

                <Button
                  variant="gold"
                  size="lg"
                  fullWidth
                  style={{ marginTop: 32 }}
                  disabled={!address || (shipping ? !shipping.serviceable : false)}
                  onPress={() => setStep(1)}
                >
                  Continue to payment
                </Button>
              </View>
            ) : null}

            {step === 1 ? (
              <View>
                <Display size={30}>Payment</Display>
                <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Clock size={14} color={colors.gold} />
                  <Sans size={14} color={colors.muted}>
                    Your price is held for 30 minutes from this screen
                  </Sans>
                </View>

                <Eyebrow size={10} style={{ marginTop: 32 }}>
                  How would you like to pay?
                </Eyebrow>

                <View style={{ marginTop: 16, gap: 16 }}>
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected: paymentMethod === "PHONEPE" }}
                    onPress={() => setPaymentMethod("PHONEPE")}
                    style={{
                      flexDirection: "row",
                      gap: 16,
                      borderWidth: 1,
                      borderColor: paymentMethod === "PHONEPE" ? colors.charcoal : colors.line,
                      backgroundColor: paymentMethod === "PHONEPE" ? "rgba(248,245,240,0.6)" : "transparent",
                      padding: 20,
                    }}
                  >
                    {radio(paymentMethod === "PHONEPE")}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Smartphone size={14} color={colors.gold} />
                        <Sans size={14}>Pay online</Sans>
                      </View>
                      <Sans size={12} color={colors.muted} style={{ marginTop: 4 }}>
                        UPI, cards, net banking and wallets via PhonePe’s secure page.
                      </Sans>
                      {paymentMethod === "PHONEPE" ? (
                        <View style={{ marginTop: 16, gap: 8, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 16 }}>
                          {acceptedMethods.map((m) => (
                            <View key={m.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                              <Check size={12} strokeWidth={2} color={colors.gold} />
                              <Sans size={12}>{m.label}</Sans>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  </Pressable>

                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected: paymentMethod === "COD", disabled: !codAvailable }}
                    disabled={!codAvailable}
                    onPress={() => setPaymentMethod("COD")}
                    style={{
                      flexDirection: "row",
                      gap: 16,
                      borderWidth: 1,
                      borderColor: !codAvailable ? colors.line : paymentMethod === "COD" ? colors.charcoal : colors.line,
                      backgroundColor: paymentMethod === "COD" ? "rgba(248,245,240,0.6)" : "transparent",
                      opacity: codAvailable ? 1 : 0.6,
                      padding: 20,
                    }}
                  >
                    {radio(paymentMethod === "COD")}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Banknote size={14} color={colors.gold} />
                        <Sans size={14}>Cash on delivery</Sans>
                      </View>
                      <Sans size={12} color={colors.muted} style={{ marginTop: 4 }}>
                        {codAvailable
                          ? `Pay ${formatPaise(totals.total)} to the courier when your order arrives — cash or UPI at the door.`
                          : (codUnavailableReason ?? "Not available for this order.")}
                      </Sans>
                    </View>
                  </Pressable>
                </View>

                {paymentMethod === "PHONEPE" ? (
                  <View style={{ marginTop: 24, flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: colors.beige, padding: 20 }}>
                    <ShieldCheck size={18} strokeWidth={1.4} color={colors.gold} style={{ marginTop: 2 }} />
                    <Sans size={12} leading="relaxed" color={colors.muted} style={{ flex: 1 }}>
                      You will be taken to PhonePe’s secure gateway to complete payment — card and UPI details are never entered
                      on or stored by Diva.
                    </Sans>
                  </View>
                ) : null}

                <View style={{ marginTop: 32, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  <Button variant="outline" size="lg" disabled={placing} onPress={() => setStep(0)} icon={<ChevronLeft size={14} color={colors.charcoal} />}>
                    Back
                  </Button>
                  <Button variant="gold" size="lg" disabled={placing} loading={placing} onPress={() => void placeOrder()}>
                    {placing
                      ? paymentMethod === "COD"
                        ? "Placing your order…"
                        : "Taking you to PhonePe…"
                      : paymentMethod === "COD"
                        ? `Place order · ${formatPaise(totals.total)}`
                        : `Pay ${formatPaise(totals.total)}`}
                  </Button>
                </View>
              </View>
            ) : null}
          </View>

          <View>
            <View style={{ marginBottom: 24, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }}>
              {lines.map((line, i) => (
                <View key={line.key} style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 16, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.line }}>
                  <View style={{ width: 64, height: 64, backgroundColor: colors.beige, overflow: "hidden" }}>
                    {line.product.images[0] ? (
                      <Image source={{ uri: cdnImage(line.product.images[0], IMG.thumb) }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                    ) : null}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Sans size={14} numberOfLines={1}>
                      {line.product.title}
                    </Sans>
                    <Sans size={12} color={colors.muted}>
                      {line.variant.label} · Qty {line.qty}
                    </Sans>
                  </View>
                  <Sans size={14}>{formatPaise(line.lineTotal)}</Sans>
                </View>
              ))}
            </View>

            <OrderSummary totals={totals} coupon={coupon} title="You're paying" />

            <Button href="/cart" variant="ghost" style={{ marginTop: 16, alignSelf: "center" }}>
              Edit bag
            </Button>
          </View>
        </View>
      </Container>
    </View>
  );
}
