import { useEffect, useState } from "react";
import { Keyboard, Platform, Pressable, View } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { House, Search, ShoppingBag, Store, User, type LucideIcon } from "lucide-react-native";
import { alpha, colors } from "@/lib/theme";
import { useStore } from "@/lib/store/store";
import { Eyebrow } from "@/components/ui/text";
import { Count } from "@/components/ui/icon-button";

/**
 * The bottom tab bar — the app's one departure from the site, which has no
 * equivalent. On a phone the header's icons sit at the top of the screen,
 * furthest from the thumb; the five sections a shopper actually cycles
 * between belong within reach.
 *
 * Every tab navigates; none acts (HIG, Tab bars: "Use a tab bar to support
 * navigation, not to provide actions"). Bag opens the bag *screen*, not the
 * drawer — the drawer remains the surface that "Add to bag" slides in. Search
 * is a tab because it is how most shoppers find a specific piece, and the
 * HIG's primary position for search in a tabbed app is a tab of its own.
 * Wishlist lives under Account and on every card's heart.
 *
 * `router.navigate` pops back to a screen already in the stack rather than
 * pushing a second copy — tapping Home three times must not leave three home
 * screens to swipe back through.
 */

type Tab = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  /** Which routes light the tab up. */
  matches: (pathname: string) => boolean;
};

const TABS: Tab[] = [
  { key: "home", label: "Home", icon: House, href: "/", matches: (p) => p === "/" },
  {
    key: "shop",
    label: "Shop",
    icon: Store,
    href: "/shop",
    matches: (p) =>
      ["/shop", "/category", "/collections", "/for", "/product"].some((prefix) =>
        p === prefix || p.startsWith(`${prefix}/`) || p.startsWith(`${prefix}?`),
      ),
  },
  { key: "search", label: "Search", icon: Search, href: "/search", matches: (p) => p === "/search" },
  { key: "bag", label: "Bag", icon: ShoppingBag, href: "/cart", matches: (p) => p === "/cart" },
  {
    key: "account",
    label: "Account",
    icon: User,
    href: "/account",
    matches: (p) => p.startsWith("/account") || p === "/wishlist" || p === "/login" || p === "/register",
  },
];

/** Screens where the bar would only get in the way of finishing something. */
const HIDDEN_ON = ["/checkout", "/order-confirmed", "/expo-auth-session"];

/**
 * Whether the bar is on screen right now — `Page` reads this so its scroll
 * content stops above the bar when it is there, and reaches the home
 * indicator when it is not.
 */
export function useBottomNavVisible(): boolean {
  const pathname = usePathname();
  const keyboardUp = useKeyboardVisible();
  return !keyboardUp && !HIDDEN_ON.some((prefix) => pathname.startsWith(prefix));
}

export function BottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const visible = useBottomNavVisible();
  const { totals, hydrated } = useStore();

  if (!visible) return null;

  // Only the bag carries a count. The HIG reserves tab badges for information
  // that warrants attention; how many pieces are waiting to be paid for is
  // that, how many are merely saved is not.
  const bagCount = hydrated ? totals.itemCount : 0;

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        // A hair more than the inset so the labels never kiss the home indicator.
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 8,
      }}
    >
      {TABS.map((tab) => {
        const active = tab.matches(pathname);
        const Icon = tab.icon;
        const tint = active ? colors.gold : colors.charcoal;
        const badge = tab.key === "bag" ? bagCount : 0;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) router.navigate(tab.href as never);
            }}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              gap: 4,
              paddingVertical: 4,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View>
              {/* The selected symbol fills, as the platform's own tab bars do. */}
              <Icon size={22} strokeWidth={active ? 1.8 : 1.5} color={tint} fill={active ? alpha(colors.gold, 0.22) : "transparent"} />
              {badge > 0 ? <Count value={badge} /> : null}
            </View>
            <Eyebrow size={11} color={tint} weight={active ? "medium" : "regular"} maxFontSizeMultiplier={1.4}>
              {tab.label}
            </Eyebrow>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * iOS keeps the layout put behind the keyboard, but Android (with
 * `adjustResize`) shrinks it, which would perch the bar on top of the
 * keyboard on the login and search screens. Hiding it while typing is the
 * behaviour both platforms' own apps settle on.
 */
function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => setVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}
