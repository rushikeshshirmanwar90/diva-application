import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

/**
 * Fades its children in as they mount — for content that replaces a skeleton
 * or arrives from a fetch, so the swap reads as a reveal rather than a pop.
 * `lift` adds a short rise, for the sections that arrive later on a page.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 320,
  lift = false,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  lift?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const entering = lift
    ? FadeInDown.delay(delay).duration(duration).springify().damping(18).stiffness(160)
    : FadeIn.delay(delay).duration(duration);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
