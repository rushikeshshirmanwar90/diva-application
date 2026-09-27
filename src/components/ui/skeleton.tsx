import { createContext, useContext, useEffect } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { colors } from "@/lib/theme";

/**
 * Loading placeholders.
 *
 * The animation belongs to the *group*, not the block. A catalogue skeleton
 * is fifty-odd blocks; the earlier version gave each its own sweeping
 * overlay — a clipped, transformed native view updated every frame, fifty
 * times over — and the screen stuttered on the very frame the tap was meant
 * to feel instant. Now each block is a plain static view, and one wrapper
 * breathes its opacity: a single animated property per screen, whatever the
 * block count. The pulse reads as "loading" just as clearly as the sweep
 * did, and it is what the platform's own placeholders do.
 */

const InGroup = createContext(false);

/**
 * Wraps a whole loading layout and pulses it. Nesting is safe: an inner
 * group inside an outer one renders as a plain view rather than doubling
 * the fade.
 */
export function SkeletonGroup({
  children,
  label,
  style,
}: {
  children: React.ReactNode;
  /** Read out by a screen reader in place of the blocks. */
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const nested = useContext(InGroup);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (nested) return;
    opacity.value = withRepeat(
      withTiming(0.45, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [nested, opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (nested) {
    return (
      <View accessibilityLabel={label} style={style}>
        {children}
      </View>
    );
  }

  return (
    <InGroup.Provider value>
      <Animated.View accessibilityLabel={label} style={[style, pulse]}>
        {children}
      </Animated.View>
    </InGroup.Provider>
  );
}

/**
 * A placeholder block. Static — the pulse comes from the enclosing
 * `SkeletonGroup`. `dark` is for placeholders that sit on charcoal — the
 * hero — where a beige block would read as a hole.
 */
export function Skeleton({ style, dark = false }: { style?: StyleProp<ViewStyle>; dark?: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      style={[{ backgroundColor: dark ? colors.charcoalSoft : colors.beigeDark }, style]}
    />
  );
}

/** Mirrors `ProductCard` — 4:5 image, then metal, title, subtitle, price and rating. */
export function ProductCardSkeleton() {
  return (
    <View>
      <Skeleton style={{ width: "100%", aspectRatio: 4 / 5 }} />
      <View style={{ paddingTop: 16 }}>
        <Skeleton style={{ height: 10, width: 64 }} />
        <Skeleton style={{ marginTop: 10, height: 16, width: "92%" }} />
        <Skeleton style={{ marginTop: 8, height: 12, width: "66%" }} />
        <Skeleton style={{ marginTop: 12, height: 16, width: 96 }} />
        <Skeleton style={{ marginTop: 12, height: 10, width: 80 }} />
      </View>
    </View>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <SkeletonGroup style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -10 }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ width: "50%", paddingHorizontal: 10, marginBottom: 48 }}>
          <ProductCardSkeleton />
        </View>
      ))}
    </SkeletonGroup>
  );
}
