import { Platform } from "react-native";
import { PHONEPE_ENABLE_LOGS } from "@/lib/config";

/**
 * PhonePe Standard Checkout, native SDK (react-native-phonepe-pg v3).
 *
 * This is the v2 OAuth product, driven from an order token the backend mints
 * via `POST /payments/phonepe/initiate-sdk`. It exists because the hosted
 * checkout page cannot deep-link into installed UPI apps from an in-app
 * browser — it degrades to showing a QR code, which is useless on the one
 * device the customer is holding. The SDK gets the UPI intent list instead.
 *
 * The module is loaded with `require` inside a try/catch, not a static import,
 * so a web build or Expo Go (neither of which can load a native module) falls
 * back to the hosted page rather than failing at import time. Callers branch on
 * `isPhonePeNativeAvailable()`.
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

/** `SUCCESS` and `FAILURE` are the gateway's; `INTERRUPTED` means the customer backed out mid-flow. */
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
      await sdk.init(params.environment, params.merchantId, toFlowId(params.flowId), PHONEPE_ENABLE_LOGS);
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
    const status = String(response?.status ?? "").toUpperCase();

    if (status === "SUCCESS") return { status: "SUCCESS" };
    if (status === "INTERRUPTED") return { status: "INTERRUPTED", error: response?.error };
    return { status: "FAILURE", error: response?.error };
  } catch (cause) {
    // A throw here says the handoff broke, not that the payment failed. The
    // caller still polls our status endpoint, which asks PhonePe directly.
    initializedFor = null;
    return { status: "INTERRUPTED", error: cause instanceof Error ? cause.message : String(cause) };
  }
}
