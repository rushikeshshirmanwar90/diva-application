import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { router, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { colors, shadow } from "@/lib/theme";
import { useCatalogueState } from "@/lib/data/catalogue-context";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { BottomNav, useBottomNavVisible } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { IconButton } from "@/components/ui/icon-button";

/**
 * The page shell every screen renders into — the site's root layout: the
 * content scrolling in the middle, the footer at the end, and the tab bar
 * pinned below it all. Pull-to-refresh re-reads the catalogue.
 *
 * The announcement bar, header and footer appear on the home screen only.
 * Every other screen is reached through the tab bar or by tapping into
 * something, so the hamburger, logo and search up top — and the link
 * columns at the bottom — would be repeating what the tab bar already
 * offers. A `back` screen keeps a single floating arrow so a product opened
 * from a grid still has a visible way home without the swipe gesture.
 */
export function Page({
  children,
  footer = true,
  back = false,
  contentStyle,
  scrollRef,
}: {
  children: React.ReactNode;
  /** Opt out of the footer on home; it is never shown elsewhere. */
  footer?: boolean;
  /** A detail screen: shows a floating back arrow over the content. */
  back?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  scrollRef?: React.Ref<ScrollView>;
}) {
  const insets = useSafeAreaInsets();
  const { refreshing, refresh } = useCatalogueState();
  const tabs = useBottomNavVisible();
  const home = usePathname() === "/";

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      {/* The bar is charcoal on home and white elsewhere; the clock must stay legible on both. */}
      <StatusBar style={home ? "light" : "dark"} />
      {home ? (
        <>
          <View style={{ paddingTop: insets.top, backgroundColor: colors.charcoal }}>
            <AnnouncementBar />
          </View>
          <Header />
        </>
      ) : (
        <View style={{ height: insets.top, backgroundColor: colors.white }} />
      )}
      {/*
        iOS keeps the window put behind the keyboard, so a form's lower
        fields — the password on Create account — vanish under it without
        this. Android resizes the window itself (`adjustResize`), so it
        needs nothing here.
      */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.gold} colors={[colors.gold]} />}
          // The bar carries the bottom inset itself when it is on screen.
          contentContainerStyle={[{ paddingBottom: tabs ? 0 : insets.bottom }, contentStyle]}
        >
          {children}
          {footer && home ? <Footer /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
      {back && !home ? (
        <View style={{ position: "absolute", top: insets.top + 8, left: 12 }}>
          <IconButton
            label="Go back"
            size={40}
            style={[{ backgroundColor: "rgba(255,255,255,0.92)" }, shadow.md]}
            onPress={() => (router.canGoBack() ? router.back() : router.navigate("/shop"))}
          >
            <ArrowLeft size={20} strokeWidth={1.5} color={colors.charcoal} />
          </IconButton>
        </View>
      ) : null}
      <BottomNav />
    </View>
  );
}

/** `mx-auto max-w-[90rem] px-5` — the page gutter. */
export function Container({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ paddingHorizontal: 20 }, style]}>{children}</View>;
}
