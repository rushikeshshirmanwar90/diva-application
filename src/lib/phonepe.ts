import { Platform } from "react-native";
import { PHONEPE_ENABLE_LOGS } from "@/lib/config";

/**
 * PhonePe Standard Checkout, native SDK (react-native-phonepe-pg v3).
 *
 * This is the v2 OAuth product, driven from an order token the backend mints
 * via `POST /payments/phonepe/initiate-sdk`. The payment runs inside the app:
 * PhonePe's own screen, and the installed UPI apps, with no browser involved.
 *
 * The native setup the library itself leaves out (PhonePe's Maven repo, the
 * intermediate activity it launches, the iOS AppDelegate hook) is done by
 * `plugins/withPhonePe.js`, so this only works in a build made after that
 * plugin ran — a development or EAS build, never Expo Go.
 *
 * The module is loaded with `require` inside a try/catch, not a static import,
 * so a web build or Expo Go (neither of which can load a native module) still
 * starts rather than failing at import time. Checkout branches on
 * `isPhonePeNativeAvailable()` and refuses online payment where it is false —
 * there is no browser fallback.
 */

interface PhonePeSDK {
  init(environment: string, merchantId: string, flowId: string, enableLogging: boolean): Promise<unknown>;
  startTransaction(request: string, appSchema: string | null): Promise<{ status?: string; error?: string }>;
}

let sdk: PhonePeSDK | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("react-native-phonepe-pg");
  sdk = (mod.default ?? mod) as PhonePeSDK;
} catch {
  sdk = null;
}

export function isPhonePeNativeAvailable(): boolean {
  return Platform.OS !== "web" && typeof sdk?.startTransaction === "function";
}

/**
 * The SDK's own word on how the journey ended — never proof of payment.
 * `SUCCESS` means PhonePe's screen closed normally, `FAILURE` that the customer
 * backed out or the payment failed, `INTERRUPTED` that the handoff itself broke.
 */
export type PhonePeResult = {
  status: "SUCCESS" | "FAILURE" | "INTERRUPTED" | "UNAVAILABLE";
  error?: string;
};

/** `init` is per merchant+environment, and re-running it on every payment is wasted work. */
let initializedFor: string | null = null;

/** The SDK rejects anything but `[A-Za-z0-9]`, and our ids carry hyphens. */
function toFlowId(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "").slice(0, 36) || "divacheckout";
}

export async function payWithPhonePe(params: {
  merchantId: string;
  orderId: string;
  token: string;
  environment: "SANDBOX" | "PRODUCTION";
  /** Our merchant transaction id — doubles as the SDK's journey id for support tickets. */
  flowId: string;
}): Promise<PhonePeResult> {
  if (!isPhonePeNativeAvailable() || !sdk) {
    return { status: "UNAVAILABLE", error: "The PhonePe SDK is not available in this build." };
  }

  const key = `${params.environment}:${params.merchantId}`;

  try {
    if (initializedFor !== key) {
      const ready = await sdk.init(params.environment, params.merchantId, toFlowId(params.flowId), PHONEPE_ENABLE_LOGS);
      // Android throws on bad arguments; iOS resolves `false` instead.
      if (ready === false) throw new Error("PhonePe SDK init returned false");
      initializedFor = key;
    }

    const request = JSON.stringify({
      orderId: params.orderId,
      merchantId: params.merchantId,
      token: params.token,
      paymentMode: { type: "PAY_PAGE" },
    });

    // iOS needs a scheme to return to after a UPI app takes over; Android resolves it itself.
    const response = await sdk.startTransaction(request, Platform.OS === "ios" ? "diva" : null);
    if (PHONEPE_ENABLE_LOGS) console.log("[PhonePe] startTransaction result", response);
    const status = String(response?.status ?? "").toUpperCase();

    if (status === "SUCCESS") return { status: "SUCCESS" };
    if (status === "INTERRUPTED") return { status: "INTERRUPTED", error: response?.error };
    return { status: "FAILURE", error: response?.error };
  } catch (cause) {
    // A throw here says the handoff broke, not that the payment failed. The
    // caller still polls our status endpoint, which asks PhonePe directly.
    initializedFor = null;
    if (PHONEPE_ENABLE_LOGS) console.warn("[PhonePe] SDK threw", cause);
    return { status: "INTERRUPTED", error: cause instanceof Error ? cause.message : String(cause) };
  }
}
