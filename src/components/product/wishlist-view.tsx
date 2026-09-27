import { View } from "react-native";
import { Heart } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { useStore } from "@/lib/store/store";
import { useProductLookup } from "@/lib/data/catalogue-context";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Display, Sans } from "@/components/ui/text";
import { Container } from "@/components/layout/page";

export function WishlistView() {
  const { wishlist, hydrated } = useStore();
  const getProduct = useProductLookup();

  const items = wishlist.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (!hydrated) return <View style={{ minHeight: 400 }} />;

  return (
    <Container style={{ paddingTop: 32, paddingBottom: 80 }}>
      <Breadcrumbs trail={[{ label: "Wishlist" }]} />

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart size={24} strokeWidth={1.3} color={colors.gold} />}
          title="Your wishlist is empty"
          body="Tap the heart on any piece to keep it here. We'll tell you if the price moves or stock runs low."
        />
      ) : (
        <>
          <View style={{ marginTop: 24, flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
            <Display size={36}>Wishlist</Display>
            <Sans size={12} color={colors.muted}>
              {items.length} saved {items.length === 1 ? "piece" : "pieces"} · we notify you on price changes
            </Sans>
          </View>
          <ProductGrid products={items} style={{ marginTop: 48 }} />
        </>
      )}
    </Container>
  );
}
