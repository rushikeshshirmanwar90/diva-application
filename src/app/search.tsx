import { useState } from "react";
import { TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Search } from "lucide-react-native";
import { colors, fonts } from "@/lib/theme";
import { useCatalogue, useCategories } from "@/lib/data/catalogue-context";
import { search } from "@/lib/data/product-helpers";
import { filtersFromParams } from "@/lib/filters";
import { Page, Container } from "@/components/layout/page";
import { ShopView } from "@/components/shop/shop-view";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import { CatalogueSkeleton } from "@/components/shop/catalogue-skeleton";
import { Reveal } from "@/components/ui/reveal";
import { useAfterTransition } from "@/lib/use-after-transition";

const POPULAR = ["Solitaire ring", "Gold hoops", "Polki", "Tennis bracelet", "Mangalsutra", "Pearl studs"];

/**
 * The Search tab. One field, then either results or the ways in — popular
 * searches and the categories — so an empty query is a starting point rather
 * than a dead end. Results reuse the catalogue's own filters and sort.
 */
export default function SearchScreen() {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const catalogue = useCatalogue();
  const categoryList = useCategories();
  const results = search(catalogue, query);
  const settled = useAfterTransition();
  const [draft, setDraft] = useState(query);

  const submit = (term: string) => {
    const q = term.trim();
    setDraft(q);
    router.setParams({ q });
  };

  if (!settled) {
    return (
      <Page>
        <CatalogueSkeleton />
      </Page>
    );
  }

  return (
    <Page>
      <Reveal>
      <Container style={{ paddingTop: 24, paddingBottom: 32 }}>
        <Eyebrow>{query ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "Search"}</Eyebrow>
        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.charcoal,
            paddingBottom: 12,
          }}
        >
          <Search size={20} strokeWidth={1.4} color={colors.gold} />
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => submit(draft)}
            returnKeyType="search"
            autoCorrect={false}
            autoFocus={!query}
            accessibilityLabel="Search jewellery"
            placeholder="Try “diamond pendant” or “22K hoops”"
            placeholderTextColor={colors.muted}
            style={{ flex: 1, fontFamily: fonts.display.light, fontSize: 22, color: colors.ink, paddingVertical: 0 }}
          />
        </View>
      </Container>

      {!query ? (
        <Container style={{ paddingBottom: 96, gap: 40 }}>
          <View>
            <Eyebrow style={{ marginBottom: 16 }}>Popular searches</Eyebrow>
            <View style={{ gap: 4 }}>
              {POPULAR.map((term) => (
                <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} onPress={() => setDraft(term)} style={{ paddingVertical: 10 }}>
                  <Display size={20} leading="tight">
                    {term}
                  </Display>
                </Link>
              ))}
            </View>
          </View>
          <View>
            <Eyebrow style={{ marginBottom: 16 }}>Browse by category</Eyebrow>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {categoryList.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`} style={{ backgroundColor: colors.beige, paddingHorizontal: 16, paddingVertical: 10 }} pressedStyle={{ backgroundColor: colors.beigeDark }}>
                  <Sans size={12} color={colors.charcoal}>
                    {c.name}
                  </Sans>
                </Link>
              ))}
            </View>
          </View>
        </Container>
      ) : null}

      {query && results.length === 0 ? (
        <Container style={{ paddingBottom: 96 }}>
          <View style={{ borderWidth: 1, borderColor: colors.line, paddingHorizontal: 32, paddingVertical: 64, alignItems: "center" }}>
            <Display size={24} align="center">
              No pieces match “{query}”
            </Display>
            <Sans size={14} color={colors.muted} align="center" style={{ marginTop: 12 }}>
              Try a broader term — a metal, a stone, or one of the categories below.
            </Sans>
            <View style={{ marginTop: 32, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
              {categoryList.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`} style={{ backgroundColor: colors.beige, paddingHorizontal: 16, paddingVertical: 8 }} pressedStyle={{ backgroundColor: colors.beigeDark }}>
                  <Sans size={12} color={colors.charcoal}>
                    {c.name}
                  </Sans>
                </Link>
              ))}
            </View>
          </View>
        </Container>
      ) : (
        <ShopView key={query} pool={results} initialFilters={filtersFromParams(params)} />
      )}
      </Reveal>
    </Page>
  );
}
