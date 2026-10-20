/**
 * Hands PhonePe's hosted checkout URL from checkout to the in-app payment
 * screen (`checkout/pay`) without putting it in the route.
 *
 * A URL in the route would let any `diva://checkout/pay?url=…` link make the
 * app show an arbitrary page in a WebView dressed as our payment screen. Here
 * the screen only loads a URL this session got from our own backend for that
 * payment reference, and only if it is a PhonePe HTTPS page.
 */

const gatewayUrls = new Map<string, string>();

export function isPhonePeCheckoutUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "phonepe.com" || url.hostname.endsWith(".phonepe.com"));
  } catch {
    return false;
  }
}

/** `false` if `url` is not a PhonePe HTTPS page, in which case nothing is stored. */
export function rememberGatewayUrl(reference: string, url: string): boolean {
  if (!isPhonePeCheckoutUrl(url)) return false;
  gatewayUrls.set(reference, url);
  return true;
}

/** `null` if this session never started that payment (for example after a restart). */
export function gatewayUrlFor(reference: string): string | null {
  return gatewayUrls.get(reference) ?? null;
}

export function forgetGatewayUrl(reference: string) {
  gatewayUrls.delete(reference);
}

/**
 * PhonePe sends the page to the backend's `redirectUrl` when it is done: the
 * website's `/checkout/payment-return`, or `/app-return` for app payments. In
 * the WebView that is only a signal to stop and ask our server — the URL
 * itself is never trusted, so matching the path on any host is enough.
 */
export function isPaymentReturnUrl(value: string): boolean {
  try {
    const { pathname } = new URL(value);
    return /\/(app-return|checkout\/payment-return)\/?$/.test(pathname);
  } catch {
    return false;
  }
}

/**
 * PhonePe's page starts UPI apps with links like `upi://pay?…`, `phonepe://…`
 * or, on Android, `intent://pay?…#Intent;scheme=upi;package=…;end`. A WebView
 * cannot follow those itself, and `Linking` cannot open an `intent://` URL, so
 * it is turned back into the plain scheme link it wraps.
 */
export function externalAppUrl(value: string): string | null {
  if (!value.startsWith("intent://")) return value;
  const hash = value.indexOf("#Intent;");
  if (hash === -1) return null;
  const scheme = value
    .slice(hash + "#Intent;".length)
    .split(";")
    .find((part) => part.startsWith("scheme="))
    ?.slice("scheme=".length);
  if (!scheme || !/^[a-z][a-z0-9+.-]*$/i.test(scheme) || /^(https?|javascript|file|data)$/i.test(scheme)) return null;
  return `${scheme}://${value.slice("intent://".length, hash)}`;
}
