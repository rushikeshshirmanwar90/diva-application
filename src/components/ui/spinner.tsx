import { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { colors } from "@/lib/theme";

/**
 * The site's loading mark, from `NavigationBuffer`: an outer gold hairline
 * turning clockwise, an inner one counter-rotating so the two read as one
 * mechanism, and the brand's gold lozenge still at the centre. Runs on the
 * UI thread, so it keeps turning while JS is busy mounting a screen.
 */
export function Spinner({ size = 56, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  const outer = useSharedValue(0);
  const inner = useSharedValue(0);

  useEffect(() => {
    outer.value = withRepeat(withTiming(360, { duration: 1100, easing: Easing.linear }), -1, false);
    inner.value = withRepeat(withTiming(-360, { duration: 1700, easing: Easing.linear }), -1, false);
  }, [inner, outer]);

  const outerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${outer.value}deg` }] }));
  const innerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${inner.value}deg` }] }));

  const inset = Math.round(size * 0.125);
  const lozenge = Math.max(4, Math.round(size * 0.107));

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Loading" style={[{ width: size, height: size }, styles.centre, style]}>
      <Animated.View style={[styles.ring, { top: 0, left: 0, width: size, height: size }, styles.outer, outerStyle]} />
      <Animated.View
        style={[styles.ring, { top: inset, left: inset, width: size - inset * 2, height: size - inset * 2 }, styles.inner, innerStyle]}
      />
      <View style={[styles.lozenge, { width: lozenge, height: lozenge }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderRadius: 999, borderWidth: 1 },
  outer: { borderColor: "rgba(201,162,39,0.25)", borderTopColor: colors.gold },
  inner: { borderColor: "rgba(201,162,39,0.2)", borderBottomColor: colors.goldLight },
  lozenge: { backgroundColor: colors.gold, transform: [{ rotate: "45deg" }] },
});
