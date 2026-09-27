import { useLocalSearchParams } from "expo-router";
import { useCatalogue } from "@/lib/data/catalogue-context";
import { filtersFromParams } from "@/lib/filters";
import { Page } from "@/components/layout/page";
import { PageHeader } from "@/components/shop/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { CatalogueSkeleton } from "@/components/shop/catalogue-skeleton";
import { Reveal } from "@/components/ui/reveal";
import { useAfterTransition } from "@/lib/use-after-transition";

export default function ShopScreen() {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const pool = useCatalogue();
  const settled = useAfterTransition();
  // Keyed on the query so `/shop?price=…` from a price tile resets the filters.
  const key = JSON.stringify(params);

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
      <PageHeader
        eyebrow={`${pool.length} pieces`}
        title="All jewellery"
        description="Every piece is BIS hallmarked with a verifiable HUID. Filter by what matters to you — weight, metal, stone or budget."
        trail={[{ label: "All jewellery" }]}
      />
      <ShopView key={key} pool={pool} initialFilters={filtersFromParams(params)} />
      </Reveal>
    </Page>
  );
}
