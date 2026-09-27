import { useEffect, useState } from "react";
import { useNavigation, type NativeStackNavigationProp } from "expo-router";

/**
 * Past this a transition has either finished or never started — a screen
 * that is the first in the stack, or one the navigator reused — so the
 * content mounts regardless. Long enough for the slide, short enough that a
 * missed event is not felt.
 */
const FALLBACK_MS = 420;

/**
 * False for a screen's first frames, true once the push transition has ended.
 *
 * The screens that felt "stuck" on tap were doing nothing wrong on paper: the
 * product was already in the catalogue, so the screen skipped its skeleton
 * and rendered the whole page at once — gallery, buy box, details, reviews.
 * The native stack cannot start sliding until that first render has landed,
 * so for a few hundred milliseconds the tap appeared to do nothing at all.
 *
 * Gating the heavy tree on this makes the first frame a skeleton — cheap to
 * render, so the transition starts on the tap itself, and shimmering on the
 * UI thread while the real content mounts underneath.
 */
export function useAfterTransition(): boolean {
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, object | undefined>>>();
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (settled) return;
    const settle = () => setSettled(true);
    const unsubscribe = navigation.addListener("transitionEnd", settle);
    const fallback = setTimeout(settle, FALLBACK_MS);
    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, [navigation, settled]);

  return settled;
}
