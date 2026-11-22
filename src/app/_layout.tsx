import "react-native-url-polyfill/auto";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond";
import { Jost_300Light, Jost_400Regular, Jost_500Medium } from "@expo-google-fonts/jost";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "@/lib/theme";
import { CatalogueProvider } from "@/lib/data/catalogue-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { StoreProvider } from "@/lib/store/store";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AppLoader } from "@/components/layout/app-loader";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { Toaster } from "@/components/ui/toaster";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync();

/**
 * The root layout — the site's `app/layout.tsx`.
 *
 * Loads the two brand typefaces before anything renders, then stacks the
 * same three providers in the same order (catalogue → auth → store) and
 * mounts the transient surfaces — bag, menu, search, toasts — once, above
 * the navigator, so they overlay whichever screen is open. The launch veil
 * sits on top of all of them and takes over from the native splash until
 * the catalogue has arrived.
 */
export default function RootLayout() {
  const [loaded] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CatalogueProvider>
        <AuthProvider>
          <StoreProvider>
            <View style={{ flex: 1, backgroundColor: colors.white }}>
              <StatusBar style="light" />
              <View style={{ flex: 1 }}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.white },
                    // The platform's own push: the iOS slide with its edge
                    // swipe-back (from anywhere on the screen, not just the
                    // edge), and a slide on Android. A screen arriving from the
                    // right reads as "went somewhere" in a way a fade never did.
                    animation: Platform.OS === "ios" ? "default" : "slide_from_right",
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                    // A screen underneath the one being pushed keeps its whole
                    // tree mounted; without this, a store or catalogue update
                    // re-renders every card on the previous screen mid-transition.
                    freezeOnBlur: true,
                  }}
                />
              </View>
              <BottomNav />
              <CartDrawer />
              <MobileNav />
              <SearchOverlay />
              <Toaster />
              <AppLoader />
            </View>
          </StoreProvider>
        </AuthProvider>
      </CatalogueProvider>
    </GestureHandlerRootView>
  );
}
