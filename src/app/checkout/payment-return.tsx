import { useLocalSearchParams } from "expo-router";
import { Page } from "@/components/layout/page";
import { PaymentReturnView } from "@/components/checkout/payment-return-view";

/**
 * `?ref=` is the merchant transaction id, `?sdk=incomplete` the native SDK
 * saying the customer backed out. Nothing in the params is trusted — the
 * screen asks our server what the gateway says.
 */
export default function PaymentReturnScreen() {
  const { ref, sdk } = useLocalSearchParams<{ ref?: string; sdk?: string }>();
  return (
    <Page>
      <PaymentReturnView reference={ref ?? null} incomplete={sdk === "incomplete"} />
    </Page>
  );
}
