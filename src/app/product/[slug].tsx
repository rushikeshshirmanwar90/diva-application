import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { colors } from "@/lib/theme";
import type { Product, Review } from "@/lib/types";
import { fetchProduct, fetchProductReviews, fetchSignals } from "@/lib/api/catalogue";
import { useCatalogue, useCatalogueState, useCategories, useProductLookup, useSlugMaps } from "@/lib/data/catalogue-context";
import { recommend } from "@/lib/recommendations/score";
import { Page, Container } from "@/components/layout/page";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Gallery } from "@/components/product/gallery";
import { BuyBox } from "@/components/product/buy-box";
import { ProductDetails } from "@/components/product/product-details";
import { ReviewsSection } from "@/components/product/reviews-section";
import { ProductRail } from "@/components/product/product-grid";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { Reveal } from "@/components/ui/reveal";
import { NotFound } from "@/components/layout/not-found";
import { useAfterTransition } from "@/lib/use-after-transition";
import { useDeferredMount } from "@/lib/use-deferred-mount";

/** The product page — `app/product/[slug]/page.tsx`. */
export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  // The skeleton carries the slide in; the page itself mounts once it has
  // landed — the visible half first, the rest a frame later.
  const settled = useAfterTransition();
  const belowFold = useDeferredMount();
  const catalogue = useCatalogue();
  const { ready } = useCatalogueState();
  const lookup = useProductLookup();
  const slugs = useSlugMaps();
  const categories = useCategories();

  // The listing copy renders immediately; the detail fetch fills in the fields only that endpoint carries.
  const listed = lookup(slug);
  // Keyed by slug so a stale answer for a previous product is never shown as this one.
  const [detail, setDetail] = useState<{ slug: string; product: Product | null } | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const [reviewsY, setReviewsY] = useState(0);

  const loadReviews = useCallback(async () => {
    const list = await fetchProductReviews(slug);
    startTransition(() => setReviews(list));
  }, [slug]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      const [full, list, signals] = await Promise.all([fetchProduct(slug, slugs), fetchProductReviews(slug), fetchSignals(slug)]);
      if (cancelled) return;
      const product = full ?? lookup(slug) ?? null;
      // The detail fills in fields the listing lacks and must land promptly;
      // the reviews and the rail are below the fold, so they render at low
      // priority rather than pre-empting a scroll or a tap on the buy box.
      setDetail({ slug, product });
      startTransition(() => {
        setReviews(list);
        if (product) setRelated(recommend(product, catalogue, signals, { limit: 8 }));
      });
    })();
    return () => {
      cancelled = true;
    };
    // `lookup`/`catalogue` change only when the catalogue reloads, which should re-run this too.
  }, [slug, ready, slugs, lookup, catalogue]);

  const resolved = detail?.slug === slug ? detail.product : undefined;
  const product = resolved ?? listed;

  if (ready && resolved === null && !listed) return <NotFound />;

  if (!product || !settled) {
    return (
      <Page back>
        <ProductSkeleton />
      </Page>
    );
  }

  const category = categories.find((c) => c.slug === product.categorySlug);

  return (
    <Page back scrollRef={scrollRef}>
      <Reveal>
      <Container style={{ paddingTop: 32 }}>
        <Breadcrumbs
          trail={[
            { label: "All jewellery", href: "/shop" },
            ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
            { label: product.title },
          ]}
        />

        <View style={{ marginTop: 32, gap: 48 }}>
          <Gallery images={product.images} title={product.title} videoUrl={product.videoUrl} />
          <BuyBox product={product} onReadReviews={() => scrollRef.current?.scrollTo({ y: reviewsY, animated: true })} />
        </View>

        {belowFold ? (
          <Reveal>
            <View style={{ marginTop: 80 }}>
              <ProductDetails product={product} />
            </View>

            <View style={{ marginTop: 96 }} onLayout={(e) => setReviewsY(e.nativeEvent.layout.y)}>
              <ReviewsSection product={product} reviews={reviews} onSubmitted={() => void loadReviews()} />
            </View>

            {related.length > 0 ? (
              <Reveal lift style={{ marginTop: 96 }}>
                <SectionHeading
                  eyebrow="Styled together"
                  title="You may also like"
                  href={category ? `/category/${category.slug}` : "/shop"}
                  linkLabel="More like this"
                  align="between"
                />
                <View style={{ marginTop: 40 }}>
                  <ProductRail products={related} />
                </View>
              </Reveal>
            ) : null}

            <RecentlyViewed excludeSlug={product.slug} />
          </Reveal>
        ) : (
          // Holds the page's height so the scroll indicator does not jump
          // when the sections below arrive.
          <View style={{ height: 480 }} />
        )}
      </Container>
      </Reveal>
    </Page>
  );
}

/**
 * Mirrors the first screenful of the product page — breadcrumb, gallery and
 * thumbnail strip, then the top of the buy box — so the real page lands on
 * top of it without anything moving.
 *
 * Only the first screenful, deliberately. This is the very first frame after
 * the tap, and the native slide cannot begin until it has rendered; every
 * shimmer block below the fold is a layer the phone composites for nothing.
 * The gallery alone is taller than most screens, so nothing past the price
 * band is ever seen.
 */
function ProductSkeleton() {
  return (
    <SkeletonGroup label="Loading product">
      <Container style={{ paddingTop: 32 }}>
        <Skeleton style={{ height: 12, width: 224, maxWidth: "100%" }} />

        <View style={{ marginTop: 32, gap: 48 }}>
          {/* Gallery */}
          <View style={{ gap: 16 }}>
            <Skeleton style={{ width: "100%", aspectRatio: 4 / 5 }} />
            <View style={{ flexDirection: "row", gap: 12 }}>
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} style={{ width: 80, height: 80 }} />
              ))}
            </View>
          </View>

          {/* Buy box, to the price band */}
          <View>
            <Skeleton style={{ height: 10, width: 96 }} />
            <Skeleton style={{ marginTop: 16, height: 32, width: "100%" }} />
            <Skeleton style={{ marginTop: 8, height: 32, width: "66%" }} />
            <View style={{ marginTop: 28, borderTopWidth: 1, borderColor: colors.line, paddingTop: 24 }}>
              <Skeleton style={{ height: 32, width: 176 }} />
            </View>
          </View>
        </View>
      </Container>
    </SkeletonGroup>
  );
}
