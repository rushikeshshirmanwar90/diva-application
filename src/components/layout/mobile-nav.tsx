import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideOutLeft, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ChevronDown, ChevronRight, Grid2x2, Heart, HelpCircle, Search, ShoppingBag, User, X } from "lucide-react-native";
import { colors, shadow } from "@/lib/theme";
import { useCategories } from "@/lib/data/catalogue-context";
import { genderCollections } from "@/lib/data/genders";
import { useStoreActions, useStoreUI } from "@/lib/store/store";
import { Logo } from "@/components/layout/logo";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import { IconButton } from "@/components/ui/icon-button";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";

/** The header row's tabs, as drawer rows: All Products, then the gender edits. */
const shopLinks = [
  { href: "/shop", label: "All Products", icon: ShoppingBag },
  ...genderCollections.map((c) => ({ href: `/for/${c.slug}`, label: c.name, icon: Grid2x2 })),
];

const moreLinks = [
  { href: "/account", label: "My account", icon: User },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/faq", label: "Help & FAQ", icon: HelpCircle },
];

/** The slide-in drawer behind the hamburger — the site's `MobileNav`, verbatim. */
export function MobileNav() {
  const { menuOpen } = useStoreUI();
  const { setMenuOpen, setSearchOpen } = useStoreActions();
  const categories = useCategories();
  const insets = useSafeAreaInsets();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const chevron = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(categoriesOpen ? "180deg" : "0deg", { duration: 300 }) }],
  }));

  if (!menuOpen) return null;
  const onClose = () => setMenuOpen(false);

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 60 }}>
      <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <Pressable accessibilityLabel="Close menu" onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(26,26,26,0.6)" }} />
      </Animated.View>

      <Animated.View
        entering={SlideInLeft.duration(400)}
        exiting={SlideOutLeft.duration(300)}
        style={[
          { position: "absolute", top: 0, bottom: 0, left: 0, width: "88%", maxWidth: 352, backgroundColor: colors.white },
          shadow.xl,
        ]}
      >
        <View
          style={{
            paddingTop: insets.top,
            height: 64 + insets.top,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
            paddingHorizontal: 20,
          }}
        >
          <Logo width={102} />
          <IconButton label="Close menu" onPress={onClose} size={40}>
            <X size={19} strokeWidth={1.5} color={colors.charcoal} />
          </IconButton>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onClose();
              setSearchOpen(true);
            }}
            style={({ pressed }) => ({
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: pressed ? "rgba(201,162,39,0.6)" : colors.line,
              backgroundColor: pressed ? colors.white : "rgba(248,245,240,0.6)",
              paddingHorizontal: 16,
              paddingVertical: 10,
            })}
          >
            <Search size={15} color={colors.gold} />
            <Sans size={12} color={colors.muted} numberOfLines={1}>
              Search jewellery, gold, diamonds...
            </Sans>
          </Pressable>

          <View style={{ marginBottom: 24, flexDirection: "row", gap: 8 }}>
            {[
              { href: "/account", label: "My Account", Icon: User },
              { href: "/wishlist", label: "Wishlist", Icon: Heart },
            ].map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderRadius: 2,
                  borderWidth: 1,
                  borderColor: "rgba(230,224,215,0.8)",
                  backgroundColor: "rgba(248,245,240,0.3)",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
                pressedStyle={{ backgroundColor: colors.beige }}
              >
                <Icon size={14} color={colors.gold} />
                <Sans size={12} weight="medium">
                  {label}
                </Sans>
              </Link>
            ))}
          </View>

          <Eyebrow style={{ marginBottom: 12 }}>Shop</Eyebrow>
          <View>
            {shopLinks.map(({ href, label, icon: Icon }, i) => (
              <Link
                key={href}
                href={href}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 12,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "rgba(230,224,215,0.7)",
                }}
                pressedStyle={{ backgroundColor: "rgba(248,245,240,0.6)" }}
              >
                <Icon size={16} strokeWidth={1.5} color={colors.gold} />
                <Display size={18} style={{ flex: 1 }} numberOfLines={1}>
                  {label}
                </Display>
                <ChevronRight size={15} color={colors.line} />
              </Link>
            ))}

            {/* Categories: one row that unfolds the list, like the header's button. */}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: categoriesOpen }}
              onPress={() => setCategoriesOpen((open) => !open)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: "rgba(230,224,215,0.7)",
                backgroundColor: pressed ? "rgba(248,245,240,0.6)" : undefined,
              })}
            >
              <Grid2x2 size={16} strokeWidth={1.5} color={colors.gold} />
              <Display size={18} style={{ flex: 1 }} color={categoriesOpen ? colors.gold : colors.ink}>
                Categories
              </Display>
              <Animated.View style={chevron}>
                <ChevronDown size={15} color={categoriesOpen ? colors.gold : colors.line} />
              </Animated.View>
            </Pressable>

            {categoriesOpen && (
              <Animated.View entering={FadeIn.duration(200)} style={{ paddingLeft: 28 }}>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingVertical: 10,
                      borderTopWidth: 1,
                      borderTopColor: "rgba(230,224,215,0.7)",
                    }}
                    pressedStyle={{ backgroundColor: "rgba(248,245,240,0.6)" }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 2, backgroundColor: colors.beige, overflow: "hidden" }}>
                      {c.image ? <Image source={{ uri: c.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Sans size={14} numberOfLines={1}>
                        {c.name}
                      </Sans>
                      <Sans size={11} color={colors.muted} numberOfLines={1}>
                        {c.blurb}
                      </Sans>
                    </View>
                    <ChevronRight size={13} color={colors.line} />
                  </Link>
                ))}
              </Animated.View>
            )}
          </View>

          <View style={{ marginTop: 32 }}>
            <Eyebrow style={{ marginBottom: 12 }}>More</Eyebrow>
            {moreLinks.map(({ href, label, icon: Icon }, i) => (
              <Link
                key={href}
                href={href}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 12,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: "rgba(230,224,215,0.7)",
                }}
              >
                <Icon size={16} strokeWidth={1.5} color={colors.gold} />
                <Sans size={14} color={colors.charcoal} style={{ flex: 1 }}>
                  {label}
                </Sans>
                <ChevronRight size={13} color={colors.line} />
              </Link>
            ))}
          </View>
        </ScrollView>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.line,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Eyebrow size={10} style={{ flex: 1 }}>
            Insured delivery · 15-day returns
          </Eyebrow>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[InstagramIcon, FacebookIcon, YoutubeIcon].map((Icon, i) => (
              <View
                key={i}
                style={{ width: 28, height: 28, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" }}
              >
                <Icon size={12} color={colors.charcoal} />
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
