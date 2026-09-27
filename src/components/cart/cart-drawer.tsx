import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react-native";
import { colors, shadow } from "@/lib/theme";
import { useStore, useStoreUI } from "@/lib/store/store";
import { formatPaise, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { cdnImage, IMG } from "@/lib/images";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

/** The bag that slides in from the right — the site's `CartDrawer`. */
export function CartDrawer() {
  const { cartOpen } = useStoreUI();
  const { setCartOpen, lines, totals, setQty, removeLine } = useStore();
  const insets = useSafeAreaInsets();

  if (!cartOpen) return null;
  const close = () => setCartOpen(false);

  const toFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.taxable);
  const progress = FREE_SHIPPING_THRESHOLD > 0 ? Math.min(100, (totals.taxable / FREE_SHIPPING_THRESHOLD) * 100) : 100;

  return (
    <View accessibilityViewIsModal accessibilityLabel="Shopping bag" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 70 }}>
      <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <Pressable accessibilityLabel="Close bag" onPress={close} style={{ flex: 1, backgroundColor: "rgba(26,26,26,0.4)" }} />
      </Animated.View>

      <Animated.View
        entering={SlideInRight.duration(400)}
        exiting={SlideOutRight.duration(300)}
        style={[
          { position: "absolute", top: 0, bottom: 0, right: 0, width: "100%", maxWidth: 448, backgroundColor: colors.white },
          shadow.xl,
        ]}
      >
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingBottom: 20,
            paddingHorizontal: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
          }}
        >
          <View>
            <Eyebrow>Your bag</Eyebrow>
            <Display size={20}>
              {totals.itemCount} {totals.itemCount === 1 ? "piece" : "pieces"}
            </Display>
          </View>
          <IconButton label="Close bag" onPress={close} size={40}>
            <X size={20} strokeWidth={1.5} color={colors.charcoal} />
          </IconButton>
        </View>

        {lines.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
            <View
              style={{ marginBottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.beige, alignItems: "center", justifyContent: "center" }}
            >
              <ShoppingBag size={22} strokeWidth={1.4} color={colors.gold} />
            </View>
            <Display size={20} align="center">
              Your bag is empty
            </Display>
            <Sans size={14} color={colors.muted} align="center" style={{ marginTop: 8 }}>
              Pieces you add will be held here for 30 days.
            </Sans>
            <Button href="/shop" style={{ marginTop: 28 }}>
              Browse jewellery
            </Button>
          </View>
        ) : (
          <>
            {toFreeShipping > 0 ? (
              <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line, paddingHorizontal: 24, paddingVertical: 16 }}>
                <Sans size={12} color={colors.muted}>
                  Add{" "}
                  <Sans size={12} weight="medium">
                    {formatPaise(toFreeShipping)}
                  </Sans>{" "}
                  more for complimentary insured shipping
                </Sans>
                <View style={{ marginTop: 8, height: 2, backgroundColor: colors.line }}>
                  <View style={{ height: "100%", width: `${progress}%`, backgroundColor: colors.gold }} />
                </View>
              </View>
            ) : (
              <Sans
                size={12}
                color={colors.success}
                style={{ borderBottomWidth: 1, borderBottomColor: colors.line, paddingHorizontal: 24, paddingVertical: 16 }}
              >
                ✦ Complimentary insured shipping unlocked
              </Sans>
            )}

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24 }}>
              {lines.map((line, i) => (
                <View
                  key={line.key}
                  style={{ flexDirection: "row", gap: 16, paddingVertical: 20, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.line }}
                >
                  <Link href={`/product/${line.product.slug}`} style={{ width: 96, height: 96, backgroundColor: colors.beige, overflow: "hidden" }}>
                    {line.product.images[0] ? (
                      <Image source={{ uri: cdnImage(line.product.images[0], IMG.thumb) }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                    ) : null}
                  </Link>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/product/${line.product.slug}`}>
                      <Display size={16} weight="regular" leading="snug">
                        {line.product.title}
                      </Display>
                    </Link>
                    <Sans size={12} color={colors.muted} style={{ marginTop: 2 }}>
                      {line.product.variantLabel}: {line.variant.label}
                    </Sans>
                    <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <QtyStepper qty={line.qty} onChange={(q) => setQty(line.key, q)} size={32} />
                      <Sans size={14} weight="medium">
                        {formatPaise(line.lineTotal)}
                      </Sans>
                    </View>
                  </View>
                  <Pressable
                    accessibilityLabel={`Remove ${line.product.title}`}
                    onPress={() => removeLine(line.key)}
                    hitSlop={8}
                    style={{ alignSelf: "flex-start" }}
                  >
                    {({ pressed }) => <Trash2 size={15} strokeWidth={1.5} color={pressed ? colors.sale : colors.muted} />}
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 24, paddingTop: 20, paddingBottom: insets.bottom + 20 }}>
              <View style={{ gap: 6 }}>
                <Row label="Subtotal" value={formatPaise(totals.subtotal)} />
                <Row label="GST (3%)" value={formatPaise(totals.gst)} />
                {totals.shipping > 0 ? <Row label="Shipping" value={formatPaise(totals.shipping)} /> : null}
              </View>
              <View
                style={{ marginTop: 12, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 }}
              >
                <Eyebrow>Total</Eyebrow>
                <Display size={24}>{formatPaise(totals.total)}</Display>
              </View>
              <View style={{ marginTop: 20, gap: 10 }}>
                <Button href="/checkout" variant="gold" size="lg" fullWidth>
                  Proceed to checkout
                </Button>
                <Button href="/cart" variant="outline" fullWidth>
                  View full bag
                </Button>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Sans size={14} color={colors.muted}>
        {label}
      </Sans>
      <Sans size={14}>{value}</Sans>
    </View>
  );
}

/** The bordered −/n/+ control used by the bag, the cart page and the buy box. */
export function QtyStepper({
  qty,
  onChange,
  size = 36,
  min = 0,
  max = 10,
}: {
  qty: number;
  onChange: (next: number) => void;
  size?: number;
  min?: number;
  max?: number;
}) {
  const iconSize = size >= 48 ? 14 : 13;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line }}>
      <Pressable
        accessibilityLabel="Decrease quantity"
        onPress={() => onChange(Math.max(min, qty - 1))}
        style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      >
        {({ pressed }) => <Minus size={iconSize} color={pressed ? colors.gold : colors.charcoal} />}
      </Pressable>
      <Sans size={14} align="center" style={{ width: size >= 48 ? 40 : size }}>
        {qty}
      </Sans>
      <Pressable
        accessibilityLabel="Increase quantity"
        onPress={() => onChange(Math.min(max, qty + 1))}
        style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      >
        {({ pressed }) => <Plus size={iconSize} color={pressed ? colors.gold : colors.charcoal} />}
      </Pressable>
    </View>
  );
}
