import { FlatList, View, useWindowDimensions } from "react-native";
import { gutter } from "@/lib/theme";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store/store";
import { useProductLookup } from "@/lib/data/catalogue-context";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/layout/page";

/** Shown on the home screen; the product screen keeps its own grid in `RecentlyViewed`. */
const MAX_ITEMS = 10;
const GAP = 16;

/**
 * "Recently viewed" on the home screen, as a swiper — the site's
 * `RecentlyViewedRail`.
 *
 * Unlike `ProductRail`, which is a two-column grid, this stays a horizontal
 * rail: the list is personal and grows with every product the shopper opens,
 * and a grid of ten cards would push the rest of the home screen a screen and
 * a half further down. Cards are 62% of the screen so the next one peeks in
 * from the right edge, and the list snaps card by card. Renders nothing until
 * the store has hydrated, and nothing at all for a first-time visitor.
 */
export function RecentlyViewedRail() {
  const { recentlyViewed, hydrated } = useStore();
  const getProduct = useProductLookup();
  const { width } = useWindowDimensions();

  const items = recentlyViewed
    .map(getProduct)
    .filter((p): p is Product => Boolean(p))
    .slice(0, MAX_ITEMS);

  if (!hydrated || items.length === 0) return null;

  const cardWidth = Math.round(width * 0.62);

  return (
    <View accessibilityLabel="Recently viewed" style={{ paddingVertical: 48 }}>
      <Container>
        <SectionHeading eyebrow="Pick up where you left off" title="Recently viewed" align="between" />
      </Container>
      <FlatList
        data={items}
        keyExtractor={(product) => product.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: 40, gap: GAP }}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
}
