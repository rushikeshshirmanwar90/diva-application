import { useLocalSearchParams } from "expo-router";
import { Page } from "@/components/layout/page";
import { PaymentReturnView } from "@/components/checkout/payment-return-view";

/**
 * `?ref=` is the merchant transaction id, `?url=` the PhonePe page (browser
 * fallback only), `?sdk=incomplete` the native SDK saying the customer backed
 * out. Nothing in the params is trusted — the screen asks our server what the
 * gateway says.
 * The website's `/app-return` links back here as
 * `diva://checkout/payment-return?ref=…`, with no `url`.
 */
export default function PaymentReturnScreen() {
  const { ref, url, sdk } = useLocalSearchParams<{ ref?: string; url?: string; sdk?: string }>();
  return (
    <Page>
      <PaymentReturnView reference={ref ?? null} gatewayUrl={url ?? null} incomplete={sdk === "incomplete"} />
    </Page>
  );
}
