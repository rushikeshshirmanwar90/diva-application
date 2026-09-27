import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { BadgeCheck, Heart, RotateCcw, ShoppingBag, Truck } from "lucide-react-native";
import { colors } from "@/lib/theme";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store/store";
import { recordProductView } from "@/lib/analytics/product-view";
import { GST_RATE } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { QtyStepper } from "@/components/cart/cart-drawer";

export function BuyBox({ product, onReadReviews }: { product: Product; onReadReviews?: () => void }) {
  const { addToCart, toggleWishlist, isWishlisted, markViewed } = useStore();
  const firstAvailable = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? "");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    markViewed(product.slug);
    recordProductView(product.slug);
  }, [markViewed, product.slug]);

  const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;
  const unitPrice = product.price + (variant?.priceDelta ?? 0);
  const unitMrp = product.mrp + (variant?.priceDelta ?? 0);
  const saved = isWishlisted(product.slug);

  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {product.badges.map((b) => (
          <Badge key={b} tone={b} />
        ))}
        {product.attributes.certification ? <Eyebrow size={10}>{product.attributes.certification}</Eyebrow> : null}
      </View>

      <Display size={30} leading="tight" style={{ marginTop: 16 }}>
        {product.title}
      </Display>
      <Sans size={14} color={colors.muted} style={{ marginTop: 8 }}>
        {product.subtitle}
      </Sans>

      <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
        <Rating value={product.ratingAvg} count={product.ratingCount} />
        <Pressable
          accessibilityRole="button"
          onPress={onReadReviews}
          hitSlop={12}
          style={({ pressed }) => ({ paddingVertical: 4, opacity: pressed ? 0.6 : 1 })}
        >
          <Eyebrow color={colors.charcoal}>Read reviews</Eyebrow>
        </Pressable>
      </View>

      <View style={{ marginTop: 28, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, paddingVertical: 24 }}>
        <Price price={unitPrice} mrp={unitMrp} size="lg" />
        <Sans size={12} color={colors.muted} style={{ marginTop: 8 }}>
          Inclusive of {Math.round(GST_RATE * 100)}% GST · free insured delivery
        </Sans>
      </View>

      {variant ? (
        <View style={{ marginTop: 28 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Eyebrow color={colors.ink}>{product.variantLabel}</Eyebrow>
            <Sans size={11} color={colors.muted}>
              {variant.stock > 0 ? (variant.stock <= 3 ? `Only ${variant.stock} left` : "In stock") : "Made to order · 6–8 weeks"}
            </Sans>
          </View>
          <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {product.variants.map((v) => {
              const isActive = v.id === variant.id;
              const soldOut = v.stock === 0;
              return (
                <Pressable
                  key={v.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => setVariantId(v.id)}
                  style={({ pressed }) => ({
                    minWidth: 56,
                    borderWidth: 1,
                    borderColor: isActive || pressed ? colors.charcoal : colors.line,
                    backgroundColor: isActive ? colors.charcoal : "transparent",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <Sans size={14} color={isActive ? colors.white : soldOut ? "rgba(122,115,108,0.6)" : colors.charcoal}>
                    {v.label}
                  </Sans>
                  {soldOut ? (
                    <View
                      style={{ position: "absolute", left: 4, right: 4, top: "50%", height: 1, backgroundColor: "rgba(122,115,108,0.4)", transform: [{ rotate: "-12deg" }] }}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <Sans size={12} color={colors.muted} style={{ marginTop: 12 }}>
            SKU {variant.sku}
            {product.attributes.metal ? ` · ${product.attributes.metal}` : ""}
          </Sans>
        </View>
      ) : null}

      <View style={{ marginTop: 28, flexDirection: "row", flexWrap: "wrap", alignItems: "stretch", gap: 12 }}>
        <QtyStepper qty={qty} onChange={setQty} size={48} min={1} max={5} />
        <Button
          variant="gold"
          size="lg"
          style={{ flex: 1, paddingHorizontal: 16 }}
          disabled={!variant}
          icon={<ShoppingBag size={15} color={colors.charcoal} />}
          onPress={() => variant && addToCart(product.slug, variant.id, qty)}
        >
          {variant && variant.stock > 0 ? "Add to bag" : "Pre-order"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          accessibilityLabel={saved ? "Remove from wishlist" : "Save to wishlist"}
          onPress={() => toggleWishlist(product.slug)}
          style={{ paddingHorizontal: 20 }}
          icon={<Heart size={16} color={saved ? colors.gold : colors.charcoal} fill={saved ? colors.gold : "transparent"} />}
        />
      </View>

      <View style={{ marginTop: 32, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 32, gap: 16 }}>
        {[
          { Icon: Truck, label: "Insured delivery", sub: "2–4 working days" },
          { Icon: RotateCcw, label: "15-day returns", sub: "Free size exchange" },
          { Icon: BadgeCheck, label: product.attributes.huid ?? "Hallmarked", sub: "BIS verifiable" },
        ].map(({ Icon, label, sub }) => (
          <View key={label} style={{ flexDirection: "row", gap: 12 }}>
            <Icon size={18} strokeWidth={1.3} color={colors.gold} style={{ marginTop: 2 }} />
            <View>
              <Eyebrow size={10} color={colors.ink}>
                {label}
              </Eyebrow>
              <Sans size={11} color={colors.muted} style={{ marginTop: 2 }}>
                {sub}
              </Sans>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
