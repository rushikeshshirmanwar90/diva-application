import { useState } from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Heart, ShoppingBag, Tag, Trash2 } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { cdnImage, IMG } from "@/lib/images";
import { useStore } from "@/lib/store/store";
import { formatPaise } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import { Field } from "@/components/ui/field";
import { OrderSummary } from "@/components/cart/order-summary";
import { QtyStepper } from "@/components/cart/cart-drawer";
import { Container } from "@/components/layout/page";

export function CartView() {
  const { hydrated, lines, totals, setQty, removeLine, toggleWishlist, coupon, applyCoupon, removeCoupon } = useStore();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!hydrated) return <View style={{ minHeight: 400 }} />;

  if (lines.length === 0) {
    return (
      <Container style={{ paddingTop: 32 }}>
        <Breadcrumbs trail={[{ label: "Your bag" }]} />
        <EmptyState
          icon={<ShoppingBag size={24} strokeWidth={1.3} color={colors.gold} />}
          title="Your bag is empty"
          body="Nothing here yet. Pieces you add are held for 30 days, and your wishlist keeps them longer."
        />
      </Container>
    );
  }

  const apply = () => {
    const result = applyCoupon(code);
    setMessage({ ok: result.ok, text: result.message });
    if (result.ok) setCode("");
  };

  return (
    <Container style={{ paddingTop: 32, paddingBottom: 80 }}>
      <Breadcrumbs trail={[{ label: "Your bag" }]} />
      <View style={{ marginTop: 24, flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <Display size={36}>Your bag</Display>
        <Sans size={12} color={colors.muted}>
          {totals.itemCount} {totals.itemCount === 1 ? "piece" : "pieces"} · {formatPaise(totals.subtotal)}
        </Sans>
      </View>

      <View style={{ marginTop: 40, gap: 56 }}>
        <View>
          <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }}>
            {lines.map((line, i) => (
              <View key={line.key} style={{ flexDirection: "row", gap: 20, paddingVertical: 28, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.line }}>
                <Link href={`/product/${line.product.slug}`} style={{ width: 112, height: 112, backgroundColor: colors.beige, overflow: "hidden" }}>
                  {line.product.images[0] ? (
                    <Image source={{ uri: cdnImage(line.product.images[0], IMG.thumb) }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                  ) : null}
                </Link>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Eyebrow>{line.product.attributes.metal ?? " "}</Eyebrow>
                      <Link href={`/product/${line.product.slug}`}>
                        <Display size={20} leading="snug" style={{ marginTop: 4 }}>
                          {line.product.title}
                        </Display>
                      </Link>
                      <Sans size={12} color={colors.muted} style={{ marginTop: 4 }}>
                        {line.product.variantLabel}: {line.variant.label} · SKU {line.variant.sku}
                      </Sans>
                      <Sans size={12} color={colors.success} style={{ marginTop: 6 }}>
                        {line.variant.stock > 0
                          ? line.variant.stock <= 3
                            ? `Only ${line.variant.stock} left in this size`
                            : "In stock · ships in 48 hours"
                          : "Made to order · 6–8 weeks"}
                      </Sans>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Sans size={16} weight="medium">
                        {formatPaise(line.lineTotal)}
                      </Sans>
                      {line.unitMrp > line.unitPrice ? (
                        <Sans size={12} color={colors.muted} strike>
                          {formatPaise(line.unitMrp * line.qty)}
                        </Sans>
                      ) : null}
                    </View>
                  </View>

                  <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
                    <QtyStepper qty={line.qty} onChange={(q) => setQty(line.key, q)} />
                    <Pressable
                      onPress={() => {
                        toggleWishlist(line.product.slug);
                        removeLine(line.key);
                      }}
                      style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                    >
                      <Heart size={13} color={colors.muted} />
                      <Eyebrow size={10}>Move to wishlist</Eyebrow>
                    </Pressable>
                    <Pressable onPress={() => removeLine(line.key)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Trash2 size={13} color={colors.muted} />
                      <Eyebrow size={10}>Remove</Eyebrow>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 40, borderWidth: 1, borderColor: colors.line, padding: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Tag size={15} strokeWidth={1.4} color={colors.gold} />
              <Eyebrow color={colors.ink}>Offers & coupons</Eyebrow>
            </View>

            {coupon ? (
              <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, backgroundColor: colors.beige, paddingHorizontal: 16, paddingVertical: 12 }}>
                <Sans size={14}>
                  <Sans size={14} weight="medium">
                    {coupon}
                  </Sans>{" "}
                  will be applied at checkout
                </Sans>
                <Pressable
                  onPress={() => {
                    removeCoupon();
                    setMessage(null);
                  }}
                >
                  <Eyebrow size={10} color={colors.sale}>
                    Remove
                  </Eyebrow>
                </Pressable>
              </View>
            ) : (
              <View style={{ marginTop: 16, flexDirection: "row", gap: 12, alignItems: "stretch" }}>
                <View style={{ flex: 1 }}>
                  <Field
                    boxed
                    value={code}
                    onChangeText={(v) => setCode(v.toUpperCase())}
                    onSubmitEditing={apply}
                    placeholder="Enter code"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    accessibilityLabel="Coupon code"
                  />
                </View>
                <Button variant="outline" onPress={apply}>
                  Apply
                </Button>
              </View>
            )}

            {message ? (
              <Sans size={12} color={message.ok ? colors.success : colors.sale} style={{ marginTop: 12 }}>
                {message.text}
              </Sans>
            ) : null}
          </View>

          <Button href="/shop" variant="ghost" style={{ marginTop: 32 }}>
            ← Continue shopping
          </Button>
        </View>

        <View>
          <OrderSummary totals={totals} coupon={coupon} />
          <Button href="/checkout" variant="gold" size="lg" fullWidth style={{ marginTop: 24 }}>
            Proceed to checkout
          </Button>
          <Sans size={10} color={colors.muted} align="center" tracking={0.025} style={{ marginTop: 16 }}>
            Gold rate locked for 30 minutes once you reach checkout
          </Sans>
        </View>
      </View>
    </Container>
  );
}
