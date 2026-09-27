import { View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { colors, shadow } from "@/lib/theme";
import { useStoreUI } from "@/lib/store/store";
import { useBottomNavVisible } from "@/components/layout/bottom-nav";
import { Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";

export function Toaster() {
  const { toasts } = useStoreUI();
  const insets = useSafeAreaInsets();
  const tabs = useBottomNavVisible();
  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        // Clear the tab bar (56 + inset) when it is on screen.
        bottom: (tabs ? 56 : 0) + insets.bottom + 24,
        left: 0,
        right: 0,
        zIndex: 80,
        alignItems: "center",
        paddingHorizontal: 24,
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <Animated.View
          key={t.id}
          entering={FadeInDown.duration(500)}
          exiting={FadeOut.duration(200)}
          accessibilityRole="alert"
          style={[
            {
              width: "100%",
              maxWidth: 384,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: colors.charcoal,
              paddingHorizontal: 16,
              paddingVertical: 12,
            },
            shadow.xl,
          ]}
        >
          <Check size={15} color={colors.gold} />
          <Sans size={14} color={colors.white} style={{ flex: 1 }}>
            {t.message}
          </Sans>
          {t.href ? (
            <Link href={t.href}>
              <Eyebrow size={10} color={colors.gold}>
                {t.linkLabel ?? "View"}
              </Eyebrow>
            </Link>
          ) : null}
        </Animated.View>
      ))}
    </View>
  );
}
