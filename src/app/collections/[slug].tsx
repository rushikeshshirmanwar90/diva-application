import { useLocalSearchParams } from "expo-router";
import { useCatalogue, useCatalogueState } from "@/lib/data/catalogue-context";
import { byOccasion, getOccasionCollection } from "@/lib/data/occasions";
import { filtersFromParams } from "@/lib/filters";
import { Page } from "@/components/layout/page";
import { PageHeader } from "@/components/shop/page-header";
import { ShopView } from "@/components/shop/shop-view";
import { NotFound } from "@/components/layout/not-found";
import { CatalogueSkeleton } from "@/components/shop/catalogue-skeleton";
import { Reveal } from "@/components/ui/reveal";
import { useAfterTransition } from "@/lib/use-after-transition";

export default function CollectionScreen() {
  const { slug, ...params } = useLocalSearchParams<{ slug: string } & Record<string, string | string[]>>();
  const catalogue = useCatalogue();
  const { ready } = useCatalogueState();
  const settled = useAfterTransition();
  const collection = getOccasionCollection(slug);

  if (!ready || !settled) {
    return (
      <Page>
        <CatalogueSkeleton />
      </Page>
    );
  }
  if (!collection) return <NotFound />;

  const pool = byOccasion(catalogue, collection);

  return (
    <Page>
      <Reveal>
      <PageHeader
        eyebrow={collection.tagline}
        title={collection.name}
        description={collection.description}
        trail={[{ label: "Collections", href: "/collections" }, { label: collection.name }]}
        image={collection.image}
      />
      <ShopView key={slug} pool={pool} initialFilters={filtersFromParams(params)} />
      </Reveal>
    </Page>
  );
}
