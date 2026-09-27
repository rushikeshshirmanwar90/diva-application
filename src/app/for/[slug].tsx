import { useLocalSearchParams } from "expo-router";
import { useCatalogue, useCatalogueState } from "@/lib/data/catalogue-context";
import { byGender, getGenderCollection } from "@/lib/data/genders";
import { filtersFromParams } from "@/lib/filters";
import { Page } from "@/components/layout/page";
import { PageHeader } from "@/components/shop/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { NotFound } from "@/components/layout/not-found";
import { CatalogueSkeleton } from "@/components/shop/catalogue-skeleton";
import { Reveal } from "@/components/ui/reveal";
import { useAfterTransition } from "@/lib/use-after-transition";

/** `/for/women` and `/for/men` — the gender edits, same as the site. */
export default function GenderCollectionScreen() {
  const { slug, ...params } = useLocalSearchParams<{ slug: string } & Record<string, string | string[]>>();
  const catalogue = useCatalogue();
  const { ready } = useCatalogueState();
  const settled = useAfterTransition();
  const collection = getGenderCollection(slug);

  if (!ready || !settled) {
    return (
      <Page>
        <CatalogueSkeleton />
      </Page>
    );
  }
  if (!collection) return <NotFound />;

  const pool = byGender(catalogue, collection);

  return (
    <Page>
      <Reveal>
        <PageHeader
          eyebrow={collection.tagline}
          title={collection.title}
          description={collection.description}
          trail={[{ label: collection.title }]}
          image={collection.image}
        />
        <ShopView key={slug} pool={pool} initialFilters={filtersFromParams(params)} />
      </Reveal>
    </Page>
  );
}
