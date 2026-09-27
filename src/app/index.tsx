import { View } from "react-native";
import { useCatalogue, useCatalogueState, useHeroSlides } from "@/lib/data/catalogue-context";
import { byBadge } from "@/lib/data/product-helpers";
import { byOccasion, getOccasionCollection } from "@/lib/data/occasions";
import { Page, Container } from "@/components/layout/page";
import { Hero, HeroSkeleton } from "@/components/home/hero";
import { CategoryRail } from "@/components/home/category-rail";
import { CollectionBanner, CollectionBannerSkeleton } from "@/components/home/collection-banner";
import { PriceTiles } from "@/components/home/price-tiles";
import { RecentlyViewedRail } from "@/components/home/recently-viewed-rail";
import { Testimonials } from "@/components/home/testimonials";
import { ProductGrid, ProductRail } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/ui/reveal";

/** The home page — the same sections, in the same order, as the site's `app/page.tsx`. */
export default function HomeScreen() {
  const catalogue = useCatalogue();
  const heroSlides = useHeroSlides();
  const { ready } = useCatalogueState();

  const featured = byBadge(catalogue, "bestseller").slice(0, 4);
  const newArrivals = [...catalogue].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  /**
   * The banner slot is the Wedding occasion edit, same as the site. A fixed
   * entry in `lib/data/occasions.ts` rather than an admin-created collection,
   * so it always exists — the only question is how many pieces are tagged in.
   */
  const wedding = getOccasionCollection("wedding");
  const weddingCount = wedding ? byOccasion(catalogue, wedding).length : 0;

  return (
    <Page>
      {ready ? (
        <Reveal>
          <Hero slides={heroSlides} />
        </Reveal>
      ) : (
        <HeroSkeleton />
      )}

      {ready ? (
        <Reveal>
          <RecentlyViewedRail />
        </Reveal>
      ) : null}

      <CategoryRail />

      <Container style={{ paddingBottom: 32 }}>
        {ready ? (
          <Reveal style={{ marginTop: 40 }}>
            <ProductGrid products={featured} />
          </Reveal>
        ) : (
          <View style={{ marginTop: 40 }}>
            <ProductGridSkeleton count={4} />
          </View>
        )}
      </Container>

      {ready ? (
        wedding ? (
          <Reveal>
            <CollectionBanner collection={wedding} productCount={weddingCount} />
          </Reveal>
        ) : null
      ) : (
        <CollectionBannerSkeleton />
      )}

      <Container style={{ paddingVertical: 48 }}>
        <SectionHeading eyebrow="Just arrived" title="New this season" href="/shop?sort=newest" linkLabel="See all new" align="between" />
        <View style={{ marginTop: 40 }}>
          {ready ? (
            <Reveal>
              <ProductRail products={newArrivals} />
            </Reveal>
          ) : (
            <ProductGridSkeleton count={6} />
          )}
        </View>
      </Container>

      <PriceTiles />

      <Testimonials />
    </Page>
  );
}
