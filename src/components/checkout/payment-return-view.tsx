import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { AlertTriangle, Loader, RefreshCw } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { useStore } from "@/lib/store/store";
import { errorMessage } from "@/lib/api/client";
import { paymentStatus, type PaymentStatus } from "@/lib/api/checkout";
import { formatPaise } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Display, Sans } from "@/components/ui/text";
import { useNavigate } from "@/components/ui/link";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/layout/page";

/**
 * Confirms a payment. On the site this page is where PhonePe redirects the
 * browser back to; here it also *opens* PhonePe (in an in-app browser) and
 * keeps polling our status endpoint whether or not the customer comes back
 * through the browser — closing the sheet is fine, the poll continues.
 *
 * It never decides anything itself: the backend asks PhonePe, and the webhook
 * settles the order server-side regardless.
 */

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 24; // ~60 seconds

export function PaymentReturnView({ reference, gatewayUrl }: { reference: string | null; gatewayUrl: string | null }) {
  const navigate = useNavigate();
  const { clearCart } = useStore();

  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (gatewayUrl && !started.current) {
      void WebBrowser.openBrowserAsync(gatewayUrl, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET }).catch(() => {});
    }
  }, [gatewayUrl]);

  useEffect(() => {
    if (!reference) return;
    started.current = true;

    const controller = new AbortController();
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      attempts += 1;
      try {
        const result = await paymentStatus(reference, controller.signal);
        setStatus(result);

        if (result.status === "SUCCESS") {
          clearCart();
          WebBrowser.dismissBrowser();
          navigate(`/order-confirmed?order=${encodeURIComponent(result.orderNumber)}`, "replace");
          return;
        }
        if (result.status === "FAILED") {
          WebBrowser.dismissBrowser();
          return;
        }
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(errorMessage(cause));
        return;
      }

      if (attempts >= MAX_ATTEMPTS) {
        setExhausted(true);
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    void poll();

    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [reference, clearCart, navigate, attempt]);

  if (!reference) {
    return (
      <Shell
        icon={<AlertTriangle size={26} strokeWidth={1.4} color={colors.white} />}
        tone="error"
        title="We could not identify this payment"
        body="The payment reference is missing from this link. If money left your account, it will be confirmed or returned automatically — please check your orders in a few minutes."
      >
        <Button href="/account/orders" variant="gold" size="lg">
          View my orders
        </Button>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell icon={<AlertTriangle size={26} strokeWidth={1.4} color={colors.white} />} tone="error" title="We could not reach our servers" body={error}>
        <Button
          variant="gold"
          size="lg"
          icon={<RefreshCw size={14} color={colors.white} />}
          onPress={() => {
            setError(null);
            setAttempt((a) => a + 1);
          }}
        >
          Try again
        </Button>
      </Shell>
    );
  }

  if (status?.status === "FAILED") {
    return (
      <Shell
        icon={<AlertTriangle size={26} strokeWidth={1.4} color={colors.white} />}
        tone="error"
        title="That payment did not go through"
        body={status.failureMessage ?? "Your bank did not complete the payment. Nothing has been charged."}
      >
        <Sans size={12} color={colors.muted} align="center" style={{ marginBottom: 24 }}>
          Your bag is still intact and the items are held for you. Order <Sans size={12}>{status.orderNumber}</Sans>
        </Sans>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          <Button href="/checkout" variant="gold" size="lg">
            Try paying again
          </Button>
          <Button href="/cart" variant="outline" size="lg">
            Back to bag
          </Button>
        </View>
      </Shell>
    );
  }

  if (exhausted) {
    return (
      <Shell
        icon={<Loader size={26} strokeWidth={1.4} color={colors.white} />}
        tone="neutral"
        title="Still confirming your payment"
        body="Your bank is taking longer than usual. This is normal and nothing is lost — we will confirm it automatically and email you the moment it settles."
      >
        <Sans size={12} color={colors.muted} align="center" style={{ marginBottom: 24 }}>
          Reference <Sans size={12}>{reference}</Sans>
        </Sans>
        <Button href="/account/orders" variant="gold" size="lg">
          View my orders
        </Button>
      </Shell>
    );
  }

  return (
    <Shell
      icon={<Loader size={26} strokeWidth={1.4} color={colors.white} />}
      tone="neutral"
      title="Confirming your payment"
      body="Please keep this screen open — this usually takes a few seconds. Complete the payment in the PhonePe window; you can close it once done."
    >
      {gatewayUrl ? (
        <Button variant="outline" size="lg" onPress={() => void WebBrowser.openBrowserAsync(gatewayUrl)}>
          Reopen PhonePe
        </Button>
      ) : null}
      {status ? (
        <Sans size={12} color={colors.muted} align="center" style={{ marginTop: 16 }}>
          {formatPaise(status.amountPaise)} · Order <Sans size={12}>{status.orderNumber}</Sans>
        </Sans>
      ) : null}
    </Shell>
  );
}

function Shell({
  icon,
  tone,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  tone: "neutral" | "error" | "success";
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  const bg = tone === "error" ? colors.error : tone === "success" ? colors.gold : colors.charcoal;
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.line }}>
      <Container style={{ paddingVertical: 80, alignItems: "center" }}>
        <Logo width={96} />
        <View style={{ marginTop: 48, width: 56, height: 56, borderRadius: 28, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>{icon}</View>
        <Display size={30} align="center" style={{ marginTop: 32 }}>
          {title}
        </Display>
        <Sans size={14} leading="relaxed" color={colors.muted} align="center" style={{ marginTop: 12, maxWidth: 576 }}>
          {body}
        </Sans>
        <View style={{ marginTop: 32, alignItems: "center" }}>{children}</View>
      </Container>
    </View>
  );
}
