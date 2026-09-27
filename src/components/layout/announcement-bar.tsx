import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { colors, luxe } from "@/lib/theme";
import { Sans } from "@/components/ui/text";

const messages = [
  "Complimentary insured shipping across India",
  "15-day returns · one free size exchange",
  "BIS hallmarked · Hand-finished 1-gram gold",
  "Transparent fixed pricing · No hidden making charges",
];

/** The charcoal marquee above the header — `animate-marquee`, 42s per loop. */
export function AnnouncementBar() {
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (!width) return;
    x.value = 0;
    x.value = withRepeat(withTiming(-width, { duration: 42000, easing: Easing.linear }), -1, false);
  }, [width, x]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={{
        backgroundColor: colors.charcoal,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}
    >
      <Animated.View style={[{ flexDirection: "row" }, style]}>
        {[0, 1].map((copy) => (
          <View
            key={copy}
            accessibilityElementsHidden={copy === 1}
            onLayout={copy === 0 ? (e) => setWidth(e.nativeEvent.layout.width) : undefined}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            {messages.map((m) => (
              <View
                key={m}
                style={{ flexDirection: "row", alignItems: "center", gap: 32, paddingHorizontal: 24, paddingVertical: 8 }}
              >
                <Sans size={9} color="rgba(255,255,255,0.75)" uppercase style={{ letterSpacing: luxe(9) }}>
                  {m}
                </Sans>
                <Sans size={9} color={colors.gold}>
                  ✦
                </Sans>
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
