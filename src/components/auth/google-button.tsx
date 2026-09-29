import { useEffect } from "react";
import { Platform, Pressable, View, type PressableProps } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { ResponseType } from "expo-auth-session";
import { colors } from "@/lib/theme";
import {
  GOOGLE_WEB_CLIENT_ID as WEB_CLIENT_ID,
  GOOGLE_EXPO_REDIRECT_URI,
} from "@/lib/config";
import { useStoreActions } from "@/lib/store/store";
import { Sans } from "@/components/ui/text";
import { GoogleMark } from "@/components/ui/social-icons";

WebBrowser.maybeCompleteAuthSession();

/**
 * Extracts query parameters and hash fragments (e.g. #id_token=...) from the OAuth redirect URL.
 */
function parseAuthUrl(urlStr: string): Record<string, string> {
  const params: Record<string, string> = {};
  try {
    const url = new URL(urlStr, "https://phony.example");
    url.searchParams.forEach((val, key) => {
      params[key] = val;
    });
    if (url.hash) {
      new URLSearchParams(url.hash.replace(/^#/, "")).forEach((value, key) => {
        params[key] = value;
      });
    }
  } catch { }

  if (!params.id_token) {
    const tokenMatch = urlStr.match(/[#?&]id_token=([^&]+)/);
    if (tokenMatch) params.id_token = decodeURIComponent(tokenMatch[1]);
  }
  if (!params.error) {
    const errorMatch = urlStr.match(/[#?&]error=([^&]+)/);
    if (errorMatch) params.error = decodeURIComponent(errorMatch[1]);
  }
  if (!params.error_description) {
    const descMatch = urlStr.match(/[#?&]error_description=([^&]+)/);
    if (descMatch) params.error_description = decodeURIComponent(descMatch[1]);
  }

  return params;
}

/**
 * For expo-auth-session (browser-based OAuth), we MUST always use the Web Client ID
 * across all platforms (iOS, Android, Web).
 *
 * Why:
 * In Google Cloud Console, Android and iOS native client IDs DO NOT have "Authorized
 * redirect URIs". Only Web Application client IDs have authorized redirect URIs.
 * If an Android or iOS client ID is sent with a redirect URI like `https://auth.expo.io`,
 * Google immediately rejects it with "Error 400: redirect_uri_mismatch".
 */
const GOOGLE_AVAILABLE = Boolean(WEB_CLIENT_ID);

/**
 * The redirect URI registered in Google Cloud Console.
 */
const redirectUri = Platform.select({
  web: typeof window !== "undefined" ? window.location.origin : undefined,
  default: GOOGLE_EXPO_REDIRECT_URI,
});

/** Google's own button spec: white, 1px #dadce0, 4dp radius, #3c4043 label. */
function GoogleButtonShell({ dimmed, ...props }: PressableProps & { dimmed?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      {...props}
      style={({ pressed }) => ({
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "#dadce0",
        borderRadius: 4,
        backgroundColor: pressed ? "#f8f9fa" : colors.white,
        paddingVertical: 12,
        opacity: dimmed ? 0.5 : 1,
      })}
    >
      <GoogleMark size={18} />
      <Sans size={14} weight="medium" color="#3c4043">
        Continue with Google
      </Sans>
    </Pressable>
  );
}

export function GoogleSignInButton({ onCredential, disabled }: { onCredential: (idToken: string) => void; disabled?: boolean }) {
  const { notify } = useStoreActions();
  /**
   * We use `Google.useAuthRequest` with `ResponseType.IdToken` so Google returns
   * the `id_token` directly in the URL without requiring a client_secret.
   */
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    iosClientId: WEB_CLIENT_ID,
    androidClientId: WEB_CLIENT_ID,
    redirectUri,
    responseType: ResponseType.IdToken,
    scopes: ["openid", "profile", "email"],
    usePKCE: false,
  });

  useEffect(() => {
    if (__DEV__ && request) {
      console.log("[GoogleSignIn] Configured Auth Request:");
      console.log("  - Client ID:", request.clientId);
      console.log("  - Redirect URI:", request.redirectUri);
      console.log("  - Auth URL:", request.url);
    }
  }, [request]);

  useEffect(() => {
    if (__DEV__ && response) {
      console.log("[GoogleSignIn] Auth response (web):", JSON.stringify(response, null, 2));
    }

    if (response?.type === "success") {
      const idToken = response.params?.id_token ?? response.authentication?.idToken;
      if (idToken) {
        onCredential(idToken);
      } else {
        console.warn("[GoogleSignIn] Missing id_token in response params:", response.params);
        notify("Could not retrieve Google authentication token.");
      }
    } else if (response?.type === "error") {
      const errorMsg =
        response.error?.message ||
        response.params?.error_description ||
        response.params?.error;
      console.error("[GoogleSignIn] Auth error:", errorMsg, response);
      notify("Google sign-in encountered an error. Please try again.");
    }
  }, [response, onCredential, notify]);

  const handlePress = async () => {
    if (!request?.url) {
      notify("Google Sign-In is initializing, please try again in a moment.");
      return;
    }
    try {
      if (Platform.OS === "web") {
        await promptAsync();
        return;
      }

      // In Expo Go / mobile development, auth.expo.io requires navigating to the /start
      // endpoint so it can record the app's return deep-link in its session cookie.
      // Without this /start step, auth.expo.io rejects the redirect with:
      // "Something went wrong trying to finish signing in."
      const appReturnUrl = Linking.createURL("expo-auth-session");
      const proxyStartUrl = `https://auth.expo.io/@codewithrushi/diva-application/start?authUrl=${encodeURIComponent(
        request.url
      )}&returnUrl=${encodeURIComponent(appReturnUrl)}`;

      console.log("[GoogleSignIn] Initiating Sign-In via Proxy /start:");
      console.log("  - Proxy Start URL:", proxyStartUrl);
      console.log("  - App Return URL:", appReturnUrl);

      const result = await WebBrowser.openAuthSessionAsync(proxyStartUrl, appReturnUrl);
      console.log("[GoogleSignIn] WebBrowser result:", JSON.stringify(result));

      if (result.type === "success" && result.url) {
        const parsed = parseAuthUrl(result.url);
        const idToken = parsed.id_token;
        if (idToken) {
          onCredential(idToken);
        } else if (parsed.error) {
          console.error("[GoogleSignIn] OAuth provider error:", parsed.error, parsed.error_description);
          notify(parsed.error_description || "Google sign-in encountered an error.");
        } else {
          console.warn("[GoogleSignIn] Missing id_token in return URL:", result.url);
          notify("Could not retrieve Google authentication token.");
        }
      }
    } catch (err) {
      console.error("[GoogleSignIn] Auth exception:", err);
      notify("Failed to launch Google sign-in.");
    }
  };

  return (
    <GoogleButtonShell
      disabled={disabled || !request}
      dimmed={disabled || !request}
      onPress={() => void handlePress()}
    />
  );
}

/**
 * The same button on a build without a client id for this platform. Not
 * disabled — a greyed-out control invites "why?" with no answer — a tap says
 * what is missing instead.
 */
function GoogleUnavailableButton({ disabled }: { disabled?: boolean }) {
  const { notify } = useStoreActions();
  return (
    <GoogleButtonShell
      disabled={disabled}
      dimmed={disabled}
      onPress={() => notify("Google sign-in isn't set up on this build yet. Use your email for now.")}
    />
  );
}

export function SocialButtons({ onCredential, disabled }: { onCredential: (idToken: string) => void; disabled?: boolean }) {
  return (
    <View style={{ marginTop: 32 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
        <Sans size={10} color={colors.muted} uppercase tracking={0.18}>
          or
        </Sans>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      </View>
      {GOOGLE_AVAILABLE ? (
        <GoogleSignInButton onCredential={onCredential} disabled={disabled} />
      ) : (
        <GoogleUnavailableButton disabled={disabled} />
      )}
    </View>
  );
}