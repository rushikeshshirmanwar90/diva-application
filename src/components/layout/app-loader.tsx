import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { colors } from "@/lib/theme";
import { useCatalogueState } from "@/lib/data/catalogue-context";
import { Eyebrow } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";

/** Intrinsic size of diva-logo.png. */
const LOGO_WIDTH = 1774;
const LOGO_HEIGHT = 887;
const LOGO_RENDER_WIDTH = 168;

/**
 * Below this the loader would only flash. The catalogue usually lands well
 * inside it on a warm cache, so this is what most launches actually see.
 */
const MIN_VISIBLE_MS = 1100;

/**
 * Hard ceiling, as on the site's navigation veil. `ready` flips in a
 * `finally`, so a failed load clears this too — but a veil that cannot clear
 * itself would lock the whole app, and this makes that impossible.
 */
const FAILSAFE_MS = 8000;

const EXIT_MS = 520;

/**
 * The launch screen after the native splash: the logo rises in over the same
 * white the splash used, the site's gold ring spinner turns beneath it, and
 * the whole veil dissolves once the catalogue is in — so the first thing the
 * shopper sees is a finished home page, never a half-drawn one.
 *
 * Mounted once, above the navigator, and unmounted for good after the exit.
 */
export function AppLoader() {
  const { ready } = useCatalogueState();
  const [minElapsed, setMinElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [gone, setGone] = useState(false);

  const veilOpacity = useSharedValue(1);
  const veilScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(14);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    const min = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const failsafe = setTimeout(() => setTimedOut(true), FAILSAFE_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(failsafe);
    };
  }, []);

  // Entrance: logo first, then the rings fade in and start turning.
  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    logoOpacity.value = withTiming(1, { duration: 700, easing: ease });
    logoY.value = withTiming(0, { duration: 700, easing: ease });
    ringOpacity.value = withDelay(350, withTiming(1, { duration: 500, easing: ease }));
  }, [logoOpacity, logoY, ringOpacity]);

  const done = (ready && minElapsed) || timedOut;

  // Exit: the veil lifts — a touch of scale, then gone.
  useEffect(() => {
    if (!done) return;
    veilOpacity.value = withTiming(0, { duration: EXIT_MS, easing: Easing.inOut(Easing.cubic) });
    veilScale.value = withTiming(1.04, { duration: EXIT_MS, easing: Easing.out(Easing.cubic) });
    const unmount = setTimeout(() => setGone(true), EXIT_MS);
    return () => clearTimeout(unmount);
  }, [done, veilOpacity, veilScale]);

  const veilStyle = useAnimatedStyle(() => ({
    opacity: veilOpacity.value,
    transform: [{ scale: veilScale.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));
  const ringsStyle = useAnimatedStyle(() => ({ opacity: ringOpacity.value }));

  if (gone) return null;

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading Diva"
      accessibilityLiveRegion="polite"
      pointerEvents={done ? "none" : "auto"}
      style={[StyleSheet.absoluteFill, styles.veil, veilStyle]}
    >
      <Animated.View style={logoStyle}>
        <Image
          source={require("@/assets/images/diva/diva-logo.png")}
          style={{ width: LOGO_RENDER_WIDTH, height: (LOGO_RENDER_WIDTH * LOGO_HEIGHT) / LOGO_WIDTH }}
          contentFit="contain"
          accessibilityLabel="Diva — The Indian Jewel"
        />
      </Animated.View>

      <Animated.View style={ringsStyle}>
        <Spinner />
      </Animated.View>

      <Animated.View style={ringsStyle}>
        <Eyebrow size={10} color={colors.muted} align="center">
          Curating your edit
        </Eyebrow>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  veil: {
    zIndex: 100,
    elevation: 100,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    gap: 36,
  },
});
