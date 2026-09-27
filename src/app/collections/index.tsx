import { View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { useCatalogue } from "@/lib/data/catalogue-context";
import { byOccasion, occasionCollections } from "@/lib/data/occasions";
import { Page, Container } from "@/components/layout/page";
import { PageHeader } from "@/components/shop/page-header";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";

/**
 * One tile per occasion, each linking to its own page. The edits are the
 * backend's occasions, not its admin-created collections — a product ticked
 * as "Wedding" on the add-product page lands in the Wedding edit without a
 * second assignment.
 */
export default function CollectionsScreen() {
  const catalogue = useCatalogue();

  return (
    <Page>
      <PageHeader
        eyebrow="Shop by occasion"
        title="Collections"
        description="Seven edits, each built around when a piece will actually be worn rather than what it is made of."
        trail={[{ label: "Collections" }]}
      />

      <Container style={{ paddingBottom: 64, gap: 32 }}>
        {occasionCollections.map((c, i) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} style={{ backgroundColor: colors.charcoal, overflow: "hidden" }} pressedStyle={{ opacity: 0.92 }}>
            <View style={{ aspectRatio: i === 0 ? 16 / 9 : 4 / 3 }}>
              {c.image ? (
                <Image source={{ uri: c.image }} style={{ width: "100%", height: "100%", opacity: 0.8 }} contentFit="cover" />
              ) : null}
              <LinearGradient
                colors={["rgba(26,26,26,0)", "rgba(26,26,26,0.25)", "rgba(26,26,26,0.9)"]}
                style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
              />
              <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 32 }}>
                <Sans size={10} color={colors.goldLight} uppercase tracking={0.3}>
                  {c.tagline}
                </Sans>
                <Display size={30} leading="tight" color={colors.white} style={{ marginTop: 12 }}>
                  {c.name}
                </Display>
                <Sans size={14} leading="relaxed" color="rgba(255,255,255,0.7)" style={{ marginTop: 12, maxWidth: 512 }}>
                  {c.description}
                </Sans>
                <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Eyebrow size={10} color={colors.white}>
                    {byOccasion(catalogue, c).length} pieces
                  </Eyebrow>
                  <ArrowRight size={14} color={colors.gold} />
                </View>
              </View>
            </View>
          </Link>
        ))}
      </Container>
    </Page>
  );
}
