import { View } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/lib/theme";
import type { Collection } from "@/lib/types";
import { Display, Eyebrow, Sans } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/page";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";

export function CollectionBanner({ collection, productCount }: { collection: Collection; productCount: number }) {
  return (
    <Container style={{ paddingVertical: 64, gap: 40 }}>
      <View style={{ aspectRatio: 4 / 5, backgroundColor: colors.beige, overflow: "hidden" }}>
        {collection.image ? (
          <Image source={{ uri: collection.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" accessibilityLabel={collection.name} />
        ) : null}
      </View>
      <View>
        <Eyebrow>{collection.tagline}</Eyebrow>
        <Display size={36} leading="tight" style={{ marginTop: 16 }}>
          {collection.name}
        </Display>
        <Sans size={14} leading="relaxed" color={colors.muted} style={{ marginTop: 20, maxWidth: 448 }}>
          {collection.description}
        </Sans>
        <Eyebrow color={colors.goldText} style={{ marginTop: 24 }}>
          {productCount} pieces in this edit
        </Eyebrow>
        <Button href={`/collections/${collection.slug}`} style={{ marginTop: 32 }}>
          Explore the edit
        </Button>
      </View>
    </Container>
  );
}

/**
 * Mirrors `CollectionBanner` — the 4:5 artwork, then tagline, name, two lines
 * of description, the piece count and the button — so the real banner lands
 * in the same place the placeholder was.
 */
export function CollectionBannerSkeleton() {
  return (
    <SkeletonGroup label="Loading collection">
      <Container style={{ paddingVertical: 64, gap: 40 }}>
        <Skeleton style={{ width: "100%", aspectRatio: 4 / 5 }} />
        <View>
          <Skeleton style={{ height: 10, width: 112 }} />
          <Skeleton style={{ marginTop: 16, height: 40, width: 240, maxWidth: "100%" }} />
          <Skeleton style={{ marginTop: 20, height: 12, width: "100%", maxWidth: 448 }} />
          <Skeleton style={{ marginTop: 8, height: 12, width: "72%", maxWidth: 320 }} />
          <Skeleton style={{ marginTop: 24, height: 10, width: 136 }} />
          <Skeleton style={{ marginTop: 32, height: 40, width: 176 }} />
        </View>
      </Container>
    </SkeletonGroup>
  );
}
