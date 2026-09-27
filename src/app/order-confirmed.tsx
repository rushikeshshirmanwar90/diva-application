import { View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { BadgeCheck } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { MODEL } from "@/lib/images";
import { useCatalogue } from "@/lib/data/catalogue-context";
import { byBadge } from "@/lib/data/product-helpers";
import { Page, Container } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { ProductRail } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { OrderConfirmationSummary } from "@/components/checkout/order-confirmation-summary";

export default function OrderConfirmedScreen() {
  const { order } = useLocalSearchParams<{ order?: string }>();
  const orderNumber = order ?? "DIVA-2026-00000";
  const bestsellers = byBadge(useCatalogue(), "bestseller");

  return (
    <Page>
      <View style={{ backgroundColor: colors.charcoal, overflow: "hidden" }}>
        <Image source={{ uri: MODEL.layeredPendants }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.25 }} contentFit="cover" />
        <Container style={{ paddingVertical: 80, alignItems: "center" }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" }}>
            <BadgeCheck size={26} strokeWidth={1.4} color={colors.white} />
          </View>
          <Display size={36} leading="tight" color={colors.white} align="center" style={{ marginTop: 28 }}>
            Thank you — your order is confirmed
          </Display>
          <Sans size={14} color="rgba(255,255,255,0.7)" align="center" style={{ marginTop: 16 }}>
            Order <Sans size={14} color={colors.goldLight}>{orderNumber}</Sans> · a receipt is on its way to your email
          </Sans>
        </Container>
      </View>

      <Container style={{ paddingVertical: 64 }}>
        <OrderConfirmationSummary orderNumber={orderNumber} />

        <View style={{ marginTop: 48, borderWidth: 1, borderColor: colors.line, padding: 32 }}>
          <Eyebrow>What happens next</Eyebrow>
          <View style={{ marginTop: 24, gap: 20 }}>
            {[
              "Our workshop verifies weight and purity against your invoice, and photographs the piece before packing.",
              "You get a courier tracking link by email and SMS the moment it ships.",
              "Delivery requires a photo ID matching the order name — this is an insured jewellery shipment.",
              "15 days from delivery to return it, and 30 days for one free size exchange.",
            ].map((text, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 20 }}>
                <Display size={20} leading="none" color={colors.goldText}>
                  0{i + 1}
                </Display>
                <Sans size={14} leading="relaxed" color={colors.muted} style={{ flex: 1 }}>
                  {text}
                </Sans>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 32, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Button href="/account/orders">Track this order</Button>
            <Button href="/shop" variant="outline">
              Continue shopping
            </Button>
          </View>
        </View>

        {bestsellers.length > 0 ? (
          <View style={{ marginTop: 80 }}>
            <SectionHeading eyebrow="Often bought together" title="Complete the look" align="between" href="/shop" linkLabel="Shop all" />
            <View style={{ marginTop: 40 }}>
              <ProductRail products={bestsellers} />
            </View>
          </View>
        ) : null}
      </Container>
    </Page>
  );
}
