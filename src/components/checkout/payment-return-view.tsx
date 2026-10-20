import { useEffect, useState } from "react";
import { AppState, View } from "react-native";
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
 * browser back to. In the app it is where checkout lands once PhonePe's native
 * SDK hands back, and it polls our status endpoint for the real outcome. It
 * never opens a browser.
 *
 * It never decides anything itself: the backend asks PhonePe, and the webhook
 * settles the order server-side regardless. Nothing in the route params is
 * trusted beyond being the reference to ask about — `incomplete` (the SDK
 * said the customer backed out) only shortens the wait before offering a retry.
 */

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 24; // ~60 seconds, counted only once the customer is back
const INCOMPLETE_MAX_ATTEMPTS = 4; // ~10 seconds, in case the payment went through anyway

/**
 * While the app is in the background the customer is in a UPI app, still
 * approving the payment or entering a PIN. That time is not a stall, so it
 * neither burns the ceiling above nor needs a fast cadence — the webhook
 * settles the order either way, and the OS may pause these timers regardless.
 */
const PAYING_INTERVAL_MS = 5000;
const PAYING_MAX_MS = 15 * 60_000;

export function PaymentReturnView({ reference, incomplete = false }: { reference: string | null; incomplete?: boolean }) {
  const navigate = useNavigate();
  const { clearCart } = useStore();

  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!reference) return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let inFlight = false;
    let pollOnReturn = false;
    // SUCCESS, FAILED or an error: nothing further to ask.
    let settled = false;
    let backgroundedAt: number | null = AppState.currentState === "active" ? null : Date.now();

    const schedule = (delayMs: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void poll(), delayMs);
    };

    const poll = async () => {
      if (settled || inFlight) return;
      inFlight = true;
      if (backgroundedAt === null) attempts += 1;

      try {
        const result = await paymentStatus(reference, controller.signal);
        setStatus(result);

        if (result.status === "SUCCESS") {
          settled = true;
          clearCart();
          navigate(`/order-confirmed?order=${encodeURIComponent(result.orderNumber)}`, "replace");
          return;
        }
        if (result.status === "FAILED") {
          settled = true;
          return;
        }
      } catch (cause) {
        if (controller.signal.aborted) return;
        settled = true;
        setError(errorMessage(cause));
        return;
      } finally {
        inFlight = false;
      }

      // The customer came back while that request was in flight.
      if (pollOnReturn) {
        pollOnReturn = false;
        schedule(0);
        return;
      }

      if (backgroundedAt !== null) {
        if (Date.now() - backgroundedAt >= PAYING_MAX_MS) {
          setExhausted(true);
          return;
        }
        schedule(PAYING_INTERVAL_MS);
        return;
      }

      if (attempts >= (incomplete ? INCOMPLETE_MAX_ATTEMPTS : MAX_ATTEMPTS)) {
        setExhausted(true);
        return;
      }
      schedule(POLL_INTERVAL_MS);
    };

    const subscription = AppState.addEventListener("change", (next) => {
      if (next !== "active") {
        backgroundedAt ??= Date.now();
        return;
      }
      if (backgroundedAt === null) return;

      // Back from the UPI app: ask now, then at the fast cadence with a fresh
      // ceiling — also resuming a loop that had already given up.
      backgroundedAt = null;
      attempts = 0;
      if (settled) return;
      setExhausted(false);
      if (inFlight) {
        pollOnReturn = true;
        return;
      }
      schedule(0);
    });

    void poll();

    return () => {
      subscription.remove();
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [reference, incomplete, clearCart, navigate, attempt]);

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

  if (exhausted && incomplete) {
    return (
      <Shell
        icon={<AlertTriangle size={26} strokeWidth={1.4} color={colors.white} />}
        tone="error"
        title="Payment not completed"
        body="The payment was not completed in PhonePe. If money did leave your account, your order will be confirmed automatically — check Orders in a few minutes."
      >
        <Sans size={12} color={colors.muted} align="center" style={{ marginBottom: 24 }}>
          Your bag is still intact. Reference <Sans size={12}>{reference}</Sans>
        </Sans>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          <Button href="/checkout" variant="gold" size="lg">
            Try paying again
          </Button>
          <Button href="/account/orders" variant="outline" size="lg">
            View my orders
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
      body="Please keep this screen open while we verify your transaction with PhonePe."
    >
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
