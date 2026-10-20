import { Stack, useLocalSearchParams } from "expo-router";
import { PhonePeWebCheckout } from "@/components/checkout/phonepe-web-checkout";

/**
 * PhonePe's hosted checkout inside the app. `?ref=` is the merchant
 * transaction id; the page itself is looked up from what checkout stored for
 * it this session, never taken from the URL.
 */
export default function PayScreen() {
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  return (
    <>
      {/* A swipe back would leave the payment half-done with no status check. */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <PhonePeWebCheckout reference={ref ?? null} />
    </>
  );
}
