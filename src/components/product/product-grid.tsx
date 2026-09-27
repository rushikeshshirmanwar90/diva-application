import { View, type StyleProp, type ViewStyle } from "react-native";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";

/** Two columns, `gap-x-5 gap-y-12` — the site's grid below `lg`. */
export function ProductGrid({ products, style }: { products: Product[]; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -10 }, style]}>
      {products.map((product) => (
        <View key={product.id} style={{ width: "50%", paddingHorizontal: 10, marginBottom: 48 }}>
          <ProductCard product={product} />
        </View>
      ))}
    </View>
  );
}

/** Below `lg` the rail is the same two-column grid; kept as its own name so call sites read like the site. */
export function ProductRail({ products }: { products: Product[] }) {
  return <ProductGrid products={products} />;
}
