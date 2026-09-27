/**
 * Design tokens — a direct port of diva-frontend's `app/globals.css` `@theme`
 * block, so the app and the site are the same palette, the same two typefaces
 * and the same letter-spacing.
 *
 * Tailwind's rem-based scale is expressed in dp here (1rem = 16). Values were
 * copied from the classes the site actually uses rather than invented.
 */

import type { TextStyle } from "react-native";

export const colors = {
  gold: "#c9a227",
  goldLight: "#e2c76a",
  goldDark: "#a8871c",
  /**
   * Gold for *text* on white or beige. The brand gold reads at 2.4:1 there —
   * fine for a surface, an icon or a rule, unreadable as an 11px label. This
   * is the lightest gold that clears 4.5:1 on both light surfaces; on
   * charcoal, keep using `gold` or `goldLight`.
   */
  goldText: "#8a6d12",
  charcoal: "#1a1a1a",
  charcoalSoft: "#2e2c29",
  beige: "#f8f5f0",
  beigeDark: "#efe9e0",
  ash: "#efefef",
  ink: "#171412",
  /** 4.75:1 on beige, 5.2:1 on white. The site's `#7a736c` fell to 4.3:1 on beige. */
  muted: "#736c66",
  line: "#e6e0d7",
  sale: "#b23b3b",
  success: "#2f7a55",
  white: "#ffffff",
  /** The `#c0392b` used on form/checkout errors. */
  error: "#c0392b",
} as const;

/** Names registered by `useFonts` in the root layout. */
export const fonts = {
  display: {
    light: "CormorantGaramond_300Light",
    regular: "CormorantGaramond_400Regular",
    medium: "CormorantGaramond_500Medium",
    semibold: "CormorantGaramond_600SemiBold",
  },
  sans: {
    light: "Jost_300Light",
    regular: "Jost_400Regular",
    medium: "Jost_500Medium",
  },
} as const;

/** `--tracking-luxe: 0.18em`, resolved for a given font size. */
export const luxe = (size: number) => Math.round(size * 0.18 * 100) / 100;

/** Tailwind spacing scale, in dp. */
export const space = {
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

/** The page gutter — `px-5` on the site below `lg`. */
export const gutter = 20;

/** Alpha helper for the `charcoal/60`-style Tailwind opacities. */
export function alpha(hex: string, opacity: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * `.eyebrow` from globals.css: 11px, luxe tracking, uppercase, muted.
 * `textTransform` is applied by the `Eyebrow` component.
 */
export const eyebrowStyle: TextStyle = {
  fontFamily: fonts.sans.regular,
  fontSize: 11,
  letterSpacing: luxe(11),
  color: colors.muted,
  textTransform: "uppercase",
};

export const shadow = {
  /** `shadow-xs` */
  xs: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  /** `shadow-md` */
  md: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  /** `shadow-xl` / `shadow-2xl` */
  xl: {
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
} as const;
