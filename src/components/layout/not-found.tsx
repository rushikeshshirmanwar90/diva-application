import { View } from "react-native";
import { colors } from "@/lib/theme";
import { useCategories } from "@/lib/data/catalogue-context";
import { Page, Container } from "@/components/layout/page";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

/** The site's 404 — "This piece isn’t here". */
export function NotFound() {
  const list = useCategories();

  return (
    <Page>
      <Container style={{ paddingVertical: 80 }}>
        <View style={{ maxWidth: 448 }}>
          <Display size={72} leading="none" color={colors.goldDark}>
            404
          </Display>
          <Display size={30} leading="tight" style={{ marginTop: 24 }}>
            This piece isn’t here
          </Display>
          <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 16 }}>
            The page may have moved, or a limited run may have sold through and been retired. Either way, there is plenty
            else worth looking at.
          </Sans>

          <View style={{ marginTop: 32, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Button href="/shop" variant="gold">
              Browse jewellery
            </Button>
            <Button href="/" variant="outline">
              Back to home
            </Button>
          </View>

          <View style={{ marginTop: 48 }}>
            <Eyebrow style={{ marginBottom: 16 }}>Or jump to a category</Eyebrow>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {list.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`} style={{ backgroundColor: colors.beige, paddingHorizontal: 16, paddingVertical: 8 }} pressedStyle={{ backgroundColor: colors.beigeDark }}>
                  <Sans size={12} color={colors.charcoal}>
                    {c.name}
                  </Sans>
                </Link>
              ))}
            </View>
          </View>
        </View>
      </Container>
    </Page>
  );
}
