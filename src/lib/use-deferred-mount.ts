import { startTransition, useEffect, useState } from "react";

/**
 * False on a screen's first frames, true once the frame after mount has
 * been painted — and flipped inside a transition, so whatever it gates
 * renders at low priority, yielding to taps and scrolls.
 *
 * For the parts of a screen that are below the fold. Mounting a product
 * page's details, reviews, related rail and recently-viewed rail in the
 * same commit as its gallery and buy box blocks the JS thread for the whole
 * lot; the shopper is looking at a frozen skeleton while sections they
 * cannot see yet are being built. Letting the visible part land first, then
 * filling in the rest a frame later, is the difference between "snappy" and
 * "laggy" on the same hardware.
 */
export function useDeferredMount(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    // Two frames: one for the first commit to paint, one clear frame for
    // any entering animation to start before the heavy render is queued.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => startTransition(() => setMounted(true)));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [mounted]);

  return mounted;
}
