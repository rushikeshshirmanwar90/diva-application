import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, View } from "react-native";
import { WebView } from "react-native-webview";
import type { ShouldStartLoadRequest, WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Lock, X } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { externalAppUrl, forgetGatewayUrl, gatewayUrlFor, isPaymentReturnUrl } from "@/lib/payment-gateway";
import { Sans } from "@/components/ui/text";
import { useNavigate } from "@/components/ui/link";

/**
 * PhonePe's hosted checkout, shown inside the app.
 *
 * Used when the build has no native PhonePe SDK (Expo Go, or an app installed
 * before the SDK was added), so the customer still gets the payment gateway
 * instead of a message — in a WebView, never the phone's browser.
 *
 * Links that start a UPI app (`upi://`, `phonepe://`, Android `intent://`) are
 * handed to that app. When PhonePe sends the page to the return URL, or the
 * customer closes the screen, the status screen takes over and asks our
 * server; nothing the page or its URL says settles the order.
 */
export function PhonePeWebCheckout({ reference }: { reference: string | null }) {
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const webview = useRef<WebView>(null);
  const canGoBack = useRef(false);
  const finished = useRef(false);
  const [url] = useState(() => (reference ? gatewayUrlFor(reference) : null));
  const [loading, setLoading] = useState(true);

  /** `incomplete`: the customer left before PhonePe said it was done. */
  const finish = useCallback(
    (incomplete: boolean) => {
      if (finished.current) return;
      finished.current = true;
      if (!reference) {
        navigate("/checkout/payment-return", "replace");
        return;
      }
      forgetGatewayUrl(reference);
      const ref = encodeURIComponent(reference);
      navigate(`/checkout/payment-return?ref=${ref}${incomplete ? "&sdk=incomplete" : ""}`, "replace");
    },
    [navigate, reference],
  );

  // No page this session started for that reference (an app restart, or a
  // link from outside): there is nothing safe to show, so ask the server.
  useEffect(() => {
    if (!url) finish(false);
  }, [url, finish]);

  // The web build already is a browser; there is no WebView to host the page.
  useEffect(() => {
    if (url && Platform.OS === "web") window.location.assign(url);
  }, [url]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack.current) webview.current?.goBack();
      else finish(true);
      return true;
    });
    return () => subscription.remove();
  }, [finish]);

  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      const target = request.url;

      if (/^https?:/i.test(target)) {
        if (isPaymentReturnUrl(target)) {
          finish(false);
          return false;
        }
        return true;
      }
      if (/^(about|data|blob):/i.test(target)) return true;
      if (/^(javascript|file):/i.test(target)) return false;

      const appUrl = externalAppUrl(target);
      if (appUrl) void Linking.openURL(appUrl).catch(() => {});
      return false;
    },
    [finish],
  );

  const onNavigationStateChange = useCallback(
    (state: WebViewNavigation) => {
      canGoBack.current = state.canGoBack;
      // A server redirect can land here without passing the check above.
      if (isPaymentReturnUrl(state.url)) finish(false);
    },
    [finish],
  );

  if (!url || Platform.OS === "web") return <View style={{ flex: 1, backgroundColor: colors.white }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top }}>
      <View
        style={{
          height: 52,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Lock size={14} color={colors.gold} />
          <Sans size={13} weight="medium">
            Secure payment · PhonePe
          </Sans>
        </View>
        <Pressable
          onPress={() => finish(true)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close payment"
          style={{ padding: 4 }}
        >
          <X size={20} color={colors.ink} />
        </Pressable>
      </View>

      <View style={{ flex: 1 }}>
        <WebView
          ref={webview}
          source={{ uri: url }}
          // Every scheme reaches the handler, so UPI links are routed there
          // rather than handed to the system by the library.
          originWhitelist={["*"]}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onNavigationStateChange={onNavigationStateChange}
          onLoadEnd={() => setLoading(false)}
          setSupportMultipleWindows={false}
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          style={{ flex: 1 }}
        />
        {loading ? (
          <View
            pointerEvents="none"
            style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: colors.white }}
          >
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
