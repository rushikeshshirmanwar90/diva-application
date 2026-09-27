import { useLocalSearchParams } from "expo-router";
import { useCatalogue, useCatalogueState, useCategories } from "@/lib/data/catalogue-context";
import { byCategory } from "@/lib/data/product-helpers";
import { filtersFromParams } from "@/lib/filters";
import { Page } from "@/components/layout/page";
import { PageHeader } from "@/components/shop/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { NotFound } from "@/components/layout/not-found";
import { CatalogueSkeleton } from "@/components/shop/catalogue-skeleton";
import { Reveal } from "@/components/ui/reveal";
import { useAfterTransition } from "@/lib/use-after-transition";

export default function CategoryScreen() {
  const { slug, ...params } = useLocalSearchParams<{ slug: string } & Record<string, string | string[]>>();
  const catalogue = useCatalogue();
  const { ready } = useCatalogueState();
  const settled = useAfterTransition();
  const category = useCategories().find((c) => c.slug === slug);

  if (!ready || !settled) {
    return (
      <Page>
        <CatalogueSkeleton />
      </Page>
    );
  }
  if (!category) return <NotFound />;

  const pool = byCategory(catalogue, category.slug);

  return (
    <Page>
      <Reveal>
      <PageHeader
        eyebrow={`${pool.length} pieces`}
        title={category.name}
        description={category.blurb}
        trail={[{ label: "All jewellery", href: "/shop" }, { label: category.name }]}
        image={category.bannerImage}
      />
      <ShopView key={slug} pool={pool} initialFilters={filtersFromParams(params)} includeCategory={false} />
      </Reveal>
    </Page>
  );
}
