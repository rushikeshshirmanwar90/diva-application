import { useEffect } from "react";
import { Platform, Pressable, View, type PressableProps } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { colors } from "@/lib/theme";
import {
  GOOGLE_ANDROID_CLIENT_ID as ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID as IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID as WEB_CLIENT_ID,
} from "@/lib/config";
import { useStoreActions } from "@/lib/store/store";
import { Sans } from "@/components/ui/text";
import { GoogleMark } from "@/components/ui/social-icons";

WebBrowser.maybeCompleteAuthSession();

/**
 * "Continue with Google", producing the same id token the site's GIS button
 * does — the backend's `/auth/google` accepts it from either client.
 */

const EFFECTIVE_IOS_CLIENT_ID = IOS_CLIENT_ID || WEB_CLIENT_ID;
const EFFECTIVE_ANDROID_CLIENT_ID = ANDROID_CLIENT_ID || WEB_CLIENT_ID;

/**
 * Checks whether Google sign-in is available on this platform.
 */
const GOOGLE_AVAILABLE = Boolean(
  Platform.select({
    ios: EFFECTIVE_IOS_CLIENT_ID,
    android: EFFECTIVE_ANDROID_CLIENT_ID,
    default: WEB_CLIENT_ID,
  }),
);

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
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: WEB_CLIENT_ID,
    iosClientId: EFFECTIVE_IOS_CLIENT_ID,
    androidClientId: EFFECTIVE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params?.id_token ?? response.authentication?.idToken;
      if (idToken) {
        onCredential(idToken);
      } else {
        notify("Could not retrieve Google authentication token.");
      }
    } else if (response?.type === "error") {
      notify("Google sign-in encountered an error. Please try again.");
    }
  }, [response, onCredential, notify]);

  return <GoogleButtonShell disabled={disabled || !request} dimmed={disabled || !request} onPress={() => void promptAsync()} />;
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

