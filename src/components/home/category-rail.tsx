import { View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/lib/theme";
import { useCategories } from "@/lib/data/catalogue-context";
import { SectionHeading } from "@/components/ui/section-heading";
import { Display, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import { Container } from "@/components/layout/page";

const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
/** "Nine" reads better than "9" in running copy; past twelve the numeral is clearer. */
const countWord = (n: number) => WORDS[n] ?? String(n);

export function CategoryRail() {
  const list = useCategories();

  return (
    <Container style={{ paddingVertical: 80 }}>
      <SectionHeading
        eyebrow="Find your piece"
        title="Shop by category"
        description={`${countWord(list.length)} categories, from a 2.9-gram everyday hoop to a 68-gram bridal set.`}
      />

      {/* A two-up grid, as on the site below `lg`. */}
      <View style={{ marginTop: 48, flexDirection: "row", flexWrap: "wrap", marginHorizontal: -8 }}>
        {list.map((c) => (
          <View key={c.slug} style={{ width: "50%", paddingHorizontal: 8, marginBottom: 16 }}>
            <Link href={`/category/${c.slug}`} pressedStyle={{ opacity: 0.9 }}>
              <View style={{ aspectRatio: 3 / 4, backgroundColor: colors.beige, overflow: "hidden" }}>
                {c.image ? (
                  <Image source={{ uri: c.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" accessibilityLabel={c.name} />
                ) : null}
                <LinearGradient
                  colors={["rgba(26,26,26,0)", "rgba(26,26,26,0)", "rgba(26,26,26,0.7)"]}
                  style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16 }}>
                  <Display size={20} leading="tight" color={colors.white}>
                    {c.name}
                  </Display>
                  <Sans size={10} leading="snug" color="rgba(255,255,255,0.7)" style={{ marginTop: 2 }}>
                    {c.blurb}
                  </Sans>
                </View>
              </View>
            </Link>
          </View>
        ))}
      </View>
    </Container>
  );
}
