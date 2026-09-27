import { Text, type TextProps, type TextStyle } from "react-native";
import { colors, fonts, luxe } from "@/lib/theme";

/**
 * The two typefaces, with Tailwind's size → line-height defaults so a
 * `text-sm leading-relaxed` on the site becomes `<Sans size={14}
 * leading="relaxed">` here and measures the same.
 */

type Leading = "none" | "tight" | "snug" | "normal" | "relaxed" | number;

function lineHeightFor(size: number, leading: Leading): number {
  if (typeof leading === "number") return leading;
  const ratio = { none: 1, tight: 1.25, snug: 1.375, normal: 0, relaxed: 1.625 }[leading];
  if (ratio) return Math.round(size * ratio);
  // Tailwind's default line-height per text-* step.
  if (size <= 12) return 16;
  if (size <= 14) return 20;
  if (size <= 16) return 24;
  if (size <= 20) return 28;
  if (size <= 24) return 32;
  if (size <= 30) return 36;
  if (size <= 36) return 40;
  return Math.round(size * 1.05);
}

type Base = TextProps & {
  size?: number;
  color?: string;
  leading?: Leading;
  align?: TextStyle["textAlign"];
  /** Letter-spacing in em, e.g. `0.14` for `tracking-[0.14em]`. */
  tracking?: number;
  uppercase?: boolean;
  underline?: boolean;
  strike?: boolean;
};

export function Display({
  size = 24,
  weight = "light",
  color = colors.ink,
  leading = "normal",
  align,
  tracking,
  uppercase,
  style,
  ...rest
}: Base & { weight?: keyof typeof fonts.display }) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fonts.display[weight],
          fontSize: size,
          lineHeight: lineHeightFor(size, leading),
          color,
          textAlign: align,
          letterSpacing: tracking ? size * tracking : undefined,
          textTransform: uppercase ? "uppercase" : undefined,
        },
        style,
      ]}
    />
  );
}

export function Sans({
  size = 14,
  weight = "regular",
  color = colors.ink,
  leading = "normal",
  align,
  tracking,
  uppercase,
  underline,
  strike,
  style,
  ...rest
}: Base & { weight?: keyof typeof fonts.sans }) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fonts.sans[weight],
          fontSize: size,
          lineHeight: lineHeightFor(size, leading),
          color,
          textAlign: align,
          letterSpacing: tracking ? size * tracking : undefined,
          textTransform: uppercase ? "uppercase" : undefined,
          textDecorationLine: underline ? "underline" : strike ? "line-through" : undefined,
        },
        style,
      ]}
    />
  );
}

/** `.eyebrow` / `text-[Npx] tracking-luxe uppercase` — the site's signature label. */
export function Eyebrow({
  size = 11,
  color = colors.muted,
  weight = "regular",
  style,
  ...rest
}: Omit<Base, "tracking" | "uppercase"> & { weight?: keyof typeof fonts.sans }) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fonts.sans[weight],
          fontSize: size,
          lineHeight: lineHeightFor(size, rest.leading ?? "normal"),
          letterSpacing: luxe(size),
          textTransform: "uppercase",
          color,
          textAlign: rest.align,
        },
        style,
      ]}
    />
  );
}
