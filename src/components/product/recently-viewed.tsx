import { View } from "react-native";
import { useStore } from "@/lib/store/store";
import { useProductLookup } from "@/lib/data/catalogue-context";
import { ProductRail } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const { recentlyViewed, hydrated } = useStore();
  const getProduct = useProductLookup();

  const items = recentlyViewed
    .filter((slug) => slug !== excludeSlug)
    .map(getProduct)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (!hydrated || items.length === 0) return null;

  return (
    <View style={{ marginTop: 96 }}>
      <SectionHeading eyebrow="Pick up where you left off" title="Recently viewed" align="between" />
      <View style={{ marginTop: 40 }}>
        <ProductRail products={items} />
      </View>
    </View>
  );
}
