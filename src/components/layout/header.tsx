import { View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { colors, shadow } from "@/lib/theme";
import { useStoreActions, useStoreUI } from "@/lib/store/store";
import { Logo } from "@/components/layout/logo";
import { IconButton } from "@/components/ui/icon-button";

/**
 * The site's header at its mobile breakpoint: hamburger on the left, the logo
 * centred. 64dp tall, hairline below.
 */
export function Header() {
  const { setMenuOpen } = useStoreActions();
  const { menuOpen } = useStoreUI();

  return (
    <View
      style={[
        {
          height: 64,
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(230,224,215,0.8)",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          zIndex: 10,
        },
        shadow.xs,
      ]}
    >
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
        <IconButton label={menuOpen ? "Close menu" : "Open menu"} onPress={() => setMenuOpen(!menuOpen)}>
          <HamburgerIcon open={menuOpen} />
        </IconButton>
      </View>

      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Logo width={120} />
      </View>

      {/* Spacer keeps the center logo balanced and centered */}
      <View style={{ flex: 1 }} />
    </View>
  );
}

/** Three thin bars that morph into an X — the site's animated hamburger. */
function HamburgerIcon({ open }: { open: boolean }) {
  const top = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(open ? 0 : -6, { duration: 300 }) }, { rotate: withTiming(open ? "45deg" : "0deg", { duration: 300 }) }],
  }));
  const middle = useAnimatedStyle(() => ({ opacity: withTiming(open ? 0 : 1, { duration: 200 }) }));
  const bottom = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(open ? 0 : 6, { duration: 300 }) }, { rotate: withTiming(open ? "-45deg" : "0deg", { duration: 300 }) }],
  }));
  const bar = { position: "absolute" as const, left: 0, right: 0, top: 8.5, height: 1, backgroundColor: colors.charcoal };

  return (
    <View style={{ width: 18, height: 18 }}>
      <Animated.View style={[bar, top]} />
      <Animated.View style={[bar, middle]} />
      <Animated.View style={[bar, bottom]} />
    </View>
  );
}
