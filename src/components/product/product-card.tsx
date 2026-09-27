import { memo } from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Heart } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { cdnImage, IMG } from "@/lib/images";
import type { Product } from "@/lib/types";
import { discountPercent } from "@/lib/format";
import { useStore } from "@/lib/store/store";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";

/**
 * The catalogue card — 4:5 image, badges, heart, then metal / title / subtitle / price / rating.
 *
 * Memoised: a grid renders eight or more of these, and the parent screen
 * re-renders on every catalogue refresh and wishlist change. The card only
 * needs to redraw when its own product (or its wishlist state) changes.
 */
export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const saved = isWishlisted(product.slug);
  const inStock = product.variants.some((v) => v.stock > 0);
  const off = discountPercent(product.price, product.mrp);
  const href = `/product/${product.slug}`;

  // The artwork settles in under the finger and springs back on release —
  // the tap is acknowledged on the UI thread before the screen starts to move.
  const press = useSharedValue(0);
  const artwork = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.04 }],
    opacity: 1 - press.value * 0.1,
  }));

  return (
    <View>
      <View style={{ aspectRatio: 4 / 5, backgroundColor: colors.beige, overflow: "hidden" }}>
        <Link
          href={href}
          accessibilityLabel={product.title}
          style={{ width: "100%", height: "100%" }}
          pressedStyle={null}
          onPressIn={() => {
            press.value = withTiming(1, { duration: 110 });
          }}
          onPressOut={() => {
            press.value = withSpring(0, { damping: 14, stiffness: 220 });
          }}
        >
          <Animated.View style={[{ width: "100%", height: "100%" }, artwork]}>
            {product.images[0] ? (
              <Image
                source={{ uri: cdnImage(product.images[0], IMG.thumb) }}
                recyclingKey={product.id}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />
            ) : null}
          </Animated.View>
        </Link>

        <View pointerEvents="none" style={{ position: "absolute", top: 12, left: 12, gap: 6 }}>
          {product.badges.map((b) => (
            <Badge key={b} tone={b} />
          ))}
          {off >= 10 ? <Badge tone="sale">{`${off}% off`}</Badge> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "Remove from wishlist" : "Save to wishlist"}
          accessibilityState={{ selected: saved }}
          onPress={() => toggleWishlist(product.slug)}
          hitSlop={6}
          style={({ pressed }) => ({
            position: "absolute",
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: pressed ? colors.white : "rgba(255,255,255,0.85)",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Heart size={15} strokeWidth={1.6} color={saved ? colors.gold : colors.charcoal} fill={saved ? colors.gold : "transparent"} />
        </Pressable>

        {!inStock ? (
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(26,26,26,0.85)", paddingVertical: 8 }}>
            <Eyebrow size={10} color={colors.white} align="center">
              Made to order
            </Eyebrow>
          </View>
        ) : null}
      </View>

      <View style={{ paddingTop: 16 }}>
        <Eyebrow>{product.attributes.metal ?? " "}</Eyebrow>
        <Link href={href}>
          <Display size={18} weight="regular" leading="snug" style={{ marginTop: 6 }}>
            {product.title}
          </Display>
        </Link>
        <Sans size={12} color={colors.muted} numberOfLines={1} style={{ marginTop: 4 }}>
          {product.subtitle}
        </Sans>
        <View style={{ marginTop: 10 }}>
          <Price price={product.price} mrp={product.mrp} size="sm" />
        </View>
        <View style={{ marginTop: 8 }}>
          <Rating value={product.ratingAvg} count={product.ratingCount} />
        </View>
      </View>
    </View>
  );
});
