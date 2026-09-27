import { useRouter } from "expo-router";
import { Linking, Pressable, Text, type PressableProps, type StyleProp, type TextProps, type ViewStyle } from "react-native";
import { useCallback } from "react";
import { useStoreActions } from "@/lib/store/store";

/**
 * A pressable that navigates — the app's `<Link>`.
 *
 * Internal paths go through expo-router; `http(s)`, `tel:` and `mailto:` are
 * handed to the OS. Any navigation closes the transient surfaces (drawer,
 * search, bag), which is what the site's header does on route change.
 */

export function useNavigate() {
  const router = useRouter();
  const { setCartOpen, setMenuOpen, setSearchOpen } = useStoreActions();

  return useCallback(
    (href: string, mode: "push" | "replace" = "push") => {
      if (/^(https?:|tel:|mailto:)/i.test(href)) {
        void Linking.openURL(href).catch(() => {});
        return;
      }
      setCartOpen(false);
      setMenuOpen(false);
      setSearchOpen(false);
      if (mode === "replace") router.replace(href as never);
      else router.push(href as never);
    },
    [router, setCartOpen, setMenuOpen, setSearchOpen],
  );
}

export function Link({
  href,
  replace,
  onPress,
  pressedStyle,
  style,
  children,
  ...rest
}: Omit<PressableProps, "style" | "children"> & {
  href: string;
  replace?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Applied while pressed; defaults to a dim. Pass `null` when the child animates its own press. */
  pressedStyle?: StyleProp<ViewStyle> | null;
  children?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <Pressable
      accessibilityRole="link"
      {...rest}
      onPress={(event) => {
        onPress?.(event);
        navigate(href, replace ? "replace" : "push");
      }}
      style={({ pressed }) => [style, pressed && (pressedStyle === undefined ? { opacity: 0.7 } : pressedStyle)]}
    >
      {children}
    </Pressable>
  );
}

/**
 * A link that lives *inside* a sentence. A `Text`, not a `Pressable`: a View
 * nested in a Text has no intrinsic size on Android and throws "Views nested
 * within a <Text> must have a width and a height" — which is a red screen on
 * the register page for every Android user. Text-in-Text is what both
 * platforms lay out inline.
 */
export function InlineLink({
  href,
  replace,
  onPress,
  ...rest
}: Omit<TextProps, "onPress"> & { href: string; replace?: boolean; onPress?: () => void }) {
  const navigate = useNavigate();
  return (
    <Text
      accessibilityRole="link"
      suppressHighlighting
      {...rest}
      onPress={() => {
        onPress?.();
        navigate(href, replace ? "replace" : "push");
      }}
    />
  );
}
