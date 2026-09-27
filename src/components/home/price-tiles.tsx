import { View } from "react-native";
import { ArrowUpRight } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { SectionHeading } from "@/components/ui/section-heading";
import { Display, Eyebrow } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import { Container } from "@/components/layout/page";

const tiers = [
  { label: "Under ₹25,000", sub: "Everyday gold", query: "0-25000" },
  { label: "₹25,000 – ₹50,000", sub: "Gifting favourites", query: "25000-50000" },
  { label: "₹50,000 – ₹1,00,000", sub: "Diamond pieces", query: "50000-100000" },
  { label: "Above ₹1,00,000", sub: "Bridal & heirloom", query: "100000-9999999" },
];

export function PriceTiles() {
  return (
    <View style={{ backgroundColor: colors.beige }}>
      <Container style={{ paddingVertical: 80 }}>
        <SectionHeading
          eyebrow="Start from a number"
          title="Shop by budget"
          description="Every price on the site is the price you pay — GST included at checkout, no separate making-charge surprise."
        />
        <View style={{ marginTop: 48, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.line, gap: 1 }}>
          {tiers.map((t) => (
            <Link
              key={t.query}
              href={`/shop?price=${t.query}`}
              style={{ backgroundColor: colors.white, padding: 32, gap: 40, justifyContent: "space-between" }}
              pressedStyle={{ backgroundColor: colors.beigeDark }}
            >
              <View>
                <Eyebrow>{t.sub}</Eyebrow>
                <Display size={24} leading="tight" style={{ marginTop: 12 }}>
                  {t.label}
                </Display>
              </View>
              <ArrowUpRight size={20} strokeWidth={1.3} color={colors.gold} />
            </Link>
          ))}
        </View>
      </Container>
    </View>
  );
}
