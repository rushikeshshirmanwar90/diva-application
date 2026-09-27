import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, fonts } from "@/lib/theme";
import { Sans } from "@/components/ui/text";
import { useNavigate } from "@/components/ui/link";

type Variant = "solid" | "outline" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

/**
 * `components/ui/button.tsx` from the site: uppercase, `tracking-[0.14em]`,
 * square corners, four tones. The pressed state stands in for `hover:`.
 */

const sizes: Record<Size, { px: number; py: number; text: number }> = {
  sm: { px: 16, py: 8, text: 11 },
  md: { px: 24, py: 12, text: 11 },
  lg: { px: 32, py: 16, text: 12 },
};

function palette(variant: Variant, pressed: boolean) {
  switch (variant) {
    // Charcoal on gold (7.2:1), not white (2.4:1): the primary action must be
    // the most legible thing on the screen, not the least.
    case "gold":
      return { bg: pressed ? colors.goldDark : colors.gold, text: colors.charcoal, border: "transparent" };
    case "outline":
      return pressed
        ? { bg: colors.charcoal, text: colors.white, border: colors.charcoal }
        : { bg: "transparent", text: colors.charcoal, border: "rgba(26,26,26,0.25)" };
    case "ghost":
      return { bg: "transparent", text: pressed ? colors.gold : colors.charcoal, border: "transparent" };
    default:
      return { bg: pressed ? colors.charcoalSoft : colors.charcoal, text: colors.white, border: "transparent" };
  }
}

export function Button({
  variant = "solid",
  size = "md",
  children,
  onPress,
  href,
  disabled,
  loading,
  icon,
  style,
  fullWidth,
  accessibilityLabel,
}: {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
  onPress?: () => void;
  /** Navigate instead of calling `onPress` — the site's `ButtonLink`. */
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}) {
  const navigate = useNavigate();
  const s = sizes[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled || loading}
      onPress={() => {
        onPress?.();
        if (href) navigate(href);
      }}
      style={({ pressed }) => {
        const p = palette(variant, pressed);
        return [
          styles.base,
          {
            paddingHorizontal: variant === "ghost" ? 0 : s.px,
            paddingVertical: s.py,
            backgroundColor: p.bg,
            borderColor: p.border,
            opacity: disabled ? 0.45 : 1,
            alignSelf: fullWidth ? "stretch" : "flex-start",
          },
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const p = palette(variant, pressed);
        return (
          <View style={styles.row}>
            {loading ? <ActivityIndicator size="small" color={p.text} /> : icon}
            {typeof children === "string" ? (
              <Sans
                size={s.text}
                color={p.text}
                tracking={0.14}
                uppercase
                weight="regular"
                numberOfLines={1}
                style={{ fontFamily: fonts.sans.regular }}
              >
                {children}
              </Sans>
            ) : (
              children
            )}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
