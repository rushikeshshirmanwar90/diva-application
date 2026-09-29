import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth/auth-context";
import { colors } from "@/lib/theme";
import { Sans } from "@/components/ui/text";

/**
 * Handles the OAuth redirect route in Expo Go and native apps.
 *
 * When the browser completes authentication and redirects to:
 *   exp://.../--/expo-auth-session#id_token=...
 * Expo Router maps this route directly, displaying a smooth loading screen
 * while AuthProvider extracts the token and completes the sign-in.
 */
export default function ExpoAuthSessionScreen() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/account");
    }
  }, [status, router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.white,
        gap: 16,
      }}
    >
      <ActivityIndicator size="large" color={colors.gold} />
      <Sans size={14} color={colors.charcoal}>
        Completing sign in...
      </Sans>
    </View>
  );
}
