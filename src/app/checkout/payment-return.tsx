import { useLocalSearchParams } from "expo-router";
import { Page } from "@/components/layout/page";
import { PaymentReturnView } from "@/components/checkout/payment-return-view";

/**
 * `?ref=` is the merchant transaction id, `?url=` the PhonePe page. Nothing in
 * the params is trusted — the screen asks our server what the gateway says.
 */
export default function PaymentReturnScreen() {
  const { ref, url } = useLocalSearchParams<{ ref?: string; url?: string }>();
  return (
    <Page>
      <PaymentReturnView reference={ref ?? null} gatewayUrl={url ?? null} />
    </Page>
  );
}
